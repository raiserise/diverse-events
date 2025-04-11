import React from "react";
import { render, waitFor } from "@testing-library/react";
import DashboardPage from "../../../pages/dashboard/Dashboard";

// Mock the axios module
jest.mock("axios");

// Mock react-router-dom's useNavigate
const mockUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockUsedNavigate,
}));

// Optional: Mock API service (if used)
jest.mock("../../../api/apiService", () => ({
  getAllData: jest.fn(() => Promise.resolve([])),
}));

test("renders DashboardPage", async () => {
  render(<DashboardPage />);

  // wait for any pending useEffect or state updates to settle
  await waitFor(() => {});
});
