import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_BACKEND_URL;

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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const method = response.config.method;
    const path = response.config.url;

    if (method !== "get" && !path.includes("login") && !path.includes("signup")) {
      toast.success(response.data.message || "Success!");
    }
    return response;
  },
  (error) => {
    const errMsg = error.response?.data?.message || "Something went wrong, please try again.";
    toast.error(errMsg);
    return Promise.reject(error);
  }
);



/* -------------------------------- APIs -------------------------------- */

// Appointments
export const createAppointment = (data) => api.post("/api/appointments", data);
export const getAppointments = () => api.get("/api/appointments");
export const cancelAppointment = (id) => api.put(`/api/appointments/${id}/cancel`);
export const updateAppointment = (id, data) => api.put(`/api/appointments/${id}`, data);
export const getPatientAppointmentsById = (id) => api.get(`/api/appointments/patient/${id}`);


// Patients
export const getAllPatients = () => api.get("/api/patients");
export const getPatientDetails = (id) => api.get(`/api/patients/${id}`);
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/api/patients/${id}`);

// ---------------- Dashboard APIs ----------------
// Summary counts: totalPatients, appointmentsToday, pendingRequests
export const getDashboardSummary = () => api.get("/api/dashboard/summary");

// Chart data: appointments trend (last 7 days)
export const getAppointmentsTrend = () => api.get("/api/dashboard/appointments-trend");

// Chart data: new patients per month
export const getNewPatients = () => api.get("/api/dashboard/new-patients");

// Reports
export const uploadReport = (formData) =>
  api.post("/api/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getReports = () => api.get("/api/reports/my-reports");


/* -------------------------------- Doctor APIs -------------------------------- */

// Get all doctors (Admin/Patient)
export const getAllDoctors = () => api.get("/api/doctors");

// Get single doctor details (Doctor/Admin)
export const getDoctorDetails = (id) => api.get(`/api/doctors/${id}`);

// Update doctor details (Doctor/Admin)
export const updateDoctor = (id, data) => api.put(`/api/doctors/${id}`, data);

// Delete doctor (Admin only)
export const deleteDoctor = (id) => api.delete(`/api/doctors/${id}`);

// Doctor → get only their own patients
export const getDoctorPatients = () => api.get("/api/patients/my-patients");

export default api;
