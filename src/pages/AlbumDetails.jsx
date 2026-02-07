import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import InteractiveStarRating from '../components/InteractiveStarRating';
import spotifyService, { formatDuration } from '../services/spotifyService';
import { useDiscogsData } from '../hooks/useDiscogsData';
import iconHeadphoneActive from '../assets/icon_headphone-active.svg';
import iconHeadphoneInactive from '../assets/icon_headphone-inactive.svg';
import heartActive from '../assets/heart-active.svg';
import heartInactive from '../assets/heart-inactive.svg';
import tolistenActive from '../assets/tolisten-active.svg';
import tolistenInactive from '../assets/tolisten-inactive.svg';
import headphone from '../assets/icon_headphone.png';
import spotifyLogo from '../assets/spotify-logo.png';
import './AlbumDetails.css';

// API Credentials via variáveis de ambiente
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const DISCOGS_CONSUMER_KEY = import.meta.env.VITE_DISCOGS_CONSUMER_KEY;
const DISCOGS_CONSUMER_SECRET = import.meta.env.VITE_DISCOGS_CONSUMER_SECRET;

function ActionButton({ iconActive, iconInactive, label, isActive, onClick }) {
  return (
    <button 
      className={`action-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <img 
        src={isActive ? iconActive : iconInactive} 
        alt={label}
        className="action-icon"
      />
      <span className={`action-label ${isActive ? 'active' : ''}`}>{label}</span>
    </button>
  );
}

// Função auxiliar para formatar data no formato brasileiro
const formatReleaseDate = (dateString) => {
  if (!dateString) return null;
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} de ${month}, ${year}`;
};

// Processar tracks da API Spotify e agrupar por disco
const processTracks = (tracks) => {
  if (!tracks || tracks.length === 0) return [];
  
  const tracksByDisc = tracks.reduce((acc, track) => {
    const discNum = track.disc_number || 1;
    if (!acc[discNum]) acc[discNum] = [];
    acc[discNum].push({
      number: track.track_number,
      title: track.name,
      artists: track.artists.map(a => a.name),
      duration: formatDuration(track.duration_ms),
      durationMs: track.duration_ms,
      rating: null
    });
    return acc;
  }, {});
  
  return Object.keys(tracksByDisc)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(discNum => ({
      number: parseInt(discNum),
      tracks: tracksByDisc[discNum].sort((a, b) => a.number - b.number)
    }));
};

export default function AlbumDetails() {
  const { id } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listened, setListened] = useState(false);
  const [liked, setLiked] = useState(false);
  const [toListen, setToListen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [trackRatings, setTrackRatings] = useState({});

  const handleTrackRatingChange = (trackKey, rating) => {
    setTrackRatings(prev => ({
      ...prev,
      [trackKey]: rating
    }));
  };

  // Buscar dados da Discogs (deve ser chamado antes de qualquer return!)
  const { discogsData, loading: discogsLoading } = useDiscogsData(
    albumData?.title || '',
    albumData?.artist || '',
    DISCOGS_CONSUMER_KEY,
    DISCOGS_CONSUMER_SECRET
  );

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) {
        setError('ID do álbum não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        spotifyService.setCredentials(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
        const data = await spotifyService.getAlbum(id);
        
        // Mapear dados da API para o formato usado no componente
        setAlbumData({
          title: data.name,
          artist: data.artists.map(a => a.name).join(', '),
          coverUrl: data.images[0]?.url,
          releaseDate: data.releaseDate,
          label: data.label,
          genres: data.artistGenres || [],
          discs: processTracks(data.tracks),
          totalTracks: data.totalTracks,
          totalDurationMs: data.totalDurationMs
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching album:', err);
        setError('Não foi possível carregar os dados do álbum');
        setAlbumData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  if (loading) {
    return (
      <div className="album-details-page">
        <div className="album-loading">
          <div className="album-loading-spinner"></div>
          <p>Carregando álbum... </p>
        </div>
      </div>
    );
  }

  if (error || !albumData) {
    return (
      <div className="album-details-page">
        <div className="album-error">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="#dc2626">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p>{error || 'Não foi possível encontrar informações'}</p>
        </div>
      </div>
    );
  }

  const data = albumData;

  // Determinar gêneros a exibir (Discogs tem prioridade, depois Spotify artista)
  const displayGenres = discogsData?.genres?.length > 0 
    ? discogsData.genres 
    : data.genres?.length > 0 
      ? data.genres 
      : null;

  return (
    <div className="album-details-page">
      
      {/* Top Section - Album Info Grid */}
      <div className="album-info-grid">
        {/* Left Column - Album Cover */}
        <div className="album-cover-section">
          <img 
            src={data.coverUrl} 
            alt={data.title}
            className="album-cover"
          />
          <div className="streaming-links">
            <span className="streaming-label">Ouça em</span>
            <div className="streaming-icons">
              <a 
                href={`https://open.spotify.com/album/${id}`}
                className="streaming-icon"
                title="Spotify"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className='streaming-icon-img' src={spotifyLogo} alt="Spotify" />
              </a>
            </div>
          </div>
        </div>

        {/* Center Column - Album Info */}
        <div className="album-info-section">
          <h1 className="album-title">{data.title}</h1>
          <p className="album-artist">{data.artist}</p>
          
          <div className="ratings-section">
            <div className="rating-item">
              <span className="rating-label">Sua avaliação:</span>
              <InteractiveStarRating 
                rating={userRating}
                onRatingChange={setUserRating}
                
              />
            {/*
            {userRating > 0 && (
              <span className="rating-value">{userRating}/5</span>
            )}
            */}  
            </div>
            
            <div className="rating-item">
              <span className="rating-label">Média dos users:</span>
              <StarRating rating={null} />
            </div>
            
          </div>
        </div>

        {/* Right Column - Details Card */}
        <div className="details-section">
          <div className="details-card">
            <h3 className="details-title">Detalhes</h3>
            
            <div className="detail-row">
              <span className="detail-label">Lançamento:</span>
              <span className="detail-value">
                {formatReleaseDate(data.releaseDate) || 'Não foi possível encontrar informações'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Gravadora:</span>
              <span className="detail-value">
                {discogsLoading ? 'Carregando...' : 
                  (discogsData?.labels?.join(', ') || data.label || 'Não foi possível encontrar informações')}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Gêneros:</span>
              <span className="detail-value genres">
                {discogsLoading ? (
                  'Carregando...'
                ) : displayGenres ? (
                  <>
                    {displayGenres.map((genre, index) => (
                      <span key={index}>
                        <a href="#" className="genre-link">{genre}</a>
                        {index < displayGenres.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {discogsData?.styles?.length > 0 && (
                      <span className="detail-value styles">
                        {discogsData.styles.map((style, index) => (
                          <span key={index}>
                            <a href="#" className="genre-link style-link">{style}</a>
                            {index < discogsData.styles.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    )}
                  </>
                ) : (
                  'Não foi possível encontrar informações'
                )}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Número de Tracks:</span>
              <span className="detail-value">
                {data.totalTracks || 'Não foi possível encontrar informações'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Duração:</span>
              <span className="detail-value">
                {formatDuration(data.totalDurationMs) || 'Não foi possível encontrar informações'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <div className="action-buttons-group">
              <ActionButton
                iconActive={iconHeadphoneActive}
                iconInactive={iconHeadphoneInactive}
                label="Escutado"
                isActive={listened}
                onClick={() => setListened(!listened)}
              />
              
              <ActionButton
                iconActive={heartActive}
                iconInactive={heartInactive}
                label="Gostei"
                isActive={liked}
                onClick={() => setLiked(!liked)}
              />
              
              <ActionButton
                iconActive={tolistenActive}
                iconInactive={tolistenInactive}
                label="To-Listen"
                isActive={toListen}
                onClick={() => setToListen(!toListen)}
              />
            </div>
            
            <button className="log-button">
              <span className="log-icon">
                <img className='log-icon-image' src={headphone} alt="" />
              </span>
              Log
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Section */}
      <div className="tracklist-section">
        <h3 className="tracklist-title">Tracklist</h3>
        
        {data.discs?.length > 0 ? (
          data.discs.length === 1 ? (
            // Um único disco - sem header
            <div className="tracks-list">
              {data.discs[0].tracks.map((track) => (
                <div key={track.number} className="track-row">
                  <span className="track-number">{track.number}.</span>
                  <span className="track-title">{track.title}</span>
                  <span className="track-artists">
                    {track.artists.join(', ')}
                  </span>
                  <span className="track-duration">{track.duration}</span>
                  <div className="track-rating">
                    <InteractiveStarRating 
                      rating={trackRatings[track.number] || 0}
                      onRatingChange={(rating) => handleTrackRatingChange(track.number, rating)}
                      size={12}
                    />
                  </div>
                  <button className="track-notes-button">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Notas
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Múltiplos discos - com headers
            data.discs.map((disc) => (
              <div key={disc.number} className="disc-section">
                <div className='disc-background'>
                  <h3 className="disc-label">Disco {disc.number}</h3>
                </div>
                <div className="tracks-list">
                  {disc.tracks.map((track) => (
                    <div key={`${disc.number}-${track.number}`} className="track-row">
                      <span className="track-number">{track.number}.</span>
                      <span className="track-title">{track.title}</span>
                      <span className="track-artists">
                        {track.artists.join(', ')}
                      </span>
                      <span className="track-duration">{track.duration}</span>
                      <div className="track-rating">
                        <InteractiveStarRating 
                          rating={trackRatings[`${disc.number}-${track.number}`] || 0}
                          onRatingChange={(rating) => handleTrackRatingChange(`${disc.number}-${track.number}`, rating)}
                          size={16}
                        />
                      </div>
                      <button className="track-notes-button">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Notas
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          <p className="no-tracklist">Não foi possível encontrar informações</p>
        )}
      </div>
    </div>
  );
}
