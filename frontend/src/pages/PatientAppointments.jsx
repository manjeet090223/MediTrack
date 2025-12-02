import React, { useEffect, useState } from "react";
import { getAppointments, cancelAppointment, updateAppointment } from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "./patientAppointments.css";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.info("Appointment Cancelled");
      loadAppointments();
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error(error.response?.data?.message || "Cancel failed");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const newReason = prompt("Update Reason for your appointment:");
      if (!newReason) return;
      await updateAppointment(id, { reason: newReason });
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
        <h2>My Appointments</h2>
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>No appointments found</td>
              </tr>
            )}

            {appointments.map((appt) => (
              <tr key={appt._id}>
                <td>{appt.doctor?.name || "-"}</td>
                <td>{new Date(appt.datetime).toLocaleString()}</td>
                <td>{appt.status}</td>
                <td>{appt.reason || "-"}</td>
                <td>
                  {appt.status === "Booked" && (
                    <>
                      <button className="btn-cancel" onClick={() => handleCancel(appt._id)}>
                        Cancel
                      </button>
                      <button className="btn-update" onClick={() => handleUpdate(appt._id)}>
                        Update
                      </button>
                    </>
                  )}
                  {appt.status === "Completed" && (
                    <span className="completed-label">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
