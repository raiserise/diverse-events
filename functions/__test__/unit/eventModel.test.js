const eventModel = require("../../models/eventModel");

jest.mock("../../config/firebase", () => {
  const docMock = {
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const collectionMock = {
    add: jest.fn(),
    doc: jest.fn(() => docMock),
    where: jest.fn(() => collectionMock),
    get: jest.fn(),
  };

  return {
    db: {
      collection: jest.fn(() => collectionMock),
    },
  };
});

jest.mock("firebase-admin", () => {
  return {
    firestore: {
      FieldValue: {
        serverTimestamp: jest.fn(() => "mock-timestamp"),
      },
      GeoPoint: jest.fn((lat, lng) => ({lat, lng})),
    },
  };
});

const {db} = require("../../config/firebase");

describe("Event Model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create a new event with default values", async () => {
      db.collection().add.mockResolvedValue({id: "event123"});

      const result = await eventModel.createEvent({
        title: "Test Event",
        creatorId: "user1",
        latitude: 1.23,
        longitude: 4.56,
      });

      expect(result.id).toBe("event123");
      expect(db.collection).toHaveBeenCalledWith("events");
      expect(db.collection().add).toHaveBeenCalled();
      expect(result.organizers).toContain("user1");
    });
  });

  describe("getEventsByUser", () => {
    it("should return events created by a user", async () => {
      db.collection()
          .where()
          .get.mockResolvedValue({
            docs: [{id: "event1", data: () => ({title: "Event 1"})}],
          });

      const result = await eventModel.getEventsByUser("user1");

      expect(result[0]).toMatchObject({id: "event1", title: "Event 1"});
    });
  });

  describe("getAllEvents", () => {
    it("should return filtered public/related events", async () => {
      db.collection().get.mockResolvedValue({
        docs: [
          {
            id: "event1",
            data: () => ({
              title: "Public Event",
              privacy: "public",
              creatorId: "user1",
              organizers: [],
              invitedUsers: [],
            }),
          },
          {
            id: "event2",
            data: () => ({
              title: "Private Event",
              privacy: "private",
              creatorId: "user2",
              organizers: ["user3"],
              invitedUsers: ["user1"],
            }),
          },
        ],
      });

      const events = await eventModel.getAllEvents("user1");

      expect(events.length).toBe(2);
      expect(events.map((e) => e.id)).toContain("event1");
      expect(events.map((e) => e.id)).toContain("event2");
    });
  });

  describe("getEventById", () => {
    it("should return event by ID", async () => {
      db.collection()
          .doc()
          .get.mockResolvedValue({
            exists: true,
            id: "event1",
            data: () => ({title: "Mock Event"}),
          });

      const result = await eventModel.getEventById("event1");

      expect(result.title).toBe("Mock Event");
    });

    it("should throw if event not found", async () => {
      db.collection().doc().get.mockResolvedValue({exists: false});

      await expect(eventModel.getEventById("fake")).rejects.toThrow(
          "Event not found",
      );
    });
  });

  describe("searchEvents", () => {
    it("should return events based on filters", async () => {
      db.collection()
          .where()
          .get.mockResolvedValue({
            docs: [{id: "e1", data: () => ({title: "Match"})}],
          });

      const result = await eventModel.searchEvents({title: "Match"});

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Match");
    });
  });

  describe("updateEvent", () => {
    it("should update an event", async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({exists: true}),
        update: jest.fn(),
      };

      db.collection().doc.mockReturnValue(mockRef);
      mockRef.get.mockResolvedValueOnce({exists: true});
      mockRef.get.mockResolvedValueOnce({
        id: "event123",
        data: () => ({title: "Updated"}),
      });

      const result = await eventModel.updateEvent("event123", {
        title: "Updated",
      });

      expect(mockRef.update).toHaveBeenCalled();
      expect(result.title).toBe("Updated");
    });

    it("should throw if event not found", async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({exists: false}),
      };

      db.collection().doc.mockReturnValue(mockRef);

      await expect(eventModel.updateEvent("missing", {})).rejects.toThrow(
          "Event not found",
      );
    });
  });

  describe("deleteEvent", () => {
    it("should delete an event", async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({exists: true}),
        delete: jest.fn(),
      };

      db.collection().doc.mockReturnValue(mockRef);

      const result = await eventModel.deleteEvent("event123");

      expect(mockRef.delete).toHaveBeenCalled();
      expect(result.message).toBe("Event successfully deleted");
    });

    it("should throw if event doesn't exist", async () => {
      const mockRef = {
        get: jest.fn().mockResolvedValue({exists: false}),
      };

      db.collection().doc.mockReturnValue(mockRef);

      await expect(eventModel.deleteEvent("bad")).rejects.toThrow(
          "Event not found",
      );
    });
  });

  describe("getEventsByIds", () => {
    it("should return events matching the given IDs", async () => {
      const mockDocs = [
        {id: "e1", exists: true, data: () => ({title: "Event 1"})},
        {id: "e2", exists: true, data: () => ({title: "Event 2"})},
      ];

      db.collection().doc.mockImplementation((id) => {
        const found = mockDocs.find((d) => d.id === id);
        return {
          get: jest.fn().mockResolvedValue(found),
        };
      });

      const result = await eventModel.getEventsByIds(["e1", "e2"]);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Event 1");
    });
  });
});
