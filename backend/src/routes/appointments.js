const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/appointmentsController");

 
router.post(
  "/",
  requireAuth,
  requireRole("Patient", "Doctor"),
  controller.createAppointment
);


router.get(
  "/",
  requireAuth,
  requireRole("Patient", "Doctor"),
  controller.getAppointments
);


router.put(
  "/:id/cancel",
  requireAuth,
  requireRole("Patient", "Doctor"),
  controller.cancelAppointment
);


router.get(
  "/patient/:id",
  requireAuth,
  requireRole("Patient", "Doctor"), 
  controller.getPatientAppointments
);


router.put(
  "/:id",
  requireAuth,
  requireRole("Patient", "Doctor"),
  controller.updateAppointment
);


router.delete(
  "/:id",
  requireAuth,
  requireRole("Doctor"),
  controller.deleteAppointment
);

module.exports = router;
