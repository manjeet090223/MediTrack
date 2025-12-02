import React, { useEffect, useState } from "react";
import { getAllPatients } from "../api/axios"; 
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import "./Patients.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await getAllPatients();
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to load patients:", err);
        toast.error(
          err.response?.data?.message || "Failed to load patients"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
