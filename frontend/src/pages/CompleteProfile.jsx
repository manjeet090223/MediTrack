import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./CompleteProfile.css";
import { toast } from "react-toastify";

export default function CompleteProfile() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    age: storedUser?.age || "",
    gender: storedUser?.gender || "",
    phone: storedUser?.phone || "",
  });

  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await api.put(
        `/api/users/update-profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }

    setLoading(false);
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h2>Complete Your Profile</h2>
        <p>Please provide the remaining details to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            className="profile-input"
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={onChange}
            required
          />

          <select
            className="profile-input"
            name="gender"
            value={form.gender}
            onChange={onChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            className="profile-input"
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={onChange}
            required
            pattern="[0-9]{10}"
            maxLength="10"
          />

          <button className="profile-btn" type="submit" disabled={loading}>
            {loading ? "Updating..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
