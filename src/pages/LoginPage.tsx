import { useState } from 'react';
import '../styles/LoginPage.css';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    alert(`Login tentado com: ${email}`);
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
            <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
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
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="login-button"
                >
                  LOGIN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;