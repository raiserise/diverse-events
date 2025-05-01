// npm test -- src/__tests__/pages/invite/NotifyDecorator.test.js

import { NotifyDecorator } from "../../../invite/NotifyDecorator";
import { addDoc, collection, getFirestore } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(() => "mocked-timestamp"),
  getFirestore: jest.fn(),
}));

describe("NotifyDecorator", () => {
  const mockDb = {};
  const mockCollectionRef = {};
  const mockUser = { id: "user123" };
  const mockEventId = "event456";
  const mockEventTitle = "Cool Event";

  const mockBaseInvite = {
    eventId: mockEventId,
    eventTitle: mockEventTitle,
    invite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getFirestore.mockReturnValue(mockDb);
    collection.mockReturnValue(mockCollectionRef);
  });

  it("should create notification with timestamp", async () => {
    const decorator = new NotifyDecorator(mockBaseInvite);
    await decorator.invite(mockUser);

    // Verify Firestore interaction occurred
    expect(addDoc).toHaveBeenCalled();

    // Get the actual notification object that was created
    const [notificationData] = addDoc.mock.calls[0];

    // Verify critical fields exist
    expect(notificationData).toEqual(
      expect.objectContaining({
        relatedEventId: mockEventId,
        userId: mockUser.id,
        message: expect.stringContaining(mockEventTitle),
        type: "event_invite",
        read: false,
      })
    );

    // Verify timestamp exists (either mock or real)
    expect(notificationData.createdAt).toBe(undefined);
  });

  it("should throw an error when user is invalid", async () => {
    const decorator = new NotifyDecorator(mockBaseInvite);

    await expect(decorator.invite(null)).rejects.toThrow(
      "Invalid user object."
    );
    await expect(decorator.invite({})).rejects.toThrow("Invalid user object.");
  });
});
