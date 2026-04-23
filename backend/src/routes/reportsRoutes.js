const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const controller = require("../controllers/reportsController");
const mongoose = require("mongoose");
const Report = require("../models/Report"); 

// Upload report
router.post(
  "/upload",
  requireAuth,
  requireRole("Patient"),
  controller.uploadMiddleware,
  controller.uploadReport
);

// GET reports for a specific patient by ID (Doctor / Admin)
router.get("/patient/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    const reports = await Report.find({ patient: id }).sort({ uploadedAt: -1 });
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/my-reports", requireAuth, async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user.id });
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete report
router.delete("/:id", requireAuth, controller.deleteReport);

module.exports = router;
