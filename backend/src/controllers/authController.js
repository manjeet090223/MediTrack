const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_EXPIRY = "7d"; 

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password." });
    }


    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }


    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }


    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists with this email." });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashed, role });

    const userSafe = { id: user._id, name: user.name, email: user.email, role: user.role };

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

    return res.status(201).json({ message: "Signup successful", user: userSafe, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Provide email and password." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const userSafe = { id: user._id, name: user.name, email: user.email, role: user.role };

    return res.json({ message: "Login successful", token, user: userSafe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  login,signup
}