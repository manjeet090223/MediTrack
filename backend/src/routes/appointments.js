const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/appointmentsController");

// Create appointment 
router.post(
  "/",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"),
  controller.createAppointment
);

// Get all appointments 
router.get(
  "/",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"),
  controller.getAppointments
);

// Cancel appointment
router.put(
  "/:id/cancel",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"),
  controller.cancelAppointment
);

// Get appointments by Patient ID
router.get(
  "/patient/:id",
  requireAuth,
  requireRole("Patient", "Doctor", "Admin"), 
  controller.getPatientAppointments
);

// Update appointment 
router.put(
  "/:id",
  requireAuth,
  requireRole("Doctor", "Admin"),
  controller.updateAppointment
);

// Delete appointment
router.delete(
  "/:id",
  requireAuth,
  requireRole("Doctor", "Admin"),
  controller.deleteAppointment
);

module.exports = router;
