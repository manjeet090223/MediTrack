import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaPlus, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <FaUserCircle className="avatar" />
        <h2 className="sidebar-brand">{user?.name || "User"}</h2>
        <span className="user-role">{user?.role}</span>
      </div>

      {/* Menu Links */}
      <ul className="menu">
        <li className="menu-item" onClick={() => navigate("/home")}>
          <FaHome className="icon" /> Home
        </li>

        <li className="menu-item" onClick={() => navigate("/appointments")}>
          <FaCalendarAlt className="icon" /> Appointments
        </li>

        {user?.role === "Patient" && (
          <li className="menu-item" onClick={() => navigate("/book-appointment")}>
            <FaPlus className="icon" /> Book Appointment
          </li>
        )}
      </ul>

      {/* Logout bottom fixed */}
      <div className="logout-section">
        <li className="menu-item logout-btn" onClick={logout}>
          <FaSignOutAlt className="icon" /> Logout
        </li>
      </div>
    </div>
  );
}
