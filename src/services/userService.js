import { api } from "./api.js";
export const userService = {
  login: async (credentials) => {
    // Certifique-se de que está enviando no formato correto
    const loginData = {
      email: credentials.email,
      senha: credentials.senha,
    };

    try {
      const response = await api.post("/usuarios/login", loginData);
      localStorage.setItem("token", response.data.token);
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

    console.log("Dados enviados para o backend:", userDataForBackend);

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

  login: async (credentials) => {
    const response = await api.post("/usuarios/login", credentials);
    localStorage.setItem("token", response.data.token);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};
