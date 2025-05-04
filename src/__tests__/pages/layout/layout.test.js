// npm test src/__tests__/pages/layout/layout.test.js
/* eslint-disable react/display-name */
import React from "react";
import { render, screen } from "@testing-library/react";
import Layout from "../../../pages/layout/Layout";

// Mock the SideBar and NavBar components
jest.mock("../../../components/SideBar", () => () => (
  <nav data-testid="sidebar">Sidebar</nav>
));
jest.mock("../../../components/NavBar", () => ({ pageTitle }) => (
  <header data-testid="navbar">{pageTitle}</header>
));

describe("Layout", () => {
  it("renders sidebar and navbar", () => {
    render(
      <Layout title="Dashboard">
        <main>Page Content</main>
      </Layout>
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toHaveTextContent("Dashboard");
  });

  it("renders children content", () => {
    render(
      <Layout title="Test Page">
        <main>Test Content</main>
      </Layout>
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
