import { useState, useEffect, useCallback, useRef } from 'react';
import discogsService from '../services/discogsService';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

class DiscogsCache {
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

const globalCache = new DiscogsCache();

export function useDiscogsData(albumName, artistName, consumerKey, consumerSecret) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const abortControllerRef = useRef(null);

  const fetchDiscogsData = useCallback(async () => {
    if (!albumName.trim() || !consumerKey || !consumerSecret) {
      setState({
        data: null,
        loading: false,
        error: null
      });
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Criar chave de cache
      const cacheKey = `${albumName}-${artistName || ''}`.toLowerCase();
      
      // Verificar cache
      const cached = globalCache.get(cacheKey);
      
      if (cached) {
        setState({
          data: cached,
          loading: false,
          error: null
        });
        return;
      }

      // Buscar na API
      discogsService.setCredentials(consumerKey, consumerSecret);
      const data = await discogsService.getAlbumInfo(albumName, artistName);
      
      // Salvar no cache
      if (data) {
        globalCache.set(cacheKey, data);
      }

      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching Discogs data:', error);
        setState({
          data: null,
          loading: false,
          error: error.message || 'Erro ao buscar dados da Discogs'
        });
      }
    }
  }, [albumName, artistName, consumerKey, consumerSecret]);

  useEffect(() => {
    fetchDiscogsData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDiscogsData]);

  const refetch = useCallback(() => {
    // Limpar cache específico e buscar novamente
    const cacheKey = `${albumName}-${artistName || ''}`.toLowerCase();
    globalCache.cache.delete(cacheKey);
    fetchDiscogsData();
  }, [fetchDiscogsData, albumName, artistName]);

  return {
    discogsData: state.data,
    loading: state.loading,
    error: state.error,
    refetch
  };
}
