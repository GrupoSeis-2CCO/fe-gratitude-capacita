import axios from "axios";

// In dev, force '/api' to ensure Vite proxy is used. In prod, read from env with fallback.
const BASE_URL = (import.meta.env?.DEV)
  ? "/api"
  : (import.meta.env.VITE_BASE_URL || "/api");

export const api = axios.create({
  baseURL: BASE_URL,
});

// Normalize relative URLs so baseURL is applied even if callers pass a leading '/'
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAbsolute = /^https?:\/\//i.test(url);
  if (!isAbsolute && url.startsWith('/')) {
    config.url = url.replace(/^\/+/, '');
  }
  return config;
});

// Config Local
/*
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/

// Config AWS

api.interceptors.request.use((config) => {
  // Não adicionar token APENAS para o endpoint de login
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
