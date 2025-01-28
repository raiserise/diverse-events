const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/users", userController.addUser);
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
