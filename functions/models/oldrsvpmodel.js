const { db } = require("../config/firebase");
const admin = require("firebase-admin");

const createRSVP = async (eventId, userId, data) => {
  const rsvpData = {
    eventId,
    userId,
    status: "pending", // Requires approval
    organizers: data.organizers,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Prevent duplicate RSVP
  const existingRSVP = await db
    .collection("rsvps")
    .where("eventId", "==", eventId)
    .where("userId", "==", userId)
    .get();

  if (!existingRSVP.empty) {
    throw new Error("You have already RSVP'd for this event.");
  }

  // Create RSVP without adding to participants
  const rsvpRef = db.collection("rsvps").doc();
  await rsvpRef.set(rsvpData);

  return { id: rsvpRef.id, ...rsvpData };
};

const updateRSVP = async (rsvpId, userId, status) => {
  const rsvpRef = db.collection("rsvps").doc(rsvpId);
  const rsvpDoc = await rsvpRef.get();

  if (!rsvpDoc.exists) {
    throw new Error("RSVP not found.");
  }

  const rsvpData = rsvpDoc.data();

  const isOrganizer = rsvpData.organizers.includes(userId);
  const isParticipant = rsvpData.userId === userId;

  if (status === "cancelled" && !isParticipant) {
    throw new Error(
      "Unauthorized: Only the participant can cancel their RSVP."
    );
  }

  // Allow participants to update to specific statuses
  const allowedParticipantStatuses = ["pending"]; // Adjust as needed
  if (
    status !== "cancelled" &&
    !isOrganizer &&
    !(isParticipant && allowedParticipantStatuses.includes(status))
  ) {
    throw new Error("Unauthorized: Only organizers can update RSVP status.");
  }

  if (rsvpData.status === status) {
    throw new Error("No change detected in RSVP status.");
  }

  const eventRef = db.collection("events").doc(rsvpData.eventId);

  return db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) {
      throw new Error("Event not found.");
    }

    const eventData = eventDoc.data();
    const participants = eventData.participants || [];

    const lastCancelledAt = rsvpData.lastCancelledAt?.toDate() || null;
    const cooldownMinutes = 10;
    const now = new Date();

    if (status === "cancelled") {
      transaction.update(rsvpRef, {
        lastCancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      if (lastCancelledAt) {
        const diffMinutes = (now - lastCancelledAt) / (1000 * 60);
        if (diffMinutes < cooldownMinutes) {
          throw new Error(
            `You must wait ${cooldownMinutes - diffMinutes} minutes before RSVPing again.`
          );
        }
      }
    }

    if (status === "approved") {
      if (
        eventData.maxParticipants &&
        participants.length >= eventData.maxParticipants
      ) {
        throw new Error("Event is at full capacity.");
      }
      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayUnion(rsvpData.userId),
      });
    }

    if (status === "cancelled") {
      if (!["pending", "approved"].includes(rsvpData.status)) {
        throw new Error("Cannot cancel a non-pending/approved RSVP.");
      }
      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayRemove(rsvpData.userId),
      });
    }

    if (rsvpData.status === "approved" && status !== "approved") {
      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayRemove(rsvpData.userId),
      });
    }

    const shouldResetCreatedDate =
      rsvpData.status === "cancelled" && status !== "cancelled";

    transaction.update(rsvpRef, {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(shouldResetCreatedDate && {
        createdDate: admin.firestore.FieldValue.serverTimestamp(),
      }),
    });

    return { id: rsvpId, status };
  });
};

const getRSVPsByStatus = async (eventId, status) => {
  let query = db.collection("rsvps").where("eventId", "==", eventId);
  if (status) {
    query = query.where("status", "==", status);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getRSVPById = async (rsvpId) => {
  const rsvpDoc = await db.collection("rsvps").doc(rsvpId).get();

  if (!rsvpDoc.exists) {
    throw new Error("RSVP not found.");
  }

  return { id: rsvpDoc.id, ...rsvpDoc.data() };
};

const getRSVPsByEvent = async (eventId) => {
  try {
    const snapshot = await db
      .collection("rsvps")
      .where("eventId", "==", eventId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching RSVPs for event: ${error.message}`);
  }
};

const findRSVP = async (eventId, userId) => {
  try {
    const snapshot = await db
      .collection("rsvps")
      .where("eventId", "==", eventId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    return snapshot.empty
      ? null
      : {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
  } catch (error) {
    throw new Error(`RSVP lookup failed: ${error.message}`);
  }
};

const countRSVPsByStatus = (rsvps, status) => {
  return rsvps.filter((rsvp) => rsvp.status === status).length;
};

const getUserRSVPs = async (userId) => {
  try {
    console.log(`Fetching RSVPs for user: ${userId}`);
    const snapshot = await db
      .collection("rsvps")
      .where("userId", "==", userId)
      .get();

    if (snapshot.empty) {
      console.log(`No RSVPs found for user: ${userId}`);
    }

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching user RSVPs: ${error.message}`);
  }
};
module.exports = {
  createRSVP,
  updateRSVP,
  getRSVPsByStatus,
  getRSVPById,
  getRSVPsByEvent,
  countRSVPsByStatus,
  findRSVP,
  getUserRSVPs,
};
