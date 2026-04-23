import React, { useEffect, useState } from "react";
import api, { createAppointment } from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiFileText,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiLoader,
  FiStar,
  FiAward,
  FiActivity,
  FiDollarSign
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import "./bookAppointment.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [datetime, setDatetime] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/api/users?role=Doctor");
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        toast.error("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDoctor || !datetime) {
      toast.warn("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      await createAppointment({
        doctorId: selectedDoctor._id,
        datetime,
        reason,
      });
      toast.success("Appointment Booked Successfully!");
      setStep(4); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedDoctor;
    if (step === 2) return !!datetime;
    return true;
  };

  const steps = [
    { num: 1, label: "Select Doctor", icon: <FiUser size={16} /> },
    { num: 2, label: "Date & Time", icon: <FiCalendar size={16} /> },
    { num: 3, label: "Confirm", icon: <FiCheck size={16} /> },
  ];

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  return (
    <div className="page-wrapper">
      <Sidebar />

      <main className="page-main">
        <div className="page-container">

          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="page-header-text">
              <h1 className="page-title">Book Appointment</h1>
              <p className="page-subtitle">Schedule a consultation with our specialists</p>
            </div>
          </motion.div>

          {step <= 3 && (
            <>

              <motion.div
                className="step-indicator"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {steps.map((s, i) => (
                  <React.Fragment key={s.num}>
                    <div
                      className={`step-item ${step === s.num ? "active" : ""} ${step > s.num ? "completed" : ""}`}
                      onClick={() => {
                        if (s.num < step) {
                          setDirection(-1);
                          setStep(s.num);
                        }
                      }}
                    >
                      <div className="step-circle">
                        {step > s.num ? <FiCheck size={16} /> : s.icon}
                      </div>
                      <span className="step-label">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`step-line ${step > s.num ? "completed" : ""}`} />}
                  </React.Fragment>
                ))}
              </motion.div>


              <div className="booking-content">
                <AnimatePresence mode="wait" custom={direction}>

                  {step === 1 && (
                    <motion.div
                      key="step1"
                      className="step-panel"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                    >
                      <div className="step-card">
                        <div className="step-card-header">
                          <h2>Choose Your Doctor</h2>
                          <p>Select a specialist for your consultation</p>
                        </div>

                        <div className="doctor-grid">
                          {doctors.map((doc) => (
                            <div
                              key={doc._id}
                              className={`doctor-option ${selectedDoctor?._id === doc._id ? "selected" : ""}`}
                              onClick={() => setSelectedDoctor(doc)}
                            >
                              <div className="doctor-option-avatar">
                                {doc.name?.charAt(0)?.toUpperCase() || "D"}
                              </div>
                              <div className="doctor-option-info">
                                <h4>{doc.name}</h4>
                                <span className="doctor-spec">{doc.specialization || "General Physician"}</span>
                                <div className="doctor-meta">
                                  <span><FiAward size={12} /> {doc.experience || 0}+ yrs exp</span>
                                  <span><FiStar size={12} /> 4.8</span>
                                </div>
                              </div>
                              <div className="doctor-option-check">
                                {selectedDoctor?._id === doc._id && <FiCheck size={18} />}
                              </div>
                            </div>
                          ))}
                        </div>

                        {doctors.length === 0 && (
                          <div className="empty-doctors">
                            <FiUser size={32} />
                            <p>No doctors available at the moment</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}


                  {step === 2 && (
                    <motion.div
                      key="step2"
                      className="step-panel"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                    >
                      <div className="booking-two-col">

                        <div className="doctor-preview-card">
                          <div className="preview-header">
                            <h3>Selected Doctor</h3>
                          </div>
                          <div className="preview-body">
                            <div className="preview-avatar">
                              {selectedDoctor?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <h4 className="preview-name">{selectedDoctor?.name}</h4>
                            <span className="preview-spec">{selectedDoctor?.specialization || "General Physician"}</span>

                            <div className="preview-details">
                              <div className="preview-detail-row">
                                <FiClock size={14} />
                                <span>30 min consultation</span>
                              </div>
                              <div className="preview-detail-row">
                                <FiActivity size={14} />
                                <span>In-person visit</span>
                              </div>
                              <div className="preview-detail-row">
                                <FiDollarSign size={14} />
                                <span>₹500 consultation fee</span>
                              </div>
                            </div>
                          </div>
                        </div>


                        <div className="step-card">
                          <div className="step-card-header">
                            <h2>Pick Date & Time</h2>
                            <p>Choose when you'd like to visit</p>
                          </div>

                          <div className="form-section">
                            <label className="booking-label">
                              <FiCalendar size={14} />
                              Date & Time
                            </label>
                            <input
                              type="datetime-local"
                              value={datetime}
                              onChange={(e) => setDatetime(e.target.value)}
                              className="booking-input"
                              required
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>

                          <div className="form-section">
                            <label className="booking-label">
                              <FiFileText size={14} />
                              Reason for Visit <span className="label-optional">(optional)</span>
                            </label>
                            <textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="booking-textarea"
                              placeholder="Briefly describe your symptoms or reason for the appointment..."
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}


                  {step === 3 && (
                    <motion.div
                      key="step3"
                      className="step-panel"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25 }}
                    >
                      <div className="step-card confirm-card">
                        <div className="step-card-header">
                          <h2>Confirm Booking</h2>
                          <p>Review your appointment details before confirming</p>
                        </div>

                        <div className="confirm-grid">
                          <div className="confirm-row">
                            <div className="confirm-icon"><FiUser size={18} /></div>
                            <div>
                              <span className="confirm-label">Doctor</span>
                              <span className="confirm-value">{selectedDoctor?.name}</span>
                            </div>
                          </div>
                          <div className="confirm-row">
                            <div className="confirm-icon"><FiCalendar size={18} /></div>
                            <div>
                              <span className="confirm-label">Date & Time</span>
                              <span className="confirm-value">
                                {datetime
                                  ? new Date(datetime).toLocaleString("en-IN", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </span>
                            </div>
                          </div>
                          <div className="confirm-row">
                            <div className="confirm-icon"><FiClock size={18} /></div>
                            <div>
                              <span className="confirm-label">Duration</span>
                              <span className="confirm-value">30 minutes</span>
                            </div>
                          </div>
                          <div className="confirm-row">
                            <div className="confirm-icon"><FiFileText size={18} /></div>
                            <div>
                              <span className="confirm-label">Reason</span>
                              <span className="confirm-value">{reason || "Not specified"}</span>
                            </div>
                          </div>
                          <div className="confirm-row">
                            <div className="confirm-icon"><FiDollarSign size={18} /></div>
                            <div>
                              <span className="confirm-label">Fee</span>
                              <span className="confirm-value">₹500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


                <div className="step-nav">
                  {step > 1 && (
                    <button className="btn-step-back" onClick={goBack}>
                      <FiChevronLeft size={18} />
                      <span>Back</span>
                    </button>
                  )}
                  <div className="step-nav-spacer" />
                  {step < 3 && (
                    <button
                      className="btn-step-next"
                      onClick={goNext}
                      disabled={!canProceed()}
                    >
                      <span>Continue</span>
                      <FiChevronRight size={18} />
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      className="btn-step-confirm"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FiLoader size={18} className="spin" />
                          <span>Booking...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck size={18} />
                          <span>Confirm Booking</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}


          {step === 4 && (
            <motion.div
              className="success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="success-icon-wrapper">
                <FiCheck size={40} />
              </div>
              <h2>Appointment Booked!</h2>
              <p>Your appointment with <strong>{selectedDoctor?.name}</strong> has been confirmed.</p>
              <p className="success-datetime">
                {new Date(datetime).toLocaleString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className="success-actions">
                <button className="btn-step-back" onClick={() => navigate("/my-appointments")}>
                  View My Appointments
                </button>
                <button
                  className="btn-step-next"
                  onClick={() => {
                    setStep(1);
                    setSelectedDoctor(null);
                    setDatetime("");
                    setReason("");
                  }}
                >
                  Book Another
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
