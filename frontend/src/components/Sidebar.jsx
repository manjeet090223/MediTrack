import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiCalendar,
  FiPlus,
  FiLogOut,
  FiUser,
  FiUsers,
  FiUploadCloud,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
  FiFileText,
} from "react-icons/fi";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [isOpen, setIsOpen] = useState(window.innerWidth >= 900);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) setIsOpen(true);
      else setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goHome = () => {
    if (user?.role === "Doctor") navigate("/doctor-dashboard");
    else navigate("/home");
  };

  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="hamburger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        variants={sidebarVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
      >
        {/* Logo & Brand */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">M</div>
            <span className="logo-text">MediTrack</span>
          </div>
        </div>

        {/* User Info */}
        <div className="user-info-card">
          <div className="user-avatar">{user?.name?.charAt(0) || "U"}</div>
          <div className="user-details">
            <h4>{user?.name || "User"}</h4>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="menu">
            <li className={`menu-item ${isActive("/home") || isActive("/doctor-dashboard") ? "active" : ""}`}>
              <button 
                className="menu-link"
                onClick={goHome}
              >
                <FiHome className="icon" />
                <span>Home</span>
              </button>
            </li>

            <li className={`menu-item ${isActive("/my-appointments") || isActive("/appointments") ? "active" : ""}`}>
              <button 
                className="menu-link"
                onClick={() =>
                  user?.role === "Patient"
                    ? navigate("/my-appointments")
                    : navigate("/appointments")
                }
              >
                <FiCalendar className="icon" />
                <span>Appointments</span>
              </button>
            </li>

            {user?.role === "Patient" && (
              <>
                <li className={`menu-item ${isActive("/profile") ? "active" : ""}`}>
                  <button 
                    className="menu-link"
                    onClick={() => navigate("/profile")}
                  >
                    <FiUser className="icon" />
                    <span>My Profile</span>
                  </button>
                </li>
                <li className={`menu-item ${isActive("/book-appointment") ? "active" : ""}`}>
                  <button 
                    className="menu-link"
                    onClick={() => navigate("/book-appointment")}
                  >
                    <FiPlus className="icon" />
                    <span>Book Appointment</span>
                  </button>
                </li>
                <li className={`menu-item ${isActive("/upload-report") ? "active" : ""}`}>
                  <button 
                    className="menu-link"
                    onClick={() => navigate("/upload-report")}
                  >
                    <FiUploadCloud className="icon" />
                    <span>Upload Report</span>
                  </button>
                </li>
                <li className={`menu-item ${isActive("/my-prescriptions") ? "active" : ""}`}>
                  <button 
                    className="menu-link"
                    onClick={() => navigate("/my-prescriptions")}
                  >
                    <FiFileText className="icon" />
                    <span>My Prescriptions</span>
                  </button>
                </li>
              </>
            )}

            {user?.role === "Doctor" && (
              <>
                <li className={`menu-item ${isActive("/patients") ? "active" : ""}`}>
                  <button 
                    className="menu-link"
                    onClick={() => navigate("/patients")}
                  >
                    <FiUsers className="icon" />
                    <span>Patients</span>
                  </button>
                </li>
                <li className={`menu-item ${isActive("/doctor-profile") ? "active" : ""}`}>
                  <button 
                    className="menu-link"
                    onClick={() => navigate("/doctor-profile")}
                  >
                    <FiUser className="icon" />
                    <span>My Profile</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Divider */}
        <div className="sidebar-divider"></div>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          {/* Dark Mode Toggle */}
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <FiSun size={20} />
            ) : (
              <FiMoon size={20} />
            )}
            <span>{isDarkMode ? "Light" : "Dark"}</span>
          </button>

          {/* Logout Button */}
          <button 
            className="logout-btn"
            onClick={logout}
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
