const mongoose = require("mongoose");

const Doctor = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 

    specialization: { type: String, default: "" },
    experience: { type: Number, default: 0 }, 
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    department: { type: String, default: "" },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", Doctor);
