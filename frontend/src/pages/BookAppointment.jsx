import React, { useEffect, useState } from "react";
import api, { createAppointment } from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "./appointments.css";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [datetime, setDatetime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/users?role=Doctor");
        console.log("Doctors fetched:", res.data);
        setDoctors(res.data);
        if (res.data.length > 0) setSelectedDoctor(res.data[0]._id);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        toast.error("Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Booking appointment payload:", { doctorId: selectedDoctor, datetime, reason });
    if (!selectedDoctor || !datetime) return toast.warn("Please select doctor and datetime");

    try {
      const res = await createAppointment({
        doctorId: selectedDoctor,
        datetime,
        reason,
      });
      console.log("Appointment created response:", res.data);
      toast.success("Appointment Booked Successfully!");
      setDatetime("");
      setReason("");
    } catch (error) {
      console.error("Booking failed:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to book");
    }
  };

  return (
    <div className="appointments-page">
      <Sidebar />
      <div className="appointment-container">
        <form className="appointment-form" onSubmit={handleSubmit}>
          <h2>Book Appointment</h2>

          <label>Select Doctor</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
          >
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.name}</option>
            ))}
          </select>

          <label>Date & Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />

          <label>Reason for Appointment</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your issue"
          ></textarea>

          <button type="submit" className="btn-primary">Book Appointment</button>
        </form>
      </div>
    </div>
  );
}
