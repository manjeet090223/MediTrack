import React, { useEffect, useState } from "react";
import {
  getAppointments,
  cancelAppointment,
  updateAppointment,
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
  FiChevronRight
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
            <button className="appt-add-btn">
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
                            <button className="icon-btn btn-view" title="View Details">
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
                            
                            <button className="icon-btn btn-more">
                              <FiMoreVertical />
                            </button>
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
      </main>
    </div>
  );
}
