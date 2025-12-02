// controllers/patientController.js
const User = require("../models/userModel");

// Get all patients (Doctor only)
// Get all patients (Doctor only)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select(
      "_id name email age gender phone createdAt updatedAt"
    ); // <-- added age, gender, phone

    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get single patient details (Doctor/Admin)
exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select(
      "_id name email age gender phone createdAt updatedAt"
    );

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update patient details (Doctor/Admin)
exports.updatePatient = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      select: "_id name email age gender phone updatedAt",
    });

    if (!updated)
      return res.status(404).json({ message: "Patient not found" });

    res.json({ message: "Patient updated successfully", data: updated });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Patient (Admin Only)
exports.deletePatient = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);

    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    await patient.deleteOne();

    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

