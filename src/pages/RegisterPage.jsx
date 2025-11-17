
import { useState } from 'react';
import Button from '../components/Button';
import { userService } from '../services/UserService';
import { useNavigate } from 'react-router-dom';


export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Máscaras -------------------------------------------------
  const maskCPF = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let out = digits;
    if (digits.length > 3) out = digits.slice(0,3) + '.' + digits.slice(3);
    if (digits.length > 6) out = out.slice(0,7) + '.' + out.slice(7);
    if (digits.length > 9) out = out.slice(0,11) + '-' + out.slice(11);
    return out;
  };

  // Validação ------------------------------------------------
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nome deve ter ao menos 3 caracteres';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido (use ###.###.###-##)';
    }
    if (!formData.role) {
      newErrors.role = 'Selecione um cargo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Dados inválidos', message: 'Corrija os campos destacados.' } }));
      return;
    }
    setLoading(true);
    // Mapear role para idCargo: 1 = funcionário, 2 = colaborador
    let idCargo = null;
    if (formData.role === 'funcionario') idCargo = 1;
    if (formData.role === 'colaborador') idCargo = 2;
    try {
      await userService.create({
        nome: formData.fullName,
        cpf: formData.cpf,
        email: formData.email,
        cargo: idCargo
      });
  window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', title: 'Cadastro realizado' } }));
      // Opcional: navegar para login
      // navigate('/login');
    } catch (error) {
  window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Erro ao cadastrar', message: 'Verifique os dados e tente novamente' } }));
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'cpf') newValue = maskCPF(value);
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  return (
      <div className="min-h-screen pt-28 px-10 bg-gradient-to-tr from-blue-50 to-blue-100 flex justify-center items-start font-sans">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-5xl text-gray-800 font-bold mb-2">
              Registrar novo colaborador
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed">
              Insira todas as informações do usuário
            </p>
          </div>

          <div className="flex min-h-[600px] w-200 mb-10 bg-white rounded-3xl shadow-xl overflow-hidden max-w-6xl mx-auto">
            {/* Lado esquerdo - Branding */}
            <div className="flex-[0.8] bg-blue-500 flex items-center justify-center p-12">
              <div className="text-center text-white">
                <svg width="120" height="120" viewBox="0 0 120 120" className="mb-8 mx-auto drop-shadow-lg">
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

            {/* Lado direito - Formulário */}
            <div className="flex-[1.2] p-12 flex items-center overflow-y-auto">
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                <div className="flex flex-col">
                  <label htmlFor="fullName" className="text-lg text-gray-700 mb-2 font-semibold">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Insira o nome do usuário"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`w-full py-3 px-4 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition`}
                  />
                  {errors.fullName && <div className="h-5 mt-1"><span className="text-sm text-red-600">{errors.fullName}</span></div>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="cpf" className="text-lg text-gray-700 mb-2 font-semibold">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                    className={`w-full py-3 px-4 border ${errors.cpf ? 'border-red-500' : 'border-gray-300'} rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition`}
                  />
                  {errors.cpf && <div className="h-5 mt-1"><span className="text-sm text-red-600">{errors.cpf}</span></div>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-lg text-gray-700 mb-2 font-semibold">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="usuario@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full py-3 px-4 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition`}
                  />
                  {errors.email && <div className="h-5 mt-1"><span className="text-sm text-red-600">{errors.email}</span></div>}
                </div>

                <div className="flex flex-col">
                  <label htmlFor="role" className="text-lg text-gray-700 mb-2 font-semibold">
                    Cargo
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className={`w-full py-3 px-4 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg text-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition`}
                  >
                    <option disabled value="">Selecionar cargo</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="funcionario">Funcionário</option>
                  </select>
                  {errors.role && <div className="h-5 mt-1"><span className="text-sm text-red-600">{errors.role}</span></div>}
                </div>

                <div className="flex justify-center mt-6">
                  <Button  
                    label={loading ? "Cadastrando..." : "CADASTRAR"}
                    variant="Default"
                    onClick={handleSubmit}
                    disabled={loading}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}