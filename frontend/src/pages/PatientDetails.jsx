import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPatientDetails,
  getPatientAppointmentsById,
  getPatientPrescriptions,
  createPrescription,
  updatePrescriptionStatus,
  getPatientReports,
} from "../api/axios";
import Sidebar from "../components/Sidebar";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUser,
  FiClock,
  FiSearch,
  FiFilter,
  FiPlus,
  FiFileText,
  FiEye,
  FiX,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiImage,
  FiFile,
  FiFolder,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./Patients.css";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // History table filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Prescription modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    notes: "",
    medicines: [{ name: "", dosage: "", duration: "", instructions: "" }],
  });
  const [formErrors, setFormErrors] = useState({});

  // Reports modal
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("prescriptions");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [patientRes, apptsRes, prescRes] = await Promise.all([
          getPatientDetails(id),
          getPatientAppointmentsById(id),
          getPatientPrescriptions(id),
        ]);
        setPatient(patientRes.data);
        setAppointments(apptsRes.data);
        setPrescriptions(prescRes.data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // --- Prescription Handlers ---
  const addMedicineRow = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "", instructions: "" }],
    }));
  };

  const removeMedicineRow = (index) => {
    if (prescriptionForm.medicines.length <= 1) return;
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setPrescriptionForm((prev) => {
      const updated = [...prev.medicines];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!prescriptionForm.diagnosis.trim()) errors.diagnosis = "Diagnosis is required";
    
    const medErrors = [];
    let hasError = false;
    prescriptionForm.medicines.forEach((med, i) => {
      const err = {};
      if (!med.name.trim()) { err.name = true; hasError = true; }
      if (!med.dosage.trim()) { err.dosage = true; hasError = true; }
      if (!med.duration.trim()) { err.duration = true; hasError = true; }
      medErrors[i] = err;
    });
    if (hasError) errors.medicines = medErrors;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPrescriptionLoading(true);
    try {
      const res = await createPrescription({
        patientId: id,
        diagnosis: prescriptionForm.diagnosis,
        notes: prescriptionForm.notes,
        medicines: prescriptionForm.medicines,
      });
      setPrescriptions((prev) => [res.data.data, ...prev]);
      setShowPrescriptionModal(false);
      setPrescriptionForm({
        diagnosis: "",
        notes: "",
        medicines: [{ name: "", dosage: "", duration: "", instructions: "" }],
      });
      setFormErrors({});
    } catch (err) {
      console.error("Failed to create prescription:", err);
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleToggleStatus = async (prescId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "completed" : "active";
    try {
      const res = await updatePrescriptionStatus(prescId, newStatus);
      setPrescriptions((prev) =>
        prev.map((p) => (p._id === prescId ? res.data.data : p))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // ── Reports modal ────────────────────────────────────────────
  const handleOpenReports = async () => {
    setShowReportsModal(true);
    setPreviewReport(null);
    setReportsLoading(true);
    try {
      const res = await getPatientReports(id);
      setReports(res.data?.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="patients-page-layout">
        <Sidebar />
        <main className="patients-main-content">
          <div className="patients-loading">
            <div className="spinner"></div>
            <p>Gathering patient data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patients-page-layout">
        <Sidebar />
        <main className="patients-main-content">
          <div className="patients-empty-state">
            <h3>Patient not found</h3>
            <button className="back-btn" onClick={() => navigate("/patients")}>
              <FiArrowLeft /> Back to Patients
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredAppts = appointments.filter((appt) => {
    const matchSearch =
      appt.reason?.toLowerCase().includes(search.toLowerCase()) ||
      appt.doctor?.name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      appt.status === statusFilter ||
      (statusFilter === "Pending" && appt.status === "Booked");

    return matchSearch && matchStatus;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAppts = filteredAppts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAppts.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const activePrescriptions = prescriptions.filter((p) => p.status === "active");
  const completedPrescriptions = prescriptions.filter((p) => p.status === "completed");

  return (
    <div className="patients-page-layout">
      <Sidebar />
      <main className="patients-main-content">
        <motion.div 
          className="patients-container-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          
          {/* HEADER SECTION */}
          <header className="patients-header">
            <div className="header-nav-group">
              <button className="back-btn" onClick={() => navigate("/patients")}>
                <FiArrowLeft />
                <span>Back to Patients</span>
              </button>
              <div className="header-text">
                <h1 className="patients-title">{patient.name}</h1>
                <p className="patients-subtitle">Patient Medical Record & History</p>
              </div>
            </div>
            <div className="rx-header-actions">
              <button
                className="patients-add-btn"
                onClick={() => setShowPrescriptionModal(true)}
              >
                <FiPlus />
                <span>Add Prescription</span>
              </button>
              <button
                className="header-secondary-btn"
                title="View Reports"
                onClick={handleOpenReports}
              >
                <FiEye />
                <span>View Reports</span>
              </button>
            </div>
          </header>

          {/* PROFILE OVERVIEW CARD */}
          <section className="profile-overview-card">
            <div className="profile-card-header">
              <div className="profile-avatar-large">
                {getInitials(patient.name)}
              </div>
              <div className="profile-headline">
                <h2>{patient.name}</h2>
                <span className={`status-pill pill-${(patient.status || "Active").toLowerCase()}`}>
                  {patient.status || "Active"}
                </span>
              </div>
            </div>
            
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-icon"><FiMail /></div>
                <div className="detail-content">
                  <label>Email Address</label>
                  <span>{patient.email}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon"><FiPhone /></div>
                <div className="detail-content">
                  <label>Phone Number</label>
                  <span>{patient.phone || "Not provided"}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon"><FiCalendar /></div>
                <div className="detail-content">
                  <label>Age & Gender</label>
                  <span>{patient.age || "-"} Years / {patient.gender || "-"}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon"><FiClock /></div>
                <div className="detail-content">
                  <label>Member Since</label>
                  <span>{new Date(patient.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </section>

          {/* TAB NAVIGATION */}
          <div className="rx-tabs">
            <button
              className={`rx-tab ${activeTab === "prescriptions" ? "rx-tab-active" : ""}`}
              onClick={() => setActiveTab("prescriptions")}
            >
              <FiFileText size={16} />
              Prescriptions ({prescriptions.length})
            </button>
            <button
              className={`rx-tab ${activeTab === "history" ? "rx-tab-active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <FiCalendar size={16} />
              Appointment History ({appointments.length})
            </button>
          </div>

          {/* PRESCRIPTIONS TAB */}
          {activeTab === "prescriptions" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Active Prescriptions */}
              {activePrescriptions.length > 0 && (
                <>
                  <div className="rx-section-label">
                    <FiCheckCircle size={16} className="rx-section-icon-active" />
                    Active Medications ({activePrescriptions.length})
                  </div>
                  <div className="rx-card-grid">
                    {activePrescriptions.map((rx) => (
                      <motion.div
                        className="rx-card rx-card-active"
                        key={rx._id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="rx-card-top">
                          <div className="rx-card-header">
                            <h4 className="rx-diagnosis">{rx.diagnosis}</h4>
                            <span className="rx-status-badge rx-badge-active">Active</span>
                          </div>
                          <p className="rx-date">
                            {new Date(rx.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="rx-medicines-list">
                          {rx.medicines.map((med, idx) => (
                            <div className="rx-medicine-item" key={idx}>
                              <div className="rx-med-name">{med.name}</div>
                              <div className="rx-med-details">
                                <span className="rx-med-tag">{med.dosage}</span>
                                <span className="rx-med-tag">{med.duration}</span>
                              </div>
                              {med.instructions && (
                                <p className="rx-med-instructions">{med.instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {rx.notes && <p className="rx-notes"><strong>Notes:</strong> {rx.notes}</p>}

                        <div className="rx-card-actions">
                          <button
                            className="rx-action-btn rx-complete-btn"
                            onClick={() => handleToggleStatus(rx._id, rx.status)}
                          >
                            <FiCheckCircle size={14} />
                            Mark Completed
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* Completed Prescriptions */}
              {completedPrescriptions.length > 0 && (
                <>
                  <div className="rx-section-label rx-section-completed">
                    <FiAlertCircle size={16} className="rx-section-icon-completed" />
                    Completed ({completedPrescriptions.length})
                  </div>
                  <div className="rx-card-grid">
                    {completedPrescriptions.map((rx) => (
                      <motion.div
                        className="rx-card rx-card-completed"
                        key={rx._id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="rx-card-top">
                          <div className="rx-card-header">
                            <h4 className="rx-diagnosis">{rx.diagnosis}</h4>
                            <span className="rx-status-badge rx-badge-completed">Completed</span>
                          </div>
                          <p className="rx-date">
                            {new Date(rx.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                        </div>

                        <div className="rx-medicines-list">
                          {rx.medicines.map((med, idx) => (
                            <div className="rx-medicine-item" key={idx}>
                              <div className="rx-med-name">{med.name}</div>
                              <div className="rx-med-details">
                                <span className="rx-med-tag">{med.dosage}</span>
                                <span className="rx-med-tag">{med.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {rx.notes && <p className="rx-notes"><strong>Notes:</strong> {rx.notes}</p>}

                        <div className="rx-card-actions">
                          <button
                            className="rx-action-btn rx-reactivate-btn"
                            onClick={() => handleToggleStatus(rx._id, rx.status)}
                          >
                            <FiCheckCircle size={14} />
                            Reactivate
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {prescriptions.length === 0 && (
                <div className="rx-empty-state">
                  <div className="rx-empty-icon"><FiFileText size={40} /></div>
                  <h3>No prescriptions yet</h3>
                  <p>Click "Add Prescription" to create the first prescription for this patient.</p>
                  <button
                    className="patients-add-btn"
                    onClick={() => setShowPrescriptionModal(true)}
                    style={{ marginTop: "16px" }}
                  >
                    <FiPlus /> Add Prescription
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* APPOINTMENT HISTORY TAB */}
          {activeTab === "history" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="patients-filter-card">
                <div className="search-box-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search history by doctor or reason..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="dropdown-wrapper">
                  <FiFilter className="filter-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Booked">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="patients-table-container">
                {currentAppts.length === 0 ? (
                  <div className="patients-empty-state" style={{ padding: 'var(--space-10) 0' }}>
                    <p>No appointment history found matching the filters.</p>
                  </div>
                ) : (
                  <table className="patients-modern-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Medical Professional</th>
                        <th>Reason for Visit</th>
                        <th>Visit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="wait">
                        {currentAppts.map((appt) => (
                          <motion.tr 
                            key={appt._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <td>
                              <div className="date-cell">
                                <span className="visit-date">{new Date(appt.datetime).toLocaleDateString()}</span>
                                <span className="visit-type">{new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td>
                              <div className="doctor-cell">
                                <FiUser size={14} />
                                <span>{appt.doctor?.name}</span>
                              </div>
                            </td>
                            <td>
                              <p className="reason-text" style={{ maxWidth: '250px' }}>{appt.reason || "General Consultation"}</p>
                            </td>
                            <td>
                              <span className={`status-pill pill-${appt.status.toLowerCase()}`}>
                                {appt.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="patients-pagination">
                  <button
                    className="pag-btn"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="pag-pages">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`pag-page ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    className="pag-btn"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* ══════════════════════════════════════════
            VIEW REPORTS MODAL
        ══════════════════════════════════════════ */}
        <AnimatePresence>
          {showReportsModal && (
            <motion.div
              className="ep-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowReportsModal(false); setPreviewReport(null); }}
            >
              <motion.div
                className="ep-modal rpt-modal"
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 24 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="ep-header">
                  <div className="ep-header-left">
                    <div className="ep-avatar rpt-avatar">
                      <FiFolder size={20} />
                    </div>
                    <div>
                      <h2 className="ep-title">Patient Reports</h2>
                      <p className="ep-subtitle">{patient?.name} — uploaded documents</p>
                    </div>
                  </div>
                  <button
                    className="ep-close-btn"
                    onClick={() => { setShowReportsModal(false); setPreviewReport(null); }}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="rpt-body">
                  {reportsLoading ? (
                    <div className="rpt-loading">
                      <div className="spinner"></div>
                      <p>Loading reports...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="rpt-empty">
                      <FiFileText size={40} />
                      <p>No reports uploaded yet for this patient.</p>
                    </div>
                  ) : (
                    <>
                      {/* Preview pane */}
                      {previewReport && (
                        <div className="rpt-preview">
                          <div className="rpt-preview-bar">
                            <span className="rpt-preview-name">{previewReport.originalName}</span>
                            <button
                              className="ep-close-btn"
                              onClick={() => setPreviewReport(null)}
                              title="Close preview"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                          {/\.(jpg|jpeg|png)$/i.test(previewReport.originalName) ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/uploads/reports/${previewReport.filename}`}
                              alt={previewReport.originalName}
                              className="rpt-preview-img"
                            />
                          ) : (
                            <iframe
                              src={`${import.meta.env.VITE_BACKEND_URL}/uploads/reports/${previewReport.filename}`}
                              title={previewReport.originalName}
                              className="rpt-preview-iframe"
                            />
                          )}
                        </div>
                      )}

                      {/* File list */}
                      <ul className="rpt-list">
                        {reports.map((r) => {
                          const isImage = /\.(jpg|jpeg|png)$/i.test(r.originalName);
                          const isPdf = /\.pdf$/i.test(r.originalName);
                          const fileUrl = `${import.meta.env.VITE_BACKEND_URL}/uploads/reports/${r.filename}`;
                          return (
                            <li key={r._id} className={`rpt-item ${previewReport?._id === r._id ? "rpt-item-active" : ""}`}>
                              <div className="rpt-item-icon">
                                {isImage ? <FiImage size={18} /> : isPdf ? <FiFileText size={18} /> : <FiFile size={18} />}
                              </div>
                              <div className="rpt-item-info">
                                <span className="rpt-item-name">{r.originalName || r.filename}</span>
                                <span className="rpt-item-date">
                                  {new Date(r.uploadedAt).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric",
                                  })}
                                </span>
                              </div>
                              <div className="rpt-item-actions">
                                <button
                                  className="rpt-btn rpt-btn-preview"
                                  title="Preview"
                                  onClick={() => setPreviewReport(previewReport?._id === r._id ? null : r)}
                                >
                                  <FiEye size={15} />
                                </button>
                                <a
                                  href={fileUrl}
                                  download={r.originalName}
                                  className="rpt-btn rpt-btn-download"
                                  title="Download"
                                >
                                  <FiDownload size={15} />
                                </a>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADD PRESCRIPTION MODAL */}
        <AnimatePresence>
          {showPrescriptionModal && (
            <motion.div
              className="rx-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrescriptionModal(false)}
            >
              <motion.div
                className="rx-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rx-modal-header">
                  <div>
                    <h2>New Prescription</h2>
                    <p>for {patient.name}</p>
                  </div>
                  <button
                    className="rx-modal-close"
                    onClick={() => setShowPrescriptionModal(false)}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <form className="rx-modal-form" onSubmit={handleSubmitPrescription}>
                  {/* Diagnosis */}
                  <div className="rx-form-group">
                    <label className="rx-form-label">
                      Diagnosis <span className="rx-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`rx-form-input ${formErrors.diagnosis ? "rx-input-error" : ""}`}
                      placeholder="e.g., Upper Respiratory Tract Infection"
                      value={prescriptionForm.diagnosis}
                      onChange={(e) =>
                        setPrescriptionForm((prev) => ({ ...prev, diagnosis: e.target.value }))
                      }
                    />
                    {formErrors.diagnosis && (
                      <span className="rx-error-text">{formErrors.diagnosis}</span>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="rx-form-group">
                    <label className="rx-form-label">Notes</label>
                    <textarea
                      className="rx-form-textarea"
                      placeholder="Additional notes or instructions for the patient..."
                      rows={3}
                      value={prescriptionForm.notes}
                      onChange={(e) =>
                        setPrescriptionForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>

                  {/* Medicines */}
                  <div className="rx-form-group">
                    <div className="rx-medicines-header">
                      <label className="rx-form-label">
                        Medicines <span className="rx-required">*</span>
                      </label>
                      <button
                        type="button"
                        className="rx-add-medicine-btn"
                        onClick={addMedicineRow}
                      >
                        <FiPlus size={14} />
                        Add Medicine
                      </button>
                    </div>

                    <div className="rx-medicines-form-list">
                      {prescriptionForm.medicines.map((med, index) => (
                        <div className="rx-medicine-form-row" key={index}>
                          <div className="rx-medicine-row-header">
                            <span className="rx-medicine-number">Medicine #{index + 1}</span>
                            {prescriptionForm.medicines.length > 1 && (
                              <button
                                type="button"
                                className="rx-remove-medicine-btn"
                                onClick={() => removeMedicineRow(index)}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
                          </div>
                          <div className="rx-medicine-fields">
                            <input
                              type="text"
                              className={`rx-form-input ${formErrors.medicines?.[index]?.name ? "rx-input-error" : ""}`}
                              placeholder="Medicine Name *"
                              value={med.name}
                              onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                            />
                            <input
                              type="text"
                              className={`rx-form-input ${formErrors.medicines?.[index]?.dosage ? "rx-input-error" : ""}`}
                              placeholder="Dosage (e.g., 1-0-1) *"
                              value={med.dosage}
                              onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                            />
                            <input
                              type="text"
                              className={`rx-form-input ${formErrors.medicines?.[index]?.duration ? "rx-input-error" : ""}`}
                              placeholder="Duration (e.g., 5 days) *"
                              value={med.duration}
                              onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                            />
                            <input
                              type="text"
                              className="rx-form-input"
                              placeholder="Instructions (optional)"
                              value={med.instructions}
                              onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="rx-modal-actions">
                    <button
                      type="button"
                      className="rx-cancel-btn"
                      onClick={() => setShowPrescriptionModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rx-submit-btn"
                      disabled={prescriptionLoading}
                    >
                      {prescriptionLoading ? "Saving..." : "Create Prescription"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
