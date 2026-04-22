import React from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiMapPin, FiArrowRight } from "react-icons/fi";
import { formatDate, formatTime } from "../../utils/formatters";
import "./AppointmentsList.css";

export default function AppointmentsList({
  appointments = [],
  loading = false,
  onViewAll = null,
  limit = 5
}) {
  const displayAppointments = appointments.slice(0, limit);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="appointments-list">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="appointment-skeleton">
            <div className="skeleton-content"></div>
          </div>
        ))}
      </div>
    );
  }

  if (displayAppointments.length === 0) {
    return (
      <div className="appointments-empty">
        <FiCalendar className="empty-icon" />
        <h4>No Appointments</h4>
        <p>You don't have any upcoming appointments scheduled.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="appointments-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {displayAppointments.map((apt, idx) => (
        <motion.div
          key={apt.id || idx}
          className="appointment-item"
          variants={itemVariants}
        >
          <div className="appointment-date-box">
            <div className="appointment-day">
              {new Date(apt.datetime).getDate()}
            </div>
            <div className="appointment-month">
              {new Date(apt.datetime).toLocaleDateString("en-US", {
                month: "short"
              })}
            </div>
          </div>

          <div className="appointment-details">
            <h4 className="appointment-doctor">
              {apt.doctor?.name ? `Dr. ${apt.doctor.name}` : "Dr. TBA"}
            </h4>
            <div className="appointment-info">
              <span className="info-item">
                <FiClock size={14} />
                {formatTime(apt.datetime)}
              </span>
              {apt.specialization && (
                <span className="info-item">
                  {apt.specialization}
                </span>
              )}
            </div>
            {apt.notes && (
              <p className="appointment-notes">{apt.notes}</p>
            )}
          </div>

          <div className={`appointment-status status-${(apt.status || "scheduled").toLowerCase()}`}>
            {apt.status || "Scheduled"}
          </div>
        </motion.div>
      ))}

      {appointments.length > limit && (
        <button className="view-all-btn" onClick={onViewAll}>
          View All Appointments
          <FiArrowRight size={16} />
        </button>
      )}
    </motion.div>
  );
}
