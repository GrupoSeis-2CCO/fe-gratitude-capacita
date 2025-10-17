import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedUserTypes = [1, 2] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem("token");
      const userType = parseInt(localStorage.getItem("userType"));

      // Usuário não logado
      if (!token) {
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'warning', title: 'Login necessário', message: 'Faça login para continuar.' } }));
        navigate("/login", { 
          state: { 
            from: location, 
            message: "🔒 Você precisa estar logado para acessar esta página. Faça login para continuar." 
          }, 
          replace: true 
        });
        return;
      }

      // Usuário sem permissão
      if (!allowedUserTypes.includes(userType)) {
        const getUserTypeLabel = (type) => {
          switch (type) {
            case 1: return "Funcionário";
            case 2: return "Colaborador";
            default: return "Usuário";
          }
        };

        const allowedLabels = allowedUserTypes
          .map(type => getUserTypeLabel(type))
          .join(" ou ");
        
        const message = `🚫 Acesso negado. Esta página é restrita para: ${allowedLabels}. Você está logado como: ${getUserTypeLabel(userType)}.`;
        
        window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', title: 'Acesso negado', message } }));
        navigate("/login", { 
          state: { 
            from: location, 
            message: message 
          }, 
          replace: true 
        });
        return;
      }

      // Usuário tem acesso
      setIsChecking(false);
    };

    checkAccess();
  }, [navigate, location, allowedUserTypes]);

  // Mostra loading ou nada enquanto verifica
  if (isChecking) {
    return <div className="flex items-center justify-center min-h-96">
      <div className="text-lg text-gray-600">Verificando acesso...</div>
    </div>;
  }

  return children;
}