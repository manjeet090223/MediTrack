const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// Get all doctors
router.get("/", requireAuth, requireRole("Admin", "Patient"), async (req, res) => {
  try {
    const role = req.query.role;
    let filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select("_id name email role");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
