import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import { userService } from '../services/userService';
import OrangeAlert from "../components/OrangeAlert";



export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("showLoginAlert") === "true") {
      setShowAlert(true);
      localStorage.removeItem("showLoginAlert");
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("showLoginAlert") === "true") {
      setShowAlert(true);
      localStorage.removeItem("showLoginAlert");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Fazer login usando o userService
      await userService.login({ 
        email: email.toLowerCase().trim(), 
        senha: password 
      });
      
      // Redirecionar para a página principal após login bem-sucedido
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Email ou senha incorretos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  
  
  return (

    
    <div className="login-page">
      <div className="login-content">
        <div className="login-header">
          <h1>Bem-vindo de volta!</h1>
          <p>Faça login com seu e-mail e senha cadastrados.</p>
        </div>

        <div className="login-form-container">
          {/* Lado esquerdo - Branding */}
          <div className="login-image-section">
            <div className="login-branding">
              <svg width="120" height="120" viewBox="0 0 120 120" className="login-logo">
                <circle cx="60" cy="60" r="55" fill="#FF6B35" opacity="0.2"/>
                <circle cx="60" cy="60" r="35" fill="#FF6B35"/>
                <circle cx="60" cy="45" r="12" fill="white"/>
                <path d="M40 75 Q40 65 60 65 Q80 65 80 75 L80 85 Q80 95 60 95 Q40 95 40 85 Z" fill="white"/>
              </svg>
              <h2>Gratitude Serviços</h2>
              <p>Gestão de Projetos Sociais</p>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="login-form-section">
            {showAlert && (
              <OrangeAlert>
                Você <b>NÃO</b> possui acesso, Realize o Login primeiro
              </OrangeAlert>
            )}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'ENTRANDO...' : 'LOGIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}