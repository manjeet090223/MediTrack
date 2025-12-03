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
} = require("../controllers/patientController");

// Doctor: Only MY patients
router.get("/my-patients", requireAuth, requireRole("Doctor"), getMyPatients);

// Admin: All patients
router.get("/", requireAuth, requireRole("Admin"), getAllPatients);

// ID wise detail (allowed: Doctor/Admin/Own profile)
router.get("/:id", requireAuth, getPatientById);

// Update patient profile
router.put("/:id", requireAuth, updatePatient);

// Delete Patient (Admin)
router.delete("/:id", requireAuth, requireRole("Admin"), deletePatient);

module.exports = router;
