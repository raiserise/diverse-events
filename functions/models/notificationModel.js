const { db } = require("../config/firebase");
const admin = require("firebase-admin");

const createNotification = async ({
  userId,
  type,
  message,
  relatedEventId,
}) => {
  try {
    const notificationRef = await db.collection("notifications").add({
      userId,
      type, // e.g., "event_invite", "rsvp_confirmation", "rsvp_received"
      message,
      relatedEventId,
      read: false, // Unread by default
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      id: notificationRef.id,
      userId,
      type,
      message,
      relatedEventId,
      read: false,
    };
  } catch (error) {
    throw new Error(`Error creating notification: ${error.message}`);
  }
};

const getNotificationsForUser = async (userId) => {
  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching notifications: ${error.message}`);
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    // Verify notification ownership
    const notification = await db
      .collection("notifications")
      .doc(notificationId)
      .get();

    await db.collection("notifications").doc(notificationId).update({
      read: true,
    });

    return { id: notificationId, read: true };
  } catch (error) {
    throw new Error(`Error updating notification: ${error.message}`);
  }
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
};
