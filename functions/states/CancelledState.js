// src/states/CancelledState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class CancelledState extends BaseState {
  async reapply() {
    const { db } = this;
    const { id: rsvpId, data } = this.rsvp;

    const lastCancelledAt = data.lastCancelledAt?.toDate?.() || null;
    const cooldownMinutes = 10;
    const now = new Date();

    if (lastCancelledAt) {
      const diffMinutes = (now - lastCancelledAt) / (1000 * 60);
      if (diffMinutes < cooldownMinutes) {
        throw new Error(
          `You must wait ${Math.ceil(cooldownMinutes - diffMinutes)} minutes before RSVPing again.`
        );
      }
    }

    await db.collection("rsvps").doc(rsvpId).update({
      status: "pending",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reapplied: true,
    });

    const PendingState = require("./PendingState");
    this.rsvp.setState(new PendingState(this.rsvp));
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
