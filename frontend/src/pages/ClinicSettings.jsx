import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiUser,
  FiClock,
  FiSliders,
  FiSave,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiAward,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";
import { getDoctorDetails, updateDoctor } from "../api/axios";
import "./ClinicSettings.css";

export default function ClinicSettings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    gender: "",
  });


  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "10:00", end: "14:00" },
    sunday: { enabled: false, start: "", end: "" },
  });


  const [preferences, setPreferences] = useState({
    appointmentDuration: "30",
    autoConfirm: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await getDoctorDetails(user.id);
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          specialization: res.data.specialization || "",
          experience: res.data.experience || "",
          gender: res.data.gender || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await updateDoctor(user.id, profile);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilitySave = () => {

    localStorage.setItem("doctor_availability", JSON.stringify(availability));
    toast.success("Availability saved");
  };

  const handlePreferencesSave = () => {
    localStorage.setItem("doctor_preferences", JSON.stringify(preferences));
    toast.success("Preferences saved");
  };

  const sections = [
    { id: "profile", label: "Profile", icon: <FiUser size={16} /> },
    { id: "availability", label: "Availability", icon: <FiClock size={16} /> },
    { id: "preferences", label: "Preferences", icon: <FiSliders size={16} /> },
  ];

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="cs-page-layout">
      <Sidebar />
      <main className="cs-main">
        <div className="cs-container">

          <motion.div
            className="cs-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button className="cs-back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="cs-title">Clinic Settings</h1>
              <p className="cs-subtitle">Manage your practice configuration</p>
            </div>
          </motion.div>

          <div className="cs-layout">

            <motion.nav
              className="cs-nav"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={`cs-nav-item ${activeSection === s.id ? "cs-nav-active" : ""}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </motion.nav>


            <motion.div
              className="cs-content"
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >

              {activeSection === "profile" && (
                <div className="cs-card">
                  <div className="cs-card-header">
                    <h2>Professional Profile</h2>
                    <p>Update your personal and professional details</p>
                  </div>

                  {loading ? (
                    <div className="cs-loading">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <div className="cs-form">
                      <div className="cs-form-grid">
                        <div className="cs-field">
                          <label><FiUser size={13} /> Full Name</label>
                          <input name="name" value={profile.name} onChange={handleProfileChange} placeholder="Dr. Name" />
                        </div>
                        <div className="cs-field">
                          <label><FiMail size={13} /> Email</label>
                          <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="email@example.com" />
                        </div>
                        <div className="cs-field">
                          <label><FiPhone size={13} /> Phone</label>
                          <input name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="+91..." />
                        </div>
                        <div className="cs-field">
                          <label><FiBriefcase size={13} /> Specialization</label>
                          <input name="specialization" value={profile.specialization} onChange={handleProfileChange} placeholder="e.g. Cardiology" />
                        </div>
                        <div className="cs-field">
                          <label><FiAward size={13} /> Experience (Years)</label>
                          <input name="experience" type="number" value={profile.experience} onChange={handleProfileChange} placeholder="Years" />
                        </div>
                        <div className="cs-field">
                          <label><FiActivity size={13} /> Gender</label>
                          <select name="gender" value={profile.gender} onChange={handleProfileChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="cs-form-actions">
                        <button className="cs-save-btn" onClick={handleProfileSave} disabled={saving}>
                          <FiSave size={15} />
                          {saving ? "Saving..." : "Save Profile"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {activeSection === "availability" && (
                <div className="cs-card">
                  <div className="cs-card-header">
                    <h2>Weekly Availability</h2>
                    <p>Set your working hours for each day</p>
                  </div>
                  <div className="cs-avail-list">
                    {days.map((day) => (
                      <div key={day} className={`cs-avail-row ${!availability[day].enabled ? "cs-avail-disabled" : ""}`}>
                        <label className="cs-toggle-label">
                          <input
                            type="checkbox"
                            checked={availability[day].enabled}
                            onChange={(e) =>
                              setAvailability((prev) => ({
                                ...prev,
                                [day]: { ...prev[day], enabled: e.target.checked },
                              }))
                            }
                          />
                          <span className="cs-toggle-switch"></span>
                          <span className="cs-day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        </label>
                        {availability[day].enabled && (
                          <div className="cs-time-range">
                            <input
                              type="time"
                              value={availability[day].start}
                              onChange={(e) =>
                                setAvailability((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], start: e.target.value },
                                }))
                              }
                            />
                            <span className="cs-time-sep">to</span>
                            <input
                              type="time"
                              value={availability[day].end}
                              onChange={(e) =>
                                setAvailability((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], end: e.target.value },
                                }))
                              }
                            />
                          </div>
                        )}
                        {!availability[day].enabled && (
                          <span className="cs-day-off">Day off</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="cs-form-actions">
                    <button className="cs-save-btn" onClick={handleAvailabilitySave}>
                      <FiSave size={15} />
                      Save Availability
                    </button>
                  </div>
                </div>
              )}


              {activeSection === "preferences" && (
                <div className="cs-card">
                  <div className="cs-card-header">
                    <h2>Practice Preferences</h2>
                    <p>Configure how your clinic operates</p>
                  </div>
                  <div className="cs-pref-list">
                    <div className="cs-pref-item">
                      <div className="cs-pref-info">
                        <span className="cs-pref-label">Default Appointment Duration</span>
                        <span className="cs-pref-desc">How long each appointment slot should be</span>
                      </div>
                      <select
                        value={preferences.appointmentDuration}
                        onChange={(e) => setPreferences((p) => ({ ...p, appointmentDuration: e.target.value }))}
                        className="cs-pref-select"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                    </div>

                    <div className="cs-pref-item">
                      <div className="cs-pref-info">
                        <span className="cs-pref-label">Auto-confirm Appointments</span>
                        <span className="cs-pref-desc">Automatically confirm new booking requests</span>
                      </div>
                      <label className="cs-toggle-label">
                        <input
                          type="checkbox"
                          checked={preferences.autoConfirm}
                          onChange={(e) => setPreferences((p) => ({ ...p, autoConfirm: e.target.checked }))}
                        />
                        <span className="cs-toggle-switch"></span>
                      </label>
                    </div>

                    <div className="cs-pref-item">
                      <div className="cs-pref-info">
                        <span className="cs-pref-label">Email Notifications</span>
                        <span className="cs-pref-desc">Receive email alerts for new appointments</span>
                      </div>
                      <label className="cs-toggle-label">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences((p) => ({ ...p, emailNotifications: e.target.checked }))}
                        />
                        <span className="cs-toggle-switch"></span>
                      </label>
                    </div>

                    <div className="cs-pref-item">
                      <div className="cs-pref-info">
                        <span className="cs-pref-label">SMS Notifications</span>
                        <span className="cs-pref-desc">Get text messages for urgent updates</span>
                      </div>
                      <label className="cs-toggle-label">
                        <input
                          type="checkbox"
                          checked={preferences.smsNotifications}
                          onChange={(e) => setPreferences((p) => ({ ...p, smsNotifications: e.target.checked }))}
                        />
                        <span className="cs-toggle-switch"></span>
                      </label>
                    </div>
                  </div>
                  <div className="cs-form-actions">
                    <button className="cs-save-btn" onClick={handlePreferencesSave}>
                      <FiSave size={15} />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
