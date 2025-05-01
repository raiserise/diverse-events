import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Notifications from "../../../pages/notification/Notifications";
import { BrowserRouter } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import notificationService from "../../../services/NotificationService";

// Mock user context
jest.mock("../../../context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock notification service
jest.mock("../../../services/NotificationService", () => ({
  subscribe: jest.fn(),
  unsubscribeObserver: jest.fn(),
  startListening: jest.fn(),
  stopListening: jest.fn(),
}));

describe("Notifications", () => {
  const mockUser = { uid: "user123" };

  const mockNotifications = [
    {
      id: "1",
      type: "event_invite",
      message: "You are invited!",
      read: false,
      createdAt: { _seconds: Math.floor(Date.now() / 1000) },
      relatedEventId: "abc",
    },
    {
      id: "2",
      type: "rsvp_approved",
      message: "Your RSVP has been approved!",
      read: true,
      createdAt: { _seconds: Math.floor(Date.now() / 1000) - 5000 },
      relatedEventId: "def",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });

    // Simulate onSnapshot pushing notifications after component mounts
    notificationService.subscribe.mockImplementation((callback) => {
      setTimeout(() => {
        callback(mockNotifications);
      }, 0); // mimic async behavior
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>
    );

  it("renders loading initially, then displays notifications", async () => {
    renderComponent();

    // Initially shows loading
    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument();

    // Wait for notifications to load
    await waitFor(() =>
      expect(
        screen.queryByText(/loading notifications/i)
      ).not.toBeInTheDocument()
    );

    // Shows notifications
    expect(screen.getByText(/you are invited!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/your rsvp has been approved!/i)
    ).toBeInTheDocument();
  });

  it("filters unread notifications when clicking UNREAD tab", async () => {
    renderComponent();

    await waitFor(() =>
      expect(
        screen.queryByText(/loading notifications/i)
      ).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/📬 unread/i));

    // Should only show unread
    expect(screen.getByText(/you are invited!/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/your rsvp has been approved!/i)
    ).not.toBeInTheDocument();
  });

  it("filters only invites when clicking INVITES tab", async () => {
    renderComponent();

    await waitFor(() =>
      expect(
        screen.queryByText(/loading notifications/i)
      ).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/📨 invites/i));

    expect(screen.getByText(/you are invited!/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/your rsvp has been approved!/i)
    ).not.toBeInTheDocument();
  });

  it("shows empty state when there are no notifications in selected tab", async () => {
    notificationService.subscribe.mockImplementation((callback) => {
      setTimeout(() => {
        callback([]); // empty list
      }, 0);
    });

    renderComponent();

    await waitFor(() =>
      expect(
        screen.queryByText(/loading notifications/i)
      ).not.toBeInTheDocument()
    );

    expect(screen.getByText(/no notifications available/i)).toBeInTheDocument();
  });
});
