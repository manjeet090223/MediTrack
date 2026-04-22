import React from "react";
import { motion } from "framer-motion";
import "./QuickActionCards.css";

export default function QuickActionCards({ actions = [], columns = 3 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: {
      y: -4
    }
  };

  return (
    <motion.div
      className="quick-action-cards"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))` }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action, idx) => (
        <motion.button
          key={idx}
          className={`action-card action-${action.color || "primary"}`}
          variants={itemVariants}
          whileHover="hover"
          onClick={action.onClick}
        >
          <div className="action-icon">{action.icon}</div>
          <h3 className="action-title">{action.title}</h3>
          <p className="action-description">{action.description}</p>
          <span className="action-arrow">→</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
