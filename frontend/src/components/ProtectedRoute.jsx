// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is provided, check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home/dashboard if role not allowed
    return <Navigate to="/" replace />;
  }

  return children;
}
