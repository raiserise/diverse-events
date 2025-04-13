const httpMocks = require("node-mocks-http");
const eventController = require("../../controllers/eventController");
const eventModel = require("../../models/eventModel");
const rsvpModel = require("../../models/rsvpModel");

jest.mock("../../models/eventModel");
jest.mock("../../models/rsvpModel");

describe("eventController", () => {
  const mockUser = { user_id: "user123" };

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

  describe("getEventStats", () => {
    it("should return stats if user is organizer", async () => {
      const eventId = "event5";
      const mockEvent = { id: eventId, organizers: [mockUser.user_id] };
      const rsvps = [
        { status: "approved" },
        { status: "declined" },
        { status: "approved" },
      ];

      eventModel.getEventById.mockResolvedValue(mockEvent);
      rsvpModel.getRSVPsByEvent.mockResolvedValue(rsvps);
      rsvpModel.countRSVPsByStatus.mockImplementation(
        (arr, status) => arr.filter((r) => r.status === status).length
      );

      const req = httpMocks.createRequest({
        method: "GET",
        params: { eventId },
        user: mockUser,
      });
      const res = httpMocks.createResponse();

      await eventController.getEventStats(req, res);
      const stats = res._getJSONData();

      expect(res.statusCode).toBe(200);
      expect(stats.totalRSVPs).toBe(3);
      expect(stats.attendees).toBe(2);
      expect(stats.declined).toBe(1);
    });
  });
});
