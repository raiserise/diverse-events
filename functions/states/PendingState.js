// src/states/PendingState.js
const admin = require("firebase-admin"); // Import Firebase Admin SDK
const BaseState = require("./BaseState");

class PendingState extends BaseState {
  async onEnter() {
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);
    const eventRef = this.db.collection("events").doc(this.rsvp.eventId);
    const userRef = this.db.collection("users").doc(this.rsvp.userId);

    // Fetch all needed docs in parallel
    const [rsvpSnap, eventSnap, userSnap] = await Promise.all([
      rsvpRef.get(),
      eventRef.get(),
      userRef.get(),
    ]);

    const rsvpData = rsvpSnap.data();
    const eventData = eventSnap.data();
    const userData = userSnap.data();

    const userName = userData?.name || "A user";
    const eventTitle = eventData?.title || "your event";

    // Determine message for user
    const userMessage = rsvpData.reapplied ?
      "Thank you for reapplying! Your RSVP is now pending approval." :
      "Your RSVP has been received and is now pending approval.";

    // Clear 'reapplied' flag if present
    if (rsvpData.reapplied) {
      await rsvpRef.update({
        reapplied: this.admin.firestore.FieldValue.delete(),
      });
    }

    await this.sendUserNotification("rsvp_pending", userMessage);

    const organizerMessage = `${userName} has requested to join your event "${eventTitle}" as a guest/participant`;
    await this.sendOrganizerNotification("rsvp_received", organizerMessage);
  }

  async approve() {
    const eventRef = this.db.collection("events").doc(this.rsvp.eventId);
    const rsvpRef = this.db.collection("rsvps").doc(this.rsvp.id);
    const userRef = this.db.collection("users").doc(this.rsvp.userId);

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

    // Fetch user and event data
    const [userSnap, eventSnap] = await Promise.all([
      userRef.get(),
      eventRef.get(),
    ]);

    const userData = userSnap.data();
    const eventData = eventSnap.data();
    const userName = userData?.name || "A user";
    const eventTitle = eventData?.title || "your event";

    // Notify user
    await this.sendUserNotification(
        "rsvp_approved",
        `You're confirmed! Your RSVP for "${eventTitle}" has been approved.`,
    );

    // Notify organizer
    await this.sendOrganizerNotification(
        "rsvp_received",
        `${userName} has been approved to attend "${eventTitle}".`,
    );

    // Transition to ApprovedState
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
        "Your RSVP for the event has been rejected.",
    );

    const RejectedState = require("./RejectedState");
    this.rsvp.setState(new RejectedState(this.rsvp));
  }

  async cancel() {
    const {db} = this;
    // eslint-disable-next-line no-unused-vars
    const {eventId, userId, id: rsvpId} = this.rsvp;
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
        "Your pending RSVP has been cancelled",
    );

    const CancelledState = require("./CancelledState");
    this.rsvp.setState(new CancelledState(this.rsvp));
  }
}

module.exports = PendingState;
