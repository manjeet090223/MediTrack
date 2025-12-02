// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import QuickStats from "../components/dashboard/QuickStats";
import HealthProgress from "../components/dashboard/HealthProgress";
import AppointmentsCarousel from "../components/dashboard/AppointmentsCarousel";
import HealthTips from "../components/dashboard/HealthTips";
import { FaHospitalUser, FaUserMd, FaUserInjured } from "react-icons/fa";

import api from "../api/axios"; // Axios instance with token
import "./Home.css";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);

  // ⚡ Fetch patient dashboard summary & upcoming appointments
  useEffect(() => {
    if (!user?.id) return;

    console.log("Fetching dashboard data for user:", user);

    const fetchData = async () => {
      try {
        // Patient Dashboard Summary
        const summaryRes = await api.get(
          `/api/dashboard/patient-summary/${user.id}`
        );
        console.log("Patient summary data:", summaryRes.data);
        setStats(summaryRes.data);

        // Upcoming Appointments
        const appointmentsRes = await api.get(
          `/api/appointments/patient/${user.id}`
        );
        console.log("Appointments fetched:", appointmentsRes.data);
        setAppointments(appointmentsRes.data);
      } catch (err) {
        console.error(
          "Dashboard fetch error:",
          err.response?.data || err.message
        );
      }
    };

    fetchData();
  }, []); // <- empty array ensures it runs only once

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content fade-slide">
        <h1 className="page-title">Welcome, {user?.name}</h1>

        <HealthTips />

        <QuickStats
          totalAppointments={stats.totalAppointments}
          upcomingAppointments={stats.upcomingAppointments}
          completedAppointments={stats.completedAppointments}
        />

        <div style={{ display: "flex", gap: "25px", marginTop: "20px", justifyContent:"center"}}>
          <HealthProgress progress={70} label="Health Score" />
          <HealthProgress progress={50} label="Medicine Adherence" />
        </div>

        {/* 🚀 Hospital Stat Cards replacing HoverCards */}
        <div className="hospital-stats" style={{ display: "flex", gap: "22px", marginTop: "25px", justifyContent:"center"}}>
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

        {appointments.length > 0 && (
          <AppointmentsCarousel appointments={appointments} />
        )}
      </div>
    </div>
  );
}
