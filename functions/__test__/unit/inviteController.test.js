// inviteController.test.js
const inviteController = require("../../controllers/inviteController");

// Mock dependent models
jest.mock("../../models/inviteModel", () => ({
  createInvite: jest.fn(),
  getInvitesForUser: jest.fn(),
}));
jest.mock("../../models/notificationModel", () => ({
  createNotification: jest.fn(),
}));

const inviteModel = require("../../models/inviteModel");
const notificationModel = require("../../models/notificationModel");

// Helper: create a fake response object that mimics Express's res methods
const createFakeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("sendInvite", () => {
  test("should send an invite and create notification successfully", async () => {
    // Arrange
    const req = {
      body: {
        eventId: "event1",
        recipientId: "recipient1",
        role: "guest",
      },
      user: { user_id: "sender1" },
    };
    const res = createFakeRes();
    const fakeInvite = { id: "invite123", eventId: "event1" };

    // Mock createInvite to resolve with a fake invite object.
    inviteModel.createInvite.mockResolvedValue(fakeInvite);
    // Mock createNotification to resolve (return value is not used).
    notificationModel.createNotification.mockResolvedValue();

    // Act
    await inviteController.sendInvite(req, res);

    // Assert
    // Verify that createInvite was called with the proper parameters.
    expect(inviteModel.createInvite).toHaveBeenCalledWith(
      "event1",
      "sender1",
      "recipient1",
      "guest"
    );
    // Verify that createNotification was called with the expected payload.
    expect(notificationModel.createNotification).toHaveBeenCalledWith({
      userId: "recipient1",
      type: "event_invite",
      message: "You've been invited to an event as guest",
      relatedEventId: "event1",
    });
    // Verify a successful response.
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeInvite);
  });

  test("should return 500 status and error message if invite creation fails", async () => {
    // Arrange
    const req = {
      body: {
        eventId: "event1",
        recipientId: "recipient1",
        role: "guest",
      },
      user: { user_id: "sender1" },
    };
    const res = createFakeRes();
    const errorMessage = "Invite creation failed";
    inviteModel.createInvite.mockRejectedValue(new Error(errorMessage));

    // Act
    await inviteController.sendInvite(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

describe("getMyInvites", () => {
  test("should get invites for the authenticated user", async () => {
    // Arrange
    const req = {
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const fakeInvites = [
      { id: "invite1", userId: "user1" },
      { id: "invite2", userId: "user1" },
    ];
    inviteModel.getInvitesForUser.mockResolvedValue(fakeInvites);

    // Act
    await inviteController.getMyInvites(req, res);

    // Assert
    expect(inviteModel.getInvitesForUser).toHaveBeenCalledWith("user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeInvites);
  });

  test("should return 500 status with error message if getting invites fails", async () => {
    // Arrange
    const req = {
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const errorMessage = "Failed to fetch invites";
    inviteModel.getInvitesForUser.mockRejectedValue(new Error(errorMessage));

    // Act
    await inviteController.getMyInvites(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
