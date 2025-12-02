import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaHospitalAlt } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import api from "../api/axios"; // Import your axios instance
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // State for summary and chart data
  const [summary, setSummary] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingRequests: 0,
  });
  const [appointmentsTrend, setAppointmentsTrend] = useState([]);
  const [newPatients, setNewPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [summaryRes, trendRes, patientsRes] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get("/api/dashboard/appointments-trend"),
        api.get("/api/dashboard/new-patients"),
      ]);

      setSummary(summaryRes.data);
      setAppointmentsTrend(trendRes.data);
      setNewPatients(patientsRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content fade-slide">
        <h1 className="page-title">Welcome {user?.name}</h1>

        {/* MEDITREK Info Card */}
        <div className="info-card">
          <div className="info-icon">
            <FaHospitalAlt />
          </div>
          <h3 className="info-title">MEDITREK</h3>
          <p className="info-text">
            MEDITREK helps you manage your appointments, patient records, and daily tasks efficiently.
            Stay organized and provide the best care to your patients with ease and clarity.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Patients</h3>
            <p>{loading ? "Loading..." : summary.totalPatients}</p>
          </div>
          <div className="summary-card">
            <h3>Appointments Today</h3>
            <p>{loading ? "Loading..." : summary.appointmentsToday}</p>
          </div>
          <div className="summary-card">
            <h3>Pending Requests</h3>
            <p>{loading ? "Loading..." : summary.pendingRequests}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="dashboard-charts">
          <div className="chart-card">
            <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Appointments Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={appointmentsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#0a8a42" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 style={{ textAlign: "center", marginBottom: "15px" }}>New Patients</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={newPatients}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#0a8a42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-actions">
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
