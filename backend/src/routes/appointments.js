const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/appointmentsController");

// Create appointment (Patient + Admin)
router.post(
  "/",
  requireAuth,
  requireRole("Patient", "Admin"),
  controller.createAppointment
);

// Get all appointments (Patient sees only their own, Doctor/Admin sees all)
router.get(
  "/",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"),
  controller.getAppointments
);

// Cancel appointment (Owner + Admin)
router.put(
  "/:id/cancel",
  requireAuth,
  requireRole("Patient", "Admin"),
  controller.cancelAppointment
);

// Get appointments by Patient ID
router.get(
  "/patient/:id",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"), // Patient bhi allowed
  controller.getPatientAppointments
);

// Update appointment (Doctor + Admin)
router.put(
  "/:id",
  requireAuth,
  requireRole("Doctor", "Admin"),
  controller.updateAppointment
);

module.exports = router;
