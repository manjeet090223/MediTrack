const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

// Doctor Only
router.get("/", requireAuth, requireRole("Doctor"), getAllPatients);

// Patient, Doctor, Admin can get patient by ID
router.get("/:id", requireAuth, async (req, res) => {
  const user = req.user; // logged-in user
  const { id } = req.params;

  if (user.role === "Patient" && user.id !== id) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Patient can see own profile, Doctor/Admin can see any
  await getPatientById(req, res);
});

// Patient can update their own profile, Doctor/Admin can update any
router.put("/:id", requireAuth, async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (user.role === "Patient" && user.id !== id) {
    return res.status(403).json({ message: "Access denied" });
  }

  await updatePatient(req, res);
});

// Admin Only
router.delete("/:id", requireAuth, requireRole("Admin"), deletePatient);

module.exports = router;
