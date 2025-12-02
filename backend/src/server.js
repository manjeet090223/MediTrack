const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const appointmentsRouter = require("./routes/appointments");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const profileRoutes = require("./routes/profileRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// DB Connection
connectDB();

// Routes
app.use("/api/appointments", appointmentsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.send("Pathrise backend is running 🚀");
});

// 404 Handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
