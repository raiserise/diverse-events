const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/inviteController");
const authMiddleware = require("../middleware/auth");

// router.get(
//   "/events/:eventId/invites",
//   authMiddleware,
//   inviteController.getEventInvites
// );

// routes/inviteRoutes.js
router.post("/invites", authMiddleware.auth, inviteController.sendInvite);
router.get("/invites/me", authMiddleware.auth, inviteController.getMyInvites);

// RSVP routes
// router.post(
//   "/events/:eventId/rsvp",
//   authMiddleware.auth,
//   rsvpController.createRSVP
// );
// router.put("/rsvps/:rsvpId", authMiddleware.auth, rsvpController.updateRSVP);

// // Notification routes
// router.get(
//   "/notifications",
//   authMiddleware.auth,
//   notificationController.getNotifications
// );
// router.put(
//   "/notifications/:notificationId",
//   authMiddleware.auth,
//   notificationController.markAsRead
// );

module.exports = router;
