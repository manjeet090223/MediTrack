import React, { useEffect, useState } from "react";
import { getAllPatients, deletePatient, getDoctorPatients } from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiUser, 
  FiEye, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiMail,
  FiPhone,
  FiCalendar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./Patients.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let res;
      if (user?.role === "Doctor") res = await getDoctorPatients();
      else if (user?.role === "Admin") res = await getAllPatients();
      else {
        toast.error("Access denied!");
        return navigate("/dashboard");
      }
      setPatients(res.data);
      setFilteredData(res.data);
    } catch (err) {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    let updated = [...patients];

    // Search filter
    if (search) {
      updated = updated.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          p.phone?.includes(search)
      );
    }

    // Gender filter
    if (genderFilter) {
      updated = updated.filter((p) => p.gender === genderFilter);
    }

    // Age Group filter
    if (ageGroupFilter) {
      updated = updated.filter((p) => {
        const age = parseInt(p.age);
        if (isNaN(age)) return false;
        if (ageGroupFilter === "Child") return age < 18;
        if (ageGroupFilter === "Adult") return age >= 18 && age < 60;
        if (ageGroupFilter === "Senior") return age >= 60;
        return true;
      });
    }

    setFilteredData(updated);
    setCurrentPage(1);
  }, [search, genderFilter, ageGroupFilter, patients]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;
    try {
      await deletePatient(id);
      toast.success("Patient record deleted");
      setPatients(patients.filter((p) => p._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="patients-page-layout">
      <Sidebar />
      <main className="patients-main-content">
        <div className="patients-container-wide">
          
          {/* HEADER SECTION */}
          <header className="patients-header">
            <div className="patients-header-left">
              <h1 className="patients-title">Patients</h1>
              <p className="patients-subtitle">Manage and view detailed patient records</p>
            </div>
            <button className="patients-add-btn" onClick={() => navigate("/add-patient")}>
              <FiPlus />
              <span>Add Patient</span>
            </button>
          </header>

          {/* SEARCH & FILTERS CARD */}
          <div className="patients-filter-card">
            <div className="search-box-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filters-group">
              <div className="dropdown-wrapper">
                <FiFilter className="filter-icon" />
                <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="dropdown-wrapper">
                <FiCalendar className="filter-icon" />
                <select value={ageGroupFilter} onChange={(e) => setAgeGroupFilter(e.target.value)}>
                  <option value="">All Ages</option>
                  <option value="Child">Child (0-17)</option>
                  <option value="Adult">Adult (18-59)</option>
                  <option value="Senior">Senior (60+)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="patients-table-container">
            {loading ? (
              <div className="patients-loading">
                <div className="spinner"></div>
                <p>Loading patient records...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="patients-empty-state">
                <div className="empty-icon-circle">
                  <FiUser size={40} />
                </div>
                <h3>No patients found</h3>
                <p>Start by adding your first patient to the system.</p>
                <button className="patients-empty-cta" onClick={() => navigate("/add-patient")}>
                  Add Patient
                </button>
              </div>
            ) : (
              <table className="patients-modern-table">
                <thead>
                  <tr>
                    <th>Patient Identification</th>
                    <th>Age / Gender</th>
                    <th>Last Visit</th>
                    <th>Visits</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentItems.map((p) => (
                      <motion.tr 
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>
                          <div className="patient-id-cell">
                            <div className="patient-avatar">
                              {getInitials(p.name)}
                            </div>
                            <div className="patient-meta">
                              <span className="patient-name">{p.name}</span>
                              <span className="patient-email">
                                <FiMail size={12} /> {p.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="age-gender-cell">
                            <span className="age-text">{p.age || "-"} Yrs</span>
                            <span className="gender-subtext">{p.gender || "Not specified"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="visit-cell">
                            <span className="visit-date">{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "Never"}</span>
                            <span className="visit-type">Consultation</span>
                          </div>
                        </td>
                        <td>
                          <div className="visits-count-cell">
                            <span className="count-badge">{p.totalVisits || 0}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill pill-${(p.status || "Active").toLowerCase()}`}>
                            {p.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="action-icons">
                            <button className="action-btn btn-view" title="View Profile" onClick={() => navigate(`/patients/${p._id}`)}>
                              <FiEye />
                            </button>
                            <button className="action-btn btn-edit" title="Edit Patient">
                              <FiEdit2 />
                            </button>
                            <button className="action-btn btn-delete" title="Delete Record" onClick={() => handleDelete(p._id)}>
                              <FiTrash2 />
                            </button>
                            <button className="action-btn btn-more">
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
        </div>
      </main>
    </div>
  );
}
