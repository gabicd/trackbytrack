const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
const MAX_RESULTS = 200;
const BATCH_SIZE = 50;
const DELAY_BETWEEN_CALLS = 100;

class SpotifyService {
  constructor() {
    this.clientId = null;
    this.clientSecret = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  setCredentials(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getAccessToken() {
    // Se já temos um token válido, retorna ele
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Client ID and Client Secret must be set');
    }

    try {
      const response = await fetch(SPOTIFY_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Failed to obtain access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      // Define expiração 1 minuto antes do real para segurança
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error obtaining access token:', error);
      throw error;
    }
  }

  async makeRequest(endpoint, params = {}) {
    const token = await this.getAccessToken();

    const queryString = new URLSearchParams(params).toString();
    const url = `${SPOTIFY_API_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token expirou, limpa e tenta novamente
      this.accessToken = null;
      this.tokenExpiry = null;
      return this.makeRequest(endpoint, params);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 1;
      await this.delay(retryAfter * 1000);
      return this.makeRequest(endpoint, params);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Spotify API error');
    }

    return response.json();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  normalizeAlbum(album) {
    //console.log('Nome do album:', album.name);
    //console.log('Tipo do álbum:', album.album_type);
    return {
      id: album.id,
      name: album.name,
      artists: album.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })),
      images: album.images,
      releaseDate: album.release_date,
      releaseYear: album.release_date ? new Date(album.release_date).getFullYear() : null,
      albumType: this.translateAlbumType(album.album_type),
      totalTracks: album.total_tracks
    };
  }

  translateAlbumType(type) {
    const translations = {
      'album': 'LP',
      'single': 'Single',
      'compilation': 'Compilação'
    };
    return translations[type] || type;
  }

  async searchAlbums(query) {
    if (!query.trim()) {
      return [];
    }

    const allAlbums = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore && allAlbums.length < MAX_RESULTS) {
      const limit = Math.min(BATCH_SIZE, MAX_RESULTS - allAlbums.length);
      
      try {
        const data = await this.makeRequest('/search', {
          q: query,
          type: 'album',
          limit: limit,
          offset: offset
        });

        const albums = data.albums?.items || [];
        
        if (albums.length === 0) {
          hasMore = false;
        } else {
          allAlbums.push(...albums.map(album => this.normalizeAlbum(album)));
          offset += albums.length;
          
          if (albums.length < limit) {
            hasMore = false;
          }
        }

        if (hasMore && allAlbums.length < MAX_RESULTS) {
          await this.delay(DELAY_BETWEEN_CALLS);
        }
      } catch (error) {
        console.error('Error searching albums:', error);
        throw error;
      }
    }

    return allAlbums;
  }

  async getAlbum(albumId) {
    if (!albumId) {
      throw new Error('Album ID is required');
    }

    try {
      const albumData = await this.makeRequest(`/albums/${albumId}`);
      
      // Buscar gêneros do primeiro artista
      const primaryArtistId = albumData.artists[0]?.id;
      let artistGenres = [];
      if (primaryArtistId) {
        const artistData = await this.makeRequest(`/artists/${primaryArtistId}`);
        artistGenres = artistData.genres || [];
      }
      
      // Calcular duração total
      const totalDurationMs = albumData.tracks?.items?.reduce((acc, track) => 
        acc + (track.duration_ms || 0), 0
      ) || 0;
      
      return {
        ...this.normalizeAlbum(albumData),
        label: albumData.label,
        totalDurationMs,
        artistGenres,
        tracks: albumData.tracks?.items || []
      };
    } catch (error) {
      console.error('Error fetching album:', error);
      throw error;
    }
  }
}

export function formatDuration(ms) {
  if (!ms || ms <= 0) return 'N/A';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default new SpotifyService();
export { SpotifyService };
