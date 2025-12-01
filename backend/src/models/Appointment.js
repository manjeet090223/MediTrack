const mongoose = require('mongoose');

const Appointment = new mongoose.Schema({
patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
datetime: { type: Date, required: true },
status: { type: String, enum: ['Booked','Cancelled','Completed'], default: 'Booked' },
reason: { type: String },
notes: { type: String },
}, { timestamps: true });


module.exports = mongoose.model('Appointment', Appointment);