// notificationModel.test.js
const {
  createNotification,
  getNotificationsForUser,
  markNotificationAsRead,
} = require("../../models/notificationModel");
const {db} = require("../../config/firebase");
const admin = require("firebase-admin");

// --- Mocks ---

// Mock the Firebase config module so we can simulate Firestore operations.
jest.mock("../../config/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock firebase-admin, specifically the FieldValue.serverTimestamp method.
jest.mock("firebase-admin", () => {
  const FieldValue = {
    serverTimestamp: jest.fn(() => new Date("2025-01-01T00:00:00Z")),
  };
  return {firestore: {FieldValue}};
});

// Reset mocks before each test.
beforeEach(() => {
  jest.clearAllMocks();
});

describe("createNotification", () => {
  test("should create a notification successfully", async () => {
    // Arrange
    const notificationData = {
      userId: "user1",
      type: "event_invite", // Example types: event_invite, rsvp_confirmation, etc.
      message: "You have been invited to the event!",
      relatedEventId: "event123",
    };

    // Simulate a successful add call with a generated notification id.
    const addMock = jest.fn().mockResolvedValue({id: "notif123"});
    db.collection.mockReturnValue({add: addMock});

    // Act
    const notification = await createNotification(notificationData);

    // Assert
    // The returned object should include the provided data and a generated id.
    expect(notification).toMatchObject({
      id: "notif123",
      userId: "user1",
      type: "event_invite",
      message: "You have been invited to the event!",
      relatedEventId: "event123",
      read: false,
    });
    // Verify that serverTimestamp was called to set createdAt.
    expect(admin.firestore.FieldValue.serverTimestamp).toHaveBeenCalled();
  });

  test("should throw an error if adding the notification fails", async () => {
    // Arrange
    const notificationData = {
      userId: "user1",
      type: "event_invite",
      message: "Invitation message",
      relatedEventId: "event123",
    };
    const errorMsg = "Failed to add";
    // Simulate failure during add.
    const addMock = jest.fn().mockRejectedValue(new Error(errorMsg));
    db.collection.mockReturnValue({add: addMock});

    // Act & Assert
    await expect(createNotification(notificationData)).rejects.toThrow(
        `Error creating notification: ${errorMsg}`,
    );
  });
});

describe("getNotificationsForUser", () => {
  test("should return notifications for a given user", async () => {
    // Arrange
    const userId = "user1";
    const fakeDocs = [
      {
        id: "1",
        data: () => ({
          userId,
          type: "event_invite",
          message: "Invite 1",
          relatedEventId: "evt1",
          read: false,
        }),
      },
      {
        id: "2",
        data: () => ({
          userId,
          type: "rsvp_confirmation",
          message: "RSVP confirmed",
          relatedEventId: "evt2",
          read: true,
        }),
      },
    ];
    const getMock = jest.fn().mockResolvedValue({docs: fakeDocs});
    const whereMock = jest.fn().mockReturnValue({get: getMock});
    db.collection.mockReturnValue({where: whereMock});

    // Act
    const notifications = await getNotificationsForUser(userId);

    // Assert
    expect(whereMock).toHaveBeenCalledWith("userId", "==", userId);
    expect(notifications).toHaveLength(2);
    expect(notifications).toEqual([
      {
        id: "1",
        userId,
        type: "event_invite",
        message: "Invite 1",
        relatedEventId: "evt1",
        read: false,
      },
      {
        id: "2",
        userId,
        type: "rsvp_confirmation",
        message: "RSVP confirmed",
        relatedEventId: "evt2",
        read: true,
      },
    ]);
  });

  test("should throw an error if fetching notifications fails", async () => {
    // Arrange
    const userId = "user1";
    const getMock = jest.fn().mockRejectedValue(new Error("Get failed"));
    const whereMock = jest.fn().mockReturnValue({get: getMock});
    db.collection.mockReturnValue({where: whereMock});

    // Act & Assert
    await expect(getNotificationsForUser(userId)).rejects.toThrow(
        "Error fetching notifications: Get failed",
    );
  });
});

describe("markNotificationAsRead", () => {
  test("should mark a notification as read successfully", async () => {
    // Arrange
    const notificationId = "notif123";
    const updateMock = jest.fn().mockResolvedValue();
    const docMock = jest.fn().mockReturnValue({update: updateMock});
    db.collection.mockReturnValue({doc: docMock});

    // Act
    const result = await markNotificationAsRead(notificationId);

    // Assert
    expect(docMock).toHaveBeenCalledWith(notificationId);
    expect(updateMock).toHaveBeenCalledWith({read: true});
    expect(result).toEqual({id: notificationId, read: true});
  });

  test("should throw an error if updating the notification fails", async () => {
    // Arrange
    const notificationId = "notif123";
    const errorMsg = "Update Error";
    const updateMock = jest.fn().mockRejectedValue(new Error(errorMsg));
    const docMock = jest.fn().mockReturnValue({update: updateMock});
    db.collection.mockReturnValue({doc: docMock});

    // Act & Assert
    await expect(markNotificationAsRead(notificationId)).rejects.toThrow(
        `Error updating notification: ${errorMsg}`,
    );
  });
});

