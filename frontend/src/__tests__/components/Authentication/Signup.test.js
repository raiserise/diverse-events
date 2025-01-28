import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "../../../pages/signup/Signup";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, setDoc } from "firebase/firestore";

// Mock Firebase
const mockAuth = { currentUser: null };

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => mockAuth),
  GoogleAuthProvider: jest.fn(() => ({ providerId: "google.com" })),
  signInWithPopup: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})), // Mocked Firestore object
  setDoc: jest.fn(),
  doc: jest.fn(),
}));

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "12345", email: "test@example.com" },
    });
    signInWithPopup.mockResolvedValue({
      user: {
        uid: "12345",
        email: "test@example.com",
        displayName: "Test User",
      },
    });
  });

  test("renders the signup form", () => {
    render(<Signup />);

    expect(
      screen.getByPlaceholderText("Enter your display name")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm your password")
    ).toBeInTheDocument();
    expect(screen.getByText("Sign Up with Email")).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    render(<Signup />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Confirm your password"),
      "password321"
    );

    fireEvent.click(screen.getByText("Sign Up with Email"));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  test("signs up with email and password", async () => {
    render(<Signup />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your display name"),
      "Test User"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Confirm your password"),
      "password123"
    );

    fireEvent.click(screen.getByText("Sign Up with Email"));

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      undefined,
      "test@example.com",
      "password123"
    );
  });
});
