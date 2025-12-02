const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

// Doctor Only
router.get("/", requireAuth, requireRole("Doctor"), getAllPatients);

// Doctor + Admin
router.get("/:id", requireAuth, requireRole("Doctor", "Admin"), getPatientById);
router.put("/:id", requireAuth, requireRole("Doctor", "Admin"), updatePatient);

// Admin Only
router.delete("/:id", requireAuth, requireRole("Admin"), deletePatient);

module.exports = router;
