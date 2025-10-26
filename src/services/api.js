import axios from "axios";

// Sempre usar /api (funciona em dev e prod com proxy NGINX)
const BASE_URL = "/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor de token
api.interceptors.request.use((config) => {
  const isLoginEndpoint = (config.url || '').includes('usuarios/login');

  if (!isLoginEndpoint) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
