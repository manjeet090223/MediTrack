// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// 1️⃣ Summary endpoint
router.get("/summary", async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: "Patient" });

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsToday = await Appointment.countDocuments({
      datetime: { $gte: startOfDay, $lte: endOfDay },
    });

    const pendingRequests = await Appointment.countDocuments({ status: "Booked" });

    res.json({ totalPatients, appointmentsToday, pendingRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2️⃣ Appointments Trend endpoint (last 7 days)
router.get("/appointments-trend", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate by date string YYYY-MM-DD
    const trend = await Appointment.aggregate([
      { $match: { datetime: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          appointments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill last 7 days and map to day names
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const found = trend.find((t) => t._id === dateStr);
      result.push({
        day: date.toLocaleString("default", { weekday: "short" }),
        appointments: found ? found.appointments : 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3️⃣ New Patients endpoint (last 6 months)
router.get("/new-patients", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Aggregate by month number (1-12)
    const patients = await User.aggregate([
      { $match: { role: "Patient", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          patients: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Fill last 6 months
    const result = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthNum = date.getMonth() + 1; // 1-12
      const monthName = date.toLocaleString("default", { month: "short" });
      const found = patients.find((p) => p._id === monthNum);
      result.push({ month: monthName, patients: found ? found.patients : 0 });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
