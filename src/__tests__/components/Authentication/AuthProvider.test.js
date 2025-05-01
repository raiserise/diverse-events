// npm test -- src/__tests__/components/Authentication/AuthProvider.test.js

import React from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../../context/AuthProvider";

// Simple test component to access context
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? "user-set" : "no-user"}</div>
      <button onClick={() => login({ id: "1" })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthProvider minimal tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with no user", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId("user")).toHaveTextContent("no-user");
  });

  it("login sets user and updates localStorage", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText("Login").click();
    });

    expect(await screen.findByTestId("user")).toHaveTextContent("user-set");
    expect(JSON.parse(localStorage.getItem("user"))).toEqual({ id: "1" });
  });
});
