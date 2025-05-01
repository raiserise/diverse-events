//npm test -- src/__tests__/hooks/UseEventForm.test.js
import { renderHook, act } from "@testing-library/react";
import { useEventForm } from "../../hooks/useEventForm"; // Adjust path
import { addDoc } from "firebase/firestore";

// --- Mocks ---
jest.mock("firebase/storage", () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(() => ({
    on: jest.fn((event, progress, error, complete) => complete()),
    snapshot: { ref: {} },
  })),
  getDownloadURL: jest.fn(() =>
    Promise.resolve("https://mocked-image-url.com/image.jpg")
  ),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: "mockedEventId" })),
  serverTimestamp: jest.fn(() => "mocked-timestamp"),
}));

describe("useEventForm", () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useEventForm(mockOnSuccess));
    expect(result.current.formData.title).toBe("");
    expect(result.current.imageFile).toBe(null);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBe(null);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() => useEventForm(mockOnSuccess));
    act(() => {
      result.current.handleChange({
        target: { name: "title", value: "New Event", type: "text" },
      });
    });
    expect(result.current.formData.title).toBe("New Event");
  });

  it("should update checkbox values correctly", () => {
    const { result } = renderHook(() => useEventForm(mockOnSuccess));
    act(() => {
      result.current.handleChange({
        target: { name: "acceptsRSVP", checked: true, type: "checkbox" },
      });
    });
    expect(result.current.formData.acceptsRSVP).toBe(true);
  });

  it("should update imageFile on handleFileChange", () => {
    const { result } = renderHook(() => useEventForm(mockOnSuccess));
    const file = new File(["image"], "event.png", { type: "image/png" });
    act(() => {
      result.current.handleFileChange({ target: { files: [file] } });
    });
    expect(result.current.imageFile).toBe(file);
  });

  it("should handle Firestore errors gracefully", async () => {
    addDoc.mockRejectedValueOnce(new Error("Firestore error"));
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleChange({
        target: { name: "title", value: "Failing Event", type: "text" },
      });
    });

    await act(async () => {
      await result.current.handleSubmit(
        { preventDefault: jest.fn() },
        "user123"
      );
    });

    expect(result.current.submitError).toMatch(/Failed to create event/i);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should reset form on resetForm", () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleChange({
        target: { name: "title", value: "Event", type: "text" },
      });
      result.current.handleFileChange({
        target: { files: [new File([], "a.png")] },
      });
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.title).toBe("");
    expect(result.current.imageFile).toBe(null);
    expect(result.current.submitError).toBe(null);
  });
});
