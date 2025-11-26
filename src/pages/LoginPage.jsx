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
      console.log("Login realizado com sucesso:", data);
      const userType = parseInt(localStorage.getItem("userType"));
      navigate("/cursos");
    } catch (error) {
      window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Login invalido', message: 'Email ou senha incorretos' } }));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 py-10 md:py-16 font-sans">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6 px-2">
          <h1 className="text-3xl sm:text-4xl text-gray-800 font-bold mb-3">
            Bem-vindo de volta!
          </h1>
          <p className="text-lg sm:text-2xl text-gray-600 leading-relaxed">
            Faca login com seu e-mail e senha cadastrados.
          </p>
        </div>

        <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden md:min-h-[520px] lg:min-h-[560px]">
          <div className="w-full md:w-[42%] bg-blue-500 flex items-center justify-center p-10 sm:p-12">
            <div className="text-center text-white max-w-sm space-y-2">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="mb-6 mx-auto drop-shadow-lg"
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
              <h2 className="text-2xl sm:text-3xl font-bold">
                Gratitude Servicos
              </h2>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                Gestao de Projetos Sociais
              </p>
            </div>
          </div>

          <div className="w-full md:w-[58%] p-8 sm:p-10 lg:p-12 flex items-center">
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
                  className="text-base sm:text-lg text-gray-700 mb-2 font-semibold"
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
                  className="w-full py-3 px-4 border border-zinc-300 rounded-lg text-lg bg-zinc-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="text-base sm:text-lg text-gray-700 mb-2 font-semibold"
                >
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="w-full py-3 px-4 border border-zinc-300 rounded-lg text-lg bg-zinc-50 placeholder:text-gray-500 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="w-full sm:w-72 h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white border-none px-8 rounded-lg text-lg font-semibold cursor-pointer transition-all duration-200 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "LOGIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
