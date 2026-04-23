// routes/patientRoutes.js
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatients,
  createPatient,
  linkPatient,
} = require("../controllers/patientController");

// Doctor: Only MY patients
router.get("/my-patients", requireAuth, requireRole("Doctor"), getMyPatients);

// Doctor: Link an existing patient
router.post("/link-patient", requireAuth, requireRole("Doctor"), linkPatient);

// Admin / Doctor: Create a new patient
router.post("/", requireAuth, requireRole("Admin", "Doctor"), createPatient);

router.get("/", requireAuth, requireRole("Admin"), getAllPatients);

// ID wise detail 
router.get("/:id", requireAuth, getPatientById);

// Update patient profile
router.put("/:id", requireAuth, updatePatient);

// Delete Patient (Admin deletes permanently, Doctor unlinks)
router.delete("/:id", requireAuth, requireRole("Admin", "Doctor"), deletePatient);

module.exports = router;
