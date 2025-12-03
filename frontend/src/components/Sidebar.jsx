import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
  FaFileUpload,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Mobile detection: hide sidebar by default if screen < 900px
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 900);

  // Update sidebar if window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) setIsOpen(true);
      else setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <>
      {/* Hamburger Button */}
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <FaUserCircle className="avatar" />
          <h2 className="sidebar-brand">{user?.name || "User"}</h2>
          <span className="user-role">{user?.role}</span>
        </div>

        <ul className="menu">
          <li className="menu-item" onClick={goHome}>
            <FaHome className="icon" /> Home
          </li>

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
    </>
  );
}
