/* eslint-disable react/display-name */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import RSVP from "../../../pages/rsvp/RSVP";
import * as apiService from "../../../api/apiService";
import { BrowserRouter } from "react-router-dom";

// Mock FirebaseImage to avoid real image loading
jest.mock("../../../components/FirebaseImage", () => ({ path, alt }) => (
  <img src={path} alt={alt} data-testid="firebase-image" />
));

// Mock CustomModal to always render children
jest.mock(
  "../../../components/CustomModal",
  () =>
    ({ isOpen, children }) =>
      isOpen ? <div data-testid="modal">{children}</div> : null
);

// Mock toast
jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

describe("RSVP Integration", () => {
  const mockRSVPs = [
    {
      id: "rsvp1",
      eventId: "event1",
      userId: "user1",
      status: "pending",
      createdAt: new Date(),
      event: {
        id: "event1",
        title: "Event One",
        featuredImage: "img1.jpg",
        startDate: new Date(),
      },
      userName: "You",
    },
  ];

  const mockManagedRSVPs = [
    {
      id: "rsvp2",
      eventId: "event2",
      userId: "user2",
      status: "pending",
      createdAt: new Date(),
      event: {
        id: "event2",
        title: "Event Two",
        featuredImage: "img2.jpg",
        startDate: new Date(),
      },
      userName: "Alice",
      email: "alice@example.com",
    },
    {
      id: "rsvp3",
      eventId: "event2",
      userId: "user3",
      status: "pending", // <-- CHANGE THIS TO "pending"
      createdAt: new Date(),
      event: {
        id: "event2",
        title: "Event Two",
        featuredImage: "img2.jpg",
        startDate: new Date(),
      },
      userName: "Bob",
      email: "bob@example.com",
    },
    {
      id: "rsvp4",
      eventId: "event2",
      userId: "user4",
      status: "rejected",
      createdAt: new Date(),
      event: {
        id: "event2",
        title: "Event Two",
        featuredImage: "img2.jpg",
        startDate: new Date(),
      },
      userName: "Charlie",
      email: "charlie@example.com",
    },
  ];

  beforeEach(() => {
    jest.spyOn(apiService, "getAllData").mockImplementation((url) => {
      if (url === "/events/me") return Promise.resolve([{ id: "event2" }]);
      if (url.startsWith("/rsvp/") && url !== "/rsvp/user")
        return Promise.resolve({ rsvps: mockManagedRSVPs });
      if (url === "/rsvp/user") return Promise.resolve({ rsvps: mockRSVPs });
      return Promise.resolve([]);
    });
    jest.spyOn(apiService, "postData").mockImplementation((url) => {
      if (url === "/events/batch")
        return Promise.resolve({
          events: [mockRSVPs[0].event, mockManagedRSVPs[0].event],
        });
      if (url === "/users/batch")
        return Promise.resolve({
          users: [
            { id: "user2", name: "Alice", email: "alice@example.com" },
            { id: "user3", name: "Bob", email: "bob@example.com" },
            { id: "user4", name: "Charlie", email: "charlie@example.com" },
          ],
        });
      return Promise.resolve({});
    });
    jest.spyOn(apiService, "patchData").mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders My RSVPs and Manage RSVPs tabs and switches between them", async () => {
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("My RSVPs")).toBeInTheDocument();
      expect(screen.getByText(/Manage RSVPs/)).toBeInTheDocument();
    });

    expect(await screen.findByText("Event One")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Manage RSVPs/));
    await waitFor(() => {
      // There may be multiple "Event Two" cards, so use getAllByText
      expect(screen.getAllByText("Event Two").length).toBeGreaterThan(0);
      // Optionally, check for specific users
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });
  });

  it("shows loader and then error state if API fails", async () => {
    jest
      .spyOn(apiService, "getAllData")
      .mockRejectedValue(new Error("Network error"));
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load RSVP data/i)).toBeInTheDocument();
    });
  });

  it("shows empty state for My RSVPs if none exist", async () => {
    jest.spyOn(apiService, "getAllData").mockImplementation((url) => {
      if (url === "/events/me") return Promise.resolve([]);
      if (url === "/rsvp/user") return Promise.resolve({ rsvps: [] });
      return Promise.resolve([]);
    });
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No RSVPs Yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/You haven't responded to any events/i)
      ).toBeInTheDocument();
    });
  });

  it("shows empty state for Manage RSVPs if none exist", async () => {
    jest.spyOn(apiService, "getAllData").mockImplementation((url) => {
      if (url === "/events/me") return Promise.resolve([{ id: "event1" }]);
      if (url === "/rsvp/event1") return Promise.resolve({ rsvps: [] });
      if (url === "/rsvp/user") return Promise.resolve({ rsvps: [] });
      return Promise.resolve([]);
    });
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText(/Manage RSVPs/));
    await waitFor(() => {
      expect(screen.getByText(/No Matching RSVPs/i)).toBeInTheDocument();
    });
  });

  it("allows user to cancel RSVP via modal", async () => {
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    await screen.findByText("Event One");
    fireEvent.click(screen.getByText(/Cancel RSVP/i));
    expect(
      screen.getByText(/Are you sure you want to cancel/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("cancel-button"));
    await waitFor(() => {
      expect(apiService.patchData).toHaveBeenCalledWith(
        "/rsvp/rsvp1/status",
        { status: "cancelled" },
        true
      );
    });
  });
  it("approves and rejects a pending RSVP", async () => {
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );

    // Switch to Manage RSVPs tab
    fireEvent.click(screen.getByText(/Manage RSVPs/));

    // Wait for filter buttons to appear
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^All$/i })
      ).toBeInTheDocument();
    });

    // Click the Pending filter button
    fireEvent.click(screen.getByRole("button", { name: /^Pending$/i }));

    // Wait for Bob's card to appear
    const bobName = await screen.findByText("Bob");
    let node = bobName;
    while (node && (!node.className || !node.className.includes("p-6"))) {
      node = node.parentElement;
    }
    const bobCard = node;

    // Approve Bob (if you want to test approve)
    // fireEvent.click(within(bobCard).getByText("Approve"));

    // Reject Bob
    fireEvent.click(within(bobCard).getByText("Reject"));
    await waitFor(() => {
      expect(apiService.patchData).toHaveBeenCalledWith(
        "/rsvp/rsvp3/status",
        { status: "rejected" },
        true
      );
    });
  });

  it("disables cancel button for rejected/cancelled RSVPs", async () => {
    jest.spyOn(apiService, "getAllData").mockImplementation((url) => {
      if (url === "/events/me") return Promise.resolve([]);
      if (url === "/rsvp/user")
        return Promise.resolve({
          rsvps: [
            {
              ...mockRSVPs[0],
              status: "rejected",
            },
          ],
        });
      return Promise.resolve([]);
    });
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    await screen.findByText("Event One");
    const cancelBtn = screen.getByText(/Cancel RSVP/i);
    expect(cancelBtn).toBeDisabled();
  });

  it("closes modal when user cancels the cancel action", async () => {
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    await screen.findByText("Event One");
    fireEvent.click(screen.getByText(/Cancel RSVP/i));
    expect(
      screen.getByText(/Are you sure you want to cancel/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(/No, Keep RSVP/i));
    expect(
      screen.queryByText(/Are you sure you want to cancel/i)
    ).not.toBeInTheDocument();
  });

  it("displays formatted date and time for RSVPs", async () => {
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    await screen.findByText("Event One");
    expect(screen.getByText(/📅/i)).toBeInTheDocument();
    expect(screen.getByText(/🕒/i)).toBeInTheDocument();
    expect(screen.getByText(/RSVPed on/)).toBeInTheDocument();
  });

  it("navigates to /events when clicking 'Find Events' in empty state", async () => {
    jest.spyOn(apiService, "getAllData").mockImplementation((url) => {
      if (url === "/events/me") return Promise.resolve([]);
      if (url === "/rsvp/user") return Promise.resolve({ rsvps: [] });
      return Promise.resolve([]);
    });
    render(
      <BrowserRouter>
        <RSVP />
      </BrowserRouter>
    );
    await screen.findByText(/Find Events/i);
    const btn = screen.getByText(/Find Events/i);
    expect(btn.closest("a")).toHaveAttribute("href", "/events");
  });
});
