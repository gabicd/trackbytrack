const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper para pegar o token do localStorage
const getToken = () => localStorage.getItem('access_token');

// Buscar perfil de um usuário pelo username
export const fetchUserProfile = async (username) => {
  const response = await fetch(`${API_URL}/users/${username}/profile`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar perfil');
  }
  
  return data;
};

// Buscar perfil do usuário logado
export const fetchMyProfile = async () => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao buscar perfil');
  }
  
  return data;
};

// Atualizar perfil do usuário logado
export const updateMyProfile = async (profileData) => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao atualizar perfil');
  }
  
  return data;
};

// Verificar disponibilidade do username
export const checkUsernameAvailability = async (username) => {
  const response = await fetch(`${API_URL}/users/check-username/${username}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao verificar username');
  }
  
  return data;
};
