const express = require("express");
const router = express.Router();
// const inviteController = require("../controllers/inviteController");
const rsvpController = require("../controllers/rsvpController");
const authMiddleware = require("../middleware/auth");

// routes/rsvpRoutes.js
router.post("/rsvp", authMiddleware.auth, rsvpController.submitRSVP);

// Update RSVP status (approve/reject)
router.patch(
  "/rsvp/:rsvpId/status",
  authMiddleware.auth,
  rsvpController.updateRSVPStatus
);

// Get RSVPs by event ID and optional status filter (approved, pending, rejected)
router.get(
  "/rsvp/:eventId",
  authMiddleware.auth,
  rsvpController.getRSVPsByStatus
);

module.exports = router;
