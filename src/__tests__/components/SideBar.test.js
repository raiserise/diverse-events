// npm test -- src/__tests__/components/SideBar.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
// Mock firebase/auth 
jest.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  // return a real Promise so .then() works
  signOut: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  __esModule: true,
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const real = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...real,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useLocation: jest.fn(),
    useNavigate: () => mockNavigate,
  };
});


import SideBar from '../../components/SideBar';

describe('<SideBar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('handles the profileUpdated window event', async () => {
    const fakeUser = { uid: 'u3', displayName: '', email: 'e3@e.com' };
    onAuthStateChanged.mockImplementation((_, cb) => {
      cb(fakeUser);
      return () => {};
    });
    getDoc.mockResolvedValue({ exists: () => false });
    require('react-router-dom').useLocation.mockReturnValue({ pathname: '/dashboard' });

    render(<SideBar />);
    // wait for fallback email
    await screen.findByText('e3@e.com');

    act(() => {
      window.dispatchEvent(
        new CustomEvent('profileUpdated', { detail: { displayName: 'Bob' } })
      );
    });

    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
