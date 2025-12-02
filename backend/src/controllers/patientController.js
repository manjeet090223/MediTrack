// controllers/patientController.js
const User = require("../models/userModel");

// Get all patients (Doctor only)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select(
      "_id name email createdAt updatedAt"
    );
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};
