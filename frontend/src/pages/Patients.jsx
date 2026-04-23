import React, { useEffect, useState } from "react";
import {
  getAllPatients,
  deletePatient,
  getDoctorPatients,
  updatePatient,
  createPatient,
  linkPatient,
} from "../api/axios";
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
  FiMail,
  FiPhone,
  FiCalendar,
  FiX,
  FiSave,
  FiLock,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./Patients.css";

const EMPTY_ADD_FORM = {
  name: "",
  email: "",
  password: "",
  age: "",
  gender: "",
  phone: "",
};

const EMPTY_EDIT_FORM = {
  name: "",
  email: "",
  age: "",
  gender: "",
  phone: "",
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let res;
      if (user?.role === "Doctor") res = await getDoctorPatients();
      else {
        toast.error("Access denied!");
        return navigate("/dashboard");
      }
      setPatients(res.data);
      setFilteredData(res.data);
    } catch {
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
    if (search) {
      updated = updated.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.email.toLowerCase().includes(search.toLowerCase()) ||
          p.phone?.includes(search)
      );
    }
    if (genderFilter) updated = updated.filter((p) => p.gender === genderFilter);
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
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch {
      /* toast handled by interceptor */
    }
  };

  const openAddModal = () => {
    setAddForm(EMPTY_ADD_FORM);
    setShowPassword(false);
    setAddModalOpen(true);
  };

  const closeAddModal = () => setAddModalOpen(false);

  const handleAddFormChange = (e) =>
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddSave = async (e) => {
    e.preventDefault();
    if (addForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setAddSaving(true);
    try {
      const res = await createPatient(addForm);
      const newPatient = res.data?.data;
      if (newPatient) {
        setPatients((prev) => {
          const exists = prev.some((p) => p._id === newPatient._id);
          return exists ? prev : [newPatient, ...prev];
        });
      }
      closeAddModal();
    } catch {
      /* toast handled by interceptor */
    } finally {
      setAddSaving(false);
    }
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setEditForm({
      name: patient.name || "",
      email: patient.email || "",
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingPatient(null);
  };

  const handleEditFormChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingPatient) return;
    setEditSaving(true);
    try {
      const res = await updatePatient(editingPatient._id, editForm);
      const updated = res.data?.data || { ...editingPatient, ...editForm };
      setPatients((prev) =>
        prev.map((p) => (p._id === editingPatient._id ? updated : p))
      );
      closeEditModal();
    } catch {

    } finally {
      setEditSaving(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const InputField = ({ id, label, icon: Icon, type = "text", name, value, onChange, placeholder, required, min, max, extraRight }) => (
    <div className="ep-field ep-field-full">
      <label htmlFor={id}>{label}</label>
      <div className="ep-input-wrapper">
        <Icon className="ep-input-icon" />
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
        />
        {extraRight}
      </div>
    </div>
  );

  return (
    <div className="patients-page-layout">
      <Sidebar />
      <main className="patients-main-content">
        <div className="patients-container-wide">


          <header className="patients-header">
            <div className="patients-header-left">
              <h1 className="patients-title">Patients</h1>
              <p className="patients-subtitle">Manage and view detailed patient records</p>
            </div>
            <button className="patients-add-btn" onClick={openAddModal}>
              <FiPlus />
              <span>Add Patient</span>
            </button>
          </header>


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

          {/* TABLE */}
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
                <button className="patients-empty-cta" onClick={openAddModal}>
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
                            <div className="patient-avatar">{getInitials(p.name)}</div>
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
                            <span className="visit-date">
                              {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "Never"}
                            </span>
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
                            <button
                              className="action-btn btn-view"
                              title="View Profile"
                              onClick={() => navigate(`/patients/${p._id}`)}
                            >
                              <FiEye />
                            </button>
                            <button
                              className="action-btn btn-edit"
                              title="Edit Patient"
                              onClick={() => openEditModal(p)}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="action-btn btn-delete"
                              title="Delete Record"
                              onClick={() => handleDelete(p._id)}
                            >
                              <FiTrash2 />
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

      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            className="ep-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddModal}
          >
            <motion.div
              className="ep-modal ep-modal-wide"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >

              <div className="ep-header">
                <div className="ep-header-left">
                  <div className="ep-avatar ep-avatar-add">
                    <FiPlus size={22} />
                  </div>
                  <div>
                    <h2 className="ep-title">Add New Patient</h2>
                    <p className="ep-subtitle">Create a patient account in the system</p>
                  </div>
                </div>
                <button className="ep-close-btn" onClick={closeAddModal} title="Close">
                  <FiX size={20} />
                </button>
              </div>


              <form className="ep-form" onSubmit={handleAddSave}>
                <div className="ep-form-grid">


                  <div className="ep-field ep-field-full">
                    <label htmlFor="ap-name">Full Name <span className="ep-required">*</span></label>
                    <div className="ep-input-wrapper">
                      <FiUser className="ep-input-icon" />
                      <input
                        id="ap-name"
                        type="text"
                        name="name"
                        value={addForm.name}
                        onChange={handleAddFormChange}
                        placeholder="e.g. Sarah Johnson"
                        required
                      />
                    </div>
                  </div>


                  <div className="ep-field ep-field-full">
                    <label htmlFor="ap-email">Email Address <span className="ep-required">*</span></label>
                    <div className="ep-input-wrapper">
                      <FiMail className="ep-input-icon" />
                      <input
                        id="ap-email"
                        type="email"
                        name="email"
                        value={addForm.email}
                        onChange={handleAddFormChange}
                        placeholder="patient@example.com"
                        required
                      />
                    </div>
                  </div>


                  <div className="ep-field ep-field-full">
                    <label htmlFor="ap-password">
                      Temporary Password <span className="ep-required">*</span>
                      <span className="ep-label-hint"> — patient can change after login</span>
                    </label>
                    <div className="ep-input-wrapper">
                      <FiLock className="ep-input-icon" />
                      <input
                        id="ap-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={addForm.password}
                        onChange={handleAddFormChange}
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="ep-pw-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>


                  <div className="ep-field">
                    <label htmlFor="ap-phone">Phone Number</label>
                    <div className="ep-input-wrapper">
                      <FiPhone className="ep-input-icon" />
                      <input
                        id="ap-phone"
                        type="tel"
                        name="phone"
                        value={addForm.phone}
                        onChange={handleAddFormChange}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>


                  <div className="ep-field">
                    <label htmlFor="ap-age">Age</label>
                    <div className="ep-input-wrapper">
                      <FiCalendar className="ep-input-icon" />
                      <input
                        id="ap-age"
                        type="number"
                        name="age"
                        value={addForm.age}
                        onChange={handleAddFormChange}
                        placeholder="Age"
                        min="0"
                        max="150"
                      />
                    </div>
                  </div>


                  <div className="ep-field ep-field-full">
                    <label htmlFor="ap-gender">Gender</label>
                    <div className="ep-select-wrapper">
                      <select
                        id="ap-gender"
                        name="gender"
                        value={addForm.gender}
                        onChange={handleAddFormChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>


                <div className="ep-footer">
                  <button type="button" className="ep-cancel-btn" onClick={closeAddModal}>
                    Cancel
                  </button>
                  <button type="submit" className="ep-save-btn" disabled={addSaving}>
                    {addSaving ? (
                      <span className="ep-saving-spinner"></span>
                    ) : (
                      <FiPlus size={15} />
                    )}
                    {addSaving ? "Creating..." : "Create Patient"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModalOpen && editingPatient && (
          <motion.div
            className="ep-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditModal}
          >
            <motion.div
              className="ep-modal"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >

              <div className="ep-header">
                <div className="ep-header-left">
                  <div className="ep-avatar">{getInitials(editingPatient.name)}</div>
                  <div>
                    <h2 className="ep-title">Edit Patient</h2>
                    <p className="ep-subtitle">Update {editingPatient.name}'s information</p>
                  </div>
                </div>
                <button className="ep-close-btn" onClick={closeEditModal} title="Close">
                  <FiX size={20} />
                </button>
              </div>


              <form className="ep-form" onSubmit={handleEditSave}>
                <div className="ep-form-grid">

                  <div className="ep-field ep-field-full">
                    <label htmlFor="ep-name">Full Name</label>
                    <div className="ep-input-wrapper">
                      <FiUser className="ep-input-icon" />
                      <input
                        id="ep-name"
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        placeholder="Patient full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="ep-field ep-field-full">
                    <label htmlFor="ep-email">Email Address</label>
                    <div className="ep-input-wrapper">
                      <FiMail className="ep-input-icon" />
                      <input
                        id="ep-email"
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        placeholder="Email address"
                        required
                      />
                    </div>
                  </div>

                  <div className="ep-field">
                    <label htmlFor="ep-phone">Phone Number</label>
                    <div className="ep-input-wrapper">
                      <FiPhone className="ep-input-icon" />
                      <input
                        id="ep-phone"
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditFormChange}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div className="ep-field">
                    <label htmlFor="ep-age">Age</label>
                    <div className="ep-input-wrapper">
                      <FiCalendar className="ep-input-icon" />
                      <input
                        id="ep-age"
                        type="number"
                        name="age"
                        value={editForm.age}
                        onChange={handleEditFormChange}
                        placeholder="Age"
                        min="0"
                        max="150"
                      />
                    </div>
                  </div>

                  <div className="ep-field ep-field-full">
                    <label htmlFor="ep-gender">Gender</label>
                    <div className="ep-select-wrapper">
                      <select
                        id="ep-gender"
                        name="gender"
                        value={editForm.gender}
                        onChange={handleEditFormChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="ep-footer">
                  <button type="button" className="ep-cancel-btn" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="ep-save-btn" disabled={editSaving}>
                    {editSaving ? (
                      <span className="ep-saving-spinner"></span>
                    ) : (
                      <FiSave size={15} />
                    )}
                    {editSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
