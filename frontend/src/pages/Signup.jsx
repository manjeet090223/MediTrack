import React, { useState } from "react";
import api from "../api/axios"; 
import { Link, useNavigate } from "react-router-dom";
import "./loginSignup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient", 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/api/auth/signup", form);
      setSuccess("Signup successful — redirecting...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h1 className="brand-title">MediTrack</h1>
        <p className="tagline">Smart Patient Health Record System</p>

        <h2 className="form-title">Create Account</h2>

        {error && <div className="alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            required
          />

          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />

          <select
            className="input"
            name="role"
            value={form.role}
            onChange={onChange}
          >
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
          </select>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Create Account"}
          </button>
        </form>

        <p className="link-row">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
