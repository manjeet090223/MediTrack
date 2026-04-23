const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

// Get all doctors
router.get("/", requireAuth, requireRole("Patient", "Doctor"), async (req, res) => {
  try {
    const role = req.query.role;
    
    if (role === "Doctor") {
      const doctors = await User.aggregate([
        { $match: { role: "Doctor" } },
        {
          $lookup: {
            from: "doctors", // collection name in MongoDB
            localField: "_id",
            foreignField: "user",
            as: "profile"
          }
        },
        {
          $unwind: {
            path: "$profile",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            specialization: "$profile.specialization",
            experience: "$profile.experience"
          }
        }
      ]);
      return res.json(doctors);
    }

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
