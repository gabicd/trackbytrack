import { useState, useEffect, useCallback, useRef } from 'react';
import spotifyService from '../services/spotifyService';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const ITEMS_PER_PAGE = 24;

class SearchCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

const globalCache = new SearchCache();

export function useAlbumSearch(query, clientId, clientSecret) {
  const [state, setState] = useState({
    albums: [],
    filteredAlbums: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 0
  });

  const abortControllerRef = useRef(null);

  const filterAlbums = useCallback((albums, searchQuery) => {
    if (!searchQuery.trim()) return albums;

    const terms = searchQuery.toLowerCase().trim().split(/\s+/);
    
    return albums.filter(album => {
      const albumName = album.name.toLowerCase();
      const artistNames = album.artists.map(a => a.name.toLowerCase()).join(' ');
      const searchableText = `${albumName} ${artistNames}`;
      
      return terms.every(term => searchableText.includes(term));
    });
  }, []);

  const calculatePagination = useCallback((filteredAlbums, page) => {
    const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
    const safePage = Math.min(Math.max(1, page), totalPages || 1);
    
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedAlbums = filteredAlbums.slice(startIndex, endIndex);
    
    return {
      albums: paginatedAlbums,
      currentPage: safePage,
      totalPages
    };
  }, []);

  useEffect(() => {
    if (!query.trim() || !clientId || !clientSecret) {
      setState({
        albums: [],
        filteredAlbums: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 0
      });
      return;
    }

    const searchAlbums = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Verificar cache
        const cached = globalCache.get(query.toLowerCase());
        
        let allAlbums;
        if (cached) {
          allAlbums = cached;
        } else {
          spotifyService.setCredentials(clientId, clientSecret);
          allAlbums = await spotifyService.searchAlbums(query);
          globalCache.set(query.toLowerCase(), allAlbums);
        }

        // Filtrar álbuns
        const filtered = filterAlbums(allAlbums, query);
        
        // Calcular paginação
        const pagination = calculatePagination(filtered, 1);

        setState({
          albums: allAlbums,
          filteredAlbums: filtered,
          loading: false,
          error: null,
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Erro ao buscar álbuns'
          }));
        }
      }
    };

    searchAlbums();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, clientId, clientSecret, filterAlbums, calculatePagination]);

  const goToPage = useCallback((page) => {
    setState(prev => {
      const pagination = calculatePagination(prev.filteredAlbums, page);
      return {
        ...prev,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages
      };
    });
  }, [calculatePagination]);

  const getCurrentPageAlbums = useCallback(() => {
    const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return state.filteredAlbums.slice(startIndex, endIndex);
  }, [state.currentPage, state.filteredAlbums]);

  return {
    albums: getCurrentPageAlbums(),
    loading: state.loading,
    error: state.error,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalResults: state.filteredAlbums.length,
    goToPage
  };
}
