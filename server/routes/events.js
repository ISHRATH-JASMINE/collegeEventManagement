const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get registration count
    const registrationCount = await Registration.countDocuments({
      eventId: event._id,
      status: 'registered'
    });

    res.json({ ...event.toObject(), registrationCount });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (coordinator only)
router.post('/', auth, authorize('coordinator'), async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      venue,
      category,
      maxParticipants,
      registrationDeadline
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      venue,
      category,
      maxParticipants,
      registrationDeadline,
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (coordinator only)
router.put('/:id', auth, authorize('coordinator'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (coordinator only)
router.delete('/:id', auth, authorize('coordinator'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Soft delete by setting isActive to false
    await Event.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events created by coordinator
router.get('/coordinator/my-events', auth, authorize('coordinator'), async (req, res) => {
  try {
    const events = await Event.find({ 
      createdBy: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Get registration counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          eventId: event._id,
          status: 'registered'
        });
        return { ...event.toObject(), registrationCount };
      })
    );

    res.json(eventsWithCounts);
  } catch (error) {
    console.error('Get coordinator events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;