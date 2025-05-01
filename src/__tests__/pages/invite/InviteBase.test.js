// npm test -- src/__tests__/pages/invite/InviteBase.test.js

import { InviteBase } from "../../../invite/InviteBase"; // adjust path as needed
import { getFirestore, updateDoc, doc, arrayUnion } from "firebase/firestore";

// Mock Firestore functions
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  arrayUnion: jest.fn((id) => id),
}));

describe("InviteBase", () => {
  const mockDb = {}; // mock return value for getFirestore()
  const mockDocRef = {};

  beforeEach(() => {
    jest.clearAllMocks();
    getFirestore.mockReturnValue(mockDb);
    doc.mockReturnValue(mockDocRef);
  });

  it("should call updateDoc with correct parameters when inviting a user", async () => {
    const mockEventId = "event123";
    const mockUser = { id: "user456" };

    const inviteBase = new InviteBase(mockEventId, "Test Event");
    await inviteBase.invite(mockUser);

    expect(doc).toHaveBeenCalledWith(mockDb, "events", mockEventId);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      invitedUsers: arrayUnion(mockUser.id),
    });
  });

  it("should throw error when user is invalid", async () => {
    const inviteBase = new InviteBase("event789", "Another Event");

    await expect(inviteBase.invite(null)).rejects.toThrow(
      "Invalid user object."
    );
    await expect(inviteBase.invite({})).rejects.toThrow("Invalid user object.");
  });
});
