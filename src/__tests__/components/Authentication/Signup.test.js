import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom"; // Import MemoryRouter
import Signup from "../../../pages/signup/Signup";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

// Mock Firebase functions
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
}));

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Mock resolved values
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { user_id: "12345", email: "test@example.com" },
    });

    signInWithPopup.mockResolvedValue({
      user: {
        user_id: "12345",
        email: "test@example.com",
        displayName: "Test User",
      },
    });
  });

  test("renders the signup form", () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

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
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

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
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

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
