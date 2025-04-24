// import React from 'react';
// import { render, screen, waitFor } from '@testing-library/react';
// import EventDetails from '../../../pages/events/EventDetails';
// import { MemoryRouter, Route, Routes } from 'react-router-dom';
// import * as api from '../../../api/apiService';

// jest.mock('../../../components/FirebaseImage', () => (props) => (
//   <img data-testid="firebase-img" alt={props.alt} />
// ));
// jest.mock('../../../components/EventModal', () => () => <div>Edit Modal</div>);
// jest.mock('../../../components/CustomModal', () => (props) =>
//   props.isOpen ? <div>Invite Modal</div> : null
// );
// jest.mock('../../../components/DeleteEventsModal', () => (props) =>
//   props.isOpen ? <div>Delete Modal</div> : null
// );

// // ✅ Fix onAuthStateChanged mock
// jest.mock('firebase/auth', () => {
//   return {
//     getAuth: jest.fn(() => ({})),
//     onAuthStateChanged: jest.fn((auth, callback) => {
//       callback({ uid: 'test-user' }); // simulate user login
//       return () => {}; // ✅ return unsubscribe function
//     }),
//   };
// });

// jest.mock('../../../api/apiService');

// describe('EventDetails', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('renders loading state initially', async () => {
//     render(
//       <MemoryRouter initialEntries={['/events/test-id']}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     // ✅ Fallback to class-based selector for skeleton UI
//     expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
//   });

//   it('displays event data after successful load', async () => {
//     api.getDataById.mockImplementation((endpoint) => {
//       if (endpoint === '/events') {
//         return Promise.resolve({
//           id: 'mock-id', // required
//           title: 'Mock Event',
//           description: 'An event for testing',
//           format: 'Online',
//           privacy: 'public',
//           category: ['Tech'],
//           startDate: { _seconds: 1730505600 },
//           endDate: { _seconds: 1730509200 },
//           organizers: ['test-user'],
//           participants: [],
//           acceptsRSVP: true,
//         });
//       }
//       if (endpoint === '/users') {
//         return Promise.resolve({ id: 'test-user', name: 'Test User' });
//       }
//       if (endpoint === '/rsvp/check') {
//         return Promise.resolve({ exists: false });
//       }
//     });

//     render(
//       <MemoryRouter initialEntries={['/events/test-id']}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByText('Mock Event')).toBeInTheDocument();
//       expect(screen.getByText(/RSVP Available/i)).toBeInTheDocument();
//     });
//   });

//   it('shows error message if event fails to load', async () => {
//     api.getDataById.mockImplementation((endpoint) => {
//       if (endpoint === '/events') {
//         throw new Error('Fetch failed');
//       }
//     });

//     render(
//       <MemoryRouter initialEntries={['/events/test-id']}>
//         <Routes>
//           <Route path="/events/:id" element={<EventDetails />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       expect(
//         screen.getByText(/Error loading event details/i)
//       ).toBeInTheDocument();
//     });
//   });
// });
