const mongoose = require("mongoose");

const User = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Patient", "Doctor", "Admin"], default: "Patient" },

  // New fields
  age: { type: Number, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
  phone: { type: String, default: null },

  // Profile completion flag
  profileComplete: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("User", User);
