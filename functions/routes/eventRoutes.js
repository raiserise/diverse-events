const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/auth");

// Event routes
router.post("/events", authMiddleware.auth, eventController.createEvent);
router.get("/events", authMiddleware.auth, eventController.getAllEvents);
router.get("/events/me", authMiddleware.auth, eventController.getUserEvents);
router.put(
  "/events/:eventId",
  authMiddleware.auth,
  eventController.updateEvent
);
router.delete(
  "/events/:eventId",
  authMiddleware.auth,
  eventController.deleteEvent
);
router.get("/events/:eventId", eventController.getEventDetails);

router.get(
  "/events/:eventId/stats",
  authMiddleware.auth,
  eventController.getEventStats
);

router.post(
  "/events/batch",
  authMiddleware.auth,
  eventController.getEventsByIds
);

module.exports = router;
