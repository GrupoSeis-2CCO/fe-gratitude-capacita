import { useState } from 'react';
import Button from '../components/Button';
<<<<<<< HEAD
import Header from '../components/Header';
// import { userService } from '../services/api';
import { userService } from "../services/userService";

=======
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55

export function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    cargo: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const validateField = async (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'nome':
        if (value.length < 2) {
          errors.nome = 'Nome deve ter pelo menos 2 caracteres';
        } else {
          delete errors.nome;
        }
        break;

      case 'cpf':
        const cleanCPF = value.replace(/\D/g, '');
        if (cleanCPF.length !== 11) {
          errors.cpf = 'CPF deve ter 11 dígitos';
        } else if (!isValidCPF(cleanCPF)) {
          errors.cpf = 'CPF inválido';
        } else {
          delete errors.cpf;
          try {
            const exists = await userService.checkCPF(cleanCPF);
            if (exists.exists) {
              errors.cpf = 'Este CPF já está cadastrado';
            }
          } catch (error) {
            console.log('Erro ao verificar CPF:', error);
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Email inválido';
        } else {
          delete errors.email;
          // Verificar se email já existe (opcional)
          try {
            const exists = await userService.checkEmail(value);
            if (exists.exists) {
              errors.email = 'Este email já está cadastrado';
            }
          } catch (error) {
            console.log('Erro ao verificar email:', error);
          }
        }
        break;

      case 'cargo':
        if (!value) {
          errors.cargo = 'Selecione um cargo';
        } else {
          delete errors.cargo;
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidCPF = (cpf) => {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.substring(10, 11));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isnomeValid = await validateField('nome', formData.nome);
    const isCPFValid = await validateField('cpf', formData.cpf);
    const isEmailValid = await validateField('email', formData.email);
    const isCargoValid = await validateField('cargo', formData.cargo);

    if (!isnomeValid || !isCPFValid || !isEmailValid || !isCargoValid) {
      setMessage({
        type: 'error',
        text: 'Por favor, corrija os erros no formulário'
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        email: formData.email.toLowerCase().trim(),
        cargo: formData.cargo
      };

      const result = await userService.create(userData);
      
      setMessage({
        type: 'success',
        text: `Colaborador ${result.nome} cadastrado com sucesso!`
      });

      // Limpar formulário
      setFormData({
        nome: '',
        cpf: '',
        email: '',
        cargo: ''
      });
      setValidationErrors({});

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao cadastrar colaborador'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    // Formatação automática do CPF
    if (name === 'cpf') {
      const formattedCPF = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedCPF
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (value.trim()) {
      setTimeout(() => validateField(name, value), 500);
    }

    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  return (
      <div className="min-h-screen pt-[200px] px-10 bg-gradient-to-tr from-blue-50 to-blue-100 flex justify-center items-start font-sans">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl text-gray-800 font-bold mb-4">
              Registrar novo colaborador
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Insira todas as informações do usuário
            </p>
          </div>

<<<<<<< HEAD
          <div className="register-form-container">
            <div className="register-image-section">
              <div className="register-branding">
                <svg width="120" height="120" viewBox="0 0 120 120" className="register-logo">
=======
          <div className="flex bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] max-w-6xl mx-auto">
            {/* Lado esquerdo - Branding */}
            <div className="flex-[0.8] bg-blue-500 flex items-center justify-center p-12">
              <div className="text-center text-white">
                <svg width="120" height="120" viewBox="0 0 120 120" className="mb-8 mx-auto drop-shadow-lg">
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                  <circle cx="60" cy="60" r="55" fill="#FF6B35" opacity="0.2"/>
                  <circle cx="60" cy="60" r="35" fill="#FF6B35"/>
                  <circle cx="60" cy="45" r="12" fill="white"/>
                  <path d="M40 75 Q40 65 60 65 Q80 65 80 75 L80 85 Q80 95 60 95 Q40 95 40 85 Z" fill="white"/>
                </svg>
                <h2 className="text-3xl font-bold mb-4">
                  Gratitude Serviços
                </h2>
                <p className="text-xl text-white/90 leading-relaxed mb-8">
                  Gestão de Projetos Sociais
                </p>
                <div className="flex justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-75">
                    <circle cx="40" cy="30" r="12" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M20 65 Q20 50 40 50 Q60 50 60 65" stroke="white" strokeWidth="2" fill="none"/>
                    <line x1="65" y1="25" x2="65" y2="35" stroke="white" strokeWidth="2"/>
                    <line x1="60" y1="30" x2="70" y2="30" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="register-form-section">
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                  <label htmlFor="nome">Nome completo</label>
=======
            {/* Lado direito - Formulário */}
            <div className="flex-[1.2] p-12 flex items-center">
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                <div className="flex flex-col">
                  <label htmlFor="fullName" className="text-lg text-gray-700 mb-2 font-semibold">
                    Nome completo
                  </label>
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    placeholder="Insira o nome do usuário"
                    value={formData.nome}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={validationErrors.nome ? 'error' : ''}
                    required
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                  />
                  {validationErrors.nome && (
                    <span className="error-message">{validationErrors.nome}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="cpf" className="text-lg text-gray-700 mb-2 font-semibold">
                    CPF
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    maxLength="14"
                    disabled={isLoading}
                    className={validationErrors.cpf ? 'error' : ''}
                    required
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                  />
                  {validationErrors.cpf && (
                    <span className="error-message">{validationErrors.cpf}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-lg text-gray-700 mb-2 font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="usuario@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={validationErrors.email ? 'error' : ''}
                    required
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                  />
                  {validationErrors.email && (
                    <span className="error-message">{validationErrors.email}</span>
                  )}
                </div>

<<<<<<< HEAD
                <div className="form-group">
                  <label htmlFor="cargo">Cargo</label>
=======
                <div className="flex flex-col">
                  <label htmlFor="role" className="text-lg text-gray-700 mb-2 font-semibold">
                    Cargo
                  </label>
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                  <select
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={validationErrors.cargo ? 'error' : ''}
                    required
<<<<<<< HEAD
                    >
                      <option disabled value="">Selecionar cargo</option>
                      <option value="1">Funcionário</option>
                      <option value="2">Colaborador</option>
                    </select>
                  {validationErrors.cargo && (
                    <span className="error-message">{validationErrors.cargo }</span>
                  )}
                </div>

                <div className="form-actions">
=======
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                  >
                    <option disabled value="">Selecionar cargo</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="funcionario">Funcionário</option>
                  </select>
                </div>

                <div className="flex justify-center mt-6">
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
                  <Button  
                    label={isLoading ? "CADASTRANDO..." : "CADASTRAR"}
                    variant="Default"
                    onClick={handleSubmit}
                    disabled={isLoading || Object.keys(validationErrors).length > 0}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}