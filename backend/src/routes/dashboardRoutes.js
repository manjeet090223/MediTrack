const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");


router.get("/summary", requireAuth, requireRole("Doctor", "Admin"), async (req, res) => {
  try {
    const role = req.user.role?.toLowerCase();
    const isDoctor = role === "doctor";
    const isAdmin = role === "admin";

    // If doctor, filter by ID. If admin, see all. Otherwise, see nothing.
    const doctorFilter = isDoctor 
      ? { doctor: new mongoose.Types.ObjectId(req.user.id) } 
      : (isAdmin ? {} : { _id: null }); 

    let totalPatients = 0;
    if (isDoctor) {
      const uniquePatients = await Appointment.distinct("patient", doctorFilter);
      totalPatients = uniquePatients.length;
    } else if (isAdmin) {
      totalPatients = await User.countDocuments({ role: "Patient" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentsToday = await Appointment.countDocuments({
      ...doctorFilter,
      datetime: { $gte: startOfDay, $lte: endOfDay },
    });

    const appointmentsCompleted = await Appointment.countDocuments({
      ...doctorFilter,
      datetime: { $gte: startOfDay, $lte: endOfDay },
      status: "Completed",
    });

    res.json({ totalPatients, appointmentsToday, pendingRequests, appointmentsCompleted });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/appointments-trend", requireAuth, requireRole("Doctor", "Admin"), async (req, res) => {
  try {
    const { range } = req.query; // '7d' or '30d'
    const daysToFetch = range === "30d" ? 30 : 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysToFetch - 1));
    startDate.setHours(0, 0, 0, 0);

    const role = req.user.role?.toLowerCase();
    const matchStage = { datetime: { $gte: startDate } };
    
    if (role === "doctor") {
      matchStage.doctor = new mongoose.Types.ObjectId(req.user.id);
    } else if (role !== "admin") {
      matchStage._id = null;
    }

    const trend = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$datetime" } },
          appointments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const result = [];
    for (let i = 0; i < daysToFetch; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (daysToFetch - 1 - i));
      const dateStr = date.toISOString().split("T")[0];
      const found = trend.find((t) => t._id === dateStr);

      result.push({
        day: date.toLocaleString("default", { weekday: "short" }),
        date: dateStr,
        appointments: found ? found.appointments : 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Appointments Trend Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/new-patients", requireAuth, requireRole("Doctor", "Admin"), async (req, res) => {
  try {
    const { range } = req.query; // '6m' or '1y'
    const monthsToFetch = range === "1y" ? 12 : 6;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsToFetch - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const role = req.user.role?.toLowerCase();
    let patients = [];
    
    if (role === "doctor") {
      patients = await Appointment.aggregate([
        { $match: { doctor: new mongoose.Types.ObjectId(req.user.id) } },
        { $sort: { datetime: 1 } },
        {
          $group: {
            _id: "$patient",
            firstVisit: { $first: "$datetime" },
          },
        },
        { $match: { firstVisit: { $gte: startDate } } },
        {
          $group: {
            _id: { $month: "$firstVisit" },
            year: { $year: "$firstVisit" },
            patients: { $sum: 1 },
          },
        },
        { $sort: { year: 1, _id: 1 } },
      ]);
    } else if (role === "admin") {
      patients = await User.aggregate([
        { $match: { role: "Patient", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            patients: { $sum: 1 },
          },
        },
        { $sort: { year: 1, _id: 1 } },
      ]);
    }

    const result = [];
    for (let i = 0; i < monthsToFetch; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (monthsToFetch - 1 - i));
      const monthNum = date.getMonth() + 1;
      const yearNum = date.getFullYear();
      const monthName = date.toLocaleString("default", { month: "short" });
      const found = patients.find((p) => p._id === monthNum && p.year === yearNum);

      result.push({
        month: monthName,
        patients: found ? found.patients : 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("New Patients Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/today-schedule", requireAuth, requireRole("Doctor", "Admin"), async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const role = req.user.role?.toLowerCase();
    const isDoctor = role === "doctor";
    const isAdmin = role === "admin";

    const doctorFilter = isDoctor 
      ? { doctor: new mongoose.Types.ObjectId(req.user.id) } 
      : (isAdmin ? {} : { _id: null });

    const appointments = await Appointment.find({
      ...doctorFilter,
      datetime: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("patient", "name")
      .sort({ datetime: 1 });

    const formattedSchedule = appointments.map((appt) => {
      // Format time as HH:MM AM/PM
      const timeStr = new Date(appt.datetime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: appt._id,
        patientId: appt.patient ? appt.patient._id : null,
        patientName: appt.patient ? appt.patient.name : "Unknown Patient",
        time: timeStr,
        status: appt.status === "Booked" ? "Scheduled" : appt.status,
        type: appt.reason || "General Consultation",
      };
    });

    res.json(formattedSchedule);
  } catch (error) {
    console.error("Today Schedule Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get(
  "/patient-summary/:userId",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"), 
  async (req, res) => {
    const { userId } = req.params;

    
    if (req.user.role === "Patient" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      const now = new Date();

      const totalAppointments = await Appointment.countDocuments({
        patient: objectId,
        status: { $in: ["Booked", "Completed"] },
      });

      const upcomingAppointments = await Appointment.countDocuments({
        patient: objectId,
        status: "Booked",
        datetime: { $gte: now },
      });

      const completedAppointments = await Appointment.countDocuments({
        patient: objectId,
        $or: [
          { status: "Completed" },
          { status: "Booked", datetime: { $lt: now } },
        ],
      });

      res.json({ totalAppointments, upcomingAppointments, completedAppointments });
    } catch (error) {
      console.error("Patient Summary Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
module.exports = router;
