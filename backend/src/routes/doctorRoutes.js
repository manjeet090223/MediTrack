const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { getDoctorProfile, updateDoctorProfile } = require("../controllers/doctorController");


router.get("/:id", requireAuth, requireRole("Doctor", "Admin"), getDoctorProfile);
router.put("/:id", requireAuth, requireRole("Doctor", "Admin"), updateDoctorProfile);

module.exports = router;
