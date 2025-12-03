import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./loginSignup.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", form);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

     
      if (user.role === "Doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h1 className="brand-title">MediTrack</h1>
        <p className="tagline">Smart Patient Health Record System</p>

        <h2 className="form-title">Welcome Back</h2>

        {error && <div className="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            name="email"
            placeholder="Email Address"
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

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="link-row">
          New here? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}
