const {
  createEvent,
  getEventsByUser,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../../models/eventModel");

describe("Event Model", () => {
  let testEventId;
  const testUserId = "test-user-123";

  const baseEventData = {
    title: "Sample Event",
    description: "This is a test event.",
    creatorId: testUserId,
    privacy: "public",
    format: "offline",
    startDate: "2025-04-01",
    endDate: "2025-04-02",
    duration: 1,
    language: "English",
    maxParticipants: 100,
    category: ["General"],
    terms: "Test terms",
    locationName: "Test Location",
    latitude: "1.3521",
    longitude: "103.8198",
    acceptsRSVP: true,
    featuredImage: "http://example.com/image.jpg",
    organizers: ["user123"],
  };

  test("should create a new event", async () => {
    const event = await createEvent(baseEventData);
    expect(event).toHaveProperty("id");
    expect(event.title).toBe("Sample Event");
    testEventId = event.id;
  });

  test("should get event by ID", async () => {
    const event = await getEventById(testEventId);
    expect(event).toHaveProperty("id", testEventId);
    expect(event.creatorId).toBe(testUserId);
  });

  test("should get events by user", async () => {
    const events = await getEventsByUser(testUserId);
    expect(Array.isArray(events)).toBe(true);
    expect(events.some((e) => e.id === testEventId)).toBe(true);
  });

  test("should get all events visible to the user", async () => {
    const events = await getAllEvents(testUserId);
    expect(Array.isArray(events)).toBe(true);
  });

  test("should update the event", async () => {
    const updatedEvent = await updateEvent(testEventId, {
      title: "Updated Event Title",
    });
    expect(updatedEvent.title).toBe("Updated Event Title");
  });

  test("should delete the event", async () => {
    const response = await deleteEvent(testEventId);
    expect(response).toHaveProperty("message", "Event successfully deleted");
    expect(response).toHaveProperty("eventId", testEventId);
  });

  test("should throw error for deleted event", async () => {
    await expect(getEventById(testEventId)).rejects.toThrow("Event not found");
  });
});
