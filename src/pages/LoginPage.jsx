import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import tbtLogo from '../assets/tbt-logo.svg';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
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
    console.log('Login attempt:', formData);
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
            name="usernameOrEmail"
            placeholder="Username ou email"
            value={formData.usernameOrEmail}
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
            <Link to="/register" className="auth-link">
              Não possui uma conta? Cadastre-se aqui
            </Link>
            <Link to="/forgot-password" className="auth-link">
              Esqueci minha senha
            </Link>
          </div>
          
          <button type="submit" className="auth-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
