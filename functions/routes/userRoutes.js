const express = require("express");
const userController = require("../controllers/userController");
const eventController = require("../controllers/eventController");

const router = express.Router();

router.post("/users", userController.addUser);
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

router.post("/events", eventController.addEvent);
router.get("/events", eventController.getEvents);
router.get("/events/:id", eventController.getEventById);
router.put("/events/:id", eventController.updateEvent);
router.delete("/events/:id", eventController.deleteEvent);

module.exports = router;
