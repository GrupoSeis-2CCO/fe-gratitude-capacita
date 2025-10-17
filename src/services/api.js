import axios from "axios";

export const api = axios.create({
baseURL: "http://localhost:8080",
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
  const isLoginEndpoint = config.url?.includes('/usuarios/login');
  
  if (!isLoginEndpoint) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});


export default api;
