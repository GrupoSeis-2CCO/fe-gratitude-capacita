<<<<<<< HEAD
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
=======
import { useState } from "react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55

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
<<<<<<< HEAD

    
    <div className="login-page">
      <div className="login-content">
        <div className="login-header">
          <h1>Bem-vindo de volta!</h1>
          <p>Faça login com seu e-mail e senha cadastrados.</p>
=======
    <div className="min-h-screen pt-[200px] px-10 bg-gradient-to-tr from-blue-50 to-blue-100 flex justify-center items-start font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl text-gray-800 font-bold mb-4">
            Bem-vindo de volta!
          </h1>
          <p className="text-2xl text-gray-600 leading-relaxed">
            Faça login com seu e-mail e senha cadastrados.
          </p>
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
        </div>

        <div className="flex bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] max-w-6xl mx-auto">
          {/* Lado esquerdo - Branding */}
          <div className="flex-[0.8] bg-blue-500 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="mb-8 mx-auto drop-shadow-lg"
                aria-hidden="true"
              >
                <circle cx="60" cy="60" r="55" fill="#FF6B35" opacity="0.2" />
                <circle cx="60" cy="60" r="35" fill="#FF6B35" />
                <circle cx="60" cy="45" r="12" fill="white" />
                <path
                  d="M40 75 Q40 65 60 65 Q80 65 80 75 L80 85 Q80 95 60 95 Q40 95 40 85 Z"
                  fill="white"
                />
              </svg>
              <h2 className="text-3xl font-bold mb-4">
                Gratitude Serviços
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Gestão de Projetos Sociais
              </p>
            </div>
          </div>

          {/* Lado direito - Formulário */}
<<<<<<< HEAD
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
=======
          <div className="flex-[1.2] p-12 flex items-center">
            <form
              className="w-full flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-lg text-gray-700 mb-2 font-semibold"
                >
                  Email
                </label>
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
<<<<<<< HEAD
                  disabled={isLoading}
=======
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="text-lg text-gray-700 mb-2 font-semibold"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
<<<<<<< HEAD
                  disabled={isLoading}
=======
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                />
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
<<<<<<< HEAD
                  className="login-button"
                  disabled={isLoading}
=======
                  className="min-w-80 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white border-none px-8 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-200"
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
