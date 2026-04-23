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


router.get("/me", requireAuth, requireRole("Patient"), getMyPrescriptions);

router.post("/", requireAuth, requireRole("Doctor"), createPrescription);


router.get(
  "/patient/:patientId",
  requireAuth,
  requireRole("Doctor"),
  getPatientPrescriptions
);


router.put("/:id", requireAuth, requireRole("Doctor"), updatePrescription);


router.patch(
  "/:id/status",
  requireAuth,
  requireRole("Doctor", "Patient"),
  updatePrescriptionStatus
);

module.exports = router;
