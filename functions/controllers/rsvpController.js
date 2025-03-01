const rsvpModel = require("../models/rsvpModel");
const notificationModel = require("../models/notificationModel");
const inviteModel = require("../models/inviteModel");
const eventModel = require("../models/eventModel");

const submitRSVP = async (req, res) => {
  try {
    const { eventId, inviteId, dietaryRequirements } = req.body;
    const userId = req.user.user_id;
    const email = req.user.email;

    const rsvp = await rsvpModel.createRSVP(eventId, userId, {
      inviteId,
      dietaryRequirements,
    });

    // If RSVP is from an invite, update invite status
    if (inviteId) {
      await inviteModel.updateInviteStatus(inviteId, "accepted");
    }

    // Fetch event details from model
    const event = await eventModel.getEventById(eventId);

    if (event) {
      await notificationModel.createNotification({
        userId: event.creatorId,
        type: "rsvp_received",
        message: `User email ${email} has RSVP'd as a guest/particpant.`,
        relatedEventId: eventId,
      });
    }

    // Notify the RSVP user
    await notificationModel.createNotification({
      userId,
      type: "rsvp_confirmation",
      message: `You have successfully RSVP'd as guest/particpant for the event.`,
      relatedEventId: eventId,
    });

    res.status(201).json(rsvp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateRSVPStatus = async (req, res) => {
  try {
    const { rsvpId } = req.params; // Extract rsvpId from URL
    const { status } = req.body; // Extract status from the body
    const userId = req.user.user_id; // Get the authenticated user's ID

    // Fetch RSVP using the new model function
    const rsvpData = await rsvpModel.getRSVPById(rsvpId);
    const eventId = rsvpData.eventId; // Get eventId from RSVP

    //Ensure only the RSVP owner can update it
    const updatedRSVP = await rsvpModel.updateRSVP(rsvpId, userId, status);

    let message = "";
    if (status === "approved") {
      message = `Your RSVP has been approved. You are now confirmed as a guest/participant for the event.`;
    } else if (status === "rejected") {
      message = `Your RSVP for the event has been rejected.`;
    }

    // Notify the RSVP-ed user
    await notificationModel.createNotification({
      userId,
      type: "rsvp_confirmation",
      message: message,
      relatedEventId: eventId,
    });

    res.status(200).json(updatedRSVP);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get pending/approved/rejected RSVPs for an event
const getRSVPsByStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query; // Get status from query param
    const organizerId = req.user.user_id;

    // Validate event ownership using model
    const event = await eventModel.getEventById(eventId);
    if (!event || event.organizerId !== organizerId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view RSVPs for this event." });
    }
    // Validate status filter
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

// // controllers/rsvpController.js
// const createRSVP = async (req, res) => {
//     try {
//       const { eventId } = req.params;
//       const { status, dietaryRequirements, inviteId } = req.body;

//       // Public RSVP checks
//       if (!inviteId) {
//         const event = await eventModel.getEvent(eventId);
//         if (!event.publicRSVPEnabled) {
//           return res.status(403).json({ error: 'Public RSVP not allowed' });
//         }
//       }

//       const rsvpId = await rsvpModel.createRSVP(eventId, req.user.user_id, {
//         status,
//         dietaryRequirements,
//         inviteId
//       });

//       // Notify organizers
//       await notificationModel.createOrganizerNotification(
//         eventId,
//         `${req.user.email} RSVP'd as ${status}`
//       );

//       res.status(201).json({ id: rsvpId });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };

module.exports = { submitRSVP, updateRSVPStatus, getRSVPsByStatus };
