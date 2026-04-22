import React from "react";
import { motion } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiAlertCircle
} from "react-icons/fi";
import "./StatusBanner.css";

export default function StatusBanner({ status = "idle", message = "", icon = "check", onAction = null }) {
  const getStatusIcon = () => {
    switch (icon) {
      case "clock":
        return <FiClock />;
      case "check":
        return <FiCheckCircle />;
      case "plus":
        return <FiPlus />;
      default:
        return <FiAlertCircle />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className={`status-banner status-${status}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="banner-icon">{getStatusIcon()}</div>
      <div className="banner-content">
        <p className="banner-message">{message}</p>
      </div>
      {onAction && (
        <button className="banner-action" onClick={onAction}>
          View
        </button>
      )}
    </motion.div>
  );
}
