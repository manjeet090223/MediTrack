import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatientDetails, updatePatient } from "../api/axios";
import Sidebar from "../components/Sidebar";
import "./Patients.css";
import { toast } from "react-toastify";

export default function EditPatient() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await getPatientDetails(id);
        setForm(res.data);
      } catch (err) {
        console.error("Failed to load patient data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePatient(id, form);
      toast.success("Patient updated successfully!");
      navigate(`/patients/${id}`);
    } catch {
      toast.error("Failed to update patient");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content fade-slide">
        <h1 className="page-title">Edit Patient</h1>

        <form className="patient-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          <label>Age</label>
          <input type="number" name="age" value={form.age} onChange={handleChange} />

          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />

          <button type="submit" className="btn-save">Save Changes</button>
        </form>
      </div>
    </div>
  );
}
