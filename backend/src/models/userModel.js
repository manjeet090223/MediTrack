const mongoose = require("mongoose");

const User = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Patient", "Doctor"], default: "Patient" },
  age: { type: Number, default: null },
  gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  profileComplete: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  linkedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

module.exports = mongoose.model("User", User);
