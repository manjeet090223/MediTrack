const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  createPrescription,
  getPatientPrescriptions,
  getMyPrescriptions,
  updatePrescription,
  updatePrescriptionStatus,
} = require("../controllers/prescriptionController");

// Patient: Get my prescriptions (must be above /:id routes)
router.get("/me", requireAuth, requireRole("Patient"), getMyPrescriptions);

// Doctor: Create prescription
router.post("/", requireAuth, requireRole("Doctor"), createPrescription);

// Doctor: Get prescriptions for a patient
router.get(
  "/patient/:patientId",
  requireAuth,
  requireRole("Doctor"),
  getPatientPrescriptions
);

// Doctor: Update prescription
router.put("/:id", requireAuth, requireRole("Doctor"), updatePrescription);

// Doctor / Patient: Toggle prescription status
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("Doctor", "Patient"),
  updatePrescriptionStatus
);

module.exports = router;
