const { db } = require("../config/firebase");
const admin = require("firebase-admin");
const {
  PendingState,
  ApprovedState,
  RejectedState,
  CancelledState,
} = require("../states");

class RSVP {
  constructor(id, data) {
    this.id = id;
    this.eventId = data.eventId;
    this.userId = data.userId;
    this.status = data.status;
    this.data = data;
    this.state = this.createState();
  }

  // State management
  createState() {
    switch (this.status) {
      case "pending":
        return new PendingState(this);
      case "approved":
        return new ApprovedState(this);
      case "rejected":
        return new RejectedState(this);
      case "cancelled":
        return new CancelledState(this);
      default:
        throw new Error(`Invalid RSVP status: ${this.status}`);
    }
  }

  setState(newState) {
    this.state = newState;
    this.status = newState.constructor.name.replace("State", "").toLowerCase();
  }

  // State transitions
  async approve() {
    return this.state.approve();
  }

  async reject() {
    return this.state.reject();
  }

  async cancel() {
    return this.state.cancel();
  }

  // Custom serialization to handle circular references
  toJSON() {
    // eslint-disable-next-line no-unused-vars
    const { state, ...rest } = this; // Exclude the `state` property
    return rest;
  }

  // Static methods (original functionality preserved)
  static async createRSVP(eventId, userId, data) {
    const eventSnap = await db.collection("events").doc(eventId).get();

    if (!eventSnap.exists) {
      throw new Error("Event not found.");
    }

    const eventData = eventSnap.data();

    // Optional: Prevent RSVP if the event is closed or archived
    if (eventData.status === "cancelled" || eventData.status === "closed") {
      throw new Error("RSVPs are no longer accepted for this event.");
    }

    if (eventData.participants?.length >= eventData.maxParticipants) {
      throw new Error("Event is full. RSVP not allowed.");
    }

    const existingRSVP = await db
      .collection("rsvps")
      .where("eventId", "==", eventId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (!existingRSVP.empty) {
      const rsvpDoc = existingRSVP.docs[0];
      const rsvpData = rsvpDoc.data();
      const rsvpInstance = new RSVP(rsvpDoc.id, rsvpData);

      // Delegate to current state (e.g., CancelledState)
      if (rsvpInstance.status === "cancelled") {
        await rsvpInstance.state.reapply(data); // Use reapply method in CancelledState
        return rsvpInstance; // Return updated RSVP instance
      }

      throw new Error("You have already RSVP'd for this event.");
    }

    // If no existing RSVP, create a new one
    const rsvpData = {
      eventId,
      userId,
      status: "pending",
      organizers: data.organizers,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const rsvpRef = db.collection("rsvps").doc();
    await rsvpRef.set(rsvpData);
    return new RSVP(rsvpRef.id, rsvpData);
  }

  static async updateRSVP(rsvpId, userId, status) {
    const rsvp = await RSVP.load(rsvpId);

    // Authorization checks
    // eslint-disable-next-line no-unused-vars
    const isOrganizer = rsvp.data.organizers.includes(userId);
    const isParticipant = rsvp.userId === userId;

    if (status === "cancelled" && !isParticipant) {
      throw new Error("Only the participant can cancel their RSVP.");
    }

    // State transition
    switch (status) {
      case "approved":
        await rsvp.approve();
        break;
      case "rejected":
        await rsvp.reject();
        break;
      case "cancelled":
        await rsvp.cancel();
        break;
      default:
        throw new Error(`Invalid status transition: ${status}`);
    }

    return rsvp;
  }

  static async load(rsvpId) {
    const doc = await db.collection("rsvps").doc(rsvpId).get();
    if (!doc.exists) throw new Error("RSVP not found.");
    return new RSVP(doc.id, doc.data());
  }

  static async getRSVPsByStatus(eventId, status) {
    let query = db.collection("rsvps").where("eventId", "==", eventId);
    if (status) query = query.where("status", "==", status);

    const snapshot = await query.get();

    // Return plain objects instead of RSVP instances to avoid circular references
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async getRSVPById(rsvpId) {
    return RSVP.load(rsvpId);
  }

  static async getRSVPsByEvent(eventId) {
    const snapshot = await db
      .collection("rsvps")
      .where("eventId", "==", eventId)
      .get();

    // Return plain objects instead of RSVP instances
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  static async findRSVP(eventId, userId) {
    const snapshot = await db
      .collection("rsvps")
      .where("eventId", "==", eventId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    return snapshot.empty
      ? null
      : new RSVP(snapshot.docs[0].id, snapshot.docs[0].data());
  }

  static countRSVPsByStatus(rsvps, status) {
    return rsvps.filter((rsvp) => rsvp.status === status).length;
  }

  static async getUserRSVPs(userId) {
    const snapshot = await db
      .collection("rsvps")
      .where("userId", "==", userId)
      .get();

    // Return plain objects instead of RSVP instances to avoid circular references
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis?.(),
        lastCancelledAt: doc.data().lastCancelledAt?.toMillis?.(),
      }))
      .sort(
        (a, b) =>
          b.lastCancelledAt - a.lastCancelledAt || b.createdAt - a.createdAt
      );
  }
}

module.exports = RSVP;
