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

// Doctor + Admin allowed, Patient not allowed to edit doctor's notes or status
router.put(
  "/:id",
  requireAuth,
  requireRole("Doctor", "Admin"),
  controller.updateAppointment
);

module.exports = router;
