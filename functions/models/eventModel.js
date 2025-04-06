const {db} = require("../config/firebase");
const admin = require("firebase-admin");

const createEvent = async (data) => {
  try {
    // Ensure organizers array includes creatorId by default
    const organizers =
      Array.isArray(data.organizers) && data.organizers.length > 0 ?
        [...new Set([data.creatorId, ...data.organizers])] : // Ensure uniqueness
        [data.creatorId]; // Default to creatorId only if no organizers are provided

    const eventData = {
      title: data.title?.trim() || "Untitled Event",
      description: data.description?.trim() || "No description provided.",
      privacy: data.privacy || "public",
      format: data.format || "online", // Renamed from eventType for clarity
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      duration: isNaN(data.duration) ? "1" : String(data.duration), // Ensure string format
      language: data.language || "English",
      maxParticipants: isNaN(data.maxParticipants) ?
        10 :
        Number(data.maxParticipants),
      category: Array.isArray(data.category) ? data.category : ["General"], // Ensure array format
      terms: data.terms?.trim() || "Standard event terms apply.",
      location:
        data.latitude && data.longitude ?
          {
            name: data.locationName?.trim() || "Unknown Location",
            coordinates: new admin.firestore.GeoPoint(
                parseFloat(data.latitude),
                parseFloat(data.longitude),
            ),
          } :
          null, // Set location to null if latitude/longitude are missing
      acceptsRSVP: data.acceptsRSVP ?? false, // Allow explicit false values
      featuredImage: data.featuredImage || "",
      creatorId: data.creatorId || null, // Ensure creatorId is present or null
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      organizers: organizers,
      status: "active",
      participants: [], // Start with an empty list of RSVPs
      invitedUsers: [], // Start with an empty list of invited users
    };

    const docRef = await db.collection("events").add(eventData);
    return {id: docRef.id, ...eventData};
  } catch (error) {
    throw new Error(`Error creating event: ${error.message}`);
  }
};

const getEventsByUser = async (userId) => {
  try {
    const snapshot = await db
        .collection("events")
        .where("creatorId", "==", userId)
        .get();

    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  } catch (error) {
    throw new Error(`Error getting user events: ${error.message}`);
  }
};

const getAllEvents = async (userId) => {
  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    return events.filter(
        (event) =>
          event.privacy === "public" || // Public events are visible to everyone
        event.creatorId === userId || // Creator can always see their event
        event.organizers.includes(userId) || // Organizers can see the event
        event.invitedUsers.includes(userId), // Invited users can see the event
    );
  } catch (error) {
    throw new Error(`Error getting all events: ${error.message}`);
  }
};

const getEventById = async (id) => {
  try {
    const doc = await db.collection("events").doc(id).get();
    if (!doc.exists) throw new Error("Event not found");
    return {id: doc.id, ...doc.data()};
  } catch (error) {
    throw new Error(`Error retrieving events: ${error.message}`);
  }
};

const searchEvents = async (filters) => {
  try {
    let query = db.collection("events");

    if (filters.title) {
      query = query.where("title", "==", filters.title);
    }

    // Filter by category (if provided)
    if (filters.category) {
      query = query.where("category", "==", filters.category);
    }

    // Filter by start date (if provided)
    if (filters.startDate) {
      query = query.where("startDate", ">=", new Date(filters.startDate));
    }

    // Filter by end date (if provided)
    if (filters.endDate) {
      query = query.where("endDate", "<=", new Date(filters.endDate));
    }

    // Filter by privacy (if provided)
    if (filters.privacy) {
      query = query.where("privacy", "==", filters.privacy);
    }

    // Filter by privacy settings based on the includePrivate flag
    if (filters.includePrivate === false) {
      query = query.where("privacy", "==", "public"); // Only include public events
    }

    // Execute the query and get the results
    const snapshot = await query.get();

    // Return the results as an array of event objects
    return snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
  } catch (error) {
    throw new Error(`Error searching events: ${error.message}`);
  }
};

const updateEvent = async (eventId, data) => {
  try {
    const eventRef = db.collection("events").doc(eventId);
    const eventSnapshot = await eventRef.get();

    if (!eventSnapshot.exists) {
      throw new Error("Event not found");
    }

    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await eventRef.update(updateData);

    const updatedEvent = await eventRef.get();
    return {id: updatedEvent.id, ...updatedEvent.data()};
  } catch (error) {
    throw new Error(`Error updating event: ${error.message}`);
  }
};

const deleteEvent = async (eventId) => {
  try {
    const eventRef = db.collection("events").doc(eventId);
    const eventSnapshot = await eventRef.get();

    if (!eventSnapshot.exists) {
      throw new Error("Event not found");
    }

    await eventRef.delete();
    return {message: "Event successfully deleted", eventId};
  } catch (error) {
    throw new Error(`Error deleting event: ${error.message}`);
  }
};

module.exports = {
  createEvent,
  getEventsByUser,
  searchEvents,
  updateEvent,
  getEventById,
  deleteEvent,
  getAllEvents,
};
