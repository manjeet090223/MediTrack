const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");

// Get doctor profile 
exports.getDoctorProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("_id name email phone role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const doctor = await Doctor.findOne({ user: userId }).select(
      "specialization department experience gender profileComplete"
    );

    res.json({
      ...user.toObject(),
      ...(doctor ? doctor.toObject() : {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update doctor profile 
exports.updateDoctorProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, specialization, department, experience, gender } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true, select: "_id name email phone role" }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    
    let updatedDoctor = await Doctor.findOneAndUpdate(
      { user: userId },
      {
        specialization: specialization || "",
        department: department || "",
        experience: experience || 0,
        gender: gender || "Other",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, select: "specialization department experience gender profileComplete user" }
    );

    res.json({
      message: "Profile updated successfully",
      data: { ...updatedUser.toObject(), ...(updatedDoctor ? updatedDoctor.toObject() : {}) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
