const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Busca release na Discogs via backend (com cache)
 */
export async function searchDiscogsRelease(artist, album) {
  const response = await fetch(
    `${API_BASE_URL}/discogs/search?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar na Discogs');
  }
  
  const data = await response.json();
  
  // Log se veio do cache (para debug)
  if (data.fromCache) {
    console.log('📦 Dados vindos do cache!');
  }
  
  return data;
}

/**
 * Busca detalhes do release
 */
export async function getDiscogsReleaseDetails(id) {
  const response = await fetch(`${API_BASE_URL}/discogs/release/${id}`);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar detalhes do release');
  }
  
  return response.json();
}

/**
 * Estatísticas do cache (debug)
 */
export async function getCacheStats() {
  const response = await fetch(`${API_BASE_URL}/discogs/cache/stats`);
  return response.json();
}
