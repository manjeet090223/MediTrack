import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiEdit3,
  FiSave,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiShield,
  FiActivity
} from "react-icons/fi";
import "./PatientProfile.css";

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?.id) return;

    const fetchPatient = async () => {
      try {
        const res = await api.get(`/api/patients/${user.id}`);
        setPatient(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          address: res.data.address || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };

    fetchPatient();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/patients/${user.id}`, formData);
      setPatient(res.data);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    if (!patient) return 0;
    const fields = ["name", "email", "phone", "age", "gender", "address"];
    const filled = fields.filter((f) => patient[f] && patient[f] !== "");
    return Math.round((filled.length / fields.length) * 100);
  };

  const completion = getProfileCompletion();

  if (!patient) {
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
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Manage your personal information</p>
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
                  {patient.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <h2 className="profile-name">{patient.name}</h2>
                <p className="profile-email">{patient.email}</p>
                <span className="profile-role-badge">
                  <FiShield size={12} />
                  Patient
                </span>
              </div>

              {/* Profile Completion */}
              <div className="profile-completion">
                <div className="completion-header">
                  <span className="completion-label">Profile Completion</span>
                  <span className="completion-value">{completion}%</span>
                </div>
                <div className="completion-bar">
                  <div
                    className="completion-fill"
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
                {completion < 100 && (
                  <p className="completion-hint">Complete your profile for a better experience</p>
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
                <>
                  {/* Personal Information */}
                  <motion.div
                    className="info-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <div className="info-card-header">
                      <h3>Personal Information</h3>
                    </div>
                    <div className="info-grid">
                      <div className="info-field">
                        <div className="field-icon"><FiUser size={16} /></div>
                        <div>
                          <span className="field-label">Full Name</span>
                          <span className="field-value">{patient.name || "—"}</span>
                        </div>
                      </div>
                      <div className="info-field">
                        <div className="field-icon"><FiMail size={16} /></div>
                        <div>
                          <span className="field-label">Email Address</span>
                          <span className="field-value">{patient.email || "—"}</span>
                        </div>
                      </div>
                      <div className="info-field">
                        <div className="field-icon"><FiPhone size={16} /></div>
                        <div>
                          <span className="field-label">Phone Number</span>
                          <span className="field-value">{patient.phone || "—"}</span>
                        </div>
                      </div>
                      <div className="info-field">
                        <div className="field-icon"><FiMapPin size={16} /></div>
                        <div>
                          <span className="field-label">Address</span>
                          <span className="field-value">{patient.address || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Basic Details */}
                  <motion.div
                    className="info-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                  >
                    <div className="info-card-header">
                      <h3>Basic Details</h3>
                    </div>
                    <div className="info-grid">
                      <div className="info-field">
                        <div className="field-icon"><FiCalendar size={16} /></div>
                        <div>
                          <span className="field-label">Age</span>
                          <span className="field-value">{patient.age ? `${patient.age} years` : "—"}</span>
                        </div>
                      </div>
                      <div className="info-field">
                        <div className="field-icon"><FiActivity size={16} /></div>
                        <div>
                          <span className="field-label">Gender</span>
                          <span className="field-value">{patient.gender || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                /* EDIT MODE */
                <motion.div
                  className="info-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="info-card-header">
                    <h3>Edit Your Information</h3>
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
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder="Enter your name"
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
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="form-input"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiPhone size={14} />
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your phone"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiCalendar size={14} />
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your age"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">
                          <FiActivity size={14} />
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="form-input"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-field form-field-full">
                        <label className="form-label">
                          <FiMapPin size={14} />
                          Address
                        </label>
                        <input
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-form-cancel" onClick={() => setEditing(false)}>
                        <FiX size={16} />
                        <span>Cancel</span>
                      </button>
                      <button type="submit" className="btn-form-save">
                        <FiSave size={16} />
                        <span>Save Changes</span>
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
