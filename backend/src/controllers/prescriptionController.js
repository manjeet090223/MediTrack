const Prescription = require("../models/Prescription");

// Doctor: Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, diagnosis, notes, medicines } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ message: "Patient and diagnosis are required." });
    }

    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "At least one medicine is required." });
    }

    // Validate each medicine has required fields
    for (const med of medicines) {
      if (!med.name || !med.dosage || !med.duration) {
        return res.status(400).json({
          message: "Each medicine must have name, dosage, and duration.",
        });
      }
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.id,
      diagnosis,
      notes: notes || "",
      medicines,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    return res.status(201).json({
      message: "Prescription created successfully",
      data: populated,
    });
  } catch (err) {
    console.error("Create Prescription Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Doctor: Get all prescriptions for a specific patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .populate("doctorId", "name email")
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    return res.json(prescriptions);
  } catch (err) {
    console.error("Get Patient Prescriptions Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Patient: Get my prescriptions
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user.id })
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });

    return res.json(prescriptions);
  } catch (err) {
    console.error("Get My Prescriptions Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Doctor: Update a prescription
exports.updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Only the doctor who created it can update
    if (prescription.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own prescriptions." });
    }

    const { diagnosis, notes, medicines } = req.body;

    if (medicines) {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({ message: "At least one medicine is required." });
      }
      for (const med of medicines) {
        if (!med.name || !med.dosage || !med.duration) {
          return res.status(400).json({
            message: "Each medicine must have name, dosage, and duration.",
          });
        }
      }
      prescription.medicines = medicines;
    }

    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (notes !== undefined) prescription.notes = notes;

    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    return res.json({ message: "Prescription updated successfully", data: populated });
  } catch (err) {
    console.error("Update Prescription Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Doctor: Toggle prescription status (active/completed)
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (prescription.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only modify your own prescriptions." });
    }

    const { status } = req.body;
    if (!status || !["active", "completed"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'active' or 'completed'." });
    }

    prescription.status = status;
    await prescription.save();

    const populated = await Prescription.findById(prescription._id)
      .populate("doctorId", "name email")
      .populate("patientId", "name email");

    return res.json({ message: "Prescription status updated", data: populated });
  } catch (err) {
    console.error("Update Prescription Status Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
