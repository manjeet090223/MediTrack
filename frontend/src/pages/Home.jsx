import React from "react";
import Sidebar from "../components/Sidebar";
import "./Home.css";
import { FaUserMd, FaUserInjured, FaHospitalUser } from "react-icons/fa";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content fade-slide">
        <h1 className="page-title">
          Welcome, {user?.name || "User"} 
        </h1>

        <div className="role-badge">
          {user?.role === "Doctor" ? (
            <>
              <FaUserMd className="role-icon" /> Doctor
            </>
          ) : (
            <>
              <FaUserInjured className="role-icon" /> Patient
            </>
          )}
        </div>

        <div className="info-card">
          <h3 className="info-title">
            {user?.role === "Doctor" ? (
              <>🩺 Manage Your Medical Duties Efficiently</>
            ) : (
              <> Stay Updated with Your Health Records</>
            )}
          </h3>

          <p className="info-text">
            Access appointments, patient/doctor info and stay connected with MediCare team.
          </p>
        </div>

        <div className="hospital-stats">
          <div className="stat-card">
            <FaHospitalUser className="stat-icon" />
            <h4>24/7 Support</h4>
            <p>Always here for your care</p>
          </div>
          <div className="stat-card">
            <FaUserMd className="stat-icon" />
            <h4>Expert Doctors</h4>
            <p>Qualified & Trusted</p>
          </div>
          <div className="stat-card">
            <FaUserInjured className="stat-icon" />
            <h4>Easy Appointments</h4>
            <p>Book anytime</p>
          </div>
        </div>

      </div>
    </div>
  );
}
