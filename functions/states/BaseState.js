const admin = require("firebase-admin"); // Use admin for Firestore operations
const notificationModel = require("../models/notificationModel");

class BaseState {
  constructor(rsvp) {
    this.rsvp = rsvp;
    this.db = admin.firestore(); // Initialize Firestore directly from admin
  }

  /**
   * Send a notification to the RSVP user.
   * @param {string} type - The type of notification (e.g., "rsvp_confirmation").
   * @param {string} message - The message to include in the notification.
   */
  async sendUserNotification(type, message) {
    try {
      await notificationModel.createNotification({
        userId: this.rsvp.userId,
        type,
        message,
        relatedEventId: this.rsvp.eventId,
      });
    } catch (error) {
      console.error("Error sending user notification:", error.message);
      throw new Error("Failed to send user notification.");
    }
  }

  /**
   * Send a notification to the event organizer.
   * @param {string} type - The type of notification (e.g., "rsvp_update").
   * @param {string} message - The message to include in the notification.
   */
  async sendOrganizerNotification(type, message) {
    try {
      const eventDoc = await this.db
          .collection("events")
          .doc(this.rsvp.eventId)
          .get();

      if (!eventDoc.exists) {
        throw new Error("Event not found.");
      }

      const eventData = eventDoc.data();
      await notificationModel.createNotification({
        userId: eventData.creatorId,
        type,
        message,
        relatedEventId: this.rsvp.eventId,
      });
    } catch (error) {
      console.error("Error sending organizer notification:", error.message);
      throw new Error("Failed to send organizer notification.");
    }
  }
}

module.exports = BaseState;
