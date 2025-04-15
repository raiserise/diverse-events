// src/states/ApprovedState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class ApprovedState extends BaseState {
  async cancel() {
    const eventRef = this.db.collection("events").doc(this.rsvp.eventId);
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);

    const lastCancelledAt = this.rsvp.data.lastCancelledAt?.toDate?.() || null;
    const cooldownMinutes = 10;
    const now = new Date();

    if (lastCancelledAt) {
      const diffMinutes = (now - lastCancelledAt) / (1000 * 60);
      if (diffMinutes < cooldownMinutes) {
        throw new Error(
            `You must wait ${Math.ceil(cooldownMinutes - diffMinutes)} minutes before RSVPing again.`,
        );
      }
    }

    await this.db.runTransaction(async (transaction) => {
      transaction.update(rsvpRef, {
        status: "cancelled",
        lastCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayRemove(this.rsvp.userId),
      });
    });

    await this.sendUserNotification(
        "rsvp_confirmation",
        "Your RSVP for the event has been cancelled.",
    );

    await this.sendOrganizerNotification(
        "rsvp_received",
        `User ${this.rsvp.userId} has cancelled their RSVP for your event.`,
    );
  }
}

module.exports = ApprovedState;
