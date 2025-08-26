const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  }
}, {
  timestamps: true
});

// Prevent duplicate registrations
registrationSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);