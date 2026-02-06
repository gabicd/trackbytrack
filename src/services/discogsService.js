const DISCOGS_API_BASE = 'https://api.discogs.com';

class DiscogsService {
  constructor() {
    this.consumerKey = null;
    this.consumerSecret = null;
  }

  setCredentials(consumerKey, consumerSecret) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error('Consumer Key and Consumer Secret must be set');
    }

    // Adicionar credentials como query parameters
    const queryParams = new URLSearchParams({
      ...params,
      key: this.consumerKey,
      secret: this.consumerSecret
    });

    const url = `${DISCOGS_API_BASE}${endpoint}?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TrackByTrack/1.0'
      }
    });

    if (response.status === 429) {
      // Rate limit - aguardar e tentar novamente
      await this.delay(1000);
      return this.makeRequest(endpoint, params);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Discogs API error');
    }

    return response.json();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchRelease(albumName, artistName) {
    if (!albumName.trim()) {
      return null;
    }

    const query = `${albumName} ${artistName || ''}`.trim();

    try {
      const data = await this.makeRequest('/database/search', {
        q: query,
        type: 'release'
      });

      // Retorna o primeiro resultado
      const results = data.results || [];
      if (results.length > 0) {
        return results[0];
      }

      return null;
    } catch (error) {
      console.error('Error searching release:', error);
      throw error;
    }
  }

  async getReleaseDetails(releaseId) {
    if (!releaseId) {
      throw new Error('Release ID is required');
    }

    try {
      const data = await this.makeRequest(`/releases/${releaseId}`);
      
      return {
        id: data.id,
        title: data.title,
        year: data.year,
        genres: data.genres || [],
        styles: data.styles || [],
        labels: (data.labels || []).map(label => label.name),
        tracklist: (data.tracklist || []).map(track => ({
          position: track.position,
          title: track.title,
          duration: track.duration
        }))
      };
    } catch (error) {
      console.error('Error fetching release details:', error);
      throw error;
    }
  }

  async getAlbumInfo(albumName, artistName) {
    try {
      // Buscar release
      const release = await this.searchRelease(albumName, artistName);
      
      if (!release) {
        return null;
      }

      // Pegar detalhes completos
      const details = await this.getReleaseDetails(release.id);
      return details;
    } catch (error) {
      console.error('Error getting album info:', error);
      throw error;
    }
  }
}

export default new DiscogsService();
export { DiscogsService };
