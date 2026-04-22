import React from "react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";
import "./TrendIndicator.css";

export default function TrendIndicator({ trend = "neutral", percentage = 0, label = "" }) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <FiTrendingUp className="trend-icon trend-up" />;
      case "down":
        return <FiTrendingDown className="trend-icon trend-down" />;
      default:
        return <FiMinus className="trend-icon trend-neutral" />;
    }
  };

  return (
    <div className={`trend-indicator trend-${trend}`}>
      {getTrendIcon()}
      <span className="trend-text">
        {percentage}%
        {label && <span className="trend-label">{label}</span>}
      </span>
    </div>
  );
}
