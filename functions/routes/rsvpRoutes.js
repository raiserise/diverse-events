const express = require("express");
const router = express.Router();
const rsvpController = require("../controllers/rsvpController");
const authMiddleware = require("../middleware/auth");

router.get("/rsvp/user", authMiddleware.auth, rsvpController.getRSVPsByUser);

// Get RSVPs by event ID and optional status filter (approved, pending, rejected)
router.get(
  "/rsvp/:eventId",
  authMiddleware.auth,
  rsvpController.getRSVPsByStatus
);

router.get(
  "/rsvp/check/:eventId",
  authMiddleware.auth,
  rsvpController.checkRSVP
);

router.post("/rsvp", authMiddleware.auth, rsvpController.submitRSVP);

// Update RSVP status (approve/reject)
router.patch(
  "/rsvp/:rsvpId/status",
  authMiddleware.auth,
  rsvpController.updateRSVPStatus
);

module.exports = router;
