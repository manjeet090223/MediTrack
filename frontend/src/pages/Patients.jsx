import React, { useEffect, useState } from "react";
import { getAllPatients, deletePatient, getDoctorPatients } from "../api/axios";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Patients.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10; 

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        let res;
        if (user?.role === "Doctor") res = await getDoctorPatients();
        else if (user?.role === "Admin") res = await getAllPatients();
        else {
          toast.error("Access denied!");
          return navigate("/dashboard");
        }

        setPatients(res.data);
      } catch (err) {
        toast.error("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await deletePatient(id);
      setPatients(patients.filter((p) => p._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };


  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );


  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  if (loading) return <div className="loading">Loading patients...</div>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content fade-slide">
        <h1 className="page-title">
          {user?.role === "Doctor" ? "My Patients" : "All Patients"}
        </h1>

       
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="search-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {currentPatients.length === 0 ? (
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
              {currentPatients.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.age || "-"}</td>
                  <td>{p.gender || "-"}</td>
                  <td>{p.phone || "-"}</td>

                  <td className="actions">
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/patients/${p._id}`)}
                    >
                      View
                    </button>

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
