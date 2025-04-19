const rsvpModel = require("../models/rsvpModel");
const notificationModel = require("../models/notificationModel");
const inviteModel = require("../models/inviteModel");
const eventModel = require("../models/eventModel");

const submitRSVP = async (req, res) => {
  try {
    const { eventId, organizers } = req.body;
    const userId = req.user.user_id;
    const email = req.user.email;

    const rsvp = await rsvpModel.createRSVP(eventId, userId, {
      organizers,
    });

    // Fetch event details
    const event = await eventModel.getEventById(eventId);
    if (event) {
      await notificationModel.createNotification({
        userId: event.creatorId,
        type: "rsvp_received",
        message: `User email ${email} has RSVP'd as a guest/participant.`,
        relatedEventId: eventId,
      });
    }

    // Notify the RSVP user
    await notificationModel.createNotification({
      userId,
      type: "rsvp_confirmation",
      // eslint-disable-next-line max-len
      message: `You have successfully RSVP'd as a guest/participant for the event.`,
      relatedEventId: eventId,
    });

    res.status(201).json(rsvp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const checkRSVP = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.user_id;

    const rsvp = await rsvpModel.findRSVP(eventId, userId);

    if (!rsvp) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({
      exists: true,
      rsvpId: rsvp.id,
      status: rsvp.status,
      lastCancelledAt: rsvp.lastCancelledAt || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRSVPStatus = async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const { status } = req.body;
    const userId = req.user.user_id;

    // Fetch RSVP details
    const rsvpData = await rsvpModel.getRSVPById(rsvpId);
    if (!rsvpData) {
      return res.status(404).json({ error: "RSVP not found." });
    }

    // Ensure only the RSVP owner can update it
    const updatedRSVP = await rsvpModel.updateRSVP(rsvpId, userId, status);

    // Generate notification message dynamically
    const statusMessages = new Map([
      [
        "approved",
        "Your RSVP has been approved. You are now confirmed as a guest/participant for the event.",
      ],
      ["rejected", "Your RSVP for the event has been rejected."],
      ["cancelled", "Your RSVP for the event has been cancelled."],
    ]);

    // Validate and get message
    const message =
      statusMessages.get(status) || "Your RSVP status has been updated.";

    // Notify the RSVP user
    await notificationModel.createNotification({
      userId,
      type: "rsvp_confirmation",
      message,
      relatedEventId: rsvpData.eventId,
    });

    res.status(200).json(updatedRSVP);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get RSVPs by status for an event (Organizer Only)
const getRSVPsByStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;
    const organizerId = req.user.user_id;

    // Validate event ownership
    const event = await eventModel.getEventById(eventId);
    if (!event || event.creatorId !== organizerId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view RSVPs for this event." });
    }

    // Validate RSVP status filter
    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid RSVP status provided." });
    }

    const rsvps = await rsvpModel.getRSVPsByStatus(eventId, status);
    res.status(200).json({ rsvps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all RSVPs for the logged-in user
const getRSVPsByUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log(`User ID from request: ${userId}`);
    const rsvps = await rsvpModel.getUserRSVPs(userId);
    console.log(`Retrieved RSVPs:`, rsvps); // Log the fetched RSVPs

    res.status(200).json({ rsvps });
  } catch (error) {
    console.error("Error retrieving RSVPs:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitRSVP,
  updateRSVPStatus,
  getRSVPsByStatus,
  checkRSVP,
  getRSVPsByUser,
};
