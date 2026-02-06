import { useState } from 'react';
import StarRating from '../components/StarRating';
import iconHeadphoneActive from '../assets/icon_headphone-active.svg';
import iconHeadphoneInactive from '../assets/icon_headphone-inactive.svg';
import heartActive from '../assets/heart-active.svg';
import heartInactive from '../assets/heart-inactive.svg';
import tolistenActive from '../assets/tolisten-active.svg';
import tolistenInactive from '../assets/tolisten-inactive.svg';
import headphone from '../assets/icon_headphone.png';
import './AlbumDetails.css';

const mockAlbumData = {
  title: "Fancy Some More?",
  artist: "PinkPantheress",
  coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/af/PinkPantheress_-_Fancy_Some_More%3F.jpg",
  userRating: 5,
  usersRating: 4.5,
  usersCount: 17,
  criticsRating: 3,
  criticsCount: 3,
  releaseDate: "10/10/2025",
  label: "Warner UK",
  genres: ["Dance-Pop", "Electronic Dance Music", "Breakbeat", "Liquid Drum and Bass", "House", "Bassline"],
  streamingLinks: [
    { name: "Apple Music", url: "#" },
    { name: "Spotify", url: "#" },
    { name: "YouTube Music", url: "#" }
  ],
  discs: [
    {
      number: 1,
      tracks: [
        {
          number: 1,
          title: "Illegal + Anitta",
          artists: ["PinkPantheress", "Anitta"],
          duration: "2:29",
          rating: 3
        },
        {
          number: 2,
          title: "Illegal + SEVENTEEN",
          artists: ["PinkPantheress", "SEVENTEEN"],
          duration: "2:47",
          rating: 3
        }
      ]
    }
  ]
};

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
      <span className="action-label">{label}</span>
    </button>
  );
}

export default function AlbumDetails() {
  const [listened, setListened] = useState(false);
  const [liked, setLiked] = useState(false);
  const [toListen, setToListen] = useState(false);

  return (
    <div className="album-details-page">
      {/* Top Section - Album Info Grid */}
      <div className="album-info-grid">
        {/* Left Column - Album Cover */}
        <div className="album-cover-section">
          <img 
            src={mockAlbumData.coverUrl} 
            alt={mockAlbumData.title}
            className="album-cover"
          />
          <div className="streaming-links">
            <span className="streaming-label">Ouça em</span>
            <div className="streaming-icons">
              {mockAlbumData.streamingLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.url}
                  className="streaming-icon"
                  title={link.name}
                >
                  {link.name[0]}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Album Info */}
        <div className="album-info-section">
          <h1 className="album-title">{mockAlbumData.title}</h1>
          <p className="album-artist">{mockAlbumData.artist}</p>
          
          <div className="ratings-section">
            <div className="rating-item">
              <span className="rating-label">Sua avaliação:</span>
              <StarRating rating={mockAlbumData.userRating} />
            </div>
            
            <div className="rating-item">
              <span className="rating-label">
                Média dos users ({mockAlbumData.usersCount}):
              </span>
              <StarRating rating={mockAlbumData.usersRating} />
            </div>
            
            <div className="rating-item">
              <span className="rating-label">
                Média da crítica ({mockAlbumData.criticsCount}):
              </span>
              <StarRating rating={mockAlbumData.criticsRating} />
            </div>
          </div>
        </div>

        {/* Right Column - Details Card */}
        <div className="details-section">
          <div className="details-card">
            <h3 className="details-title">Detalhes</h3>
            <div className="detail-row">
              <span className="detail-label">Lançamento:</span>
              <span className="detail-value">{mockAlbumData.releaseDate}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gravadora:</span>
              <span className="detail-value">{mockAlbumData.label}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Gêneros:</span>
              <span className="detail-value genres">
                {mockAlbumData.genres.map((genre, index) => (
                  <span key={index}>
                    <a href="#" className="genre-link">{genre}</a>
                    {index < mockAlbumData.genres.length - 1 ? ', ' : ''}
                  </span>
                ))}
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
        
        {mockAlbumData.discs.map((disc) => (
          <div key={disc.number} className="disc-section">
            <h3 className="disc-label">Disco {disc.number}</h3>
            <div className="tracks-list">
              {disc.tracks.map((track) => (
                <div key={track.number} className="track-row">
                  <span className="track-number">{track.number}.</span>
                  <span className="track-title">{track.title}</span>
                  <span className="track-artists">
                    {track.artists.join(', ')}
                  </span>
                  <span className="track-duration">{track.duration}</span>
                  <div className="track-rating">
                    <StarRating rating={track.rating} />
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
        ))}
      </div>
    </div>
  );
}
