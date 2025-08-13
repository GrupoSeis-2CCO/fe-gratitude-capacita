import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // CRIAR .env NA RAIZ DO PROJETO 
  headers: {
    "X-API-KEY": "", // TODO: Colocar o Token Bearer aqui a partir do localStorage ou cookie
  },
});


export default api;