import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook customizado para gerenciamento de autenticação e autorização
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  /**
   * Obtém o tipo do usuário atual
   */
  const getCurrentUserType = () => {
    return parseInt(localStorage.getItem("userType")) || null;
  };

  /**
   * Obtém informações do usuário atual
   */
  const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    const userType = getCurrentUserType();

    return {
      token,
      userType,
      isAuthenticated: !!token,
      isColaborador: userType === 2,
      isFuncionario: userType === 1,
    };
  };

  /**
   * Redireciona para login com mensagem personalizada
   */
  const redirectToLogin = (
    message = "Você precisa estar logado para acessar esta página."
  ) => {
    // Para compatibilidade, mantém alert mas pode ser substituído por notificação
    alert(message);
    navigate("/login", {
      state: { from: location, message },
      replace: true,
    });
  };

  /**
   * Verifica se o usuário tem permissão para acessar determinado recurso
   */
  const checkPermission = (allowedUserTypes = [1, 2]) => {
    const { isAuthenticated, userType } = getCurrentUser();

    if (!isAuthenticated) {
      setTimeout(() => {
        redirectToLogin(
          "🔒 Você precisa estar logado para acessar esta página. Faça login para continuar."
        );
      }, 100);
      return false;
    }

    if (!allowedUserTypes.includes(userType)) {
      const getUserTypeLabel = (type) => {
        switch (type) {
          case 1:
            return "Funcionário";
          case 2:
            return "Colaborador";
          default:
            return "Usuário";
        }
      };

      const allowedLabels = allowedUserTypes
        .map((type) => getUserTypeLabel(type))
        .join(" ou ");

      setTimeout(() => {
        redirectToLogin(
          `🚫 Acesso negado. Esta página é restrita para: ${allowedLabels}. Você está logado como: ${getUserTypeLabel(
            userType
          )}.`
        );
      }, 100);
      return false;
    }

    return true;
  };

  /**
   * Efetua logout do usuário
   */
  const logout = (message = "✅ Você foi desconectado com sucesso.") => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    if (message) {
      alert(message);
    }
    window.location.href = "/login";
  };

  return {
    isAuthenticated,
    isLoggedIn: isAuthenticated, // Alias para compatibilidade
    getCurrentUser,
    getCurrentUserType,
    redirectToLogin,
    checkPermission,
    logout,
  };
};
