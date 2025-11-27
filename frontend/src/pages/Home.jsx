import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="auth-container">
      <div className="card home-card">
        <h1 className="brand-title animate-fade">Welcome, {user?.name || "User"}!</h1>
        <p className="tagline animate-fade" style={{ marginBottom: "25px" }}>
          You are logged in as <strong>{user?.role || "Patient"}</strong>
        </p>

        <div className="role-card">
          {user?.role === "Doctor" ? (
            <p>🩺 Access your patients’ health records and manage appointments.</p>
          ) : (
            <p>💊 Track your health records and communicate with your doctor.</p>
          )}
        </div>

        <button className="btn logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
