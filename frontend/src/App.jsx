import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";


import Home from "./pages/Home"; 
import DoctorDashboard from "./pages/DoctorDashboard"; 
import Appointments from "./pages/Appointments"; 
import PatientAppointments from "./pages/PatientAppointments"; 
import BookAppointment from "./pages/BookAppointment";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails"; 
import UploadReport from "./pages/UploadReport"; 
import PatientProfile from "./pages/PatientProfile";
import DoctorProfile from "./pages/DoctorProfile"; 
import MedicalRecords from "./pages/MedicalRecords"; 
import ClinicSettings from "./pages/ClinicSettings"; 
import MyPrescriptions from "./pages/MyPrescriptions"; 


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
          path="/my-prescriptions"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <MyPrescriptions />
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
            <ProtectedRoute allowedRoles={["Doctor"]}>
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
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MedicalRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <ClinicSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
