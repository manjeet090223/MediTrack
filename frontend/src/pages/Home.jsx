import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiCheckCircle,
  FiTrendingUp,
  FiBook,
  FiPlus,
  FiShare2,
  FiAward,
  FiBell,
  FiUsers,
  FiBarChart2,
  FiHeart,
  FiInfo
} from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import StatusBanner from "../components/dashboard/StatusBanner";
import KPICard from "../components/dashboard/KPICard";
import AppointmentsList from "../components/dashboard/AppointmentsList";
import QuickActionCards from "../components/dashboard/QuickActionCards";
import { useSmartMessages } from "../hooks/useSmartMessages";
import { getTrendIndicator } from "../utils/formatters";
import api from "../api/axios";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState({
    healthScore: 75,
    medicineAdherence: 65,
    previousHealthScore: 70,
    previousAdherence: 60
  });

  const smartMessages = useSmartMessages(stats, appointments);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const summaryRes = await api.get(`/api/dashboard/patient-summary/${user.id}`);
        setStats(summaryRes.data);

        const appointmentsRes = await api.get(`/api/appointments/patient/${user.id}`);
        setAppointments(appointmentsRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const healthTrend = getTrendIndicator(healthMetrics.healthScore, healthMetrics.previousHealthScore);
  const adherenceTrend = getTrendIndicator(healthMetrics.medicineAdherence, healthMetrics.previousAdherence);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule a consultation with our doctors",
      icon: <FiPlus size={28} />,
      color: "primary",
      onClick: () => navigate("/book-appointment")
    },
    {
      title: "Upload Report",
      description: "Share your medical documents",
      icon: <FiShare2 size={28} />,
      color: "success",
      onClick: () => navigate("/upload-report")
    },
    {
      title: "View Progress",
      description: "Track your health metrics",
      icon: <FiTrendingUp size={28} />,
      color: "info",
      onClick: () => navigate("/profile")
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <motion.div
            className="welcome-section"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div>
              <h1 className="welcome-title">
                {smartMessages.greeting}, {user?.name?.split(" ")[0]}! <FiHeart style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
              </h1>
              <p className="welcome-subtitle">
                Here's your health overview for today
              </p>
            </div>
          </motion.div>

          {/* Status Banner */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <StatusBanner
              status={smartMessages.statusBanner.status}
              message={smartMessages.statusBanner.message}
              icon={smartMessages.statusBanner.icon}
              onAction={() => navigate("/my-appointments")}
            />
          </motion.div>

          {/* KPI Cards Grid */}
          <motion.div
            className="kpi-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <KPICard
              title="Total Appointments"
              value={stats.totalAppointments}
              icon={<FiCalendar />}
              color="primary"
              loading={loading}
              description="All-time appointments"
            />
            <KPICard
              title="Upcoming"
              value={stats.upcomingAppointments}
              icon={<FiCheckCircle />}
              color="success"
              loading={loading}
              description="Scheduled for you"
              trend={getTrendIndicator(stats.upcomingAppointments, Math.max(0, stats.upcomingAppointments - 1))}
            />
            <KPICard
              title="Completed"
              value={stats.completedAppointments}
              icon={<FiAward />}
              color="info"
              loading={loading}
              description="Successfully completed"
            />
          </motion.div>

          {/* Health Metrics & Appointments Section */}
          <div className="dashboard-grid">
            {/* Left Column - Health Metrics */}
            <motion.div
              className="health-metrics-card card-elevated"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="card-header">
                <h3>Health Metrics</h3>
              </div>

              <div className="metrics-row">
                <div className="metric">
                  <div className="metric-label">Health Score</div>
                  <div className="metric-value">{healthMetrics.healthScore}%</div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${healthMetrics.healthScore}%`,
                        background: "linear-gradient(90deg, #10B981, #059669)"
                      }}
                    ></div>
                  </div>
                  {healthTrend && (
                    <span className={`trend ${healthTrend.trend}`}>
                      {healthTrend.trend === "up" ? "↑" : "↓"} {healthTrend.percentage}%
                    </span>
                  )}
                </div>

                <div className="metric">
                  <div className="metric-label">Medicine Adherence</div>
                  <div className="metric-value">{healthMetrics.medicineAdherence}%</div>
                  <div className="metric-bar">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${healthMetrics.medicineAdherence}%`,
                        background: "linear-gradient(90deg, #0EA5E9, #0284C7)"
                      }}
                    ></div>
                  </div>
                  {adherenceTrend && (
                    <span className={`trend ${adherenceTrend.trend}`}>
                      {adherenceTrend.trend === "up" ? "↑" : "↓"} {adherenceTrend.percentage}%
                    </span>
                  )}
                </div>
              </div>

              <div className="metrics-info">
                <p className="info-box success">
                  <FiCheckCircle style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />{smartMessages.health.medicine.message}
                </p>
                <p className="info-box primary">
                  <FiInfo style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />{smartMessages.health.health.message}
                </p>
              </div>
            </motion.div>

            {/* Right Column - Upcoming Appointments */}
            <motion.div
              className="appointments-card card-elevated"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="card-header">
                <h3>Upcoming Appointments</h3>
                {appointments.length > 0 && (
                  <span className="badge">{appointments.length}</span>
                )}
              </div>

              <AppointmentsList
                appointments={appointments}
                loading={loading}
                limit={5}
                onViewAll={() => navigate("/my-appointments")}
              />
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            className="quick-actions-section"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Get things done in seconds</p>
            </div>
            <QuickActionCards actions={quickActions} />
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="features-section"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="section-header">
              <h2>Why MediTrack?</h2>
              <p>Everything you need for better health management</p>
            </div>

            <div className="features-grid">
              <motion.div className="feature-card" variants={itemVariants}>
                <div className="feature-icon success">
                  <FiBell size={32} />
                </div>
                <h4>Smart Reminders</h4>
                <p>Never miss a dose with intelligent medication reminders</p>
              </motion.div>

              <motion.div className="feature-card" variants={itemVariants}>
                <div className="feature-icon primary">
                  <FiUsers size={32} />
                </div>
                <h4>Expert Doctors</h4>
                <p>Connect with qualified healthcare professionals 24/7</p>
              </motion.div>

              <motion.div className="feature-card" variants={itemVariants}>
                <div className="feature-icon info">
                  <FiBarChart2 size={32} />
                </div>
                <h4>Health Insights</h4>
                <p>Track and visualize your health progress over time</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
