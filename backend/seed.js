const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/userModel"); 
const Appointment = require("./src/models/Appointment"); 
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));


// Dummy Users
const users = [
  { name: "Dr. Aarti Sharma", email: "aarti@example.com", password: bcrypt.hashSync("password123", 10), role: "Doctor" },
  { name: "Dr. Rajiv Kumar", email: "rajiv@example.com", password: bcrypt.hashSync("password123", 10), role: "Doctor" },
  { name: "Manjeet Singh", email: "manjeet@example.com", password: bcrypt.hashSync("password123", 10), role: "Patient" },
  { name: "Rohit Mehra", email: "rohit@example.com", password: bcrypt.hashSync("password123", 10), role: "Patient" },
  { name: "Admin User", email: "admin@example.com", password: bcrypt.hashSync("admin123", 10), role: "Admin" },
];

// Dummy Appointments (will assign doctor & patient after creating users)
const appointments = [
  { datetime: new Date(Date.now() + 86400000), reason: "Regular checkup", status: "Booked" }, // Tomorrow
  { datetime: new Date(Date.now() + 2 * 86400000), reason: "Headache and dizziness", status: "Booked" },
  { datetime: new Date(Date.now() + 3 * 86400000), reason: "Fever and cold", status: "Booked" },
  { datetime: new Date(Date.now() + 4 * 86400000), reason: "Back pain", status: "Booked" },
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Appointment.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const doctors = createdUsers.filter(u => u.role === "Doctor");
    const patients = createdUsers.filter(u => u.role === "Patient");

    // Assign doctor & patient to appointments
    appointments.forEach((appt, idx) => {
      appt.doctor = doctors[idx % doctors.length]._id;
      appt.patient = patients[idx % patients.length]._id;
    });

    // Insert appointments
    await Appointment.insertMany(appointments);

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
