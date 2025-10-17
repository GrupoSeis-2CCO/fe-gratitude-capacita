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
  // Mapeia tipo de usuário de forma robusta
  // Convenção global neste frontend e no backend: 1 = Funcionário, 2 = Colaborador
      let tipoFinal = null;

      // Tenta extrair informações do próprio token (JWT)
      try {
        const parts = String(response.data.token || '').split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1] || '')) || {};
          const idCargoClaim = parseInt(payload.idCargo ?? payload.cargo ?? payload.fkCargo, 10);
          if (!Number.isNaN(idCargoClaim)) {
            tipoFinal = idCargoClaim; // 1=Funcionário, 2=Colaborador
          } else {
            const tipoClaim = parseInt(payload.tipo ?? payload.userType ?? payload.type, 10);
            if (!Number.isNaN(tipoClaim)) tipoFinal = tipoClaim;
          }
        }
      } catch (_) {
        // ignore
      }

      // Se ainda não definido, tenta pelo corpo da resposta
      if (tipoFinal == null) {
        const idCargoResp = parseInt(response.data.idCargo ?? response.data.cargo, 10);
        if (!Number.isNaN(idCargoResp)) {
          tipoFinal = idCargoResp; // 1=Funcionário, 2=Colaborador
        } else {
          const tipoRaw = response.data.userType ?? response.data.tipo;
          const tipoParsed = parseInt(tipoRaw, 10);
          if (!Number.isNaN(tipoParsed)) tipoFinal = tipoParsed;
        }
      }

      if (tipoFinal != null) {
        localStorage.setItem("userType", String(tipoFinal));
      }
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
