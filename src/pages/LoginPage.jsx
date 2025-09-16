
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/UserService";

export function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await userService.login({ email, senha: password });
      // Exibe no console o status do login e o tipo de usuário
      console.log("Login realizado com sucesso:", data);
      const userType = parseInt(localStorage.getItem("userType"));
  // Redireciona para /cursos para qualquer cargo
  navigate("/cursos");
    } catch (error) {
      alert("Email ou senha inválidos. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[200px] px-10 bg-gradient-to-tr from-blue-50 to-blue-100 flex justify-center items-start font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl text-gray-800 font-bold mb-4">
            Bem-vindo de volta!
          </h1>
          <p className="text-2xl text-gray-600 leading-relaxed">
            Faça login com seu e-mail e senha cadastrados.
          </p>
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
          <div className="flex-[1.2] p-12 flex items-center">
            <form
              className="w-full flex flex-col gap-6"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!loading) await handleLogin();
              }}
            >
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-lg text-gray-700 mb-2 font-semibold"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
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
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg text-lg bg-gray-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="min-w-80 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white border-none px-8 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-200 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "LOGIN"}
                </button>
              </div>

              {/* Mock Login Buttons - REMOVER EM PRODUÇÃO */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <p className="text-sm text-gray-500 mb-4 text-center">🚧 Mock Login para Testes (REMOVER EM PRODUÇÃO)</p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("token", "mock-token-funcionario");
                      localStorage.setItem("userType", "1");
                      console.log("Mock login como Funcionário (tipo 1)");
                      navigate("/cursos");
                    }}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    🧑‍💼 Mock Login - Funcionário (Tipo 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("token", "mock-token-colaborador");
                      localStorage.setItem("userType", "2");
                      console.log("Mock login como Colaborador (tipo 2)");
                      navigate("/cursos");
                    }}
                    className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    👥 Mock Login - Colaborador (Tipo 2)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
