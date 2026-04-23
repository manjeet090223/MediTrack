const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appointment");


async function attachVisitStats(patients) {
  if (!patients.length) return patients;
  const ids = patients.map((p) => p._id || p);


  const stats = await Appointment.aggregate([
    { $match: { patient: { $in: ids } } },
    {
      $group: {
        _id: "$patient",
        totalVisits: { $sum: 1 },
        lastVisit: { $max: "$datetime" },
      },
    },
  ]);

  const statsMap = new Map();
  stats.forEach((s) => statsMap.set(s._id.toString(), s));

  return patients.map((p) => {
    const obj = p.toObject ? p.toObject() : { ...p };
    const s = statsMap.get(obj._id.toString());
    obj.totalVisits = s ? s.totalVisits : 0;
    obj.lastVisit = s ? s.lastVisit : null;
    return obj;
  });
}


exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select(
      "_id name email age gender phone"
    );
    const enriched = await attachVisitStats(patients);
    res.json(enriched);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;


    const doctor = await User.findById(doctorId).populate(
      "linkedPatients",
      "_id name email age gender phone"
    );

    const linkedMap = new Map();
    if (doctor?.linkedPatients?.length) {
      doctor.linkedPatients.forEach((p) => {
        if (p) linkedMap.set(p._id.toString(), p);
      });
    }


    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient", "_id name email age gender phone");

    appointments.forEach((a) => {
      if (a.patient && !linkedMap.has(a.patient._id.toString())) {
        linkedMap.set(a.patient._id.toString(), a.patient);
      }
    });

    res.json(await attachVisitStats([...linkedMap.values()]));
  } catch (err) {
    console.error("Error fetching my patients:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select(
      "_id name email age gender phone address"
    );
    if (!patient)
      return res.status(404).json({ message: "Patient not found" });

    res.json(patient);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.updatePatient = async (req, res) => {
  try {
    const { name, email, phone, age, gender, address } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, age, gender, address },
      {
        new: true,
        select: "_id name email age gender phone address",
      }
    );
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json(updated);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;


    await User.findByIdAndUpdate(req.user.id, {
      $pull: { linkedPatients: patientId },
    });
    return res.json({ message: "Patient removed from your directory" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.createPatient = async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const exists = await User.findOne({ email });
    if (exists) {

      if (exists.role === "Patient" && req.user.role === "Doctor") {
        await User.findByIdAndUpdate(req.user.id, {
          $addToSet: { linkedPatients: exists._id },
        });
        const safe = {
          _id: exists._id,
          name: exists.name,
          email: exists.email,
          age: exists.age,
          gender: exists.gender,
          phone: exists.phone,
        };
        return res.status(200).json({ message: "Patient linked to your list successfully", data: safe });
      }
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const patient = await User.create({
      name,
      email,
      password: hashed,
      role: "Patient",
      age: age || null,
      gender: gender || null,
      phone: phone || null,
      createdBy: req.user.id,
    });


    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { linkedPatients: patient._id },
    });

    const safe = {
      _id: patient._id,
      name: patient.name,
      email: patient.email,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
    };
    res.status(201).json({ message: "Patient created successfully", data: safe });
  } catch (err) {
    console.error("Create Patient Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.linkPatient = async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ message: "patientId is required." });

    const patient = await User.findOne({ _id: patientId, role: "Patient" }).select(
      "_id name email age gender phone"
    );
    if (!patient) return res.status(404).json({ message: "Patient not found." });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { linkedPatients: patient._id },
    });

    res.json({ message: "Patient linked successfully", data: patient });
  } catch (err) {
    console.error("Link Patient Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
