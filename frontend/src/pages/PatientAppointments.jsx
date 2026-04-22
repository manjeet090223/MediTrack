import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments, cancelAppointment, updateAppointment } from "../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiCalendar,
  FiPlus,
  FiEdit3,
  FiXCircle,
  FiClock,
  FiUser,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiInbox
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import "./patientAppointments.css";

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user"));

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter((item) => {
    const matchSearch = item.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.info("Appointment Cancelled");
      loadAppointments();
    } catch (error) {
      toast.error("Cancel failed");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const newReason = prompt("Update Reason:");
      if (!newReason) return;

      await updateAppointment(id, { reason: newReason });
      toast.success("Updated Successfully");
      loadAppointments();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Booked": return "status-booked";
      case "Completed": return "status-completed";
      case "Cancelled": return "status-cancelled";
      default: return "";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />

      <main className="page-main">
        <div className="page-container">
          {/* Page Header */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="page-header-text">
              <h1 className="page-title">My Appointments</h1>
              <p className="page-subtitle">Manage and track your consultations</p>
            </div>
            <button
              className="btn-primary-action"
              onClick={() => navigate("/book-appointment")}
            >
              <FiPlus size={18} />
              <span>Book Appointment</span>
            </button>
          </motion.div>

          {/* Filters Card */}
          <motion.div
            className="filters-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="filter-input-group">
              <FiSearch className="filter-icon" size={18} />
              <input
                type="text"
                placeholder="Search by doctor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-search"
              />
            </div>

            <div className="filter-input-group">
              <FiFilter className="filter-icon" size={18} />
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-count">
              <span>{filteredAppointments.length} result{filteredAppointments.length !== 1 ? "s" : ""}</span>
            </div>
          </motion.div>

          {/* Table Card */}
          <motion.div
            className="table-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {paginatedAppointments.length === 0 ? (
              /* Empty State */
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <FiInbox size={48} />
                </div>
                <h3>No appointments found</h3>
                <p>You don't have any appointments yet. Book your first consultation to get started.</p>
                <button
                  className="btn-primary-action"
                  onClick={() => navigate("/book-appointment")}
                >
                  <FiPlus size={18} />
                  <span>Book your first appointment</span>
                </button>
              </div>
            ) : (
              <>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          <span className="th-content"><FiUser size={14} /> Doctor</span>
                        </th>
                        <th>
                          <span className="th-content"><FiClock size={14} /> Date & Time</span>
                        </th>
                        <th className="th-center">Status</th>
                        <th>
                          <span className="th-content"><FiFileText size={14} /> Reason</span>
                        </th>
                        <th className="th-center">Actions</th>
                      </tr>
                    </thead>

                    <motion.tbody
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {paginatedAppointments.map((appt, index) => (
                        <motion.tr key={appt._id} variants={itemVariants}>
                          <td className="td-doctor">
                            <div className="doctor-cell">
                              <div className="doctor-avatar">
                                {appt.doctor?.name?.charAt(0) || "D"}
                              </div>
                              <span>{appt.doctor?.name || "—"}</span>
                            </div>
                          </td>
                          <td className="td-datetime">
                            <div className="datetime-cell">
                              <FiCalendar size={14} className="datetime-icon" />
                              <span>{new Date(appt.datetime).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}</span>
                            </div>
                          </td>
                          <td className="td-status">
                            <span className={`status-badge ${getStatusClass(appt.status)}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="td-reason">
                            {appt.reason || "—"}
                          </td>
                          <td className="td-actions">
                            {appt.status === "Booked" && (
                              <div className="action-group">
                                <button
                                  className="action-btn action-edit"
                                  onClick={() => handleUpdate(appt._id)}
                                  title="Edit reason"
                                >
                                  <FiEdit3 size={15} />
                                </button>
                                <button
                                  className="action-btn action-cancel"
                                  onClick={() => handleCancel(appt._id)}
                                  title="Cancel appointment"
                                >
                                  <FiXCircle size={15} />
                                </button>
                              </div>
                            )}
                            {appt.status === "Completed" && (
                              <span className="status-badge status-completed">Completed</span>
                            )}
                            {appt.status === "Cancelled" && (
                              <span className="status-badge status-cancelled">Cancelled</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-bar">
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        <FiChevronLeft size={16} />
                        <span>Prev</span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          className={`pagination-num ${currentPage === i + 1 ? "active" : ""}`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        <span>Next</span>
                        <FiChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
