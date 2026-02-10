import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchUserProfile, fetchMyProfile } from '../services/userApi.js';
import { getAvatarUrl } from '../services/uploadApi.js';
import EditProfileModal from '../components/EditProfileModal.jsx';
import './UserProfile.css';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'seu_cloud_name';

// Dados mockados dos álbuns favoritos (manter por enquanto)
const mockFavoriteAlbums = [
  {
    id: "0vHPK6J5p42cNHyftCJhhT",
    title: "Songs in the Key of Life",
    artist: "Stevie Wonder",
    coverUrl: "https://upload.wikimedia.org/wikipedia/pt/b/b2/Songs_in_the_Key_of_Life.jpg"
  },
  {
    id: "2guir0Q5aJkZ9z8G5m0O1F",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png/250px-Kendrick_Lamar_-_To_Pimp_a_Butterfly.png"
  },
  {
    id: "6M4VOF1YO3P3J1q8v5y3L8",
    title: "LOVElution",
    artist: "tripleS",
    coverUrl: "https://akamai.sscdn.co/uploadfile/letras/albuns/3/0/2/a/1690661698174616.jpg"
  },
  {
    id: "6P2FD8sOqF4T3Z8x9J7K2M",
    title: "Ten",
    artist: "Pearl Jam",
    coverUrl: "https://upload.wikimedia.org/wikipedia/pt/d/da/Pearl_Jam_-_Ten.jpg"
  },
  {
    id: "4P3H2Q8x9J7K6M5N4L3O2P",
    title: "Sweetener",
    artist: "Ariana Grande",
    coverUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Sweetener_album_cover.png"
  }
];

// Dados mockados dos logs recentes (manter por enquanto)
const mockRecentLogs = [
  {
    id: "log1",
    album: {
      id: "1a2b3c4d",
      title: "Midnights",
      artist: "Taylor Swift",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png"
    },
    action: "listened",
    date: "2 horas atrás",
    rating: 4.5
  },
  {
    id: "log2",
    album: {
      id: "5e6f7g8h",
      title: "Renaissance",
      artist: "Beyoncé",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/ad/Beyonc%C3%A9_-_Renaissance.png"
    },
    action: "listened",
    date: "5 horas atrás",
    rating: 5
  },
  {
    id: "log3",
    album: {
      id: "9i0j1k2l",
      title: "Harry's House",
      artist: "Harry Styles",
      coverUrl: "https://upload.wikimedia.org/wikipedia/pt/d/d5/Harry_Styles_-_Harry%27s_House.png"
    },
    action: "reviewed",
    date: "1 dia atrás",
    rating: 4
  },
  {
    id: "log4",
    album: {
      id: "3m4n5o6p",
      title: "DeBÍ TiRAR MáS FOToS",
      artist: "Bad Bunny",
      coverUrl: "https://lh3.googleusercontent.com/yBcpSTWxVqyJr7enMy7HFv14Yb8p1jI5AS5o49Cvbeyc6zjvCvdLn_0_iAxz50MqxLx6hQDngWBeaC26=w544-h544-l90-rj"
    },
    action: "listened",
    date: "2 dias atrás",
    rating: 4.5
  },
  {
    id: "log5",
    album: {
      id: "7q8r9s0t",
      title: "Planet Her",
      artist: "Doja Cat",
      coverUrl: "https://upload.wikimedia.org/wikipedia/en/6/61/Doja_Cat_-_Planet_Her.png"
    },
    action: "listened",
    date: "3 dias atrás",
    rating: 3.5
  }
];

// Tabs de navegação
const profileTabs = [
  { id: 'profile', label: 'Perfil', path: '/profile', active: true },
  { id: 'diary', label: 'Diário', path: '/profile/diary', active: false },
  { id: 'reviews', label: 'Reviews', path: '/profile/reviews', active: false },
  { id: 'toListen', label: 'To-Listen', path: '/profile/to-listen', active: false },
  { id: 'lists', label: 'Listas', path: '/profile/lists', active: false },
  { id: 'likes', label: 'Likes', path: '/profile/likes', active: false }
];

function StarRating({ rating }) {
  if (!rating) return null;
  
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={i} className="star filled">★</span>);
  }
  
  if (hasHalfStar) {
    stars.push(<span key="half" className="star half">⯪</span>);
  }
  
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
  }
  
  return <div className="log-rating">{stars}</div>;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Determinar se é o perfil próprio
  const isOwnProfile = !username || (currentUser?.profile?.username === username);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data;
        
        if (!username) {
          // Perfil próprio - usar /api/users/me
          if (!isAuthenticated) {
            setError('Faça login para ver seu perfil');
            setLoading(false);
            return;
          }
          data = await fetchMyProfile();
        } else {
          // Perfil de outro usuário - usar /api/users/:username/profile
          data = await fetchUserProfile(username);
        }
        
        setProfileData(data.user);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, isAuthenticated, currentUser?.profile?.username]);

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  const handleEditProfile = () => {
    if (isOwnProfile) {
      setIsEditModalOpen(true);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileData(updatedUser);
    // Atualizar também no contexto de auth para refletir na navbar
    updateUser({ profile: updatedUser });
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-page">
        <div className="profile-error">
          <p>{error}</p>
          {!isAuthenticated && (
            <button onClick={() => navigate('/login')} className="btn-primary">
              Fazer Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="user-profile-page">
        <div className="profile-error">
          <p>Perfil não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {profileData.avatarUrl ? (
              <img 
                src={profileData.avatarPublicId 
                  ? getAvatarUrl(profileData.avatarPublicId, 400, CLOUDINARY_CLOUD_NAME) 
                  : profileData.avatarUrl} 
                alt={profileData.displayName}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                <svg viewBox="0 0 24 24" width="64" height="64" fill="#999">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="profile-name">
            <div className="profile-display-row">
              <h2 className="profile-display-name">{profileData.displayName}</h2>
              {isOwnProfile && (
                <button 
                  className="edit-profile-button" 
                  title="Editar perfil"
                  onClick={handleEditProfile}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              )}
            </div>
            <h1 className="profile-username">@{profileData.username}</h1>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{profileData.nListened || 0}</span>
            <span className="stat-label">Álbuns</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{profileData.nLists || 0}</span>
            <span className="stat-label">Listas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{profileData.nFollowers || 0}</span>
            <span className="stat-label">Seguidores</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{profileData.nFollowing || 0}</span>
            <span className="stat-label">Seguindo</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        {profileTabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.path}
            className={`profile-tab ${tab.active ? 'active' : ''}`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* All-Time Favs Section */}
      <section className="profile-section">
        <div className="section-header">
          <h2 className="section-title">All-Time Favs</h2>
          {isOwnProfile && (
            <button className="edit-button" title="Editar">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="favorites-grid">
          {mockFavoriteAlbums.map((album) => (
            <div
              key={album.id}
              className="favorite-album"
              onClick={() => handleAlbumClick(album.id)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={album.coverUrl}
                alt={album.title}
                className="favorite-album-cover"
              />
              <div className="favorite-album-overlay">
                <div className="favorite-album-title-overlay">{album.title}</div>
                <div className="favorite-album-artist-overlay">{album.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="profile-section">
        <h2 className="section-title">Atividade Recente</h2>
        
        <div className="logs-list">
          {mockRecentLogs.map((log) => (
            <div key={log.id} className="log-card">
              <img
                src={log.album.coverUrl}
                alt={log.album.title}
                className="log-album-cover"
              />
              <div className="log-info">
                <div className="log-album-title">{log.album.title}</div>
                <div className="log-album-artist">{log.album.artist}</div>
              </div>
              <div className="log-meta">
                <StarRating rating={log.rating} />
                <span className="log-date">{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditModalOpen && isOwnProfile && (
        <EditProfileModal
          user={profileData}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
