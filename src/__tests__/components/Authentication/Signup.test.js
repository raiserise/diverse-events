// npm test -- src/__tests__/components/Authentication/Signup.test.js
// src/__tests__/components/Authentication/Signup.test.js
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import Signup from '../../../pages/signup/Signup';
import { useAuth } from '../../../context/AuthProvider';
import { MemoryRouter } from 'react-router-dom';

// --- 1) stub out your own firebase.js BEFORE anything else imports it ---
jest.mock('../../../firebase', () => ({
  // we only need `db` for setDoc(...)
  db: {},
}));

// --- 2) mock react-router hooks & components ---
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

// --- 3) mock your AuthProvider hook ---
jest.mock('../../../context/AuthProvider');

// --- 4) mock firebase/auth & firebase/firestore APIs ---
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

// --- 5) mock secure-compare and toastify so no real comparisons/toasts happen ---
jest.mock('secure-compare', () => jest.fn());
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn() },
}));

// now import the things that we’ll inspect
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import compare from 'secure-compare';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

describe('Signup page', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: null });
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('redirects to /dashboard if already signed in', () => {
    useAuth.mockReturnValue({ currentUser: { uid: 'u1' } });
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('shows validation error if displayName is empty', async () => {
    compare.mockReturnValue(true);
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    // fill only email + passwords
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'pw' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'pw' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(
      await screen.findByText(/Display name is required/i)
    ).toBeInTheDocument();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('shows error if passwords do not match', async () => {
    compare.mockReturnValue(false);
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Display Name/i), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'one' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'two' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('signs up with email and navigates on success', async () => {
    compare.mockReturnValue(true);
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u2', email: 'a@b.com' },
    });
    setDoc.mockResolvedValue();

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Display Name/i), {
      target: { value: 'Bob' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: 'pw' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'pw' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        getAuth(),
        'a@b.com',
        'pw'
      );
      expect(setDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'users', 'u2'),
        expect.objectContaining({ name: 'Bob', email: 'a@b.com' })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Account created successfully'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error when email signup fails', async () => {
    compare.mockReturnValue(true);
    const err = new Error('Bad things');
    createUserWithEmailAndPassword.mockRejectedValue(err);

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Display Name/i), {
      target: { value: 'Bob' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'x@y.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText(/Bad things/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('signs up with Google and navigates on success', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: 'g1', email: 'g@u', displayName: 'G User' },
    });
    setDoc.mockResolvedValue();

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(
        getAuth(),
        expect.any(GoogleAuthProvider)
      );
      expect(setDoc).toHaveBeenCalledWith(
        doc(expect.anything(), 'users', 'g1'),
        expect.objectContaining({ name: 'G User', email: 'g@u' })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Account created successfully'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error when Google signup fails', async () => {
    signInWithPopup.mockRejectedValue(new Error('Nope'));

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Google/i }));

    expect(
      await screen.findByText(/Failed to sign up with Google/i)
    ).toBeInTheDocument();
    // the Google button should be re-enabled
    expect(screen.getByRole('button', { name: /Google/i })).not.toBeDisabled();
  });
});
