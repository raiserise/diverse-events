const rsvpModel = require("../models/rsvpModel");
const notificationModel = require("../models/notificationModel");
const eventModel = require("../models/eventModel");

const submitRSVP = async (req, res) => {
  try {
    const { eventId, organizers } = req.body;
    const userId = req.user.user_id;
    const email = req.user.email;

    // Create or update RSVP using the model
    const rsvp = await rsvpModel.createRSVP(eventId, userId, {
      organizers,
    });

    // Load full RSVP instance (including state class)
    const rsvpInstance = await rsvpModel.load(rsvp.id);

    // Call onEnter or another state-driven action
    if (rsvpInstance.state.onEnter) {
      await rsvpInstance.state.onEnter(); // optional hook
    }

    res.status(201).json(rsvpInstance);
  } catch (error) {
    console.error("RSVP creation error:", error);
    return res.status(400).json({ error: error.message });
  }
};

const checkRSVP = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.user_id;

    // Find RSVP using the model
    const rsvp = await rsvpModel.findRSVP(eventId, userId);

    if (!rsvp) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({
      exists: true,
      rsvpId: rsvp.id,
      status: rsvp.status,
      lastCancelledAt: rsvp.data.lastCancelledAt ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRSVPStatus = async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const { status } = req.body;

    // Fetch RSVP details
    const rsvpData = await rsvpModel.getRSVPById(rsvpId);
    if (!rsvpData) {
      return res.status(404).json({ error: "RSVP not found." });
    }

    // Load RSVP instance and delegate to state class
    const rsvpInstance = await rsvpModel.load(rsvpId);

    switch (status) {
      case "approved":
        await rsvpInstance.approve();
        break;
      case "rejected":
        await rsvpInstance.reject();
        break;
      case "cancelled":
        await rsvpInstance.cancel();
        break;
      default:
        throw new Error("Invalid status transition.");
    }

    // Notification logic handled in state classes
    res.status(200).json({ message: `RSVP ${status} successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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
    const validStatuses = ["pending", "approved", "rejected", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid RSVP status provided." });
    }

    // Get RSVPs by status using the model
    const rsvps = await rsvpModel.getRSVPsByStatus(eventId, status);
    res.status(200).json({ rsvps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRSVPsByUser = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch RSVPs for the logged-in user
    const rsvps = await rsvpModel.getUserRSVPs(userId);

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
