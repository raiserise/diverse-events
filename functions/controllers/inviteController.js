const inviteModel = require("../models/inviteModel");
const notificationModel = require("../models/notificationModel");

const sendInvite = async (req, res) => {
  try {
    const { eventId, recipientId, role } = req.body;

    // Create invite
    const invite = await inviteModel.createInvite(
      eventId,
      req.user.user_id,
      recipientId,
      role
    );

    // Create notification
    await notificationModel.createNotification({
      userId: recipientId,
      type: "event_invite",
      message: `You've been invited to an event as ${role}`,
      relatedEventId: eventId,
    });

    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyInvites = async (req, res) => {
  try {
    const invites = await inviteModel.getInvitesForUser(req.user.user_id);
    res.status(200).json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendInvite, getMyInvites };
