import React, { useEffect, useState } from "react";
import { getDoctorDetails, updateDoctor } from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import "./profile.css";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  // Load doctor data
  const loadDoctor = async () => {
    if (!user?.id) {
      toast.error("Doctor ID not found");
      return;
    }
    try {
      const res = await getDoctorDetails(user.id);   
      setDoctor(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Failed to load doctor:", error);
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    loadDoctor();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateDoctor(user.id, formData);
      setEditMode(false);
      loadDoctor();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleCancel = () => {
    setFormData(doctor);
    setEditMode(false);
  };

  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-container">
        <div className="profile-card">
          <h2>My Profile</h2>

          {!editMode ? (
            <>
              <p><strong>Name:</strong> {doctor.name}</p>
              <p><strong>Email:</strong> {doctor.email}</p>
              <p><strong>Specialization:</strong> {doctor.specialization || "-"}</p>
              <p><strong>Phone:</strong> {doctor.phone || "-"}</p>
              <p><strong>Experience:</strong> {doctor.experience || "-"}</p>
              <p><strong>Gender:</strong> {doctor.gender || "-"}</p>
              <div className="form-buttons">
                <button className="btn-edit" onClick={() => setEditMode(true)}>Edit Profile</button>
              </div>
            </>
          ) : (
            <div className="profile-form">
              <label>
                Name
                <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
              </label>
              <label>
                Specialization
                <input type="text" name="specialization" value={formData.specialization || ""} onChange={handleChange} />
              </label>
              <label>
                Phone
                <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} />
              </label>
              <label>
                Experience (years)
                <input type="number" name="experience" value={formData.experience || ""} onChange={handleChange} />
              </label>
              <label>
                Gender
                <select name="gender" value={formData.gender || ""} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <div className="form-buttons">
                <button className="btn-save" onClick={handleSave}>Save</button>
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
