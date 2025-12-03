import React, { useEffect, useState } from "react";
import { getAppointments, cancelAppointment, updateAppointment } from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "./patientAppointments.css";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user"));

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter((item) => {
    const matchSearch = item.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.info("Appointment Cancelled");
      loadAppointments();
    } catch (error) {
      toast.error("Cancel failed");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const newReason = prompt("Update Reason:");
      if (!newReason) return;

      await updateAppointment(id, { reason: newReason });
      toast.success("Updated Successfully");
      loadAppointments();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="appointments-page">
      <Sidebar />

      <div className="appointment-container">
        <h2>My Appointments</h2>

       
        <div className="filter-section">
          <input
            type="text"
            placeholder="Search by Doctor Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            className="filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Booked">Booked</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-wrapper">
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
            {paginatedAppointments.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            )}

            {paginatedAppointments.map((appt) => (
              <tr key={appt._id}>
                <td>{appt.doctor?.name}</td>
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

        {/*Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ⬅ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
