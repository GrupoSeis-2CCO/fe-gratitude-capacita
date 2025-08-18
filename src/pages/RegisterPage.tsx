import { useState } from 'react';
import '../styles/RegisterPage.css';
import Button from '../components/Button';
import Header from '../components/Header';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    role: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Header />
      
      <div className="register-page">
        <div className="register-content">
          <div className="register-header">
            <h1>Registrar novo colaborador</h1>
            <p>Insira todas as informações do usuário</p>
          </div>

          <div className="register-form-container">
            {/* Lado esquerdo - Branding */}
            <div className="register-image-section">
              <div className="register-branding">
                <svg width="120" height="120" viewBox="0 0 120 120" className="register-logo">
                  <circle cx="60" cy="60" r="55" fill="#FF6B35" opacity="0.2"/>
                  <circle cx="60" cy="60" r="35" fill="#FF6B35"/>
                  <circle cx="60" cy="45" r="12" fill="white"/>
                  <path d="M40 75 Q40 65 60 65 Q80 65 80 75 L80 85 Q80 95 60 95 Q40 95 40 85 Z" fill="white"/>
                </svg>
                <h2>Gratitude Serviços</h2>
                <p>Gestão de Projetos Sociais</p>
                <div className="register-icon-accent">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="user-plus-icon">
                    <circle cx="40" cy="30" r="12" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M20 65 Q20 50 40 50 Q60 50 60 65" stroke="white" strokeWidth="2" fill="none"/>
                    <line x1="65" y1="25" x2="65" y2="35" stroke="white" strokeWidth="2"/>
                    <line x1="60" y1="30" x2="70" y2="30" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Lado direito - Formulário */}
            <div className="register-form-section">
              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label htmlFor="fullName">Nome completo</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Insira o nome do usuário"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    placeholder="Ex: 12345678900"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="usuario@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Cargo</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option disabled value="">Selecionar cargo</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="funcionario">Funcionário</option>
                  </select>
                </div>

                <div  className="form-actions">
                  <Button  
                    label="CADASTRAR"
                    variant="Default"
                    onClick={handleSubmit}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}