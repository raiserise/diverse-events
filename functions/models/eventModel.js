const { db } = require("../config/firebase");

// Add a new event
const addEvent = async (data) => {
  try {
    const docRef = await db.collection("events").add(data);
    return { id: docRef.id, ...data };
  } catch (error) {
    throw new Error(`Error adding event: ${error.message}`);
  }
};

// Get all events
const getEvents = async () => {
  try {
    const snapshot = await db.collection("events").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error retrieving events: ${error.message}`);
  }
};

// Get a single event by ID
const getEventById = async (id) => {
  try {
    const doc = await db.collection("events").doc(id).get();
    if (!doc.exists) throw new Error("Event not found");
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Error retrieving event: ${error.message}`);
  }
};

// Update a event
const updateEvent = async (id, data) => {
  try {
    await db.collection("events").doc(id).update(data);
    return `Event ${id} updated successfully`;
  } catch (error) {
    throw new Error(`Error updating event: ${error.message}`);
  }
};

// Delete a event
const deleteEvent = async (id) => {
  try {
    await db.collection("events").doc(id).delete();
    return `Event ${id} deleted successfully`;
  } catch (error) {
    throw new Error(`Error deleting event: ${error.message}`);
  }
};

module.exports = { addEvent, getEvents, getEventById, updateEvent, deleteEvent };
