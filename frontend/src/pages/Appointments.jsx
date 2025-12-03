import React, { useEffect, useState } from "react";
import {
  getAppointments,
  cancelAppointment,
  updateAppointment,
} from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "./appointments.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem("user"));

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
      setFilteredData(res.data);
    } catch (error) {
      toast.error("Failed to load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Search + Filter Logic
  useEffect(() => {
    let updated = [...appointments];

    if (search) {
      updated = updated.filter(
        (a) =>
          a.doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.patient?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      updated = updated.filter((a) => a.status === statusFilter);
    }

    setFilteredData(updated);
    setCurrentPage(1);
  }, [search, statusFilter, appointments]);

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.info("Appointment Cancelled");
      loadAppointments();
    } catch (error) {
      toast.error("Cancel failed");
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateAppointment(id, updates);
      toast.success("Appointment Updated");
      loadAppointments();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // Pagination Logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="appointments-page">
      <Sidebar />
      <div className="appointment-container">
        <h2>Appointments</h2>

        {/* SEARCH & FILTER SECTION */}
        <div className="filter-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search doctor or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
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
              <th>Patient</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            )}

            {currentItems.map((appt) => (
              <tr key={appt._id}>
                <td>{appt.doctor?.name || "-"}</td>
                <td>{appt.patient?.name || "-"}</td>
                <td>{new Date(appt.datetime).toLocaleString()}</td>
                <td>{appt.status}</td>
                <td>{appt.reason || "-"}</td>

                <td>
                  {/* PATIENT CANCEL */}
                  {user.role === "Patient" && appt.status === "Booked" && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancel(appt._id)}
                    >
                      Cancel
                    </button>
                  )}

                  {/* DOCTOR/ADMIN MARK COMPLETED */}
                  {(user.role === "Doctor" || user.role === "Admin") && (
                    <>
                      {appt.status === "Completed" ? (
                        <span className="completed-label">Completed</span>
                      ) : appt.status === "Booked" ? (
                        <button
                          className="btn-update"
                          onClick={() =>
                            handleUpdate(appt._id, { status: "Completed" })
                          }
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="cancelled-label">Cancelled</span>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                className={currentPage === num + 1 ? "active" : ""}
                onClick={() => setCurrentPage(num + 1)}
              >
                {num + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
