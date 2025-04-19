// src/states/PendingState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class PendingState extends BaseState {
  async onEnter() {
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);
    const rsvpSnap = await rsvpRef.get();
    const rsvpData = rsvpSnap.data();

    let message = "Your RSVP has been received and is now pending approval.";

    if (rsvpData.reapplied) {
      message = "Your RSVP has been reapplied and is now pending approval.";
      await rsvpRef.update({ reapplied: admin.firestore.FieldValue.delete() });
    }

    await this.sendUserNotification("rsvp_pending", message);

    const eventDoc = await this.db
      .collection("events")
      .doc(this.rsvp.eventId)
      .get();
    const eventData = eventDoc.data();

    await this.sendOrganizerNotification(
      "rsvp_received",
      `User ${this.rsvp.userId} has RSVP'd as a guest/participant for "${eventData?.title || "your event"}".`
    );
  }

  async approve() {
    const eventRef = this.db.collection("events").doc(this.rsvp.eventId);
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);

    await this.db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      const eventData = eventDoc.data();

      if (
        eventData.maxParticipants &&
        (eventData.participants?.length || 0) >= eventData.maxParticipants
      ) {
        throw new Error("Event is at full capacity.");
      }

      transaction.update(rsvpRef, {
        status: "approved",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayUnion(this.rsvp.userId),
      });
    });

    await this.sendUserNotification(
      "rsvp_approved",
      "Your RSVP has been approved. You are now confirmed as a guest/participant."
    );

    await this.sendOrganizerNotification(
      "rsvp_received",
      `User ${this.rsvp.userId} has been approved for your event.`
    );

    const ApprovedState = require("./ApprovedState");
    this.rsvp.setState(new ApprovedState(this.rsvp));
  }

  async reject() {
    await this.db.collection("rsvps").doc(this.rsvp.id).update({
      status: "rejected",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await this.sendUserNotification(
      "rsvp_rejected",
      "Your RSVP for the event has been rejected."
    );

    const RejectedState = require("./RejectedState");
    this.rsvp.setState(new RejectedState(this.rsvp));
  }

  async cancel() {
    const { db } = this;
    // eslint-disable-next-line no-unused-vars
    const { eventId, userId, id: rsvpId } = this.rsvp;
    const rsvpRef = db.collection("rsvps").doc(rsvpId);
    const eventRef = db.collection("events").doc(eventId);

    await db.runTransaction(async (transaction) => {
      // Check if event exists
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists) {
        throw new Error("Event not found");
      }

      // Update RSVP status
      transaction.update(rsvpRef, {
        status: "cancelled",
        lastCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // No need to modify participants array since it's pending
    });

    await this.sendUserNotification(
      "rsvp_cancelled",
      "Your pending RSVP has been cancelled"
    );

    const CancelledState = require("./CancelledState");
    this.rsvp.setState(new CancelledState(this.rsvp));
  }
}

module.exports = PendingState;
