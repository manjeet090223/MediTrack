import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAppointments,
  cancelAppointment,
  updateAppointment,
  deleteAppointment,
  createDoctorAppointment,
  getDoctorPatients,
} from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiMoreVertical, 
  FiClock, 
  FiUser, 
  FiCheckCircle, 
  FiXCircle, 
  FiEye, 
  FiCalendar,
  FiChevronRight,
  FiX,
  FiFileText,
  FiAlertCircle,
  FiEdit,
  FiTrash2
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./appointments.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState("Today");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // --- Add Appointment Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    datetime: "",
    reason: "",
  });

  // --- Three-dot dropdown & Edit modal state ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: "", datetime: "", reason: "", status: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAppointments();
      setAppointments(res.data);
      setFilteredData(res.data);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Fetch patients when modal opens
  useEffect(() => {
    if (showModal && patients.length === 0) {
      const fetchPatients = async () => {
        setPatientsLoading(true);
        try {
          const res = await getDoctorPatients();
          setPatients(res.data);
        } catch (err) {
          console.error("Failed to fetch patients:", err);
        } finally {
          setPatientsLoading(false);
        }
      };
      fetchPatients();
    }
  }, [showModal]);

  // Close patient dropdown & three-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPatientDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ESC key to close modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") { setShowModal(false); setShowEditModal(false); setOpenMenuId(null); }
    };
    if (showModal || showEditModal) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showModal, showEditModal]);

  useEffect(() => {
    let updated = [...appointments];

    // Search filter
    if (search) {
      updated = updated.filter(
        (a) =>
          a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.reason?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status dropdown filter
    if (statusFilter) {
      updated = updated.filter((a) => a.status === statusFilter);
    }

    // Tab filter
    const now = new Date();
    const todayStr = now.toDateString();

    if (activeTab === "Today") {
      updated = updated.filter((a) => new Date(a.datetime).toDateString() === todayStr && a.status !== "Cancelled");
    } else if (activeTab === "Upcoming") {
      updated = updated.filter((a) => new Date(a.datetime) > now && a.status === "Booked");
    } else if (activeTab === "Completed") {
      updated = updated.filter((a) => a.status === "Completed");
    }

    setFilteredData(updated);
    setCurrentPage(1);
  }, [search, statusFilter, appointments, activeTab]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      toast.info("Appointment Cancelled");
      loadAppointments();
    } catch (error) {
      toast.error("Cancel failed");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateAppointment(id, updates);
      toast.success("Appointment Updated");
      loadAppointments();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      toast.success("Appointment Deleted");
      setOpenMenuId(null);
      loadAppointments();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const openEditModal = (appt) => {
    setEditData({
      id: appt._id,
      datetime: new Date(appt.datetime).toISOString().slice(0, 16),
      reason: appt.reason || "",
      status: appt.status,
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await updateAppointment(editData.id, {
        datetime: editData.datetime,
        reason: editData.reason,
        status: editData.status,
      });
      toast.success("Appointment Updated");
      setShowEditModal(false);
      loadAppointments();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Modal Handlers ---
  const openModal = () => {
    setShowModal(true);
    setFormData({ patientId: "", patientName: "", datetime: "", reason: "" });
    setFormErrors({});
    setPatientSearch("");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.patientId) errors.patient = "Please select a patient";
    if (!formData.datetime) errors.datetime = "Date & time is required";
    if (!formData.reason.trim()) errors.reason = "Reason is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await createDoctorAppointment({
        patientId: formData.patientId,
        datetime: formData.datetime,
        reason: formData.reason,
      });
      setShowModal(false);
      loadAppointments();
    } catch (err) {
      console.error("Failed to create appointment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectPatient = (patient) => {
    setFormData((prev) => ({
      ...prev,
      patientId: patient._id,
      patientName: patient.name,
    }));
    setPatientSearch(patient.name);
    setShowPatientDropdown(false);
    setFormErrors((prev) => ({ ...prev, patient: undefined }));
  };

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Summary logic
  const today = new Date().toDateString();
  const summary = {
    todayTotal: appointments.filter(a => new Date(a.datetime).toDateString() === today).length,
    pending: appointments.filter(a => a.status === "Booked").length,
    completed: appointments.filter(a => a.status === "Completed").length
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const isUrgent = (datetime) => {
    const apptTime = new Date(datetime);
    const now = new Date();
    const diff = (apptTime - now) / (1000 * 60); // minutes
    return diff > 0 && diff <= 60;
  };

  return (
    <div className="appt-page-layout">
      <Sidebar />
      <main className="appt-main-content">
        <div className="appt-container-wide">
          
          {/* HEADER SECTION */}
          <header className="appt-header">
            <div className="appt-header-left">
              <h1 className="appt-title">Appointments</h1>
              <p className="appt-subtitle">Manage and track your patient schedule</p>
            </div>
            <button className="appt-add-btn" onClick={openModal}>
              <FiPlus />
              <span>Add Appointment</span>
            </button>
          </header>

          {/* QUICK SUMMARY BAR */}
          <div className="appt-summary-grid">
            <div className="summary-card">
              <div className="summary-icon icon-blue"><FiCalendar /></div>
              <div className="summary-info">
                <span className="summary-label">Total Today</span>
                <h3 className="summary-value">{summary.todayTotal}</h3>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon icon-amber"><FiClock /></div>
              <div className="summary-info">
                <span className="summary-label">Pending</span>
                <h3 className="summary-value">{summary.pending}</h3>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon icon-green"><FiCheckCircle /></div>
              <div className="summary-info">
                <span className="summary-label">Completed</span>
                <h3 className="summary-value">{summary.completed}</h3>
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="appt-tabs-container">
            <div className="appt-tabs">
              {["Today", "Upcoming", "Completed"].map((tab) => (
                <button
                  key={tab}
                  className={`appt-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* FILTERS CARD */}
          <div className="appt-filter-card">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-dropdown-wrapper">
              <FiFilter className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="appt-table-container">
            {loading ? (
              <div className="appt-loading">
                <div className="spinner"></div>
                <p>Loading appointments...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="appt-empty-state">
                <div className="empty-icon-circle">
                  <FiCalendar size={40} />
                </div>
                <h3>No appointments found</h3>
                <p>There are no appointments matching your current filters.</p>
                <button className="appt-empty-cta" onClick={() => {setSearch(""); setStatusFilter(""); setActiveTab("Today");}}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <table className="appt-modern-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentItems.map((appt) => (
                      <motion.tr 
                        key={appt._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>
                          <div className="patient-cell">
                            <div className="patient-avatar">
                              {getInitials(user.role === "Doctor" ? appt.patient?.name : appt.doctor?.name)}
                            </div>
                            <div className="patient-info">
                              <span className="patient-name">
                                {user.role === "Doctor" ? appt.patient?.name : appt.doctor?.name || "Unknown"}
                              </span>
                              <span className="patient-role">{user.role === "Doctor" ? "Patient" : "Doctor"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <div className="date-row">
                              <FiCalendar size={14} />
                              <span>{new Date(appt.datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="time-row">
                              <FiClock size={14} />
                              <span className={isUrgent(appt.datetime) ? "text-urgent" : ""}>
                                {new Date(appt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isUrgent(appt.datetime) && <span className="urgent-dot"></span>}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge badge-${appt.status.toLowerCase()}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <p className="reason-text">{appt.reason || "General Consultation"}</p>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="icon-btn btn-view"
                              title="View Patient"
                              onClick={() => navigate(`/patients/${appt.patient?._id}`)}
                            >
                              <FiEye />
                            </button>
                            
                            {(user.role === "Doctor" || user.role === "Admin") && appt.status === "Booked" && (
                              <button 
                                className="icon-btn btn-complete" 
                                title="Mark Complete"
                                onClick={() => handleUpdate(appt._id, { status: "Completed" })}
                              >
                                <FiCheckCircle />
                              </button>
                            )}

                            {appt.status === "Booked" && (
                              <button 
                                className="icon-btn btn-cancel-action" 
                                title="Cancel Appointment"
                                onClick={() => handleCancel(appt._id)}
                              >
                                <FiXCircle />
                              </button>
                            )}
                            
                            <div className="appt-more-wrapper" ref={openMenuId === appt._id ? menuRef : null}>
                              <button
                                className="icon-btn btn-more"
                                onClick={() => setOpenMenuId(openMenuId === appt._id ? null : appt._id)}
                              >
                                <FiMoreVertical />
                              </button>
                              {openMenuId === appt._id && (
                                <div className="appt-action-menu">
                                  <button className="appt-menu-item" onClick={() => openEditModal(appt)}>
                                    <FiEdit size={14} /> Edit
                                  </button>
                                  <button className="appt-menu-item appt-menu-danger" onClick={() => handleDelete(appt._id)}>
                                    <FiTrash2 size={14} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="appt-pagination">
              <button
                className="pag-btn"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="pag-numbers">
                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    className={`pag-num ${currentPage === num + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(num + 1)}
                  >
                    {num + 1}
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
        </div>

        {/* ADD APPOINTMENT MODAL */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="appt-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="appt-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="appt-modal-header">
                  <div className="appt-modal-title-group">
                    <div className="appt-modal-icon">
                      <FiCalendar size={20} />
                    </div>
                    <div>
                      <h2>New Appointment</h2>
                      <p>Schedule a consultation with your patient</p>
                    </div>
                  </div>
                  <button className="appt-modal-close" onClick={() => setShowModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                {/* Modal Form */}
                <form className="appt-modal-form" onSubmit={handleSubmitAppointment}>
                  
                  {/* Patient Selection */}
                  <div className="appt-form-group" ref={dropdownRef}>
                    <label className="appt-form-label">
                      <FiUser size={14} />
                      Select Patient <span className="appt-required">*</span>
                    </label>
                    <div className="appt-patient-select">
                      <input
                        type="text"
                        className={`appt-form-input ${formErrors.patient ? "appt-input-error" : ""}`}
                        placeholder="Search patient by name or email..."
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientDropdown(true);
                          if (formData.patientId && e.target.value !== formData.patientName) {
                            setFormData((prev) => ({ ...prev, patientId: "", patientName: "" }));
                          }
                        }}
                        onFocus={() => setShowPatientDropdown(true)}
                      />
                      {formData.patientId && (
                        <span className="appt-selected-check"><FiCheckCircle size={16} /></span>
                      )}
                    </div>
                    
                    {/* Patient Dropdown */}
                    {showPatientDropdown && (
                      <div className="appt-patient-dropdown">
                        {patientsLoading ? (
                          <div className="appt-dropdown-loading">Loading patients...</div>
                        ) : filteredPatients.length === 0 ? (
                          <div className="appt-dropdown-empty">No patients found</div>
                        ) : (
                          filteredPatients.slice(0, 6).map((p) => (
                            <button
                              key={p._id}
                              type="button"
                              className={`appt-dropdown-item ${formData.patientId === p._id ? "appt-dropdown-selected" : ""}`}
                              onClick={() => selectPatient(p)}
                            >
                              <div className="appt-dropdown-avatar">
                                {getInitials(p.name)}
                              </div>
                              <div className="appt-dropdown-info">
                                <span className="appt-dropdown-name">{p.name}</span>
                                <span className="appt-dropdown-email">{p.email}</span>
                              </div>
                              {formData.patientId === p._id && (
                                <FiCheckCircle className="appt-dropdown-check" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    {formErrors.patient && (
                      <span className="appt-error-msg"><FiAlertCircle size={12} /> {formErrors.patient}</span>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="appt-form-group">
                    <label className="appt-form-label">
                      <FiClock size={14} />
                      Date & Time <span className="appt-required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`appt-form-input ${formErrors.datetime ? "appt-input-error" : ""}`}
                      value={formData.datetime}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, datetime: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, datetime: undefined }));
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {formErrors.datetime && (
                      <span className="appt-error-msg"><FiAlertCircle size={12} /> {formErrors.datetime}</span>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="appt-form-group">
                    <label className="appt-form-label">
                      <FiFileText size={14} />
                      Reason <span className="appt-required">*</span>
                    </label>
                    <textarea
                      className={`appt-form-textarea ${formErrors.reason ? "appt-input-error" : ""}`}
                      placeholder="e.g., Follow-up consultation, General checkup..."
                      rows={3}
                      value={formData.reason}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, reason: e.target.value }));
                        setFormErrors((prev) => ({ ...prev, reason: undefined }));
                      }}
                    />
                    {formErrors.reason && (
                      <span className="appt-error-msg"><FiAlertCircle size={12} /> {formErrors.reason}</span>
                    )}
                  </div>

                  {/* Status Info */}
                  <div className="appt-form-status-info">
                    <FiCheckCircle size={14} />
                    <span>Status will be set to <strong>Booked</strong> by default</span>
                  </div>

                  {/* Actions */}
                  <div className="appt-modal-actions">
                    <button
                      type="button"
                      className="appt-modal-cancel"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="appt-modal-submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="appt-btn-spinner"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <FiPlus size={16} />
                          Add Appointment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EDIT APPOINTMENT MODAL */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              className="appt-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                className="appt-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="appt-modal-header">
                  <div className="appt-modal-title-group">
                    <div className="appt-modal-icon" style={{ background: "var(--info-50)", color: "var(--info-600)" }}>
                      <FiEdit size={20} />
                    </div>
                    <div>
                      <h2>Edit Appointment</h2>
                      <p>Update appointment details</p>
                    </div>
                  </div>
                  <button className="appt-modal-close" onClick={() => setShowEditModal(false)}>
                    <FiX size={20} />
                  </button>
                </div>

                <form className="appt-modal-form" onSubmit={handleEditSubmit}>
                  <div className="appt-form-group">
                    <label className="appt-form-label">
                      <FiClock size={14} /> Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      className="appt-form-input"
                      value={editData.datetime}
                      onChange={(e) => setEditData((p) => ({ ...p, datetime: e.target.value }))}
                    />
                  </div>

                  <div className="appt-form-group">
                    <label className="appt-form-label">
                      <FiFileText size={14} /> Reason
                    </label>
                    <textarea
                      className="appt-form-textarea"
                      rows={3}
                      value={editData.reason}
                      onChange={(e) => setEditData((p) => ({ ...p, reason: e.target.value }))}
                    />
                  </div>

                  <div className="appt-form-group">
                    <label className="appt-form-label">
                      <FiCheckCircle size={14} /> Status
                    </label>
                    <select
                      className="appt-form-input"
                      value={editData.status}
                      onChange={(e) => setEditData((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="Booked">Booked</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="appt-modal-actions">
                    <button type="button" className="appt-modal-cancel" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="appt-modal-submit" disabled={editSubmitting}>
                      {editSubmitting ? (
                        <><span className="appt-btn-spinner"></span> Saving...</>
                      ) : (
                        <><FiCheckCircle size={16} /> Save Changes</>
                      )}
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
