// src/states/ApprovedState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class ApprovedState extends BaseState {
  async cancel() {
    const eventRef = this.db.collection("events").doc(this.rsvp.eventId);
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);

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
      "rsvp_cancelled",
      "Your RSVP for the event has been cancelled."
    );

    await this.sendOrganizerNotification(
      "rsvp_received",
      `User ${this.rsvp.userId} has cancelled their RSVP for your event.`
    );

    const CancelledState = require("./CancelledState");
    this.rsvp.setState(new CancelledState(this.rsvp));
  }

  // Prevent invalid operations
  async approve() {
    throw new Error("Cannot approve an already approved RSVP.");
  }

  async reject() {
    throw new Error("Cannot reject an already approved RSVP.");
  }
}

module.exports = ApprovedState;
