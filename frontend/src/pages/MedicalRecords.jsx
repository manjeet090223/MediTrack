import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiUser,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiEye,
  FiFolder,
  FiImage,
  FiFile,
  FiArrowLeft,
  FiClipboard,
  FiActivity,
} from "react-icons/fi";
import api from "../api/axios";
import "./MedicalRecords.css";

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState({});
  const [recordsLoading, setRecordsLoading] = useState({});

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/api/patients/my-patients");
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const togglePatient = async (patientId) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null);
      return;
    }
    setExpandedPatient(patientId);

    if (!patientRecords[patientId]) {
      setRecordsLoading((prev) => ({ ...prev, [patientId]: true }));
      try {
        const endpoint =
          activeTab === "prescriptions"
            ? `/api/prescriptions/patient/${patientId}`
            : `/api/reports/patient/${patientId}`;
        const res = await api.get(endpoint);
        const data =
          activeTab === "prescriptions"
            ? res.data?.data || res.data || []
            : res.data?.reports || [];
        setPatientRecords((prev) => ({
          ...prev,
          [patientId]: { [activeTab]: data },
        }));
      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setRecordsLoading((prev) => ({ ...prev, [patientId]: false }));
      }
    }
  };

  // When tab changes, clear expanded state
  useEffect(() => {
    setExpandedPatient(null);
    setPatientRecords({});
  }, [activeTab]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "?";

  const tabCounts = {
    prescriptions: "Rx",
    reports: "Files",
  };

  return (
    <div className="mr-page-layout">
      <Sidebar />
      <main className="mr-main">
        <div className="mr-container">
          {/* Header */}
          <motion.div
            className="mr-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button className="mr-back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="mr-title">Medical Records</h1>
              <p className="mr-subtitle">
                Access prescriptions and reports across all your patients
              </p>
            </div>
          </motion.div>

          {/* Tabs + Search */}
          <motion.div
            className="mr-toolbar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mr-tabs">
              <button
                className={`mr-tab ${activeTab === "prescriptions" ? "mr-tab-active" : ""}`}
                onClick={() => setActiveTab("prescriptions")}
              >
                <FiClipboard size={15} />
                Prescriptions
              </button>
              <button
                className={`mr-tab ${activeTab === "reports" ? "mr-tab-active" : ""}`}
                onClick={() => setActiveTab("reports")}
              >
                <FiFolder size={15} />
                Reports
              </button>
            </div>
            <div className="mr-search-box">
              <FiSearch className="mr-search-icon" />
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Patient List */}
          <div className="mr-patient-list">
            {loading ? (
              <div className="mr-loading">
                <div className="spinner"></div>
                <p>Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="mr-empty">
                <FiFileText size={40} />
                <h3>No patients found</h3>
                <p>No patients match your search criteria</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredPatients.map((patient, idx) => (
                  <motion.div
                    key={patient._id}
                    className="mr-patient-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    {/* Patient Row Header */}
                    <button
                      className={`mr-patient-header ${expandedPatient === patient._id ? "mr-patient-expanded" : ""}`}
                      onClick={() => togglePatient(patient._id)}
                    >
                      <div className="mr-patient-info">
                        <div className="mr-patient-avatar">
                          {getInitials(patient.name)}
                        </div>
                        <div>
                          <span className="mr-patient-name">
                            {patient.name}
                          </span>
                          <span className="mr-patient-email">
                            {patient.email}
                          </span>
                        </div>
                      </div>
                      <div className="mr-patient-meta">
                        {patient.gender && (
                          <span className="mr-meta-tag">{patient.gender}</span>
                        )}
                        {patient.age && (
                          <span className="mr-meta-tag">
                            {patient.age} yrs
                          </span>
                        )}
                        <span className="mr-chevron">
                          {expandedPatient === patient._id ? (
                            <FiChevronUp size={18} />
                          ) : (
                            <FiChevronDown size={18} />
                          )}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Records */}
                    <AnimatePresence>
                      {expandedPatient === patient._id && (
                        <motion.div
                          className="mr-records-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {recordsLoading[patient._id] ? (
                            <div className="mr-records-loading">
                              <div className="spinner"></div>
                              <span>Loading {activeTab}...</span>
                            </div>
                          ) : !patientRecords[patient._id]?.[activeTab]
                              ?.length ? (
                            <div className="mr-records-empty">
                              <FiFileText size={24} />
                              <span>
                                No {activeTab} found for this patient
                              </span>
                            </div>
                          ) : activeTab === "prescriptions" ? (
                            <div className="mr-rx-list">
                              {patientRecords[patient._id].prescriptions.map(
                                (rx) => (
                                  <div key={rx._id} className="mr-rx-card">
                                    <div className="mr-rx-header">
                                      <div className="mr-rx-icon">
                                        <FiActivity size={16} />
                                      </div>
                                      <div className="mr-rx-info">
                                        <span className="mr-rx-diagnosis">
                                          {rx.diagnosis || "General"}
                                        </span>
                                        <span className="mr-rx-date">
                                          {new Date(
                                            rx.createdAt
                                          ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                      <span
                                        className={`mr-rx-status mr-rx-${rx.status}`}
                                      >
                                        {rx.status}
                                      </span>
                                    </div>
                                    {rx.medicines?.length > 0 && (
                                      <div className="mr-rx-meds">
                                        {rx.medicines.map((med, i) => (
                                          <span key={i} className="mr-rx-med">
                                            {med.name}{" "}
                                            {med.dosage && `· ${med.dosage}`}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    {rx.notes && (
                                      <p className="mr-rx-notes">{rx.notes}</p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="mr-report-list">
                              {patientRecords[patient._id].reports.map((r) => {
                                const isImage = /\.(jpg|jpeg|png)$/i.test(
                                  r.originalName
                                );
                                const isPdf = /\.pdf$/i.test(r.originalName);
                                const fileUrl = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/uploads/reports/${encodeURIComponent(r.filename)}`;
                                return (
                                  <div key={r._id} className="mr-report-item">
                                    <div className="mr-report-icon">
                                      {isImage ? (
                                        <FiImage size={16} />
                                      ) : isPdf ? (
                                        <FiFileText size={16} />
                                      ) : (
                                        <FiFile size={16} />
                                      )}
                                    </div>
                                    <div className="mr-report-info">
                                      <span className="mr-report-name">
                                        {r.originalName || r.filename}
                                      </span>
                                      <span className="mr-report-date">
                                        {new Date(
                                          r.uploadedAt
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                    <div className="mr-report-actions">
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mr-action-btn"
                                        title="Preview"
                                      >
                                        <FiEye size={14} />
                                      </a>
                                      <a
                                        href={fileUrl}
                                        download={r.originalName}
                                        className="mr-action-btn"
                                        title="Download"
                                      >
                                        <FiDownload size={14} />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Quick link to full patient detail */}
                          <button
                            className="mr-view-full"
                            onClick={() => navigate(`/patients/${patient._id}`)}
                          >
                            View full patient chart →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
