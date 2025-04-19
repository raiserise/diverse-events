const eventModel = require("../models/eventModel");
const rsvpModel = require("../models/rsvpModel");

const createEvent = async (req, res) => {
  try {
    const data = req.body;
    data.creatorId = req.user.user_id; // Assuming authenticated user
    const event = await eventModel.createEvent(data);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserEvents = async (req, res) => {
  try {
    const events = await eventModel.getEventsByUser(req.user.user_id);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const userId = req.user?.user_id; // Get the authenticated user ID

    // Pass userId to filter events
    const events = await eventModel.getAllEvents(userId);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const updates = req.body;

    // Verify user is organizer
    const event = await eventModel.getEventById(eventId);
    if (!event.organizers.includes(req.user.user_id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updatedEvent = await eventModel.updateEvent(eventId, updates);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await eventModel.getEventById(eventId);

    // Check if the user is the creator or an organizer of the event
    if (event.creatorId !== req.user.user_id) {
      return res.status(403).json({ error: "Only creator can delete" });
    }

    // Call the deleteEvent function from the eventModel
    await eventModel.deleteEvent(eventId);

    // Return a success message after deleting
    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventDetails = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await eventModel.getEventById(eventId);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventStats = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Verify the user is authorized to view stats
    const event = await eventModel.getEventById(eventId);
    if (!event.organizers.includes(req.user.user_id)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Fetch RSVPs using their respective models
    // Fetch RSVPs using their respective models
    const rsvps = await rsvpModel.getRSVPsByEvent(eventId);

    // Calculate stats
    const stats = {
      totalRSVPs: rsvps.length,
      attendees: rsvpModel.countRSVPsByStatus(rsvps, "approved"),
      declined: rsvpModel.countRSVPsByStatus(rsvps, "declined"),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /events/batch
const getEventsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // expect: { ids: ["event1", "event2"] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids must be a non-empty array" });
    }

    const events = await eventModel.getEventsByIds(ids); // Add this in model
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEvent,
  getUserEvents,
  updateEvent,
  deleteEvent,
  getEventDetails,
  getEventStats,
  getAllEvents,
  getEventsByIds,
};
