import React from "react";
import Sidebar from "../components/Sidebar";

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content fade-slide">
        <h1 className="page-title">Welcome Dr. {user?.name}</h1>

        <div className="info-card">
          <h3>🩺 Doctor Portal</h3>
          <p>Manage appointments and patient records efficiently.</p>
        </div>

        <div className="dashboard-options">
          <button className="primary-btn" onClick={() => navigate("/appointments")}>
            Manage Appointments
          </button>

          <button className="primary-btn" onClick={() => navigate("/patients")}>
            View Patients
          </button>
        </div>
      </div>
    </div>
  );
}
