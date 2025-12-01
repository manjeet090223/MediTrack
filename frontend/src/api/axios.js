import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_BACKEND_URL; // https://meditrack-iyrc.onrender.com

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for toast messages
api.interceptors.response.use(
  (response) => {
    if (response.config.method !== "get") {
      toast.success(response.data.message || "Action successful!");
    }
    return response;
  },
  (error) => {
    const errMsg =
      error.response?.data?.message ||
      "Something went wrong! Please try again.";
    toast.error(errMsg);
    return Promise.reject(error);
  }
);

/* -------------------- Appointment APIs -------------------- */

// Notice the /api prefix added to all routes
export const createAppointment = (appointmentData) =>
  api.post("/api/appointments", appointmentData);

export const getAppointments = () => api.get("/api/appointments");

export const cancelAppointment = (id) =>
  api.put(`/api/appointments/${id}/cancel`);

export const updateAppointment = (id, updateData) =>
  api.put(`/api/appointments/${id}`, updateData);

export default api;
