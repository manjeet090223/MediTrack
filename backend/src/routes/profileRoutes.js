const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { requireAuth } = require("../middleware/authMiddleware");

router.put("/complete-profile", requireAuth, async (req, res) => {
  try {
    const { age, gender, phone } = req.body;

    if (!age || !gender || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        age,
        gender,
        phone,
        profileComplete: true
      },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile completed successfully", user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
