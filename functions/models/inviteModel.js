const {db} = require("../config/firebase");
const admin = require("firebase-admin");

const createInvite = async (eventId, senderId, recipientId, role = "guest") => {
  try {
    // Check if an invite already exists
    const existingInviteSnapshot = await db
        .collection("invites")
        .where("eventId", "==", eventId)
        .where("recipientId", "==", recipientId)
        .get();

    if (!existingInviteSnapshot.empty) {
      throw new Error("Invite already sent to this user for the event.");
    }

    const inviteData = {
      eventId,
      senderId,
      recipientId,
      role,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const inviteRef = await db.collection("invites").add(inviteData);
    return {id: inviteRef.id, ...inviteData};
  } catch (error) {
    throw new Error(`Error creating invite: ${error.message}`);
  }
};

const getInvitesForUser = async (userId) => {
  try {
    const snapshot = await db
        .collection("invites")
        .where("recipientId", "==", userId)
        .get();

    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  } catch (error) {
    throw new Error(`Error getting invites: ${error.message}`);
  }
};

const getInvitesByEvent = async (eventId) => {
  try {
    const snapshot = await db
        .collection("invites")
        .where("eventId", "==", eventId)
        .get();
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  } catch (error) {
    throw new Error(`Error fetching invites for event: ${error.message}`);
  }
};

module.exports = {createInvite, getInvitesForUser, getInvitesByEvent};
