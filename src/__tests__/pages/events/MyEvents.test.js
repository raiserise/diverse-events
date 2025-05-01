// src/pages/events/__tests__/MyEvents.test.js
/* eslint-disable react/display-name */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MyEvents from "../../../pages/myevents/MyEvents";
import * as AuthProvider from "../../../context/AuthProvider";
import * as useUserEventsHook from "../../../hooks/useUserEvents";
import * as useEventFormHook from "../../../hooks/useEventForm";

// Mocks
jest.mock("../../../components/EventCard", () => ({ event }) => (
  <div data-testid="event-card">{event.title}</div>
));

jest.mock(
  "../../../components/EventsFilter",
  () =>
    ({ onSearchChange, onFormatChange }) => (
      <div>
        <button onClick={() => onSearchChange("React")}>Search: React</button>
        <button onClick={() => onFormatChange("Online")}>Filter: Online</button>
      </div>
    )
);

jest.mock(
  "../../../components/EventModal",
  () =>
    ({ isOpen }) =>
      isOpen ? <div data-testid="event-modal">Modal Open</div> : null
);

describe("MyEvents component", () => {
  beforeEach(() => {
    jest.spyOn(AuthProvider, "useAuth").mockReturnValue({
      user: { uid: "test-user-id" },
    });

    jest.spyOn(useEventFormHook, "useEventForm").mockReturnValue({
      formData: {},
      handleChange: jest.fn(),
      handleFileChange: jest.fn(),
      handleSubmit: jest.fn(),
      isSubmitting: false,
      submitError: null,
    });
  });

  it("displays event cards after successful fetch and transformation", async () => {
    jest.spyOn(useUserEventsHook, "useUserEvents").mockReturnValue({
      events: [
        {
          id: "1",
          title: "React Workshop",
          format: "Online",
          category: "Tech",
          startDate: { _seconds: 1730505600 }, // Mock Firestore Timestamp
          endDate: { _seconds: 1730512800 },
          featuredImage: "img.jpg",
          location: "Zoom",
          inviteLink: "https://zoom.com/meet",
        },
      ],
      loading: false,
      error: null,
    });

    render(<MyEvents />);

    await waitFor(() => {
      expect(screen.getByTestId("event-card")).toHaveTextContent(
        "React Workshop"
      );
    });
  });

  it("shows loading state", () => {
    jest.spyOn(useUserEventsHook, "useUserEvents").mockReturnValue({
      events: [],
      loading: true,
      error: null,
    });

    render(<MyEvents />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("shows error message on fetch failure", () => {
    jest.spyOn(useUserEventsHook, "useUserEvents").mockReturnValue({
      events: [],
      loading: false,
      error: "Failed to fetch events",
    });

    render(<MyEvents />);
    expect(screen.getByText(/Failed to fetch events/i)).toBeInTheDocument();
  });

  it("filters events by title and format", async () => {
    jest.spyOn(useUserEventsHook, "useUserEvents").mockReturnValue({
      events: [
        {
          id: "1",
          title: "React Workshop",
          format: "Online",
          startDate: "2025-05-01",
          endDate: "2025-05-01",
        },
        {
          id: "2",
          title: "Vue Meetup",
          format: "Offline",
          startDate: "2025-05-01",
          endDate: "2025-05-01",
        },
      ],
      loading: false,
      error: null,
    });

    render(<MyEvents />);

    await waitFor(() => {
      expect(screen.getAllByTestId("event-card")).toHaveLength(2);
    });

    fireEvent.click(screen.getByText("Search: React"));
    fireEvent.click(screen.getByText("Filter: Online"));

    await waitFor(() => {
      const cards = screen.getAllByTestId("event-card");
      expect(cards).toHaveLength(1);
      expect(cards[0]).toHaveTextContent("React Workshop");
    });
  });

  it("opens the event modal on button click", () => {
    jest.spyOn(useUserEventsHook, "useUserEvents").mockReturnValue({
      events: [],
      loading: false,
      error: null,
    });

    render(<MyEvents />);
    fireEvent.click(screen.getByText("Create Event"));
    expect(screen.getByTestId("event-modal")).toBeInTheDocument();
  });
});
