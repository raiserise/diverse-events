// npm test -- src/__tests__/components/ProtectedRoute.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../../components/ProtectedRoute';

// 1️⃣ Mock firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// 2️⃣ Mock react-router’s Navigate so we can assert on it
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    Navigate: ({ to }) => <div>Redirected to {to}</div>,
  };
});

import { onAuthStateChanged } from 'firebase/auth';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading initially', () => {
    // don’t invoke callback yet
    onAuthStateChanged.mockImplementation(() => () => {});
    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders children when user is authenticated', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      // simulate callback with a user object
      cb({ uid: 'user1' });
      return () => {};
    });

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Content')).toBeInTheDocument();
    });
  });

  it('redirects to /login when not authenticated', async () => {
    onAuthStateChanged.mockImplementation((auth, cb) => {
      // simulate callback with null (no user)
      cb(null);
      return () => {};
    });

    render(
      <ProtectedRoute>
        <div>Won’t see this</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Redirected to /login')).toBeInTheDocument();
    });
  });
});
