import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientDetails, getPatientAppointmentsById } from "../api/axios";
import Sidebar from "../components/Sidebar";
import "./Patients.css";

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientRes, apptsRes] = await Promise.all([
          getPatientDetails(id),
          getPatientAppointmentsById(id),
        ]);

        setPatient(patientRes.data);
        setAppointments(apptsRes.data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) return <div className="loading">Loading patient...</div>;
  if (!patient) return <div>Patient not found.</div>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content fade-slide">
        <h1 className="page-title">{patient.name}</h1>

        {/* Patient Basic Info */}
        <div className="patient-profile">
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Age:</strong> {patient.age || "-"}</p>
          <p><strong>Gender:</strong> {patient.gender || "-"}</p>
          <p><strong>Phone:</strong> {patient.phone || "-"}</p>
        </div>

        {/* Appointment History */}
        <h2 className="sub-title">Appointment History</h2>

        {appointments.length === 0 ? (
          <p className="no-data">No appointments booked yet.</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td>{new Date(appt.datetime).toLocaleString()}</td>
                  <td>{appt.reason || "N/A"}</td>
                  <td>{appt.doctor?.name}</td>
                  <td className={`status ${appt.status.toLowerCase()}`}>
                    {appt.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
