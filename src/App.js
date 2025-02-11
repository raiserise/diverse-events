import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./pages/layout/Layout"; // Layout that includes Menu and Navbar
import EventsPage from "./pages/events/Events";
import MyEvents from "./pages/events/MyEvents";
import BrowseEvents from "./pages/events/BrowseEvents";
import DashboardPage from "./pages/dashboard/Dashboard";
import Login from "./pages/login/Login";
import UsersPage from "./pages/users/Users";
import Signup from "./pages/signup/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/profile/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout title={"Dashboard"}>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout title={"Events"}>
                <EventsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/browse-events"
          element={
            <ProtectedRoute>
              <Layout title={"Browse Events"}>
                <BrowseEvents />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/my-events"
          element={
            <ProtectedRoute>
              <Layout title={"My Events"}>
                <MyEvents />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout title={"User Management"}>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout title={"Events"}>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Add more routes if needed */}
      </Routes>
    </Router>
  );
};

export default App;
