const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth");

router.get(
  "/notifications",
  authMiddleware.auth,
  notificationController.getNotificationsByUser
);
router.patch(
  "/notifications/:notificationId/read",
  authMiddleware.auth,
  notificationController.markAsRead
);

module.exports = router;
