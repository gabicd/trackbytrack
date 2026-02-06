import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tbtLogo from '../assets/tbt-logo.svg';
import './Components.css';

export default function Navbar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-menu" ref={menuRef}>
          <button
            className="navbar-menu-button"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="navbar-avatar">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="#7418BA"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
          </button>

          {showMenu && (
            <div className="navbar-dropdown">
              <button
                className="navbar-dropdown-item"
                onClick={() => {
                  navigate('/profile');
                  setShowMenu(false);
                }}
              >
                Perfil
              </button>
              <button
                className="navbar-dropdown-item"
                onClick={() => {
                  navigate('/settings');
                  setShowMenu(false);
                }}
              >
                Configurações
              </button>
              <div className="navbar-dropdown-divider"></div>
              <button
                className="navbar-dropdown-item navbar-dropdown-signout"
                onClick={() => {
                  // TODO: Implementar logout quando auth estiver pronto
                  setShowMenu(false);
                }}
              >
                Sair
              </button>
            </div>
          )}
        </div>

        <div className="navbar-links">
          <button
            className="navbar-link"
            onClick={() => navigate('/lists')}
          >
            Listas
          </button>
          <button
            className="navbar-link"
            onClick={() => navigate('/friends')}
          >
            Amigos
          </button>
          <button
            className="navbar-link"
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>
      </div>

      <div className="navbar-center">
        <div className="navbar-logo-wrapper">
          <img
            src={tbtLogo}
            alt="TrackByTrack"
            className="navbar-logo"
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      <div className="navbar-right">
        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Procurar álbuns, artistas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="navbar-search-button">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="#7418BA"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </form>
      </div>
    </nav>
  );
}
