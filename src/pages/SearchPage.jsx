import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import AlbumCard from '../components/AlbumCard';
import Pagination from '../components/Pagination';
import './SearchPage.css';

// Spotify API Credentials via variáveis de ambiente
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const {
    albums,
    loading,
    error,
    currentPage,
    totalPages,
    totalResults,
    goToPage
  } = useAlbumSearch(query, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);

  const handleSearch = (searchQuery) => {
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="search-title">
          {query ? `Resultados para "${query}"` : 'Buscar Álbuns'}
        </h1>

      </div>

      <div className="search-content">
        {!query && (
          <div className="search-empty-state">
            <svg 
              viewBox="0 0 24 24" 
              width="64" 
              height="64" 
              fill="#7418BA"
              className="search-empty-icon"
            >
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <p className="search-empty-text">
              Digite o nome de um álbum ou artista para começar a busca
            </p>
          </div>
        )}

        {query && loading && (
          <div className="search-loading">
            <div className="search-loading-spinner"></div>
            <p>Buscando álbuns... </p>
          </div>
        )}

        {query && error && (
          <div className="search-error">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="#dc2626">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p>{error}</p>
            <button 
              className="search-retry-button"
              onClick={() => handleSearch(query)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {query && !loading && !error && albums.length === 0 && (
          <div className="search-no-results">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#666666">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <p className="search-no-results-title">Nenhum álbum encontrado</p>
            <p className="search-no-results-text">
              Não encontramos álbuns que contenham todos os termos da busca.
              <br />
              Tente usar termos diferentes ou menos específicos.
            </p>
          </div>
        )}

        {query && !loading && !error && albums.length > 0 && (
          <>
            <p className="search-results-info">
              {totalResults} {totalResults === 1 ? 'álbum encontrado' : 'álbuns encontrados'}
            </p>
            
            <div className="search-results-grid">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  imgSrc={album.images[0]?.url || 'https://via.placeholder.com/300'}
                  albumTitle={album.name}
                  artistName={album.artists.map(a => a.name).join(', ')}
                  releaseYear={album.releaseYear}
                  albumType={album.albumType}
                  onClick={() => handleAlbumClick(album.id)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
