
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./HealthProgress.css";

export default function HealthProgress({ progress, label }) {
  return (
    <div className="progress-card">
      <CircularProgressbar
        value={progress}
        text={`${progress}%`}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: "#0a8a42",
          textColor: "#0b6a3a",
          trailColor: "#dff5e1",
        })}
      />
      <p className="progress-label">{label}</p>
    </div>
  );
}
