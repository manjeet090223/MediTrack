const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { getDoctorProfile, updateDoctorProfile } = require("../controllers/doctorController");


router.get("/:id", requireAuth, requireRole("Doctor"), getDoctorProfile);
router.put("/:id", requireAuth, requireRole("Doctor"), updateDoctorProfile);

module.exports = router;
