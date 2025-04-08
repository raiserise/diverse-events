const notificationModel = require("../models/notificationModel");

// Send a notification
const sendNotification = async (req, res) => {
  try {
    const {message} = req.body;
    const result = await notificationModel.sendNotification(
        req.user.user_id,
        message,
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// Get notifications for a user
const getNotificationsByUser = async (req, res) => {
  try {
    const result = await notificationModel.getNotificationsForUser(
        req.user.user_id,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

const markAsRead = async (req, res) => {
  try {
    const {notificationId} = req.params;
    const updatedNotification =
      await notificationModel.markNotificationAsRead(notificationId);
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

module.exports = {sendNotification, getNotificationsByUser, markAsRead};
