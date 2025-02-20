const eventModel = require("../models/eventModel");

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

const searchEvents = async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      category: req.query.category,
      startDate: req.query.start,
      endDate: req.query.end,
      privacy: req.query.privacy,
      includePrivate: req.query.includePrivate === "true",
    };

    const results = await eventModel.searchEvents(filters);

    res.status(200).json({
      count: results.length,
      results,
    });
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

module.exports = {
  createEvent,
  getUserEvents,
  searchEvents,
  updateEvent,
  deleteEvent,
};
