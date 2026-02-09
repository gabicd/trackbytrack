import { useState, useEffect, useCallback, useRef } from 'react';
import { searchDiscogsRelease } from '../services/discogsApi';

export function useDiscogsData(albumName, artistName) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const abortControllerRef = useRef(null);

  const fetchDiscogsData = useCallback(async () => {
    if (!albumName.trim()) {
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
      // Buscar via backend (que já tem cache integrado)
      const response = await searchDiscogsRelease(artistName, albumName);
      
      // Extrair dados do primeiro resultado
      let data = null;
      if (response.results && response.results.length > 0) {
        const release = response.results[0];
        data = {
          id: release.id,
          title: release.title,
          year: release.year,
          genres: release.genre || [],
          styles: release.style || [],
          labels: [...new Set((release.label || []).map(l => typeof l === 'string' ? l : l.name))].slice(0, 2),
          fromCache: response.fromCache
        };
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
  }, [albumName, artistName]);

  useEffect(() => {
    fetchDiscogsData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDiscogsData]);

  const refetch = useCallback(() => {
    fetchDiscogsData();
  }, [fetchDiscogsData]);

  return {
    discogsData: state.data,
    loading: state.loading,
    error: state.error,
    refetch
  };
}
