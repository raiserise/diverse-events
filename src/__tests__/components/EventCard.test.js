// npm test -- src/__tests__/components/EventCard.test.js
/* eslint-disable react/display-name */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock FirebaseImage before importing EventCard
jest.mock("../../components/FirebaseImage", () => (props) => (
  <img
    data-testid="firebase-image"
    src={props.path}
    alt={props.alt}
    className={props.className}
  />
));

// Now import the component under test
import EventCard from "../../components/EventCard";

describe("EventCard", () => {
  const DEFAULT_IMAGE =
    "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

  test("renders with string date and default image", () => {
    const event = {
      id: "1",
      title: "My Event",
      // no featuredImage provided → should fall back to DEFAULT_IMAGE
      startDate: "2025-04-25",
      location: "Singapore",
      category: "Tech",
    };

    render(
      <MemoryRouter>
        <EventCard event={event} />
      </MemoryRouter>
    );

    // Link to correct URL
    const link = screen.getByRole("link", { name: /My Event/i });
    expect(link).toHaveAttribute("href", "/events/1");

    // Title
    expect(screen.getByText("My Event")).toBeInTheDocument();

    // Image fallback
    const img = screen.getByTestId("firebase-image");
    expect(img).toHaveAttribute("src", DEFAULT_IMAGE);
    expect(img).toHaveAttribute("alt", "My Event");

    // Date displayed exactly the string
    expect(screen.getByText("2025-04-25")).toBeInTheDocument();

    // Location and category
    expect(screen.getByText("Singapore")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
  });

  test("renders with Firestore timestamp and provided image", () => {
    // Stub toLocaleString for predictability
    const mockString = "Apr 25, 2025, 10:00 AM";
    const original = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = () => mockString;

    const ts = { _seconds: 1714000800 }; // corresponds to some date
    const event = {
      id: "2",
      title: "Timestamped Event",
      featuredImage: "https://example.com/img.jpg",
      startDate: ts,
      location: { name: "Virtual" },
      category: "Webinar",
    };

    render(
      <MemoryRouter>
        <EventCard event={event} />
      </MemoryRouter>
    );

    // Link
    expect(
      screen.getByRole("link", { name: /Timestamped Event/i })
    ).toHaveAttribute("href", "/events/2");

    // Image uses provided URL
    const img = screen.getByTestId("firebase-image");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
    expect(img).toHaveAttribute("alt", "Timestamped Event");

    // Date from stubbed toLocaleString
    expect(screen.getByText(mockString)).toBeInTheDocument();

    // Object location branch
    expect(screen.getByText("Virtual")).toBeInTheDocument();

    // Category
    expect(screen.getByText("Webinar")).toBeInTheDocument();

    // Restore original
    Date.prototype.toLocaleString = original;
  });
});
