const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/reportsController");
const mongoose = require("mongoose");
const Report = require("../models/Report"); // ✅ Import the Report model

// Upload report (Patient only)
router.post(
  "/upload",
  requireAuth,
  requireRole("Patient"),
  controller.uploadMiddleware,
  controller.uploadReport
);

// GET reports for a specific patient by ID
router.get("/patient/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    const reports = await Report.find({ patient: id });
    res.json({ reports }); // ✅ wrap in object to match frontend expectation
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Optional: GET reports for logged-in patient (no ID needed)
router.get("/my-reports", requireAuth, async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id });
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
