const { db } = require("../config/firebase");
const admin = require("firebase-admin");

const createEvent = async (data) => {
  try {
    // Ensure organizers array includes creatorId by default
    const organizers =
      Array.isArray(data.organizers) && data.organizers.length > 0
        ? [data.creatorId, ...data.organizers] // Include creatorId if organizers are provided
        : [data.creatorId]; // Default to creatorId only if no organizers are provided

    const eventData = {
      title: data.title || "Event", // Default to empty string
      description: data.description || "Event Description",
      privacy: data.privacy || "public",
      medium: data.medium || "online",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      duration: data.duration || "1",
      language: data.language || "English",
      maxParticipants: data.maxParticipants || 10,
      category: data.category || "General",
      terms: data.terms || "Terms and conditions",
      location:
        data.latitude && data.longitude
          ? {
              name: data.locationName || "Unknown",
              coordinates: new admin.firestore.GeoPoint(
                parseFloat(data.latitude),
                parseFloat(data.longitude)
              ),
            }
          : null, // Set location to null if latitude/longitude are missing
      acceptsRSVP: data.acceptsRSVP ?? false, // Use nullish coalescing to allow false values
      featuredImage: data.featuredImage || "",
      creatorId: data.creatorId || null, // Ensure this is present or null
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      organizers: organizers,
      status: "active",
    };

    const docRef = await db.collection("events").add(eventData);
    return { id: docRef.id, ...eventData };
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

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error getting user events: ${error.message}`);
  }
};

const getEventById = async (id) => {
  try {
    const doc = await db.collection("events").doc(id).get();
    if (!doc.exists) throw new Error("User not found");
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Error retrieving user: ${error.message}`);
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    return { id: updatedEvent.id, ...updatedEvent.data() };
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
    return { message: "Event successfully deleted", eventId };
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
};
