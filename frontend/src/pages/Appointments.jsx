import React, { useEffect, useState } from "react";
import { getAppointments, cancelAppointment, updateAppointment } from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "./appointments.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      console.log("Appointments loaded:", res.data);
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    }
  };

  const handleCancel = async (id) => {
    try {
      console.log("Canceling appointment:", id);
      await cancelAppointment(id);
      toast.info("Appointment Cancelled");
      loadAppointments();
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      console.log("Updating appointment:", id, updates);
      await updateAppointment(id, updates);
      toast.success("Appointment Updated");
      loadAppointments();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="appointments-page">
      <Sidebar />
      <div className="appointment-container">
        <h2>Appointments</h2>
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id}>
                <td>{appt.doctor?.name || "-"}</td>
                <td>{appt.patient?.name || "-"}</td>
                <td>{new Date(appt.datetime).toLocaleString()}</td>
                <td>{appt.status}</td>
                <td>{appt.reason || "-"}</td>
                <td>
                  {user.role === "Patient" && appt.status === "Booked" && (
                    <button className="btn-cancel" onClick={() => handleCancel(appt._id)}>
                      Cancel
                    </button>
                  )}
                  {(user.role === "Doctor" || user.role === "Admin") && (
                    <button className="btn-update" onClick={() => handleUpdate(appt._id, { status: "Completed" })}>
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
