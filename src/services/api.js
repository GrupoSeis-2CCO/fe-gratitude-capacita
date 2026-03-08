import axios from "axios";

// Em dev usa /api (proxy Vite), em prod usa VITE_BASE_URL (URL do backend Railway)
const BASE_URL = import.meta.env.VITE_BASE_URL || "/api";

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
