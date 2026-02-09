import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import tbtLogo from '../assets/tbt-logo.svg';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <img src={tbtLogo} alt="TrackByTrack" className="auth-logo-img" />
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="auth-input"
            required
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="auth-input"
            required
          />
          
          <input
            type="text"
            name="displayName"
            placeholder="Nome de exibição"
            value={formData.displayName}
            onChange={handleChange}
            className="auth-input"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
            required
          />
          
          <div className="auth-links">
            <Link to="/login" className="auth-link">
              Já possui uma conta? Faça login aqui
            </Link>
          </div>
          
          <button type="submit" className="auth-button">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
