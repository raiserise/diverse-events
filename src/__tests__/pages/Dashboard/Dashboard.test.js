/* eslint-disable react/display-name */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "../../../pages/dashboard/Dashboard";
import * as apiService from "../../../api/apiService";

// Mock the FirebaseImage component to avoid actual image loading
jest.mock("../../../components/FirebaseImage", () => ({ path, alt }) => (
  <img src={path} alt={alt} data-testid="firebase-image" />
));

// Mock Notifications component (not used directly in test but for coverage)
jest.mock("../../../pages/notification/Notifications", () => () => (
  <div>Mock Notifications</div>
));

describe("DashboardPage", () => {
  const mockEvents = [
    {
      id: "1",
      title: "Test Event 1",
      startDate: { _seconds: Math.floor(Date.now() / 1000 + 86400) },
      featuredImage: "path/to/image1.jpg",
      description: "Description 1",
      location: "Location 1",
      category: "Category A",
    },
    {
      id: "2",
      title: "Test Event 2",
      startDate: { _seconds: Math.floor(Date.now() / 1000 + 172800) },
      featuredImage: "path/to/image2.jpg",
      description: "Description 2",
      location: "Location 2",
      category: "Category B",
    },
  ];

  it("renders loading spinner initially", () => {
    jest.spyOn(apiService, "getAllData").mockReturnValue(new Promise(() => {}));
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders error state when API fails", async () => {
    jest
      .spyOn(apiService, "getAllData")
      .mockRejectedValue(new Error("API Error"));
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Error loading events")).toBeInTheDocument();
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });

  it("renders stats and upcoming events on success", async () => {
    jest.spyOn(apiService, "getAllData").mockResolvedValue(mockEvents);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("Total Events").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Upcoming Events").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Your RSVPs").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Test Event 1").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Test Event 2").length).toBeGreaterThan(0);
    });

    const images = screen.getAllByTestId("firebase-image");
    expect(images.length).toBe(2);
  });

  it("renders fallback when there are no upcoming events", async () => {
    const noDescriptionEvent = {
      id: "1",
      title: "No Desc Event",
      startDate: { _seconds: Math.floor(Date.now() / 1000 + 86400) },
      description: "",
      featuredImage: "fake.jpg",
      location: "Nowhere",
      category: "Empty",
    };

    jest
      .spyOn(apiService, "getAllData")
      .mockResolvedValue([noDescriptionEvent]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    const message = await screen.findByTestId("no-events-message");
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent("No description available");
  });
});
