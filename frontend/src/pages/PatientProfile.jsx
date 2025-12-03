import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./PatientProfile.css";

export default function PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

 
  useEffect(() => {
    if (!user?.id) return;

    const fetchPatient = async () => {
      try {
        const res = await api.get(`/api/patients/${user.id}`);
        setPatient(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          address: res.data.address || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };

    fetchPatient();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/api/patients/${user.id}`, formData);
      setPatient(res.data);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (!patient) return <p className="loading-text">Loading profile...</p>;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content fade-slide">
        <h1 className="page-title">Your Profile</h1>

        <div className="profile-card">
          {!editing ? (
            <div className="profile-view">
              <p><strong>Name:</strong> {patient.name}</p>
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Phone:</strong> {patient.phone}</p>
              <p><strong>Age:</strong> {patient.age}</p>
              <p><strong>Gender:</strong> {patient.gender}</p>
              <p><strong>Address:</strong> {patient.address}</p>

              <button className="btn-edit" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <form className="profile-form" onSubmit={handleSubmit}>
              <label>
                Name:
                <input name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                Phone:
                <input name="phone" value={formData.phone} onChange={handleChange} />
              </label>
              <label>
                Age:
                <input type="number" name="age" value={formData.age} onChange={handleChange} />
              </label>
              <label>
                Gender:
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Address:
                <textarea name="address" value={formData.address} onChange={handleChange} />
              </label>

              <div className="form-buttons">
                <button type="submit" className="btn-save">Save</button>
                <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
