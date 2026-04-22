import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientDetails, getPatientAppointmentsById } from "../api/axios";
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
  FiEdit2,
  FiBriefcase,
  FiMapPin
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./Patients.css";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // History table filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [patientRes, apptsRes] = await Promise.all([
          getPatientDetails(id),
          getPatientAppointmentsById(id),
        ]);
        setPatient(patientRes.data);
        setAppointments(apptsRes.data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

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
            <div className="header-actions">
              <button className="patients-add-btn">
                <FiEdit2 />
                <span>Edit Profile</span>
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

          {/* APPOINTMENT HISTORY SECTION */}
          <div className="history-section-header">
            <h3>Appointment History</h3>
          </div>

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
                            <span>Dr. {appt.doctor?.name}</span>
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
      </main>
    </div>
  );
}
