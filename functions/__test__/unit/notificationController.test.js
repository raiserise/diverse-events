// notificationController.test.js
const notificationController = require("../../controllers/notificationController");

// Mock the notification model methods
jest.mock("../../models/notificationModel", () => ({
  sendNotification: jest.fn(),
  getNotificationsForUser: jest.fn(),
  markNotificationAsRead: jest.fn(),
}));

const notificationModel = require("../../models/notificationModel");

// Helper function to create a fake Express response object.
const createFakeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("sendNotification", () => {
  test("should send a notification and return 201 with the result", async () => {
    // Arrange
    const req = {
      body: { message: "Test notification" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const fakeResult = { id: "notif1", userId: "user1", message: "Test notification" };
    notificationModel.sendNotification.mockResolvedValue(fakeResult);

    // Act
    await notificationController.sendNotification(req, res);

    // Assert
    expect(notificationModel.sendNotification).toHaveBeenCalledWith(
      "user1",
      "Test notification"
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("should return 500 with error message if sending fails", async () => {
    // Arrange
    const req = {
      body: { message: "Test notification" },
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const errorMessage = "Sending failed";
    notificationModel.sendNotification.mockRejectedValue(new Error(errorMessage));

    // Act
    await notificationController.sendNotification(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

describe("getNotificationsByUser", () => {
  test("should return notifications for the authenticated user", async () => {
    // Arrange
    const req = {
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const fakeNotifications = [
      { id: "notif1", message: "Notification 1" },
      { id: "notif2", message: "Notification 2" },
    ];
    notificationModel.getNotificationsForUser.mockResolvedValue(fakeNotifications);

    // Act
    await notificationController.getNotificationsByUser(req, res);

    // Assert
    expect(notificationModel.getNotificationsForUser).toHaveBeenCalledWith("user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeNotifications);
  });

  test("should return 500 with error message if fetching fails", async () => {
    // Arrange
    const req = {
      user: { user_id: "user1" },
    };
    const res = createFakeRes();
    const errorMessage = "Fetch error";
    notificationModel.getNotificationsForUser.mockRejectedValue(new Error(errorMessage));

    // Act
    await notificationController.getNotificationsByUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});

describe("markAsRead", () => {
  test("should mark a notification as read and return 200 with updated notification", async () => {
    // Arrange
    const req = {
      params: { notificationId: "notif1" },
    };
    const res = createFakeRes();
    const updatedNotification = { id: "notif1", read: true };
    notificationModel.markNotificationAsRead.mockResolvedValue(updatedNotification);

    // Act
    await notificationController.markAsRead(req, res);

    // Assert
    expect(notificationModel.markNotificationAsRead).toHaveBeenCalledWith("notif1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedNotification);
  });

  test("should return 400 with error message if marking fails", async () => {
    // Arrange
    const req = {
      params: { notificationId: "notif1" },
    };
    const res = createFakeRes();
    const errorMessage = "Mark as read failed";
    notificationModel.markNotificationAsRead.mockRejectedValue(new Error(errorMessage));

    // Act
    await notificationController.markAsRead(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
  });
});
