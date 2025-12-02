// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import QuickStats from "../components/dashboard/QuickStats";
import HealthProgress from "../components/dashboard/HealthProgress";
import HoverCard from "../components/dashboard/HoverCard";
import AppointmentsCarousel from "../components/dashboard/AppointmentsCarousel";
import HealthTips from "../components/dashboard/HealthTips";
import { FaNotesMedical, FaHeartbeat, FaHistory } from "react-icons/fa";

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

        <div style={{ display: "flex", gap: "25px", marginTop: "20px" }}>
          <HealthProgress progress={70} label="Health Score" />
          <HealthProgress progress={50} label="Medicine Adherence" />
        </div>

        <div style={{ display: "flex", gap: "22px", marginTop: "25px" }}>
          <HoverCard
            icon={<FaNotesMedical />}
            title="Reports"
            description="View & Upload Medical Reports"
          />
          <HoverCard
            icon={<FaHeartbeat />}
            title="Prescriptions"
            description="Check your doctor’s medication suggestions"
          />
          <HoverCard
            icon={<FaHistory />}
            title="History"
            description="Track all your visit records"
          />
        </div>

        {appointments.length > 0 && (
          <AppointmentsCarousel appointments={appointments} />
        )}
      </div>
    </div>
  );
}
