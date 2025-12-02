import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
  FaFileUpload,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goHome = () => {
    if (user?.role === "Doctor") navigate("/doctor-dashboard");
    else navigate("/home");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaUserCircle className="avatar" />
        <h2 className="sidebar-brand">{user?.name || "User"}</h2>
        <span className="user-role">{user?.role}</span>
      </div>

      <ul className="menu">
        {/* Home */}
        <li className="menu-item" onClick={goHome}>
          <FaHome className="icon" /> Home
        </li>

        {/* Appointments */}
        <li
          className="menu-item"
          onClick={() =>
            user?.role === "Patient"
              ? navigate("/my-appointments")
              : navigate("/appointments")
          }
        >
          <FaCalendarAlt className="icon" /> Appointments
        </li>

        {/* Patient-only links */}
        {user?.role === "Patient" && (
          <>
            <li className="menu-item" onClick={() => navigate("/profile")}>
              <FaUserCircle className="icon" /> My Profile
            </li>
            <li className="menu-item" onClick={() => navigate("/book-appointment")}>
              <FaPlus className="icon" /> Book Appointment
            </li>
            <li className="menu-item" onClick={() => navigate("/upload-report")}>
              <FaFileUpload className="icon" /> Upload Report
            </li>
          </>
        )}

        {/* Doctor-only links */}
        {user?.role === "Doctor" && (
          <>
            <li className="menu-item" onClick={() => navigate("/doctor-profile")}>
              <FaUserCircle className="icon" /> My Profile
            </li>
            <li className="menu-item" onClick={() => navigate("/patients")}>
              <FaUsers className="icon" /> View Patients
            </li>
          </>
        )}
      </ul>

      <div className="logout-section">
        <li className="menu-item logout-btn" onClick={logout}>
          <FaSignOutAlt className="icon" /> Logout
        </li>
      </div>
    </div>
  );
}
