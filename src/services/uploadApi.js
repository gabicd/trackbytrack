const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper para pegar o token do localStorage
const getToken = () => localStorage.getItem('access_token');

// Buscar configuração do Cloudinary (para upload unsigned)
export const getCloudinaryConfig = async () => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/uploads/config`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao obter configuração');
  }
  
  return data;
};

// Upload da imagem para o Cloudinary (unsigned)
export const uploadAvatarToCloudinary = async (file, config) => {
  const formData = new FormData();
  
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', config.folder || 'avatars');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Erro ao fazer upload');
  }
  
  return {
    publicId: data.public_id,
    url: data.secure_url,
    format: data.format,
    width: data.width,
    height: data.height
  };
};

// Deletar avatar antigo do Cloudinary
export const deleteOldAvatar = async (publicId) => {
  const token = getToken();
  
  const response = await fetch(`${API_URL}/uploads/delete-avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ publicId })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erro ao deletar avatar antigo');
  }
  
  return data;
};

// Gerar URL do avatar com transformações
export const getAvatarUrl = (publicId, size = 200, cloudName) => {
  if (!publicId || !cloudName) return null;
  
  // Transformações: resize, crop com detecção de rosto, qualidade auto
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_thumb,g_face,q_auto/${publicId}`;
};
