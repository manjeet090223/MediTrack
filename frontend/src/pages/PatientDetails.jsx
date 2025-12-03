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

  // Search + Pagination + Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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

  // Filter + Search Logic
  const filteredAppts = appointments.filter((appt) => {
    const matchSearch =
      appt.reason?.toLowerCase().includes(search.toLowerCase()) ||
      appt.doctor?.name.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      appt.status === statusFilter ||
      (statusFilter === "Pending" && appt.status === "Booked");


    return matchSearch && matchStatus;
  });

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAppts = filteredAppts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAppts.length / itemsPerPage);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content fade-slide">
        <h1 className="page-title">{patient.name}</h1>

        {/* Patient Info */}
        <div className="patient-profile">
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Age:</strong> {patient.age || "-"}</p>
          <p><strong>Gender:</strong> {patient.gender || "-"}</p>
          <p><strong>Phone:</strong> {patient.phone || "-"}</p>
        </div>

        <h2 className="sub-title">Appointment History</h2>

        {/* Search + Filter Container */}
        <div className="filter-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by doctor or reason..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* TABLE */}
        {currentAppts.length === 0 ? (
          <p className="no-data">No appointments found.</p>
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
              {currentAppts.map((appt) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${currentPage === i + 1 ? "active-page" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
