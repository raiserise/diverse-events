// src/states/ApprovedState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class ApprovedState extends BaseState {
  async cancel() {
    const eventRef = this.db.collection("events").doc(this.rsvp.eventId);
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);
    const userRef = this.db.collection("users").doc(this.rsvp.userId);

    // Fetch user data
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const userName = userData?.name || "A user";

    const eventSnap = await eventRef.get();
    const eventData = eventSnap.data();
    const eventTitle = eventData?.title || "your event";

    // Perform transaction
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

    // Notify user
    await this.sendUserNotification(
      "rsvp_cancelled",
      "You've successfully cancelled your RSVP for the event."
    );

    await this.sendOrganizerNotification(
      "rsvp_received",
      `${userName} has cancelled their RSVP for "${eventTitle}".`
    );

    // Transition to CancelledState
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
