const mongoose = require("mongoose");

const User = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Patient", "Doctor", "Admin"], default: "Patient" },
}, { timestamps: true });

module.exports = mongoose.model("User", User);
