// src/states/CancelledState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class CancelledState extends BaseState {
  async reapply() {
    const {db} = this;
    const {id: rsvpId} = this.rsvp;

    // Reset RSVP to pending
    await db.collection("rsvps").doc(rsvpId).update({
      status: "pending",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await this.sendUserNotification(
        "rsvp_cancelled",
        "Your RSVP has been reapplied and is now pending approval.",
    );
  }

  // Prevent invalid operations
  async approve() {
    throw new Error("Cannot approve a cancelled RSVP.");
  }

  async reject() {
    throw new Error("Cannot reject a cancelled RSVP.");
  }

  async cancel() {
    throw new Error("RSVP is already cancelled.");
  }
}

module.exports = CancelledState;
