// src/pages/Events.test.js
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Events from "../../../pages/events/Events"; // adjust the import if needed
import { MemoryRouter } from "react-router-dom";

// Mock the custom hook GetEventLogic
jest.mock("../../../Logic/EventsLogic/GetEventLogic", () => jest.fn());

// Mock FirebaseImage so it just renders an <img>
jest.mock("../../../components/FirebaseImage", () => {
  return ({ path, alt, className }) => (
    <img src={path} alt={alt} className={className} data-testid="firebase-image" />
  );
});

// Import the mocked hook so we can set its return values:
import GetEventLogic from "../../../Logic/EventsLogic/GetEventLogic";

describe("Events Component", () => {
  beforeEach(() => {
    // Clear mock data between tests.
    GetEventLogic.mockClear();
  });

  test("renders loading message when loading is true", () => {
    // Arrange: Mock hook to return loading
    GetEventLogic.mockReturnValue({
      loading: true,
      error: null,
      events: [],
    });

    // Act: Render the component wrapped in MemoryRouter
    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    // Assert: The loading message is displayed.
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders error message when error is returned", () => {
    const errorMessage = "Failed to load events";
    GetEventLogic.mockReturnValue({
      loading: false,
      error: errorMessage,
      events: [],
    });

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    // The error text should be displayed by the EventGrid.
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("renders events when events are loaded", () => {
    const eventsData = [
      { id: "1", title: "Event One", format: "Online", featuredImage: "image1.jpg" },
      { id: "2", title: "Event Two", format: "Physical", featuredImage: "image2.jpg" },
      { id: "3", title: "Another Event", format: "Hybrid", featuredImage: "image3.jpg" },
    ];
    GetEventLogic.mockReturnValue({
      loading: false,
      error: null,
      events: eventsData,
    });

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    // Check that each event title is rendered via the EventCard (wrapped in a Link)
    expect(screen.getByText(/Event One/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Two/i)).toBeInTheDocument();
    expect(screen.getByText(/Another Event/i)).toBeInTheDocument();
  });

  test("filters events by title based on search query", () => {
    const eventsData = [
      { id: "1", title: "React Conference", format: "Online", featuredImage: "image1.jpg" },
      { id: "2", title: "Vue Conference", format: "Physical", featuredImage: "image2.jpg" },
    ];
    GetEventLogic.mockReturnValue({
      loading: false,
      error: null,
      events: eventsData,
    });

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    // Initially, both events should be visible.
    expect(screen.getByText(/React Conference/i)).toBeInTheDocument();
    expect(screen.getByText(/Vue Conference/i)).toBeInTheDocument();

    // Find the search input (by its placeholder text) and type "React"
    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: "React" } });

    // After filtering, only "React Conference" should be visible.
    expect(screen.getByText(/React Conference/i)).toBeInTheDocument();
    expect(screen.queryByText(/Vue Conference/i)).not.toBeInTheDocument();
  });

  test("filters events by format using select dropdown", () => {
    const eventsData = [
      { id: "1", title: "Event One", format: "Online", featuredImage: "image1.jpg" },
      { id: "2", title: "Event Two", format: "Physical", featuredImage: "image2.jpg" },
    ];
    GetEventLogic.mockReturnValue({
      loading: false,
      error: null,
      events: eventsData,
    });

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    // Both events are visible initially
    expect(screen.getByText(/Event One/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Two/i)).toBeInTheDocument();

    // Get the select element by its role and change value to "Online"
    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "Online" } });

    // Now, only the event with format "Online" should be visible.
    expect(screen.getByText(/Event One/i)).toBeInTheDocument();
    expect(screen.queryByText(/Event Two/i)).not.toBeInTheDocument();
  });

  test("displays 'No events found' when search/filter yields no results", () => {
    const eventsData = [
      { id: "1", title: "React Conference", format: "Online", featuredImage: "image1.jpg" },
      { id: "2", title: "Vue Conference", format: "Physical", featuredImage: "image2.jpg" },
    ];
    GetEventLogic.mockReturnValue({
      loading: false,
      error: null,
      events: eventsData,
    });

    render(
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    );

    // Enter a search query that does not match any event.
    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: "Angular" } });

    // Expect "No events found" message to appear.
    expect(screen.getByText(/No events found/i)).toBeInTheDocument();
  });
});
