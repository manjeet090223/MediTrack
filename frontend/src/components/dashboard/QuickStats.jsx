// components/dashboard/QuickStats.jsx
import React from "react";
import CountUp from "react-countup";
import "./QuickStats.css";

export default function QuickStats({ totalAppointments, upcomingAppointments, completedAppointments }) {
  return (
    <div className="quick-stats-container">
      <div className="stat-card">
        <h3>Total Appointments</h3>
        <CountUp end={totalAppointments} duration={1.5} />
      </div>
      <div className="stat-card">
        <h3>Upcoming</h3>
        <CountUp end={upcomingAppointments} duration={1.5} />
      </div>
      <div className="stat-card">
        <h3>Completed</h3>
        <CountUp end={completedAppointments} duration={1.5} />
      </div>
    </div>
  );
}
