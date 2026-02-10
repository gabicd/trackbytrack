const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper para pegar o token do localStorage
const getToken = () => localStorage.getItem('access_token');

// Salvar ação do usuário (listened, liked, rating, etc)
export const saveAlbumAction = async (albumId, action) => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/albums/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      albumId,
      isListened: action.isListened,
      isLiked: action.isLiked,
      wantToListen: action.wantToListen,
      rating: action.rating
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao salvar ação');
  }
  
  return data;
};

// Buscar estatísticas do álbum
export const getAlbumStats = async (albumId) => {
  const response = await fetch(`${API_URL}/albums/${albumId}/stats`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar estatísticas');
  }
  
  return data;
};

// Buscar ação do usuário para um álbum específico
export const getUserAlbumAction = async (albumId) => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/albums/${albumId}/user-action`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar ação do usuário');
  }
  
  return data;
};

// Buscar ações do usuário para múltiplos álbuns
export const getUserAlbumActions = async (albumIds) => {
  const token = getToken();
  
  const queryParams = albumIds.map(id => `albumIds=${encodeURIComponent(id)}`).join('&');
  
  const response = await fetch(`${API_URL}/albums/user-actions?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar ações');
  }
  
  return data;
};
