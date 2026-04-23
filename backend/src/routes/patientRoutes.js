
const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatients,
  createPatient,
  linkPatient,
} = require("../controllers/patientController");


router.get("/my-patients", requireAuth, requireRole("Doctor"), getMyPatients);


router.post("/link-patient", requireAuth, requireRole("Doctor"), linkPatient);


router.post("/", requireAuth, requireRole("Doctor"), createPatient);


router.get("/", requireAuth, requireRole("Doctor"), getAllPatients);


router.get("/:id", requireAuth, getPatientById);


router.put("/:id", requireAuth, updatePatient);


router.delete("/:id", requireAuth, requireRole("Doctor"), deletePatient);

module.exports = router;
