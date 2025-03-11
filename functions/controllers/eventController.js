const eventModel = require("../models/eventModel");
const inviteModel = require("../models/inviteModel");
const rsvpModel = require("../models/rsvpModel");

const createEvent = async (req, res) => {
  try {
    const data = req.body;
    data.creatorId = req.user.user_id; // Assuming authenticated user
    const event = await eventModel.createEvent(data);

    // Create invites if specified
    if (data.invites && data.invites.length > 0) {
      await inviteModel.createInvite(event.id, data.invites);
    }

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
    const events = await eventModel.getAllEvents(userId); // Pass userId to filter events
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

const getEventDetails = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await eventModel.getEventById(eventId);

    if (event.privacy === "private") {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      // Check organizer access
      if (!event.organizers.includes(req.user.user_id)) {
        return res.status(403).json({ error: "Not authorized" });
      }
    }

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

    // Fetch invites and RSVPs using their respective models
    const invites = await inviteModel.getInvitesByEvent(eventId);
    const rsvps = await rsvpModel.getRSVPsByEvent(eventId);

    // Calculate stats
    const stats = {
      totalInvites: invites.length,
      totalRSVPs: rsvps.length,
      attendees: rsvpModel.countRSVPsByStatus(rsvps, "approved"),
      declined: rsvpModel.countRSVPsByStatus(rsvps, "declined"),
    };

    res.status(200).json(stats);
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
  getEventDetails,
  getEventStats,
  getAllEvents,
};
