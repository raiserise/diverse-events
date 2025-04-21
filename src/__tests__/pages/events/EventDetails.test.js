// // src/__tests__/pages/events/EventDetails.test.js
// import React from "react";
// import { render, screen, waitFor, fireEvent } from "@testing-library/react";
// import { MemoryRouter, Route, Routes } from "react-router-dom";
// import EventDetails from "../../../pages/events/EventDetails";

// // ----- MOCK DEPENDENCIES ----- //

// // Mock API service functions from "../../api/apiService"
// jest.mock("../../../api/apiService", () => ({
//   getDataById: jest.fn(),
//   addData: jest.fn(),
//   patchData: jest.fn(),
//   getAllData: jest.fn(),
// }));
// import { getDataById, addData, patchData, getAllData } from "../../../api/apiService";

// // Mock FirebaseImage: render an <img> with predictable attributes.
// jest.mock("../../../components/FirebaseImage", () => {
//   return ({ path, alt, className }) => (
//     <img src={path} alt={alt} className={className} data-testid="firebase-image" />
//   );
// });

// // Mock EventModal and CustomModal with test IDs.
// jest.mock("../../../components/EventModal", () => {
//   return ({ isOpen, modalTitle }) =>
//     isOpen ? <div data-testid="event-modal">{modalTitle}</div> : null;
// });
// jest.mock("../../../components/CustomModal", () => {
//   return ({ isOpen, children }) => (isOpen ? <div data-testid="custom-modal">{children}</div> : null);
// });

// // Mock react-toastify's toast methods.
// jest.mock("react-toastify", () => ({
//   toast: {
//     success: jest.fn(),
//     error: jest.fn(),
//   },
// }));

// // --- FIX: Mock Firebase Auth properly --- //
// // Ensure that onAuthStateChanged returns a dummy unsubscribe function.
// jest.mock("firebase/auth", () => ({
//     getAuth: jest.fn(),
//     onAuthStateChanged: jest.fn((auth, callback) => {
//       callback({ uid: "user1" }); // Simulate a logged-in user
//       return jest.fn(); // <--- THIS is the missing unsubscribe mock
//     }),
//   }));

// // ----- SAMPLE DATA ----- //

// const sampleEvent = {
//   id: "1",
//   title: "Test Event",
//   description: "This is a test event.",
//   privacy: "public",
//   terms: "Test terms",
//   featuredImage: "test-image.jpg",
//   startDate: { _seconds: 1650000000 },
//   endDate: { _seconds: 1650003600 },
//   maxParticipants: 100,
//   participants: ["user1", "user2"],
//   organizers: ["user-organizer"],
//   format: "Online",
//   inviteLink: "www.example.com/invite",
//   acceptsRSVP: true,
// };

// const sampleOrganizer = { id: "user-organizer", name: "Organizer Name", avatar: "organizer-avatar.jpg" };
// const sampleParticipant1 = { id: "user1", name: "Participant One" };
// const sampleParticipant2 = { id: "user2", name: "Participant Two" };

// // For RSVP check: a response indicating no RSVP exists.
// const sampleRSVPCheck = { exists: false };

// // ----- TEST SUITE ----- //

// describe("EventDetails Component", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("shows loading state initially", () => {
//     // Arrange: simulate getDataById never resolving so that loading remains true.
//     getDataById.mockImplementation(() => new Promise(() => {}));

//     render(
//       <MemoryRouter initialEntries={["/events/1"]}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // Assert: check that an element with class "animate-pulse" (the skeleton loader) is present.
//     expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
//   });

//   test("renders error message if event not found", async () => {
//     // Arrange: first call for event returns null.
//     getDataById.mockResolvedValueOnce(null);

//     render(
//       <MemoryRouter initialEntries={["/events/1"]}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // Wait for error message.
//     await waitFor(() =>
//       expect(screen.getByText(/Event not found\./i)).toBeInTheDocument()
//     );
//   });

//   test("renders event details when event is fetched", async () => {
//     // Arrange:
//     // 1. Fetch event details.
//     getDataById.mockResolvedValueOnce(sampleEvent);
//     // 2. Fetch organizer details.
//     getDataById.mockResolvedValueOnce({ ...sampleOrganizer });
//     // 3. Fetch participant details.
//     getDataById.mockResolvedValueOnce({ ...sampleParticipant1 });
//     getDataById.mockResolvedValueOnce({ ...sampleParticipant2 });
//     // 4. RSVP check.
//     getDataById.mockResolvedValueOnce(sampleRSVPCheck);

//     render(
//       <MemoryRouter initialEntries={["/events/1"]}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // Wait for the event details to appear.
//     await waitFor(() =>
//       expect(
//         screen.getByText((content) => content.includes("Test Event"))
//       ).toBeInTheDocument()
//     );
//     // Check that the description is rendered.
//     expect(screen.getByText(/This is a test event\./i)).toBeInTheDocument();
//     // Verify that the featured image is rendered.
//     const img = screen.getByTestId("firebase-image");
//     expect(img).toHaveAttribute("src", "test-image.jpg");
//     // Check that the RSVP button appears.
//     await waitFor(() =>
//       expect(screen.getByRole("button", { name: /RSVP Now/i })).toBeInTheDocument()
//     );
//   });

//   test("handles RSVP check and sets eligibility states", async () => {
//     // Arrange:
//     // 1. Fetch the event.
//     getDataById.mockResolvedValueOnce(sampleEvent);
//     // 2. Organizer details.
//     getDataById.mockResolvedValueOnce({ ...sampleOrganizer });
//     // 3. Participant details.
//     getDataById.mockResolvedValueOnce({ ...sampleParticipant1 });
//     getDataById.mockResolvedValueOnce({ ...sampleParticipant2 });
//     // 4. For RSVP check: simulate RSVP exists with status "cancelled" and a timestamp 10 minutes ago.
//     const fakeTimestamp = { _seconds: Math.floor((Date.now() - 10 * 60 * 1000) / 1000) };
//     getDataById.mockResolvedValueOnce({
//       exists: true,
//       rsvpId: "rsvp123",
//       status: "cancelled",
//       lastCancelledAt: fakeTimestamp,
//     });

//     render(
//       <MemoryRouter initialEntries={["/events/1"]}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // Wait for the event details to load.
//     await waitFor(() =>
//       expect(
//         screen.getByText((content) => content.includes("Test Event"))
//       ).toBeInTheDocument()
//     );

//     // Check that the RSVP button displays eligibility or cooldown text.
//     const rsvpButton = screen.getByRole("button");
//     expect(rsvpButton.textContent).toMatch(/RSVP Now|RSVP Confirmed|You can RSVP again/i);
//   });

//   test("allows editing when edit modal is triggered by organizer", async () => {
//     // Arrange: simulate that the current user (uid: "user1") is among the organizers.
//     const eventAsOrganizer = { ...sampleEvent, organizers: ["user1"] };
//     getDataById.mockResolvedValueOnce(eventAsOrganizer);
//     // For organizer details: return user1 data.
//     getDataById.mockResolvedValueOnce({ id: "user1", name: "User One", avatar: null });
//     // For RSVP check: simulate no existing RSVP.
//     getDataById.mockResolvedValueOnce({ exists: false });

//     render(
//       <MemoryRouter initialEntries={["/events/1"]}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // "Edit Event" button should be visible.
//     const editButton = screen.getByRole("button", { name: /Edit Event/i });
//     expect(editButton).toBeInTheDocument();

//     // Click the edit button.
//     fireEvent.click(editButton);

//     // Wait for the edit modal to appear.
//     await waitFor(() => {
//       expect(screen.getByTestId("event-modal")).toBeInTheDocument();
//       expect(screen.getByTestId("event-modal")).toHaveTextContent("Edit Event");
//     });
//   });
// });
