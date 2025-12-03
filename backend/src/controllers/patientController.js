// controllers/patientController.js
const User = require("../models/userModel");
const Appointment = require("../models/Appointment");

// Get ALL Patients (Admin Only)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select(
      "_id name email age gender phone"
    ); 
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Doctor-specific patients
exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "_id name email age gender phone");

    const uniquePatients = [
      ...new Map(
        appointments
          .filter(a => a.patient)
          .map(a => [a.patient._id.toString(), a.patient])
      ).values()
    ];

    res.json(uniquePatients);
  } catch (err) {
    console.error("Error fetching my patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Single patient
exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select(
      "_id name email age gender phone"
    );
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      select: "_id name email age gender phone",
    });
    res.json({ message: "Patient updated successfully", data: updated });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete patient (Admin)
exports.deletePatient = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
