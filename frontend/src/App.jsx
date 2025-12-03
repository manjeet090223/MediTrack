import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home"; // Patient Dashboard
import DoctorDashboard from "./pages/DoctorDashboard"; // Doctor Dashboard
import Appointments from "./pages/Appointments"; // Doctor Appointments
import PatientAppointments from "./pages/PatientAppointments"; // Patient Appointments
import BookAppointment from "./pages/BookAppointment";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails"; // view patient details only
import UploadReport from "./pages/UploadReport"; // Patient report upload
import PatientProfile from "./pages/PatientProfile";
import DoctorProfile from "./pages/DoctorProfile"; // Doctor profile

// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
   
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Home />
            </ProtectedRoute>
          }
        />

 
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Appointments />
            </ProtectedRoute>
          }
        />

  
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PatientAppointments />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-report"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <UploadReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "Admin"]}>
              <PatientDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
