import React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import TrendIndicator from "./TrendIndicator";
import "./KPICard.css";

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend = null,
  description = "",
  actionText = "",
  onAction = null,
  color = "primary",
  loading = false
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: {
      y: -4,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
    }
  };

  return (
    <motion.div
      className={`kpi-card kpi-${color}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {loading ? (
        <div className="kpi-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-value"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="kpi-header">
            {Icon && <div className={`kpi-icon icon-${color}`}>{Icon}</div>}
            {trend && <TrendIndicator {...trend} />}
          </div>

          <div className="kpi-content">
            <p className="kpi-title">{title}</p>
            <div className="kpi-value">
              <CountUp
                end={value || 0}
                duration={0.6}
                separator=","
                preserveValue={true}
              />
            </div>
            {description && <p className="kpi-description">{description}</p>}
          </div>

          {actionText && (
            <button className="kpi-action" onClick={onAction}>
              {actionText} →
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
