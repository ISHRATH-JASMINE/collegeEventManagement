const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Register for event (student only)
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { eventId, name, email, phone, department, rollNumber, year } = req.body;

    // Check if event exists and is active
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found or inactive' });
    }

    // Check registration deadline
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      eventId,
      studentId: req.user._id,
      status: 'registered'
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    const currentRegistrations = await Registration.countDocuments({
      eventId,
      status: 'registered'
    });

    if (currentRegistrations >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Create registration
    const registration = new Registration({
      eventId,
      studentId: req.user._id,
      name,
      email,
      phone,
      department,
      rollNumber,
      year
    });

    await registration.save();
    await registration.populate('eventId', 'title date venue');

    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's registrations
router.get('/my-registrations', auth, authorize('student'), async (req, res) => {
  try {
    const registrations = await Registration.find({
      studentId: req.user._id,
      status: 'registered'
    }).populate('eventId', 'title description date venue category')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel registration
router.delete('/:registrationId', auth, authorize('student'), async (req, res) => {
  try {
    const registration = await Registration.findOne({
      _id: req.params.registrationId,
      studentId: req.user._id
    });

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get registrations for an event (coordinator only)
router.get('/event/:eventId', auth, authorize('coordinator'), async (req, res) => {
  try {
    // Verify the coordinator owns this event
    const event = await Event.findOne({
      _id: req.params.eventId,
      createdBy: req.user._id
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found or not authorized' });
    }

    const registrations = await Registration.find({
      eventId: req.params.eventId,
      status: 'registered'
    }).sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;