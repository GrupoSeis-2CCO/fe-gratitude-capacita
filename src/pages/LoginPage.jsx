import { useState } from "react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    alert(`Login tentado com: ${email}`);
  };

  return (
    <div className="min-h-screen pt-[7.5rem] px-[2.5rem] bg-gradient-to-tr from-[#e3f2fd] to-[#bbdefb] flex justify-center items-start font-sans">
      <div className="w-full max-w-[230rem] mx-auto">
        <div className="text-center mb-[8rem]">
          <h1 className="text-[12rem] text-[#1a1a1a] font-bold mb-[2rem]">
            Bem-vindo de volta!
          </h1>
          <p className="text-[6rem] text-[#666] leading-[1.5]">
            Faça login com seu e-mail e senha cadastrados.
          </p>
        </div>

        <div className="flex bg-white rounded-[3rem] shadow-[0_1rem_2rem_rgba(0,0,0,0.1)] overflow-hidden min-h-[100rem] max-w-[350rem] mx-auto">
          {/* Lado esquerdo - Branding */}
          <div className="flex-[0.8] bg-[#4A90E2] flex items-center justify-center p-[6rem]">
            <div className="text-center text-white">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                className="mb-[4rem] filter drop-shadow-[0_1rem_2rem_rgba(0,0,0,0.2)]"
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
              <h2 className="text-[8rem] font-bold mb-[2rem]">
                Gratitude Serviços
              </h2>
              <p className="text-[5rem] text-white/90 leading-[1.4]">
                Gestão de Projetos Sociais
              </p>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="flex-[1.2] p-[8rem] px-[10rem] flex items-center">
            <form
              className="w-full flex flex-col gap-[6rem]"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-[8rem] text-[#333] mb-[2rem] font-semibold"
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
                  className="w-full py-[5rem] px-[6rem] border-[0.5rem] border-solid border-[#ddd] rounded-[2rem] text-[8rem] bg-[#f8f9fa] placeholder:text-[7rem] text-[#333] focus:outline-none focus:border-[#FF6B35] focus:ring-[1rem] focus:ring-[rgba(255,107,53,0.1)] transition"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="text-[8rem] text-[#333] mb-[2rem] font-semibold"
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
                  className="w-full py-[5rem] px-[6rem] border-[0.5rem] border-solid border-[#ddd] rounded-[2rem] text-[8rem] bg-[#f8f9fa] placeholder:text-[7rem] text-[#333] focus:outline-none focus:border-[#FF6B35] focus:ring-[1rem] focus:ring-[rgba(255,107,53,0.1)] transition"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="min-w-[80rem] h-[16rem] bg-gradient-to-tr from-[#FF6B35] to-[#FF8A65] text-white border-none px-[4rem] rounded-[2rem] text-[8rem] cursor-pointer transition hover:from-[#FF8A65] hover:to-[#FF6B35]"
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
}
