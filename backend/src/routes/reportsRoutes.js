const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/reportsController");

// Upload report (Patient only)
router.post(
  "/upload",
  requireAuth,
  requireRole("Patient"),
  controller.uploadMiddleware,
  controller.uploadReport
);

module.exports = router;
