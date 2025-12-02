import React, { useEffect, useState } from "react";
import { getAllPatients, deletePatient } from "../api/axios";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Patients.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await getAllPatients();
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to load patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deletePatient(id);
      setPatients(patients.filter((p) => p._id !== id));
      toast.success("Patient deleted successfully!");
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  if (loading) return <div className="loading">Loading patients...</div>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content fade-slide">
        <h1 className="page-title">All Patients</h1>

        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.age || "-"}</td>
                  <td>{p.gender || "-"}</td>
                  <td>{p.phone || "-"}</td>

                  <td className="actions">
                    {/* Doctor & Admin both can view */}
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/patients/${p._id}`)}
                    >
                      View
                    </button>

                    {/* Doctor & Admin can delete */}
                    {["Doctor", "Admin"].includes(user?.role) && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    )}
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
