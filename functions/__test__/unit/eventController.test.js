const httpMocks = require("node-mocks-http");
const eventController = require("../../controllers/eventController");
const eventModel = require("../../models/eventModel");

jest.mock("../../models/eventModel");
jest.mock("../../models/rsvpModel");

describe("eventController", () => {
  const mockUser = { user_id: "user123" };

  describe("getAllEvents", () => {
    it("should return events for an authenticated user", async () => {
      const req = { user: { user_id: "user123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the eventModel.getAllEvents function to return a list of events
      eventModel.getAllEvents.mockResolvedValue([{ id: 1, name: "Event 1" }]);

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: "Event 1" }]);
    });

    it("should return 500 if there is an error in retrieving all events", async () => {
      const req = { user: { user_id: "user123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the eventModel.getAllEvents function to throw an error
      eventModel.getAllEvents.mockRejectedValue(
        new Error("Error fetching all events")
      );

      await eventController.getAllEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error fetching all events",
      });
    });
  });

  describe("createEvent", () => {
    it("should create an event", async () => {
      const mockEvent = { id: "event123", title: "Test Event" };
      eventModel.createEvent.mockResolvedValue(mockEvent);

      const req = httpMocks.createRequest({
        method: "POST",
        body: {
          title: "Test Event",
        },
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.createEvent(req, res);
      const data = res._getJSONData();

      expect(res.statusCode).toBe(201);
      expect(data).toEqual(mockEvent);
      expect(eventModel.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Event",
          creatorId: mockUser.user_id,
        })
      );
    });

    it("should return 500 on error", async () => {
      eventModel.createEvent.mockRejectedValue(new Error("DB error"));

      const req = httpMocks.createRequest({
        method: "POST",
        body: { title: "Fail Event" },
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.createEvent(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData().error).toBe("DB error");
    });
  });

  describe("getUserEvents", () => {
    it("should return events for a user", async () => {
      const mockEvents = [{ id: "e1" }, { id: "e2" }];
      eventModel.getEventsByUser.mockResolvedValue(mockEvents);

      const req = httpMocks.createRequest({
        method: "GET",
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.getUserEvents(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockEvents);
    });

    it("should return 500 if there is an error in retrieving user events", async () => {
      const req = { user: { user_id: "user123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the eventModel.getEventsByUser function to throw an error
      eventModel.getEventsByUser.mockRejectedValue(new Error("Database error"));

      await eventController.getUserEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("updateEvent", () => {
    it("should update event if user is an organizer", async () => {
      const eventId = "event1";
      const updated = { title: "Updated!" };
      const existingEvent = { id: eventId, organizers: [mockUser.user_id] };
      const updatedEvent = { id: eventId, title: "Updated!" };

      eventModel.getEventById.mockResolvedValue(existingEvent);
      eventModel.updateEvent.mockResolvedValue(updatedEvent);

      const req = httpMocks.createRequest({
        method: "PATCH",
        params: { eventId },
        body: updated,
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.updateEvent(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(updatedEvent);
    });

    it("should return 403 if the user is not authorized to update the event", async () => {
      const req = {
        user: { user_id: "user123" },
        params: { eventId: "event123" },
        body: { name: "Updated Event" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the eventModel.getEventById function to return an event that doesn't include the user as an organizer
      eventModel.getEventById.mockResolvedValue({ organizers: ["user456"] });

      await eventController.updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Not authorized" });
    });

    it("should return 403 if user is not an organizer", async () => {
      const eventId = "event2";
      const existingEvent = { id: eventId, organizers: ["otherUser"] };

      eventModel.getEventById.mockResolvedValue(existingEvent);

      const req = httpMocks.createRequest({
        method: "PATCH",
        params: { eventId },
        body: { title: "Hack attempt" },
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.updateEvent(req, res);
      expect(res.statusCode).toBe(403);
      expect(res._getJSONData().error).toMatch(/not authorized/i);
    });
  });

  describe("deleteEvent", () => {
    it("should delete event if user is creator", async () => {
      const eventId = "event3";
      const event = { id: eventId, creatorId: mockUser.user_id };

      eventModel.getEventById.mockResolvedValue(event);
      eventModel.deleteEvent.mockResolvedValue(true);

      const req = httpMocks.createRequest({
        method: "DELETE",
        params: { eventId },
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.deleteEvent(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().message).toMatch(/deleted/i);
    }, 10000);

    it("should return 403 if the user is not the creator of the event", async () => {
      const req = {
        user: { user_id: "user123" },
        params: { eventId: "event123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock the eventModel.getEventById function to return an event with a different creatorId
      eventModel.getEventById.mockResolvedValue({ creatorId: "user456" });

      await eventController.deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Only creator can delete",
      });
    });

    it("should return 403 if not creator", async () => {
      const event = { id: "event4", creatorId: "notYou" };
      eventModel.getEventById.mockResolvedValue(event);

      const req = httpMocks.createRequest({
        method: "DELETE",
        params: { eventId: "event4" },
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.deleteEvent(req, res);
      expect(res.statusCode).toBe(403);
    });
  });

  describe("getEventsByIds", () => {
    let req;
    let res;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });

    test("should return 400 if ids is missing", async () => {
      req.body = {}; // no ids

      await eventController.getEventsByIds(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ids must be a non-empty array",
      });
    });

    test("should return 400 if ids is empty", async () => {
      req.body = { ids: [] };

      await eventController.getEventsByIds(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "ids must be a non-empty array",
      });
    });

    test("should return 200 and events if ids are valid", async () => {
      const mockEvents = [
        { id: "event1", title: "Test Event 1" },
        { id: "event2", title: "Test Event 2" },
      ];
      req.body = { ids: ["event1", "event2"] };
      eventModel.getEventsByIds.mockResolvedValue(mockEvents);

      await eventController.getEventsByIds(req, res);

      expect(eventModel.getEventsByIds).toHaveBeenCalledWith([
        "event1",
        "event2",
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ events: mockEvents });
    });
  });

  describe("getEventDetails", () => {
    it("should return event details for a valid eventId", async () => {
      const req = { params: { eventId: "event123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      eventModel.getEventById.mockResolvedValue({
        id: "event123",
        name: "Sample Event",
      });

      await eventController.getEventDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: "event123",
        name: "Sample Event",
      });
    });

    it("should return 500 if there is an error in retrieving the event details", async () => {
      const req = { params: { eventId: "event123" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      eventModel.getEventById.mockRejectedValue(new Error("Event not found"));

      await eventController.getEventDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Event not found" });
    });

    it("should return 500 if the eventId is invalid or missing", async () => {
      const req = { params: { eventId: "" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      eventModel.getEventById.mockRejectedValue(new Error("Invalid event ID"));

      await eventController.getEventDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid event ID" });
    });
  });
});
