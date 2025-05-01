// npm test -- src/__tests__/hooks/useUserEvents.test.js
import { renderHook, act } from "@testing-library/react";
import { useUserEvents } from "../../hooks/useUserEvents";
import { onSnapshot } from "firebase/firestore";

// Mock Firestore functions
jest.mock("firebase/firestore", () => {
  const original = jest.requireActual("firebase/firestore");
  return {
    ...original,
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn(),
  };
});

describe("useUserEvents", () => {
  it("should fetch events for the user and set loading to false", async () => {
    const mockData = [
      { id: "1", data: () => ({ title: "Event 1", organizers: ["user123"] }) },
      { id: "2", data: () => ({ title: "Event 2", organizers: ["user123"] }) },
    ];

    onSnapshot.mockImplementation((_, onSuccess) => {
      const mockSnapshot = {
        forEach: (cb) => mockData.forEach((doc) => cb(doc)),
      };
      onSuccess(mockSnapshot);
      return jest.fn(); // unsubscribe function
    });

    const { result } = renderHook(() => useUserEvents("user123"));

    // Wait for effect to run
    await act(() => Promise.resolve());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.events).toEqual([
      { id: "1", title: "Event 1", organizers: ["user123"] },
      { id: "2", title: "Event 2", organizers: ["user123"] },
    ]);
  });

  it("should handle errors and set error message", async () => {
    onSnapshot.mockImplementation((_, __, onError) => {
      onError(new Error("Snapshot error"));
      return jest.fn(); // unsubscribe function
    });

    const { result } = renderHook(() => useUserEvents("user123"));

    await act(() => Promise.resolve());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to fetch your events.");
    expect(result.current.events).toEqual([]);
  });

  it("should do nothing if no userId is provided", async () => {
    const { result } = renderHook(() => useUserEvents(null));

    await act(() => Promise.resolve());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.events).toEqual([]);
  });
});
