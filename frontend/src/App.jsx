import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home"; // Patient Dashboard
import DoctorDashboard from "./pages/DoctorDashboard"; // Doctor Dashboard
import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/BookAppointment";
import Patients from "./pages/Patients";

// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Patient Dashboard */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Doctor Dashboard */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Both Roles */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["Patient", "Doctor"]}>
              <Appointments />
            </ProtectedRoute>
          }
        />

        {/* Patient-only */}
        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        {/* Doctor-only */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Patients />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
