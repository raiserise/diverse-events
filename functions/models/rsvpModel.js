const { db } = require("../config/firebase");
const admin = require("firebase-admin");

const createRSVP = async (eventId, userId, data) => {
  const rsvpData = {
    eventId,
    userId,
    status: "pending", // Requires approval
    type: data.inviteId ? "invited" : "public",
    inviteId: data.inviteId || null,
    dietaryRequirements: data.dietaryRequirements || null,
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

  // Ensure only the person who RSVP'd can update their status
  if (rsvpData.userId !== userId) {
    throw new Error("Unauthorized to update this RSVP.");
  }

  // Ensure the status is actually changing
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

    // If approving RSVP, check event capacity
    if (status === "approved") {
      if (
        eventData.maxParticipants &&
        participants.length >= eventData.maxParticipants
      ) {
        throw new Error("Event is at full capacity.");
      }

      // Add participant when RSVP is approved
      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayUnion(userId),
      });
    } else if (rsvpData.status === "approved" && status !== "approved") {
      // If status is changing from approved to something else, remove participant
      transaction.update(eventRef, {
        participants: admin.firestore.FieldValue.arrayRemove(userId),
      });
    }

    // Update RSVP status
    transaction.update(rsvpRef, {
      status, // e.g., "approved", "declined"
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    // Use composite query with multiple where clauses <button class="citation-flag" data-index="3">
    const snapshot = await db
      .collection("rsvps")
      .where("eventId", "==", eventId)
      .where("userId", "==", userId)
      .limit(1) // Optimize performance <button class="citation-flag" data-index="4">
      .get();

    // Return first matching document or null
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

module.exports = {
  createRSVP,
  updateRSVP,
  getRSVPsByStatus,
  getRSVPById,
  getRSVPsByEvent,
  countRSVPsByStatus,
  findRSVP,
};
