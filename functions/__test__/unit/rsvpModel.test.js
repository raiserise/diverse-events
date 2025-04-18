// rsvpModel.test.js
const {
  createRSVP,
  updateRSVP,
  getRSVPsByStatus,
  getRSVPById,
  getRSVPsByEvent,
  countRSVPsByStatus,
  findRSVP,
  getUserRSVPs,
} = require("../../models/rsvpModel");
const { db } = require("../../config/firebase");

// --- Mocks ---
// Mock the Firebase config module so we can simulate Firestore operations.
jest.mock("../../config/firebase", () => ({
  db: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
}));

// Mock firebase-admin, including serverTimestamp, arrayUnion and arrayRemove.
jest.mock("firebase-admin", () => {
  const FieldValue = {
    serverTimestamp: jest.fn(() => new Date("2025-01-01T00:00:00Z")),
    arrayUnion: jest.fn((val) => val),
    arrayRemove: jest.fn((val) => val),
  };
  return { firestore: { FieldValue } };
});

// Reset mocks before each test.
beforeEach(() => {
  jest.clearAllMocks();
});

//
// ===== createRSVP Tests =====
//
describe("createRSVP", () => {
  test("should create a new RSVP successfully", async () => {
    const eventId = "event1";
    const userId = "user1";
    const data = {
      organizers: ["organizer1"],
    };

    // Simulate duplicate check: empty result
    const duplicateQueryMock = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    };

    // Simulate the document creation
    const fakeDocRef = {
      id: "rsvp123",
      set: jest.fn().mockResolvedValue(),
    };

    // First call: duplicate check; second call: create new doc.
    db.collection
      .mockImplementationOnce(() => duplicateQueryMock)
      .mockImplementationOnce(() => ({
        doc: jest.fn(() => fakeDocRef),
      }));

    const result = await createRSVP(eventId, userId, data);

    expect(result).toMatchObject({
      id: "rsvp123",
      eventId,
      userId,
      status: "pending",
      organizers: ["organizer1"],
    });
    expect(fakeDocRef.set).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: expect.any(Date),
      })
    );
  });

  test("should throw error when duplicate RSVP exists", async () => {
    const eventId = "event1";
    const userId = "user1";
    const data = { organizers: ["organizer1"] };

    const duplicateQueryMock = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: false, docs: [{}] }),
    };

    db.collection.mockImplementation(() => duplicateQueryMock);

    await expect(createRSVP(eventId, userId, data)).rejects.toThrow(
      "You have already RSVP'd for this event."
    );
  });
});

//
// ===== updateRSVP Tests =====
//
describe("updateRSVP", () => {
  test("should throw error if RSVP not found", async () => {
    const rsvpId = "rsvp1";
    const userId = "user1";
    const newStatus = "approved";

    // Simulate missing RSVP document
    const fakeRsvpDoc = { exists: false };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      return {};
    });

    await expect(updateRSVP(rsvpId, userId, newStatus)).rejects.toThrow(
      "RSVP not found."
    );
  });

  test("should throw error if no change detected in RSVP status", async () => {
    const rsvpId = "rsvp1";
    const userId = "user1";
    const newStatus = "pending"; // same as current
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1",
      status: "pending",
      organizers: ["organizer1"],
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      return {};
    });

    await expect(updateRSVP(rsvpId, userId, newStatus)).rejects.toThrow(
      "No change detected in RSVP status."
    );
  });

  test("should throw unauthorized error if cancelling by non-participant", async () => {
    const rsvpId = "rsvp1";
    const userId = "user2"; // not the participant
    const newStatus = "cancelled";
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1", // participant is user1
      status: "pending",
      organizers: ["organizer1"],
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      return {};
    });

    await expect(updateRSVP(rsvpId, userId, newStatus)).rejects.toThrow(
      "Unauthorized: Only the participant can cancel their RSVP."
    );
  });

  test("should throw unauthorized error if non-organizer tries to update non-cancellation status", async () => {
    const rsvpId = "rsvp1";
    const userId = "user2"; // neither participant nor organizer
    const newStatus = "approved";
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1", // participant
      status: "pending",
      organizers: ["organizer1"],
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      return {};
    });

    await expect(updateRSVP(rsvpId, userId, newStatus)).rejects.toThrow(
      "Unauthorized: Only organizers can update RSVP status."
    );
  });

  test("should update RSVP successfully to approved by organizer", async () => {
    const rsvpId = "rsvp1";
    const userId = "organizer1"; // authorized as organizer
    const newStatus = "approved";
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1",
      status: "pending",
      organizers: ["organizer1"],
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    // Fake event document for transaction – event exists and has capacity.
    const fakeEventData = { participants: [], maxParticipants: 100 };
    const fakeEventDoc = { exists: true, data: () => fakeEventData };

    // Create a fake transaction object.
    const updateSpy = jest.fn();
    const fakeTransaction = {
      get: jest.fn().mockResolvedValue(fakeEventDoc),
      update: updateSpy,
    };

    // Mock runTransaction to immediately invoke the callback with our fake transaction.
    db.runTransaction.mockImplementation((updateFn) =>
      updateFn(fakeTransaction)
    );

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      if (coll === "events") {
        return { doc: jest.fn(() => ({})) }; // eventRef (its content is used in transaction.get)
      }
      return {};
    });

    const result = await updateRSVP(rsvpId, userId, newStatus);
    expect(result).toEqual({ id: rsvpId, status: newStatus });
    expect(updateSpy).toHaveBeenCalled();
  });

  test("should update RSVP successfully to cancelled by participant", async () => {
    const rsvpId = "rsvp2";
    const userId = "user1"; // participant
    const newStatus = "cancelled";
    // No previous cancellation time.
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1",
      status: "pending",
      organizers: ["organizer1"],
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    const fakeEventData = { participants: ["user1"], maxParticipants: 100 };
    const fakeEventDoc = { exists: true, data: () => fakeEventData };

    const updateSpy = jest.fn();
    const fakeTransaction = {
      get: jest.fn().mockResolvedValue(fakeEventDoc),
      update: updateSpy,
    };

    db.runTransaction.mockImplementation((updateFn) =>
      updateFn(fakeTransaction)
    );

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      if (coll === "events") {
        return { doc: jest.fn(() => ({})) };
      }
      return {};
    });

    const result = await updateRSVP(rsvpId, userId, newStatus);
    expect(result).toEqual({ id: rsvpId, status: newStatus });
    expect(updateSpy).toHaveBeenCalled();
  });

  test("should throw error if event is at full capacity when approving RSVP", async () => {
    const rsvpId = "rsvp1";
    const userId = "organizer1";
    const newStatus = "approved";
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1",
      status: "pending",
      organizers: ["organizer1"],
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    // Simulate event at full capacity.
    const fakeEventData = {
      participants: ["user1", "userX"],
      maxParticipants: 2,
    };
    const fakeEventDoc = { exists: true, data: () => fakeEventData };

    const fakeTransaction = {
      get: jest.fn().mockResolvedValue(fakeEventDoc),
      update: jest.fn(),
    };

    db.runTransaction.mockImplementation((updateFn) =>
      updateFn(fakeTransaction)
    );

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      if (coll === "events") {
        return { doc: jest.fn(() => ({})) };
      }
      return {};
    });

    await expect(updateRSVP(rsvpId, userId, newStatus)).rejects.toThrow(
      "Event is at full capacity."
    );
  });

  test("should throw error due to cancellation cooldown", async () => {
    const rsvpId = "rsvp1";
    const userId = "user1"; // participant
    const newStatus = "cancelled";
    // Set lastCancelledAt to 5 minutes ago (cooldown is 10 minutes).
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const fakeRsvpData = {
      eventId: "event1",
      userId: "user1",
      status: "pending",
      organizers: ["organizer1"],
      lastCancelledAt: { toDate: () => fiveMinutesAgo },
    };
    const fakeRsvpDoc = {
      exists: true,
      id: rsvpId,
      data: () => fakeRsvpData,
    };
    const rsvpDocMock = { get: jest.fn().mockResolvedValue(fakeRsvpDoc) };

    const fakeEventData = { participants: ["user1"], maxParticipants: 100 };
    const fakeEventDoc = { exists: true, data: () => fakeEventData };

    const fakeTransaction = {
      get: jest.fn().mockResolvedValue(fakeEventDoc),
      update: jest.fn(),
    };

    db.runTransaction.mockImplementation((updateFn) =>
      updateFn(fakeTransaction)
    );

    db.collection.mockImplementation((coll) => {
      if (coll === "rsvps") {
        return { doc: jest.fn(() => rsvpDocMock) };
      }
      if (coll === "events") {
        return { doc: jest.fn(() => ({})) };
      }
      return {};
    });

    await expect(updateRSVP(rsvpId, userId, newStatus)).rejects.toThrow(
      /You must wait/
    );
  });
});

//
// ===== getRSVPsByStatus Tests =====
//
describe("getRSVPsByStatus", () => {
  test("should return RSVPs filtered by eventId and status", async () => {
    const eventId = "event1";
    const status = "pending";
    const fakeDocs = [
      { id: "rsvp1", data: () => ({ eventId, status: "pending" }) },
      { id: "rsvp2", data: () => ({ eventId, status: "pending" }) },
    ];
    const getMock = jest.fn().mockResolvedValue({ docs: fakeDocs });
    // Simulate query chain: collection(...).where(...).where(...).get()
    db.collection.mockImplementation(() => ({
      where: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ get: getMock }),
      }),
    }));

    const result = await getRSVPsByStatus(eventId, status);
    expect(result).toEqual([
      { id: "rsvp1", eventId, status: "pending" },
      { id: "rsvp2", eventId, status: "pending" },
    ]);
  });

  test("should return RSVPs filtered by eventId only when status not provided", async () => {
    const eventId = "event1";
    const fakeDocs = [
      { id: "rsvp1", data: () => ({ eventId, status: "pending" }) },
    ];
    const getMock = jest.fn().mockResolvedValue({ docs: fakeDocs });
    const whereMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockImplementation(() => ({ where: whereMock }));

    const result = await getRSVPsByStatus(eventId);
    expect(result).toEqual([{ id: "rsvp1", eventId, status: "pending" }]);
  });
});

//
// ===== getRSVPById Tests =====
//
describe("getRSVPById", () => {
  test("should return RSVP if found", async () => {
    const rsvpId = "rsvp1";
    const fakeData = { eventId: "event1", status: "pending" };
    const fakeDoc = { exists: true, id: rsvpId, data: () => fakeData };
    const getMock = jest.fn().mockResolvedValue(fakeDoc);
    db.collection.mockImplementation(() => ({
      doc: jest.fn().mockReturnValue({ get: getMock }),
    }));

    const result = await getRSVPById(rsvpId);
    expect(result).toEqual({ id: rsvpId, ...fakeData });
  });

  test("should throw error if RSVP not found", async () => {
    const rsvpId = "rsvp1";
    const fakeDoc = { exists: false };
    const getMock = jest.fn().mockResolvedValue(fakeDoc);
    db.collection.mockImplementation(() => ({
      doc: jest.fn().mockReturnValue({ get: getMock }),
    }));

    await expect(getRSVPById(rsvpId)).rejects.toThrow("RSVP not found.");
  });
});

//
// ===== getRSVPsByEvent Tests =====
//
describe("getRSVPsByEvent", () => {
  test("should return RSVPs for given event", async () => {
    const eventId = "event1";
    const fakeDocs = [
      { id: "rsvp1", data: () => ({ eventId, status: "pending" }) },
      { id: "rsvp2", data: () => ({ eventId, status: "approved" }) },
    ];
    const getMock = jest.fn().mockResolvedValue({ docs: fakeDocs });
    const whereMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockImplementation(() => ({ where: whereMock }));

    const result = await getRSVPsByEvent(eventId);
    expect(result).toEqual([
      { id: "rsvp1", eventId, status: "pending" },
      { id: "rsvp2", eventId, status: "approved" },
    ]);
  });

  test("should throw error if fetching RSVPs for event fails", async () => {
    const eventId = "event1";
    const getMock = jest.fn().mockRejectedValue(new Error("Fetch error"));
    const whereMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockImplementation(() => ({ where: whereMock }));

    await expect(getRSVPsByEvent(eventId)).rejects.toThrow(
      /Error fetching RSVPs for event: Fetch error/
    );
  });
});

//
// ===== findRSVP Tests =====
//
describe("findRSVP", () => {
  test("should return RSVP if found", async () => {
    const eventId = "event1";
    const userId = "user1";
    const fakeData = { eventId, userId, status: "pending" };
    const fakeDocs = [{ id: "rsvp1", data: () => fakeData }];
    const getMock = jest
      .fn()
      .mockResolvedValue({ empty: false, docs: fakeDocs });
    const whereMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const queryMock = { where: whereMock, limit: limitMock, get: getMock };
    db.collection.mockImplementation(() => queryMock);

    const result = await findRSVP(eventId, userId);
    expect(result).toEqual({ id: "rsvp1", ...fakeData });
  });

  test("should return null if RSVP not found", async () => {
    const eventId = "event1";
    const userId = "user1";
    const getMock = jest.fn().mockResolvedValue({ empty: true, docs: [] });
    const whereMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const queryMock = { where: whereMock, limit: limitMock, get: getMock };
    db.collection.mockImplementation(() => queryMock);

    const result = await findRSVP(eventId, userId);
    expect(result).toBeNull();
  });

  test("should throw error if lookup fails", async () => {
    const eventId = "event1";
    const userId = "user1";
    const getMock = jest.fn().mockRejectedValue(new Error("Lookup error"));
    const whereMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const queryMock = { where: whereMock, limit: limitMock, get: getMock };
    db.collection.mockImplementation(() => queryMock);

    await expect(findRSVP(eventId, userId)).rejects.toThrow(
      /RSVP lookup failed: Lookup error/
    );
  });
});

//
// ===== countRSVPsByStatus Tests =====
//
describe("countRSVPsByStatus", () => {
  test("should count RSVPs with specified status", () => {
    const rsvps = [
      { status: "pending" },
      { status: "approved" },
      { status: "pending" },
    ];
    const count = countRSVPsByStatus(rsvps, "pending");
    expect(count).toBe(2);
  });
});

//
// ===== getUserRSVPs Tests =====
//
describe("getUserRSVPs", () => {
  test("should return RSVPs for the given user", async () => {
    const userId = "user1";

    // Add a fake timestamp so that createdAt is defined
    const fakeTimestamp = { toMillis: () => 1000 };
    const fakeDocs = [
      {
        id: "rsvp1",
        data: () => ({ userId, status: "pending", createdAt: fakeTimestamp }),
      },
      {
        id: "rsvp2",
        data: () => ({ userId, status: "approved", createdAt: fakeTimestamp }),
      },
    ];
    const getMock = jest
      .fn()
      .mockResolvedValue({ docs: fakeDocs, empty: false });
    const whereMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockImplementation(() => ({ where: whereMock }));

    const result = await getUserRSVPs(userId);
    expect(result).toEqual([
      { id: "rsvp1", userId, status: "pending", createdAt: fakeTimestamp },
      { id: "rsvp2", userId, status: "approved", createdAt: fakeTimestamp },
    ]);
  });

  test("should log and return empty array if no RSVPs found", async () => {
    const userId = "user1";
    const getMock = jest.fn().mockResolvedValue({ docs: [], empty: true });
    const whereMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockImplementation(() => ({ where: whereMock }));

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const result = await getUserRSVPs(userId);
    expect(consoleSpy).toHaveBeenCalled();
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });

  test("should throw error if fetching user RSVPs fails", async () => {
    const userId = "user1";
    const getMock = jest.fn().mockRejectedValue(new Error("User fetch error"));
    const whereMock = jest.fn().mockReturnValue({ get: getMock });
    db.collection.mockImplementation(() => ({ where: whereMock }));

    await expect(getUserRSVPs(userId)).rejects.toThrow(
      /Error fetching user RSVPs: User fetch error/
    );
  });
});
