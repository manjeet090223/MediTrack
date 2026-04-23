import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMyPrescriptions } from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiClock,
  FiUser,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "./MyPrescriptions.css";

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await getMyPrescriptions();
        setPrescriptions(res.data);
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const completedPrescriptions = prescriptions.filter((p) => p.status === "completed");

  const filtered =
    filter === "active"
      ? activePrescriptions
      : filter === "completed"
      ? completedPrescriptions
      : prescriptions;

  if (loading) {
    return (
      <div className="myrx-layout">
        <Sidebar />
        <main className="myrx-main">
          <div className="myrx-loading">
            <div className="spinner"></div>
            <p>Loading your prescriptions...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="myrx-layout">
      <Sidebar />
      <main className="myrx-main">
        <motion.div
          className="myrx-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <header className="myrx-header">
            <div>
              <h1 className="myrx-title">My Prescriptions</h1>
              <p className="myrx-subtitle">Your complete medication history</p>
            </div>
            <div className="myrx-stats">
              <div className="myrx-stat-chip myrx-stat-active">
                <FiActivity size={14} />
                {activePrescriptions.length} Active
              </div>
              <div className="myrx-stat-chip myrx-stat-completed">
                <FiCheckCircle size={14} />
                {completedPrescriptions.length} Completed
              </div>
            </div>
          </header>

          {/* Active Medications Highlight */}
          {activePrescriptions.length > 0 && (
            <motion.section
              className="myrx-active-highlight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="myrx-active-highlight-header">
                <FiAlertCircle size={18} className="myrx-pulse-icon" />
                <h2>Active Medications</h2>
                <span className="myrx-active-count">{activePrescriptions.length}</span>
              </div>
              <div className="myrx-active-meds-row">
                {activePrescriptions.flatMap((rx) =>
                  rx.medicines.map((med, idx) => (
                    <div className="myrx-active-med-pill" key={`${rx._id}-${idx}`}>
                      <span className="myrx-active-med-name">{med.name}</span>
                      <span className="myrx-active-med-dosage">{med.dosage}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.section>
          )}

          {/* Filter Tabs */}
          <div className="myrx-filter-tabs">
            {[
              { key: "all", label: `All (${prescriptions.length})` },
              { key: "active", label: `Active (${activePrescriptions.length})` },
              { key: "completed", label: `Completed (${completedPrescriptions.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`myrx-filter-tab ${filter === tab.key ? "myrx-filter-tab-active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Prescriptions Timeline */}
          {filtered.length === 0 ? (
            <div className="myrx-empty">
              <div className="myrx-empty-icon">
                <FiFileText size={40} />
              </div>
              <h3>No prescriptions found</h3>
              <p>
                {filter === "all"
                  ? "Your doctor hasn't added any prescriptions yet."
                  : `No ${filter} prescriptions at the moment.`}
              </p>
            </div>
          ) : (
            <div className="myrx-timeline">
              <AnimatePresence mode="popLayout">
                {filtered.map((rx, index) => (
                  <motion.div
                    key={rx._id}
                    className={`myrx-card ${rx.status === "active" ? "myrx-card-active" : "myrx-card-completed"}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                  >
                    {/* Timeline dot */}
                    <div className="myrx-timeline-dot">
                      <div className={`myrx-dot ${rx.status === "active" ? "myrx-dot-active" : "myrx-dot-completed"}`} />
                    </div>

                    <div className="myrx-card-content">
                      {/* Card Header */}
                      <div className="myrx-card-top">
                        <div className="myrx-card-title-row">
                          <h3 className="myrx-card-diagnosis">{rx.diagnosis}</h3>
                          <span
                            className={`myrx-badge ${
                              rx.status === "active" ? "myrx-badge-active" : "myrx-badge-completed"
                            }`}
                          >
                            {rx.status === "active" ? "Active" : "Completed"}
                          </span>
                        </div>

                        <div className="myrx-card-meta">
                          <span className="myrx-meta-item">
                            <FiUser size={12} />
                            {rx.doctorId?.name || "Unknown"}
                          </span>
                          <span className="myrx-meta-item">
                            <FiClock size={12} />
                            {new Date(rx.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Medicines */}
                      <div className="myrx-medicines">
                        <p className="myrx-medicines-label">Medicines</p>
                        <div className="myrx-medicines-grid">
                          {rx.medicines.map((med, idx) => (
                            <div
                              className={`myrx-medicine-card ${rx.status === "active" ? "myrx-medicine-card-active" : ""}`}
                              key={idx}
                            >
                              <div className="myrx-medicine-header">
                                <span className="myrx-medicine-name">{med.name}</span>
                                {rx.status === "active" && (
                                  <span className="myrx-medicine-live-dot" />
                                )}
                              </div>
                              <div className="myrx-medicine-tags">
                                <span className="myrx-tag myrx-tag-dosage">
                                  Dosage: {med.dosage}
                                </span>
                                <span className="myrx-tag myrx-tag-duration">
                                  {med.duration}
                                </span>
                              </div>
                              {med.instructions && (
                                <p className="myrx-medicine-instructions">
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {rx.notes && (
                        <div className="myrx-notes-block">
                          <p className="myrx-notes-label">Doctor's Notes</p>
                          <p className="myrx-notes-text">{rx.notes}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
