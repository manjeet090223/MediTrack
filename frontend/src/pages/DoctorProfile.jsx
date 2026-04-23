import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api, { getDoctorDetails, updateDoctor } from "../api/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit3,
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiBriefcase,
  FiAward,
  FiActivity,
  FiClock
} from "react-icons/fi";
import "./PatientProfile.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchDoctor = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getDoctorDetails(user.id);
      setDoctor(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoctor(user.id, formData);
      setDoctor(formData);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const getProfileCompletion = () => {
    if (!doctor) return 0;
    const fields = ["name", "email", "phone", "specialization", "experience", "gender"];
    const filled = fields.filter((f) => doctor[f] && doctor[f] !== "");
    return Math.round((filled.length / fields.length) * 100);
  };

  const completion = getProfileCompletion();

  if (loading) {
    return (
      <div className="page-wrapper">
        <Sidebar />
        <main className="page-main">
          <div className="page-container">
            <div className="profile-skeleton">
              <div className="skeleton-card skeleton-pulse" style={{ height: 320 }}></div>
              <div className="skeleton-content">
                <div className="skeleton-card skeleton-pulse" style={{ height: 200 }}></div>
                <div className="skeleton-card skeleton-pulse" style={{ height: 200 }}></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!doctor) return <div>Failed to load profile data.</div>;

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
              <h1 className="page-title">Doctor Profile</h1>
              <p className="page-subtitle">Manage your professional identity and details</p>
            </div>
          </motion.div>

          <div className="profile-layout">
            {/* LEFT COLUMN — Profile Card */}
            <motion.div
              className="profile-sidebar-card"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Avatar */}
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                </div>
                <h2 className="profile-name">{doctor.name}</h2>
                <p className="profile-email">{doctor.email}</p>
                <span className="profile-role-badge">
                  <FiShield size={12} />
                  {doctor.specialization || "Physician"}
                </span>
              </div>

              {/* Profile Completion */}
              <div className="profile-completion">
                <div className="completion-header">
                  <span className="completion-label">Account Progress</span>
                  <span className="completion-value">{completion}%</span>
                </div>
                <div className="completion-bar">
                  <div
                    className="completion-fill"
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
                {completion < 100 && (
                  <p className="completion-hint">Add more details to reach a 100% professional score</p>
                )}
              </div>

              {/* Edit Button */}
              {!editing && (
                <button className="btn-edit-profile" onClick={() => setEditing(true)}>
                  <FiEdit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </motion.div>

            {/* RIGHT COLUMN — Info Sections */}
            <div className="profile-details">
              {!editing ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="view-mode"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Professional Qualifications */}
                    <div className="info-card" style={{ marginBottom: 'var(--space-6)' }}>
                      <div className="info-card-header">
                        <h3>Professional Qualifications</h3>
                      </div>
                      <div className="info-grid">
                        <div className="info-field">
                          <div className="field-icon"><FiBriefcase size={16} /></div>
                          <div>
                            <span className="field-label">Specialization</span>
                            <span className="field-value">{doctor.specialization || "General Medicine"}</span>
                          </div>
                        </div>
                        <div className="info-field">
                          <div className="field-icon"><FiAward size={16} /></div>
                          <div>
                            <span className="field-label">Experience</span>
                            <span className="field-value">{doctor.experience ? `${doctor.experience} Years` : "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="info-card">
                      <div className="info-card-header">
                        <h3>Contact Information</h3>
                      </div>
                      <div className="info-grid">
                        <div className="info-field">
                          <div className="field-icon"><FiUser size={16} /></div>
                          <div>
                            <span className="field-label">Full Name</span>
                            <span className="field-value">{doctor.name || "—"}</span>
                          </div>
                        </div>
                        <div className="info-field">
                          <div className="field-icon"><FiMail size={16} /></div>
                          <div>
                            <span className="field-label">Email Address</span>
                            <span className="field-value">{doctor.email || "—"}</span>
                          </div>
                        </div>
                        <div className="info-field">
                          <div className="field-icon"><FiPhone size={16} /></div>
                          <div>
                            <span className="field-label">Phone Number</span>
                            <span className="field-value">{doctor.phone || "—"}</span>
                          </div>
                        </div>
                        <div className="info-field">
                          <div className="field-icon"><FiActivity size={16} /></div>
                          <div>
                            <span className="field-label">Gender</span>
                            <span className="field-value">{doctor.gender || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                /* EDIT MODE */
                <motion.div
                  key="edit-mode"
                  className="info-card"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="info-card-header">
                    <h3>Edit Professional Profile</h3>
                  </div>
                  <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label className="form-label">
                          <FiUser size={14} />
                          Full Name
                        </label>
                        <input
                          name="name"
                          value={formData.name || ""}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder="Dr. Name"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiMail size={14} />
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiBriefcase size={14} />
                          Specialization
                        </label>
                        <input
                          name="specialization"
                          value={formData.specialization || ""}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="e.g. Cardiologist"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiAward size={14} />
                          Experience (Years)
                        </label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience || ""}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Years"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiPhone size={14} />
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          value={formData.phone || ""}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Phone"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiActivity size={14} />
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender || ""}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-form-cancel" onClick={() => setEditing(false)}>
                        <FiX size={16} />
                        <span>Cancel</span>
                      </button>
                      <button type="submit" className="btn-form-save">
                        <FiSave size={16} />
                        <span>Save Profile</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
