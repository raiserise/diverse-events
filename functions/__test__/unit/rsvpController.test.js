// rsvpController.test.js
const rsvpController = require("../../controllers/rsvpController");

// --- Mock Dependent Models ---
jest.mock("../../models/rsvpModel", () => ({
  createRSVP: jest.fn(),
  findRSVP: jest.fn(),
  getRSVPById: jest.fn(),
  updateRSVP: jest.fn(),
  getRSVPsByStatus: jest.fn(),
  getUserRSVPs: jest.fn(),
}));
jest.mock("../../models/notificationModel", () => ({
  createNotification: jest.fn(),
}));
jest.mock("../../models/eventModel", () => ({
  getEventById: jest.fn(),
}));

const rsvpModel = require("../../models/rsvpModel");
const notificationModel = require("../../models/notificationModel");
const eventModel = require("../../models/eventModel");

// --- Helper to create a fake Express response object ---
const createFakeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

//
// ===== submitRSVP Tests =====
//
describe("submitRSVP", () => {
  test("should return 400 if submitting RSVP fails", async () => {
    // Arrange
    const req = {
      body: { eventId: "event1" },
      user: { user_id: "user1", email: "user1@example.com" },
    };
    const res = createFakeRes();
    const errorMessage = "RSVP submission failed";
    rsvpModel.createRSVP.mockRejectedValue(new Error(errorMessage));

    // Act
    await rsvpController.submitRSVP(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== checkRSVP Tests =====
//
describe("checkRSVP", () => {
  test("should return exists false if RSVP is not found", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();

    // Simulate findRSVP returns an empty result.
    rsvpModel.findRSVP.mockResolvedValue(null);

    // Act
    await rsvpController.checkRSVP(req, res);

    // Assert
    expect(rsvpModel.findRSVP).toHaveBeenCalledWith("event1", "user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ exists: false });
  });

  test("should return RSVP details if found", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const fakeRSVP = {
      id: "rsvp1",
      status: "pending",
      lastCancelledAt: null,
    };
    rsvpModel.findRSVP.mockResolvedValue(fakeRSVP);

    // Act
    await rsvpController.checkRSVP(req, res);

    // Assert
    expect(rsvpModel.findRSVP).toHaveBeenCalledWith("event1", "user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      exists: true,
      rsvpId: fakeRSVP.id,
      status: fakeRSVP.status,
      lastCancelledAt: null,
    });
  });

  test("should return 500 if checkRSVP fails", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const errorMessage = "RSVP lookup error";
    rsvpModel.findRSVP.mockRejectedValue(new Error(errorMessage));

    // Act
    await rsvpController.checkRSVP(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== updateRSVPStatus Tests =====
//
describe("updateRSVPStatus", () => {
  test("should update the RSVP status and notify the user", async () => {
    // Arrange
    const req = {
      params: { rsvpId: "rsvp1" },
      body: { status: "approved" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const fakeRSVPData = { id: "rsvp1", eventId: "event1", status: "pending" };
    const updatedRSVP = { id: "rsvp1", status: "approved" };

    // Simulate fetching RSVP details.
    rsvpModel.getRSVPById.mockResolvedValue(fakeRSVPData);
    // Simulate updateRSVP call.
    rsvpModel.updateRSVP.mockResolvedValue(updatedRSVP);
    // Simulate notification creation.
    notificationModel.createNotification.mockResolvedValue();

    // Act
    await rsvpController.updateRSVPStatus(req, res);

    // Assert
    expect(rsvpModel.getRSVPById).toHaveBeenCalledWith("rsvp1");
    expect(rsvpModel.updateRSVP).toHaveBeenCalledWith(
      "rsvp1",
      "user1",
      "approved"
    );

    // Check that notification is created with the correct message for "approved" status.
    expect(notificationModel.createNotification).toHaveBeenCalledWith({
      userId: "user1",
      type: "rsvp_confirmation",
      message:
        "Your RSVP has been approved. You are now confirmed as a guest/participant for the event.",
      relatedEventId: "event1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedRSVP);
  });

  test("should return 404 if RSVP not found", async () => {
    // Arrange
    const req = {
      params: { rsvpId: "rsvp1" },
      body: { status: "approved" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    rsvpModel.getRSVPById.mockResolvedValue(null);

    // Act
    await rsvpController.updateRSVPStatus(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "RSVP not found." });
  });

  test("should return 400 if updateRSVPStatus fails", async () => {
    // Arrange
    const req = {
      params: { rsvpId: "rsvp1" },
      body: { status: "approved" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const errorMessage = "Update failed";
    const fakeRSVPData = { id: "rsvp1", eventId: "event1", status: "pending" };
    rsvpModel.getRSVPById.mockResolvedValue(fakeRSVPData);
    rsvpModel.updateRSVP.mockRejectedValue(new Error(errorMessage));

    // Act
    await rsvpController.updateRSVPStatus(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== getRSVPsByStatus Tests =====
//
describe("getRSVPsByStatus", () => {
  test("should return RSVPs for a valid event if user is authorized", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      query: { status: "pending" },
      user: { user_id: "organizer1" },
    };
    const res = createFakeRes();
    // Event belongs to the organizer.
    const fakeEvent = { id: "event1", creatorId: "organizer1" };
    eventModel.getEventById.mockResolvedValue(fakeEvent);
    const fakeRSVPs = [{ id: "rsvp1", status: "pending" }];
    rsvpModel.getRSVPsByStatus.mockResolvedValue(fakeRSVPs);

    // Act
    await rsvpController.getRSVPsByStatus(req, res);

    // Assert
    expect(eventModel.getEventById).toHaveBeenCalledWith("event1");
    expect(rsvpModel.getRSVPsByStatus).toHaveBeenCalledWith(
      "event1",
      "pending"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ rsvps: fakeRSVPs });
  });

  test("should return 400 for invalid RSVP status filter", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      query: { status: "invalidStatus" },
      user: { user_id: "organizer1" },
    };
    const res = createFakeRes();
    // Even if event exists, the filter is invalid.
    const fakeEvent = { id: "event1", creatorId: "organizer1" };
    eventModel.getEventById.mockResolvedValue(fakeEvent);

    // Act
    await rsvpController.getRSVPsByStatus(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid RSVP status provided.",
    });
  });

  test("should return 403 if user is not authorized to view RSVPs", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      query: {},
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    // Event exists but is owned by someone else.
    const fakeEvent = { id: "event1", creatorId: "organizer1" };
    eventModel.getEventById.mockResolvedValue(fakeEvent);

    // Act
    await rsvpController.getRSVPsByStatus(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized to view RSVPs for this event.",
    });
  });

  test("should return 500 if getRSVPsByStatus fails", async () => {
    // Arrange
    const req = {
      params: { eventId: "event1" },
      query: { status: "pending" },
      user: { user_id: "organizer1" },
    };
    const res = createFakeRes();
    const errorMessage = "Database error";
    const fakeEvent = { id: "event1", creatorId: "organizer1" };
    eventModel.getEventById.mockResolvedValue(fakeEvent);
    rsvpModel.getRSVPsByStatus.mockRejectedValue(new Error(errorMessage));

    // Act
    await rsvpController.getRSVPsByStatus(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

//
// ===== getRSVPsByUser Tests =====
//
describe("getRSVPsByUser", () => {
  test("should return RSVPs for the logged-in user", async () => {
    // Arrange
    const req = { user: { user_id: "user1" } };
    const res = createFakeRes();
    const fakeRSVPs = [{ id: "rsvp1" }, { id: "rsvp2" }];
    rsvpModel.getUserRSVPs.mockResolvedValue(fakeRSVPs);

    // Act
    await rsvpController.getRSVPsByUser(req, res);

    // Assert
    expect(rsvpModel.getUserRSVPs).toHaveBeenCalledWith("user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ rsvps: fakeRSVPs });
  });

  test("should return 500 if getUserRSVPs fails", async () => {
    // Arrange
    const req = { user: { user_id: "user1" } };
    const res = createFakeRes();
    const errorMessage = "User RSVPs error";
    rsvpModel.getUserRSVPs.mockRejectedValue(new Error(errorMessage));

    // Act
    await rsvpController.getRSVPsByUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    // Expect the exact error from the mock, without the prefix.
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
