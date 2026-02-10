import { useState, useEffect, useCallback } from 'react';
import { updateMyProfile, checkUsernameAvailability } from '../services/userApi.js';
import { getCloudinaryConfig, uploadAvatarToCloudinary, deleteOldAvatar } from '../services/uploadApi.js';
import './EditProfileModal.css';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'seu_cloud_name';

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    avatarUrl: null,
    avatarPublicId: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  
  // Estados para upload de avatar
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        displayName: user.displayName || '',
        avatarUrl: user.avatarUrl || null,
        avatarPublicId: user.avatarPublicId || null
      });
      setPreviewUrl(user.avatarUrl || null);
    }
  }, [user]);

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!regex.test(username)) {
      return 'Username deve ter 3-15 caracteres (letras, números, underscore)';
    }
    return '';
  };

  const checkUsername = useCallback(async (username) => {
    if (username === user?.username) {
      setUsernameAvailable(true);
      setUsernameError('');
      return;
    }

    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      setUsernameAvailable(false);
      return;
    }

    setUsernameChecking(true);
    setUsernameError('');
    
    try {
      const result = await checkUsernameAvailability(username);
      setUsernameAvailable(result.available);
      if (!result.available) {
        setUsernameError('Username já está em uso');
      }
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setUsernameChecking(false);
    }
  }, [user?.username]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username) {
        checkUsername(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, checkUsername]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'username') {
      setUsernameError('');
    }
  };

  // Validação do arquivo de imagem
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const minWidth = 128;
    const minHeight = 128;
    
    if (!validTypes.includes(file.type)) {
      return 'Formato inválido. Use JPG, PNG ou WebP';
    }
    
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Máximo 2MB';
    }
    
    return '';
  };

  // Handler para seleção de arquivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Criar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
    setError('');
  };

  // Upload do avatar
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    
    setUploadingAvatar(true);
    setError('');
    
    try {
      // 1. Buscar configuração do backend
      const config = await getCloudinaryConfig();
      
      // 2. Fazer upload para Cloudinary (UNSIGNED)
      const uploadResult = await uploadAvatarToCloudinary(selectedFile, config);
      
      // 3. Se tinha avatar antigo, deletar
      if (formData.avatarPublicId) {
        try {
          await deleteOldAvatar(formData.avatarPublicId);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
          // Não bloqueia se falhar ao deletar antigo
        }
      }
      
      // 4. Atualizar formData com novo avatar
      setFormData(prev => ({
        ...prev,
        avatarUrl: uploadResult.url,
        avatarPublicId: uploadResult.publicId
      }));
      
      setSelectedFile(null);
      
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload da imagem');
      console.error('Avatar upload error:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (usernameError || !usernameAvailable) {
      return;
    }

    // Se tem arquivo selecionado mas não fez upload ainda
    if (selectedFile) {
      await handleAvatarUpload();
    }

    setLoading(true);
    setError('');

    try {
      const result = await updateMyProfile({
        username: formData.username,
        displayName: formData.displayName,
        avatarUrl: formData.avatarUrl,
        avatarPublicId: formData.avatarPublicId
      });
      
      onUpdate(result.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group avatar-group">
            <div className="avatar-preview-container">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="avatar-preview-image"
                />
              ) : (
                <div className="avatar-preview-placeholder">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="#999">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="avatar-upload-controls">
              <input
                type="file"
                id="avatar-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="avatar-input" className="btn-secondary">
                Escolher foto
              </label>
              
              {selectedFile && (
                <button 
                  type="button" 
                  className="btn-primary btn-small"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? 'Enviando...' : 'Confirmar foto'}
                </button>
              )}
            </div>
            
            <span className="helper-text">JPG, PNG ou WebP. Máx 2MB. Mín 128x128px</span>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-prefix">@</span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input-with-prefix ${usernameError ? 'error' : ''} ${usernameAvailable && formData.username && formData.username !== user?.username ? 'success' : ''}`}
                required
              />
            </div>
            {usernameChecking && <span className="input-status checking">Verificando...</span>}
            {usernameError && <span className="input-status error">{usernameError}</span>}
            {!usernameError && usernameAvailable && formData.username && formData.username !== user?.username && <span className="input-status success">✓ Disponível</span>}
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Nome de exibição</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              maxLength={40}
              required
            />
            <span className="char-count">{formData.displayName.length}/40</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !usernameAvailable || !!usernameError}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
