const Appointment = require('../models/Appointment');

// Create appointment 
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, datetime, reason } = req.body;
    if (!doctorId || !datetime)
      return res.status(400).json({ message: 'doctorId and datetime required' });

    const appt = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      datetime,
      reason,
    });

    await appt.save();
    return res.status(201).json(appt);
  } catch (err) {
    console.error("Error in createAppointment:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get appointments depending on role
exports.getAppointments = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'Patient') filter.patient = req.user.id;
    else if (req.user.role === 'Doctor') filter.doctor = req.user.id;

    const appts = await Appointment.find(filter)
      .sort({ datetime: 1 })
      .populate('patient', 'name email profile')
      .populate('doctor', 'name email profile');

    return res.json(appts);
  } catch (err) {
    console.error("Error in getAppointments:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get appointments for a specific patient 
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.id;
    if (req.user.role === 'Patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appts = await Appointment.find({ patient: patientId })
      .sort({ datetime: -1 })
      .populate('doctor', 'name email profile')
      .populate('patient', 'name email profile');

    return res.json(appts);
  } catch (err) {
    console.error("Error in getPatientAppointments:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cancel appointment 
exports.cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'Patient' && appt.patient.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });
    if (req.user.role === 'Doctor' && appt.doctor.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    appt.status = 'Cancelled';
    await appt.save();
    return res.json(appt);
  } catch (err) {
    console.error("Error in cancelAppointment:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update appointment 
exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'Doctor' && appt.doctor.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const { datetime, reason, notes, status } = req.body;
    if (datetime) appt.datetime = datetime;
    if (reason) appt.reason = reason;
    if (typeof notes !== 'undefined') appt.notes = notes;
    if (status && ['Booked','Cancelled','Completed'].includes(status)) appt.status = status;

    await appt.save();
    return res.json(appt);
  } catch (err) {
    console.error("Error in updateAppointment:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};
