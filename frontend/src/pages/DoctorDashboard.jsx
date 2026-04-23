import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowUpRight,
  FiFileText,
  FiSettings,
  FiMoreVertical,
  FiPlus
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import api from "../api/axios";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalPatients: 0,
    appointmentsToday: 0,
    pendingRequests: 0,
    appointmentsCompleted: 0,
  });
  const [appointmentsTrend, setAppointmentsTrend] = useState([]);
  const [newPatients, setNewPatients] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chart Filters State
  const [trendRange, setTrendRange] = useState("7d"); // '7d' or '30d'
  const [patientRange, setPatientRange] = useState("6m"); // '6m' or '1y'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [summaryRes, trendRes, patientsRes, scheduleRes] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get(`/api/dashboard/appointments-trend?range=${trendRange}`),
        api.get(`/api/dashboard/new-patients?range=${patientRange}`),
        api.get("/api/dashboard/today-schedule").catch(() => ({ data: [] }))
      ]);

      setSummary(summaryRes.data);
      setAppointmentsTrend(trendRes.data);
      setNewPatients(patientsRes.data);
      
      // Use backend data directly
      setTodaySchedule(scheduleRes.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [trendRange, patientRange]);

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            <span className="tooltip-indicator"></span>
            {payload[0].value} {payload[0].name === "appointments" ? "Appointments" : "Patients"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-wrapper">
      <Sidebar />

      <main className="page-main">
        <div className="page-container">
          {/* Quick Overview Header */}
          <motion.div
            className="doc-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h1 className="page-title">Good morning, {user?.name}</h1>
              <p className="page-subtitle">Here's what's happening at your practice today.</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => navigate("/patients")}>
                <FiUsers size={16} />
                <span>My Patients</span>
              </button>
              <button className="btn-primary-action" onClick={() => navigate("/appointments")}>
                <FiPlus size={16} />
                <span>New Appointment</span>
              </button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            className="kpi-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Total Patients */}
            <div className="doc-kpi-card kpi-blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/patients')}>
              <div className="doc-kpi-header">
                <div className="doc-kpi-icon"><FiUsers size={20} /></div>
                <button className="kpi-more-btn"><FiMoreVertical size={16} /></button>
              </div>
              <div className="doc-kpi-body">
                <h3>Total Patients</h3>
                <div className="doc-kpi-val-row">
                  <span className="doc-kpi-value">{loading ? "-" : summary.totalPatients}</span>
                  <span className="kpi-trend trend-up">
                    <FiArrowUpRight size={14} /> +12%
                  </span>
                </div>
                <p className="doc-kpi-context">vs last month</p>
              </div>
            </div>

            {/* Appointments Today */}
            <div className="doc-kpi-card kpi-green" style={{ cursor: 'pointer' }} onClick={() => navigate('/appointments')}>
              <div className="doc-kpi-header">
                <div className="doc-kpi-icon"><FiCalendar size={20} /></div>
                <button className="kpi-more-btn"><FiMoreVertical size={16} /></button>
              </div>
              <div className="doc-kpi-body">
                <h3>Today's Appointments</h3>
                <div className="doc-kpi-val-row">
                  <span className="doc-kpi-value">{loading ? "-" : summary.appointmentsToday}</span>
                </div>
                <div className="kpi-progress-bar">
                  <div 
                    className="kpi-progress-fill" 
                    style={{ 
                      width: summary.appointmentsToday > 0 
                        ? `${(summary.appointmentsCompleted / summary.appointmentsToday) * 100}%` 
                        : "0%" 
                    }}
                  ></div>
                </div>
                <p className="doc-kpi-context">
                  {loading ? "-" : `${summary.appointmentsCompleted} of ${summary.appointmentsToday} completed`}
                </p>
              </div>
            </div>

            {/* Pending Requests */}
            <div className={`doc-kpi-card ${summary.pendingRequests > 0 ? "kpi-amber" : "kpi-gray"}`} style={{ cursor: 'pointer' }} onClick={() => navigate('/appointments')}>
              <div className="doc-kpi-header">
                <div className="doc-kpi-icon">
                  {summary.pendingRequests > 0 ? <FiAlertCircle size={20} /> : <FiCheckCircle size={20} />}
                </div>
                <button className="kpi-more-btn"><FiMoreVertical size={16} /></button>
              </div>
              <div className="doc-kpi-body">
                <h3>Pending Requests</h3>
                <div className="doc-kpi-val-row">
                  <span className="doc-kpi-value">{loading ? "-" : summary.pendingRequests}</span>
                </div>
                <p className={`doc-kpi-context ${summary.pendingRequests > 0 ? "text-urgent" : ""}`}>
                  {summary.pendingRequests > 0 ? "Requires attention" : "All caught up"}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="doc-layout-grid">
            {/* LEFT COLUMN - Charts & Insights */}
            <div className="doc-col-left">
              <motion.div
                className="doc-chart-card"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="chart-header">
                  <div>
                    <h3>Patient Growth</h3>
                    <p>New patients acquired per month</p>
                  </div>
                  <select 
                    className="chart-filter" 
                    value={patientRange} 
                    onChange={(e) => setPatientRange(e.target.value)}
                  >
                    <option value="1y">This Year</option>
                    <option value="6m">Last 6 Months</option>
                  </select>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={newPatients} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(92, 107, 69, 0.05)' }} />
                      <Bar dataKey="patients" fill="var(--green-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                className="doc-chart-card"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="chart-header">
                  <div>
                    <h3>Appointment Trends</h3>
                    <p>Daily consultation volume</p>
                  </div>
                  <select 
                    className="chart-filter" 
                    value={trendRange} 
                    onChange={(e) => setTrendRange(e.target.value)}
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={appointmentsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="var(--green-primary)" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "var(--bg-primary)", stroke: "var(--green-primary)", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "var(--green-primary)", stroke: "var(--bg-primary)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Schedule & Tasks */}
            <div className="doc-col-right">
              {/* Today's Schedule panel */}
              <motion.div
                className="schedule-panel"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="schedule-header">
                  <div className="schedule-header-title">
                    <FiClock className="schedule-icon" />
                    <h3>Today's Schedule</h3>
                  </div>
                  <a href="/appointments" className="schedule-view-all">View All</a>
                </div>

                <div className="schedule-list">
                  {todaySchedule.length === 0 ? (
                    <div className="schedule-empty">
                      <FiCalendar size={32} />
                      <p>No more appointments for today.</p>
                    </div>
                  ) : (
                    todaySchedule.map((appt, idx) => (
                      <div key={appt.id || idx} className="schedule-item">
                        <div className="schedule-time">
                          <span className="time-val">{appt.time.split(" ")[0]}</span>
                          <span className="time-am">{appt.time.split(" ")[1]}</span>
                        </div>
                        <div className="schedule-divider">
                          <div className={`schedule-dot ${appt.status === "Waiting" ? "dot-urgent" : appt.status === "In Progress" ? "dot-active" : "dot-normal"}`}></div>
                          <div className="schedule-line"></div>
                        </div>
                        <div className="schedule-card">
                          <div className="schedule-card-top">
                            <h4>{appt.patientName}</h4>
                            <span className={`schedule-status badge-${appt.status.toLowerCase().replace(" ", "-")}`}>
                              {appt.status}
                            </span>
                          </div>
                          <p className="schedule-type">{appt.type}</p>
                          <div className="schedule-actions">
                            <button className="btn-sched-action" onClick={() => appt.patientId && navigate(`/patients/${appt.patientId}`)}>View Chart</button>
                            {appt.status !== "Completed" && (
                              <button className="btn-sched-primary">{appt.status === "Waiting" ? "Start" : "Mark Done"}</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Quick Actions Panel */}
              <motion.div
                className="quick-actions-panel"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h3>Quick Actions</h3>
                <div className="qa-grid">
                  <button className="qa-btn" onClick={() => navigate("/appointments")}>
                    <div className="qa-icon"><FiCalendar size={18} /></div>
                    <span>Manage Calendar</span>
                  </button>
                  <button className="qa-btn" onClick={() => navigate("/patients")}>
                    <div className="qa-icon"><FiUsers size={18} /></div>
                    <span>Patient Directory</span>
                  </button>
                  <button className="qa-btn" onClick={() => navigate("/medical-records")}>
                    <div className="qa-icon"><FiFileText size={18} /></div>
                    <span>Medical Records</span>
                  </button>
                  <button className="qa-btn" onClick={() => navigate("/settings")}>
                    <div className="qa-icon"><FiSettings size={18} /></div>
                    <span>Clinic Settings</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
