import { api } from "./api.js";

export const userService = {
  login: async (credentials) => {
    const loginData = {
      email: credentials.email,
      senha: credentials.senha,
    };

    try {
      const response = await api.post("/usuarios/login", loginData);
      localStorage.setItem("token", response.data.token);
      console.log('Login backend response:', response.data);
      // Tenta salvar o tipo de usuário usando os campos possíveis
      let tipo = response.data.userType ?? response.data.tipo ?? response.data.cargo ?? response.data.idCargo;
      tipo = parseInt(tipo, 10);
      localStorage.setItem("userType", tipo);
      // Persistir também o id do usuário para facilitar outras operações (ex.: matrícula)
      try {
        const uid = response.data.idUsuario ?? response.data.id ?? response.data.usuarioId ?? response.data.userId;
        if (uid != null) {
          localStorage.setItem("usuarioId", String(uid));
        }
      } catch (_) {
        // noop
      }
      return response.data;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  create: async (userData) => {
    const userDataForBackend = {
      nome: userData.nome,
      cpf: userData.cpf.replace(/\D/g, ""),
      email: userData.email,
      idCargo: parseInt(userData.cargo, 10),
    };

    const response = await api.post("/usuarios", userDataForBackend);
    return response.data;
  },

  checkCPF: async (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    const response = await api.get(`/usuarios/validar-cpf/${cleanCPF}`);
    return response.data;
  },

  checkEmail: async (email) => {
    const response = await api.get(`/usuarios/validar-email/${email}`);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    window.location.href = "/login";
  },

  // Funções para verificação de permissões baseadas no tipo de usuário
  getCurrentUserType: () => {
    return parseInt(localStorage.getItem("userType")) || null;
  },

  isFuncionario: () => {
    return userService.getCurrentUserType() === 1;
  },

  isColaborador: () => {
    return userService.getCurrentUserType() === 2;
  },

  hasPermission: (allowedUserTypes) => {
    const currentUserType = userService.getCurrentUserType();
    return allowedUserTypes.includes(currentUserType);
  },
};

export default userService;
