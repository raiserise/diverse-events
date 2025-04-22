// Import RSVP and state classes
const { createRSVP, deleteRSVPsByEventId } = require("../../models/rsvpModel");
const {
  PendingState,
  ApprovedState,
  RejectedState,
  CancelledState,
} = require("../../states");
const { db } = require("../../config/firebase");
const RSVP = require("../../models/rsvpModel");
const notificationModel = require("../../models/notificationModel");
const BaseState = require("../../states/BaseState");

// Mock Firestore interactions if needed
jest.mock("../../config/firebase", () => ({
  db: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
}));

jest.mock("firebase-admin", () => {
  const serverTimestamp = jest.fn(() => new Date("2025-01-01T00:00:00Z"));
  const arrayUnion = jest.fn((val) => val);
  const arrayRemove = jest.fn((val) => val);
  const deleteField = jest.fn(() => "mocked-delete");

  // Mock for .doc().get().data() and .update()
  const docMock = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        participants: [],
        title: "Mock Event",
        creatorId: "organizer123",
        reapplied: false,
      }),
    }),
    update: jest.fn(),
  };

  // Mock collection to return object with .doc()
  const collectionMock = jest.fn(() => ({
    doc: jest.fn(() => docMock),
    where: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        empty: false,
        forEach: jest.fn((callback) => {
          callback({ ref: "doc1" });
          callback({ ref: "doc2" });
        }),
      }),
    })),
  }));

  const firestoreFn = jest.fn(() => ({
    collection: collectionMock,
    runTransaction: jest.fn(async (updateFn) => {
      await updateFn({
        get: docMock.get,
        update: docMock.update,
      });
    }),
    batch: jest.fn(() => ({
      delete: jest.fn(),
      commit: jest.fn(),
    })),
  }));

  firestoreFn.FieldValue = {
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    delete: deleteField,
  };

  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    firestore: firestoreFn,
  };
});

jest.mock("../../models/notificationModel", () => ({
  createNotification: jest.fn().mockResolvedValue(true),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RSVP and State Pattern", () => {
  describe("createRSVP", () => {
    test("should create a new RSVP in PendingState", async () => {
      const eventId = "event1";
      const userId = "user1";
      const data = { organizers: ["organizer1"] };

      // Simulate Firestore operations for event lookup
      const fakeEventDoc = {
        exists: true,
        id: "event1",
        data: () => ({ maxParticipants: 100, participants: [] }),
      };
      const docMock = jest.fn((eventId) => ({
        get: jest.fn().mockResolvedValue(fakeEventDoc),
      }));

      // Simulate Firestore operations for duplicate check and RSVP creation
      const fakeDocRef = {
        id: "rsvp123",
        set: jest.fn(), // simulate writing the RSVP
      };

      const duplicateQueryMock = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ empty: true, docs: [] }), // no duplicates
        doc: jest.fn(() => fakeDocRef), // <-- Add this to fix the error
      };
      db.collection.mockImplementation((coll) => {
        if (coll === "events") {
          return { doc: docMock };
        }
        if (coll === "rsvps") {
          return duplicateQueryMock; // Now includes .doc()
        }
        return {};
      });

      const result = await createRSVP(eventId, userId, data);

      expect(result).toMatchObject({
        id: "rsvp123",
        eventId,
        userId,
        status: "pending",
      });

      expect(result.data.organizers).toEqual(["organizer1"]);
    });

    test("should throw error if duplicate RSVP exists", async () => {
      const eventId = "event1";
      const userId = "user1";
      const rsvpId = "existingRsvp123";
      const data = { organizers: ["organizer1"] };

      // Mock event document retrieval
      const fakeEventDoc = {
        exists: true,
        id: eventId,
        data: () => ({ maxParticipants: 100, participants: [] }),
      };

      const eventDocMock = jest.fn(() => ({
        get: jest.fn().mockResolvedValue(fakeEventDoc),
      }));

      // Simulate Firestore operations for duplicate check and RSVP creation
      const fakeDocRef = {
        id: "existingRsvp123",
        set: jest.fn(), // simulate writing the RSVP
      };

      // rsvps collection mock
      const rsvpsCollectionMock = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        doc: jest.fn(() => fakeDocRef),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: rsvpId,
              data: () => ({
                eventId,
                userId,
                status: "approved",
                createdAt: { toDate: () => new Date(Date.now() - 100000) }, // simulate old RSVP
              }),
            },
          ],
        }),
      };

      // Final db.collection() implementation
      db.collection.mockImplementation((collection) => {
        console.log(`Accessing collection: ${collection}`);
        if (collection === "events") {
          return { doc: eventDocMock };
        }
        if (collection === "rsvps") {
          return rsvpsCollectionMock;
        }
        return {};
      });

      // Expect the createRSVP function to throw the correct error
      await expect(createRSVP(eventId, userId, data)).rejects.toThrow(
        "You have already RSVP'd for this event."
      );
    });

    test("should throw error if eventId is null", async () => {
      const eventId = "";
      const userId = "user1";
      const rsvpId = "existingRsvp123";
      const data = { organizers: ["organizer1"] };

      // Mock event document retrieval
      const fakeEventDoc = {
        exists: false,
        id: eventId,
        data: () => ({ maxParticipants: 100, participants: [] }),
      };

      const eventDocMock = jest.fn(() => ({
        get: jest.fn().mockResolvedValue(fakeEventDoc),
      }));

      // Simulate Firestore operations for duplicate check and RSVP creation
      const fakeDocRef = {
        id: "existingRsvp123",
        set: jest.fn(), // simulate writing the RSVP
      };

      // rsvps collection mock
      const rsvpsCollectionMock = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        doc: jest.fn(() => fakeDocRef),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: rsvpId,
              data: () => ({
                eventId,
                userId,
                status: "approved",
                createdAt: { toDate: () => new Date(Date.now() - 100000) }, // simulate old RSVP
              }),
            },
          ],
        }),
      };

      // Final db.collection() implementation
      db.collection.mockImplementation((collection) => {
        console.log(`Accessing collection: ${collection}`);
        if (collection === "events") {
          return { doc: eventDocMock };
        }
        if (collection === "rsvps") {
          return rsvpsCollectionMock;
        }
        return {};
      });

      // Expect the createRSVP function to throw the correct error
      await expect(createRSVP(eventId, userId, data)).rejects.toThrow(
        "Event not found."
      );
    });

    test("should throw error if Event is cancelled or closed", async () => {
      const eventId = "";
      const userId = "user1";
      const rsvpId = "existingRsvp123";
      const data = { organizers: ["organizer1"] };

      // Mock event document retrieval
      const fakeEventDoc = {
        exists: true,
        id: eventId,
        status: "cancelled",
        data: () => ({ maxParticipants: 100, participants: [] }),
      };

      const eventDocMock = jest.fn(() => ({
        get: jest.fn().mockResolvedValue(fakeEventDoc),
      }));

      // Simulate Firestore operations for duplicate check and RSVP creation
      const fakeDocRef = {
        id: "existingRsvp123",
        set: jest.fn(), // simulate writing the RSVP
      };

      // rsvps collection mock
      const rsvpsCollectionMock = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        doc: jest.fn(() => fakeDocRef),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: rsvpId,
              data: () => ({
                eventId,
                userId,
                status: "approved",
                createdAt: { toDate: () => new Date(Date.now() - 100000) }, // simulate old RSVP
              }),
            },
          ],
        }),
      };

      // Final db.collection() implementation
      db.collection.mockImplementation((collection) => {
        console.log(`Accessing collection: ${collection}`);
        if (collection === "events") {
          return { doc: eventDocMock };
        }
        if (collection === "rsvps") {
          return rsvpsCollectionMock;
        }
        return {};
      });

      // Expect the createRSVP function to throw the correct error
      await expect(createRSVP(eventId, userId, data)).rejects.toThrow(
        "You have already RSVP'd for this event."
      );
    });

    test("should throw error if Event is full", async () => {
      const eventId = "";
      const userId = "user1";
      const rsvpId = "existingRsvp123";
      const data = { organizers: ["organizer1"] };

      // Mock event document retrieval
      const fakeEventDoc = {
        exists: true,
        id: eventId,
        data: () => ({ maxParticipants: 1, participants: ["me"] }),
      };

      const eventDocMock = jest.fn(() => ({
        get: jest.fn().mockResolvedValue(fakeEventDoc),
      }));

      // Simulate Firestore operations for duplicate check and RSVP creation
      const fakeDocRef = {
        id: "existingRsvp123",
        set: jest.fn(), // simulate writing the RSVP
      };

      // rsvps collection mock
      const rsvpsCollectionMock = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        doc: jest.fn(() => fakeDocRef),
        get: jest.fn().mockResolvedValue({
          empty: false,
          docs: [
            {
              id: rsvpId,
              data: () => ({
                eventId,
                userId,
                status: "approved",
                createdAt: { toDate: () => new Date(Date.now() - 100000) }, // simulate old RSVP
              }),
            },
          ],
        }),
      };

      // Final db.collection() implementation
      db.collection.mockImplementation((collection) => {
        console.log(`Accessing collection: ${collection}`);
        if (collection === "events") {
          return { doc: eventDocMock };
        }
        if (collection === "rsvps") {
          return rsvpsCollectionMock;
        }
        return {};
      });

      // Expect the createRSVP function to throw the correct error
      await expect(createRSVP(eventId, userId, data)).rejects.toThrow(
        "Event is full. RSVP not allowed."
      );
    });
  });

  describe("State Transitions", () => {
    let rsvp;

    beforeEach(() => {
      rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "pending",
        data: {
          lastCancelledAt: {
            toDate: () => null, // 20 minutes ago
          },
        },
        setState: jest.fn(),
        toJSON: jest.fn().mockReturnValue({
          id: "rsvp1",
          eventId: "event1",
          userId: "user1",
          status: "pending",
          data: {
            lastCancelledAt: {
              toDate: () => null,
            },
          },
        }),
      };
    });

    test("should transition from PendingState to ApprovedState", async () => {
      const pendingState = new PendingState(rsvp);
      await pendingState.approve();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(ApprovedState));
    });

    test("should transition from PendingState to RejectedState", async () => {
      const pendingState = new PendingState(rsvp);
      await pendingState.reject();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(RejectedState));
    });

    test("should transition from PendingState to CancelledState", async () => {
      const pendingState = new PendingState(rsvp);
      await pendingState.cancel();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(CancelledState));
    });

    test("should reapply from CancelledState to PendingState", async () => {
      const cancelledState = new CancelledState(rsvp);
      await cancelledState.reapply();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(PendingState));
    });

    test("should correctly serialize the RSVP object", () => {
      const serializedRSVP = rsvp.toJSON();

      // Ensure that the 'state' property is excluded from the serialized object
      expect(serializedRSVP.state).toBeUndefined();
      expect(serializedRSVP.id).toBe("rsvp1");
      expect(serializedRSVP.eventId).toBe("event1");
      expect(serializedRSVP.userId).toBe("user1");
      expect(serializedRSVP.status).toBe("pending");
    });
  });

  describe("State-Specific Behavior", () => {
    test("PendingState should allow approve, reject, and cancel", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "pending",
        setState: jest.fn(),
      };

      const pendingState = new PendingState(rsvp);
      await pendingState.approve();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(ApprovedState));

      rsvp.setState.mockClear(); // Reset mock
      await pendingState.reject();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(RejectedState));

      rsvp.setState.mockClear(); // Reset mock
      await pendingState.cancel();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(CancelledState));
    });

    test("ApprovedState should only allow cancel", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "approved",
        data: {
          lastCancelledAt: {
            toDate: () => null, // 20 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const approvedState = new ApprovedState(rsvp);
      await approvedState.cancel();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(CancelledState));

      await expect(approvedState.approve()).rejects.toThrow(
        "Cannot approve an already approved RSVP."
      );
    });

    test("RejectedState should allow reapply", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "rejected",
        data: {
          lastCancelledAt: {
            toDate: () => new Date(Date.now() - 20 * 60000), // 20 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const rejectedState = new RejectedState(rsvp);
      await rejectedState.reapply();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(PendingState));
    });

    test("CancelledState should allow reapply", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        data: {
          lastCancelledAt: {
            toDate: () => null, // 20 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await cancelledState.reapply();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(PendingState));
    });
  });

  describe("CancelledState", () => {
    test("should allow reapply after cooldown period", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        data: {
          lastCancelledAt: {
            toDate: () => new Date(Date.now() - 20 * 60000), // 20 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await cancelledState.reapply();
      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(PendingState));
    });

    test("should throw an error if reapply is attempted before cooldown period", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        data: {
          lastCancelledAt: {
            toDate: () => new Date(Date.now() - 5 * 60000), // 5 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await expect(cancelledState.reapply()).rejects.toThrow(
        "You must wait 5 minutes before RSVPing again."
      );
    });

    test("should throw an error when approve is called", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await expect(cancelledState.approve()).rejects.toThrow(
        "Cannot approve a cancelled RSVP."
      );
    });

    test("should throw an error when reject is called", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await expect(cancelledState.reject()).rejects.toThrow(
        "Cannot reject a cancelled RSVP."
      );
    });

    test("should throw an error when cancel is called", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await expect(cancelledState.cancel()).rejects.toThrow(
        "RSVP is already cancelled."
      );
    });
  });

  describe("Error Handling", () => {
    test("should throw error if invalid status transition is attempted", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "approved",
        data: {
          lastCancelledAt: {
            toDate: () => null, // 20 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const approvedState = new ApprovedState(rsvp);
      await expect(approvedState.reject()).rejects.toThrow(
        "Cannot reject an already approved RSVP."
      );
    });

    test("should throw error if cooldown period is not met during reapplication", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "cancelled",
        data: {
          lastCancelledAt: {
            toDate: () => new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          },
        },
        setState: jest.fn(),
      };

      const cancelledState = new CancelledState(rsvp);
      await expect(cancelledState.reapply()).rejects.toThrow(
        "You must wait 5 minutes before RSVPing again."
      );
    });
  });

  describe("RSVP Model Static Methods", () => {
    const mockData = {
      eventId: "event123",
      userId: "user1",
      organizers: ["organizer1"],
      status: "pending",
      createdAt: { toMillis: () => 123456789 },
      lastCancelledAt: { toMillis: () => 123456000 },
    };

    beforeEach(() => jest.clearAllMocks());

    test("load - should return RSVP instance", async () => {
      db.collection.mockReturnValue({
        doc: () => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            id: "abc",
            data: () => mockData,
          }),
        }),
      });

      const rsvp = await RSVP.load("abc");
      expect(rsvp).toBeInstanceOf(RSVP);
      expect(rsvp.id).toBe("abc");
    });

    test("findRSVP - returns RSVP if exists", async () => {
      db.collection.mockReturnValue({
        where: () => ({
          where: () => ({
            limit: () => ({
              get: jest.fn().mockResolvedValue({
                empty: false,
                docs: [{ id: "r1", data: () => mockData }],
              }),
            }),
          }),
        }),
      });

      const rsvp = await RSVP.findRSVP("event123", "user1");
      expect(rsvp).toBeInstanceOf(RSVP);
      expect(rsvp.id).toBe("r1");
    });

    test("getRSVPsByStatus - returns filtered RSVP data", async () => {
      db.collection.mockReturnValue({
        where: () => ({
          where: () => ({
            get: jest.fn().mockResolvedValue({
              docs: [{ id: "r1", data: () => mockData }],
            }),
          }),
        }),
      });

      const rsvps = await RSVP.getRSVPsByStatus("event123", "pending");
      expect(rsvps[0].id).toBe("r1");
    });

    test("getRSVPsByEvent - returns all RSVPs for an event", async () => {
      db.collection.mockReturnValue({
        where: () => ({
          get: jest.fn().mockResolvedValue({
            docs: [{ id: "r1", data: () => mockData }],
          }),
        }),
      });

      const rsvps = await RSVP.getRSVPsByEvent("event123");
      expect(rsvps.length).toBe(1);
    });

    test("getUserRSVPs - returns sorted RSVP list", async () => {
      db.collection.mockReturnValue({
        where: () => ({
          get: jest.fn().mockResolvedValue({
            docs: [{ id: "r1", data: () => mockData }],
          }),
        }),
      });

      const rsvps = await RSVP.getUserRSVPs("user1");
      expect(rsvps[0].id).toBe("r1");
    });

    test("countRSVPsByStatus - counts matching RSVPs", () => {
      const list = [
        { status: "pending" },
        { status: "approved" },
        { status: "pending" },
      ];
      expect(RSVP.countRSVPsByStatus(list, "pending")).toBe(2);
    });

    test("updateRSVP - calls approve method", async () => {
      const mockApprove = jest.fn();
      jest.spyOn(RSVP, "load").mockResolvedValue({
        data: mockData,
        userId: "user1",
        approve: mockApprove,
      });

      await RSVP.updateRSVP("rsvp1", "user1", "approved");
      expect(mockApprove).toHaveBeenCalled();
    });

    test("updateRSVP - calls reject method", async () => {
      const mockReject = jest.fn();
      jest.spyOn(RSVP, "load").mockResolvedValue({
        data: mockData,
        userId: "user1",
        reject: mockReject,
      });

      await RSVP.updateRSVP("rsvp1", "user1", "rejected");
      expect(mockReject).toHaveBeenCalled();
    });

    test("updateRSVP - calls cancel method", async () => {
      const mockCancel = jest.fn();
      jest.spyOn(RSVP, "load").mockResolvedValue({
        data: mockData,
        userId: "user1",
        cancel: mockCancel,
      });

      await RSVP.updateRSVP("rsvp1", "user1", "cancelled");
      expect(mockCancel).toHaveBeenCalled();
    });

    test("updateRSVP - throws error if non-participant tries to cancel", async () => {
      jest.spyOn(RSVP, "load").mockResolvedValue({
        data: mockData,
        userId: "not-user1", // not participant
        cancel: jest.fn(),
      });

      await expect(
        RSVP.updateRSVP("rsvp1", "organizer1", "cancelled")
      ).rejects.toThrow("Only the participant can cancel their RSVP.");
    });

    test("updateRSVP - throws error for invalid status", async () => {
      jest.spyOn(RSVP, "load").mockResolvedValue({
        data: mockData,
        userId: "user1",
      });

      await expect(
        RSVP.updateRSVP("rsvp1", "user1", "archived")
      ).rejects.toThrow("Invalid status transition: archived");
    });

    test("getRSVPById - returns RSVP instance", async () => {
      const mockLoad = jest
        .spyOn(RSVP, "load")
        .mockResolvedValue(new RSVP("rsvp1", mockData));

      const result = await RSVP.getRSVPById("rsvp1");
      expect(mockLoad).toHaveBeenCalledWith("rsvp1");
      expect(result).toBeInstanceOf(RSVP);
    });

    test("getUserRSVPs - pending first, then sorted by lastCancelledAt and createdAt", async () => {
      const rsvp1 = {
        id: "r1",
        ...mockData,
        status: "approved",
        createdAt: { toMillis: () => 100 },
        lastCancelledAt: { toMillis: () => 500 },
      };
      const rsvp2 = {
        id: "r2",
        ...mockData,
        status: "approved",
        createdAt: { toMillis: () => 200 },
        lastCancelledAt: { toMillis: () => 400 },
      };
      const rsvp3 = {
        id: "r3",
        ...mockData,
        status: "pending",
        createdAt: { toMillis: () => 300 },
        lastCancelledAt: { toMillis: () => undefined },
      };

      db.collection.mockReturnValue({
        where: () => ({
          get: jest.fn().mockResolvedValue({
            docs: [
              { id: rsvp1.id, data: () => rsvp1 },
              { id: rsvp2.id, data: () => rsvp2 },
              { id: rsvp3.id, data: () => rsvp3 },
            ],
          }),
        }),
      });

      const rsvps = await RSVP.getUserRSVPs("user1");

      // pending first, then by lastCancelledAt/createdAt descending
      expect(rsvps.map((r) => r.id)).toEqual(["r3", "r1", "r2"]);
    });
  });

  describe("RejectedState", () => {
    test("should allow reapply", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "rejected",
        setState: jest.fn(),
      };

      const rejectedState = new RejectedState(rsvp);
      await rejectedState.reapply();

      expect(rsvp.setState).toHaveBeenCalledWith(expect.any(PendingState));
    });

    test("should throw an error when approve is called", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "rejected",
        setState: jest.fn(),
      };

      const rejectedState = new RejectedState(rsvp);

      await expect(rejectedState.approve()).rejects.toThrow(
        "Cannot approve a rejected RSVP."
      );
    });

    test("should throw an error when reject is called", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "rejected",
        setState: jest.fn(),
      };

      const rejectedState = new RejectedState(rsvp);

      await expect(rejectedState.reject()).rejects.toThrow(
        "RSVP is already rejected."
      );
    });

    test("should throw an error when cancel is called", async () => {
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "rejected",
        setState: jest.fn(),
      };

      const rejectedState = new RejectedState(rsvp);

      await expect(rejectedState.cancel()).rejects.toThrow(
        "Cannot cancel a rejected RSVP."
      );
    });
  });

  describe("PendingState - onEnter", () => {
    let dbMock;

    beforeEach(() => {
      // Mock Firestore database
      dbMock = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        get: jest.fn(),
        update: jest.fn(),
      };

      // Inject mocks into the state instance
      const rsvp = {
        id: "rsvp1",
        eventId: "event1",
        userId: "user1",
        status: "pending",
      };

      // eslint-disable-next-line no-invalid-this
      this.state = new PendingState({
        ...rsvp,
        db: dbMock,
      });

      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    test("should send pending approval notification when not reapplied", async () => {
      // Mock RSVP data
      dbMock.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ reapplied: false }), // RSVP is not reapplied
      });

      // Mock event data
      dbMock.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ title: "Test Event", creatorId: "organizer1" }),
      });

      // eslint-disable-next-line no-invalid-this
      await this.state.onEnter();

      // Verify the number of calls to createNotification
      expect(notificationModel.createNotification).toHaveBeenCalledTimes(2);

      // Verify the first call (user notification)
      expect(notificationModel.createNotification.mock.calls[0][0]).toEqual({
        userId: "user1",
        type: "rsvp_pending",
        message: "Your RSVP has been received and is now pending approval.",
        relatedEventId: "event1",
      });

      // Verify the second call (organizer notification)
      expect(notificationModel.createNotification.mock.calls[1][0]).toEqual({
        userId: "organizer123",
        type: "rsvp_received",
        message:
          'A user has requested to join your event \"Mock Event\" as a guest/participant',
        relatedEventId: "event1",
      });
    });

    test("should send reapply notification and remove reapplied flag when reapplied", async () => {
      const updateMock = jest.fn();

      // RSVP document mock
      dbMock.doc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ reapplied: true }),
        }),
        update: updateMock,
      });

      // Event document mock
      dbMock.doc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ title: "Test Event", creatorId: "organizer1" }),
        }),
      });

      // eslint-disable-next-line no-invalid-this
      await this.state.onEnter();

      // Verify the user notification was sent
      expect(notificationModel.createNotification.mock.calls[0][0]).toEqual({
        userId: "user1",
        type: "rsvp_pending",
        message: "Your RSVP has been received and is now pending approval.",
        relatedEventId: "event1",
      });

      // Verify the organizer notification was sent
      expect(notificationModel.createNotification.mock.calls[1][0]).toEqual({
        userId: "organizer123",
        type: "rsvp_received",
        message:
          'A user has requested to join your event \"Mock Event\" as a guest/participant',
        relatedEventId: "event1",
      });
    });

    const mockUserId = "user123";
    const mockEventId = "event123";

    const createMockRSVP = () => ({
      userId: mockUserId,
      eventId: mockEventId,
    });

    describe("BaseState", () => {
      let state;
      let mockRSVP;

      beforeEach(() => {
        mockRSVP = createMockRSVP();
        state = new BaseState(mockRSVP);
        jest.clearAllMocks();
      });

      describe("sendUserNotification", () => {
        it("should send user notification successfully", async () => {
          notificationModel.createNotification.mockResolvedValueOnce(true);

          await state.sendUserNotification(
            "rsvp_pending",
            "Your RSVP is pending"
          );

          expect(notificationModel.createNotification).toHaveBeenCalledWith({
            userId: mockUserId,
            type: "rsvp_pending",
            message: "Your RSVP is pending",
            relatedEventId: mockEventId,
          });
        });

        it("should throw error if sending user notification fails", async () => {
          notificationModel.createNotification.mockRejectedValueOnce(
            new Error("Failed")
          );

          await expect(
            state.sendUserNotification("rsvp_pending", "Failed test")
          ).rejects.toThrow("Failed to send user notification.");

          expect(notificationModel.createNotification).toHaveBeenCalled();
        });
      });

      describe("sendOrganizerNotification", () => {
        it("should send organizer notification successfully", async () => {
          // Mock eventDoc
          const mockEventDoc = {
            exists: true,
            data: () => ({ creatorId: "organizer123" }),
          };
          const getMock = require("firebase-admin")
            .firestore()
            .collection()
            .doc().get;
          getMock.mockResolvedValueOnce(mockEventDoc);

          notificationModel.createNotification.mockResolvedValueOnce(true);

          await state.sendOrganizerNotification(
            "rsvp_received",
            "User has RSVP'd"
          );

          expect(notificationModel.createNotification).toHaveBeenCalledWith({
            userId: "organizer123",
            type: "rsvp_received",
            message: "User has RSVP'd",
            relatedEventId: mockEventId,
          });
        });

        it("should throw error if event does not exist", async () => {
          const getMock = require("firebase-admin")
            .firestore()
            .collection()
            .doc().get;
          getMock.mockResolvedValueOnce({ exists: false });

          await expect(
            state.sendOrganizerNotification("rsvp_received", "No event")
          ).rejects.toThrow("Failed to send organizer notification.");
        });

        it("should throw error if notification creation fails", async () => {
          const getMock = require("firebase-admin")
            .firestore()
            .collection()
            .doc().get;
          getMock.mockResolvedValueOnce({
            exists: true,
            data: () => ({ creatorId: "organizer123" }),
          });

          notificationModel.createNotification.mockRejectedValueOnce(
            new Error("Oops")
          );

          await expect(
            state.sendOrganizerNotification("rsvp_received", "Oops test")
          ).rejects.toThrow("Failed to send organizer notification.");
        });
      });
    });
  });

  describe("deleteRSVPsByEventId", () => {
    let dbMock;
    let batchMock;

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();

      // Extract the Firestore mock instance
      dbMock = require("../../config/firebase").db;

      // Mock Firestore methods for dbMock
      batchMock = {
        delete: jest.fn(),
        commit: jest.fn(),
      };

      dbMock.collection = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn(),
        }),
      });
      dbMock.batch = jest.fn().mockReturnValue(batchMock); // Mock batch()

      // Ensure that `get` method resolves with a snapshot (e.g., with docs)
      dbMock
        .collection()
        .where()
        .get.mockResolvedValue({
          empty: false,
          forEach: jest.fn((callback) => {
            callback({ ref: "doc1" }); // Return a mock document reference
            callback({ ref: "doc2" });
          }),
        });
    });

    test("should delete all RSVPs for the given eventId", async () => {
      // Call the method under test
      await deleteRSVPsByEventId("event1");

      // Verify that the Firestore query was executed
      expect(dbMock.collection).toHaveBeenCalledWith("rsvps");
      expect(dbMock.collection().where).toHaveBeenCalledWith(
        "eventId",
        "==",
        "event1"
      );
      expect(dbMock.collection().where().get).toHaveBeenCalled();

      // Verify that the batch was created
      expect(dbMock.batch).toHaveBeenCalled();

      // Verify that the batch.delete method was called for each document
      expect(batchMock.delete).toHaveBeenCalledWith("doc1");
      expect(batchMock.delete).toHaveBeenCalledWith("doc2");

      // Verify that the batch.commit method was called
      expect(batchMock.commit).toHaveBeenCalled();
    });

    test("should do nothing if no RSVPs exist for the given eventId", async () => {
      // Mock Firestore query snapshot as empty
      dbMock.collection().where().get.mockResolvedValue({
        empty: true,
      });

      // Call the method under test
      await deleteRSVPsByEventId("event1");

      // Verify that no batch operations were performed
      expect(dbMock.batch).not.toHaveBeenCalled();
    });

    test("should handle errors during Firestore query", async () => {
      // Mock Firestore query to throw an error
      dbMock
        .collection()
        .where()
        .get.mockRejectedValue(new Error("Firestore error"));

      // Call the method under test and expect it to throw an error
      await expect(deleteRSVPsByEventId("event1")).rejects.toThrow(
        "Firestore error"
      );

      // Verify that no batch operations were performed
      expect(dbMock.batch).not.toHaveBeenCalled();
    });

    test("should handle errors during batch commit", async () => {
      // Mock Firestore query snapshot with one document
      const mockSnapshot = {
        empty: false,
        forEach: jest.fn((callback) => {
          callback({ ref: "doc1" });
        }),
      };

      dbMock.collection().where().get.mockResolvedValue(mockSnapshot);

      // Mock batch commit to throw an error
      batchMock.commit.mockRejectedValue(new Error("Batch commit error"));

      // Call the method under test and expect it to throw an error
      await expect(deleteRSVPsByEventId("event1")).rejects.toThrow(
        "Batch commit error"
      );

      // Verify that the batch.delete method was called
      expect(batchMock.delete).toHaveBeenCalledWith("doc1");
    });
  });
});
