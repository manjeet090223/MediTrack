const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { getAllPatients } = require("../controllers/patientController");

// GET /api/patients - doctor-only route
router.get("/", requireAuth, requireRole("Doctor"), getAllPatients);

module.exports = router;
