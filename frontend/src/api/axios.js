import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
