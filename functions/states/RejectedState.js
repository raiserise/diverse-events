// src/states/RejectedState.js
// eslint-disable-next-line no-unused-vars
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class RejectedState extends BaseState {
  async reapply() {
    const {db} = this;
    const {id: rsvpId} = this.rsvp;

    // Reset RSVP to pending
    await db.collection("rsvps").doc(rsvpId).update({
      status: "pending",
      updatedAt: db.admin.firestore.FieldValue.serverTimestamp(),
    });

    await this.sendUserNotification(
        "rsvp_rejected",
        "Your RSVP has been reapplied and is now pending approval.",
    );
  }

  // Prevent invalid operations
  async approve() {
    throw new Error("Cannot approve a rejected RSVP.");
  }

  async reject() {
    throw new Error("RSVP is already rejected.");
  }

  async cancel() {
    throw new Error("Cannot cancel a rejected RSVP.");
  }
}

module.exports = RejectedState;
