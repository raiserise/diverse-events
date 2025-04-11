// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./pages/layout/Layout";
import Landing from "./pages/landing/Landing";
import Dashboard from "./pages/dashboard/Dashboard";
import EventsPage from "./pages/events/Events";
import MyEvents from "./pages/myevents/MyEvents";
import EventDetails from "./pages/events/EventDetails";
import Invites from "./pages/invite/Invites";
import RSVP from "./pages/rsvp/RSVP";
import Notifications from "./pages/notification/Notifications";
import Profile from "./pages/profile/Profile";

import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./pages/users/Users";

import "react-toastify/dist/ReactToastify.css"; // Toastify CSS
import CustomToast from "./components/CustomToast"; // Custom Toast Component

const App = () => {
  const protectedRoutes = [
    { path: "/dashboard", title: "Dashboard", element: <Dashboard /> },
    { path: "/events", title: "Events", element: <EventsPage /> },
    { path: "/myevents", title: "My Events", element: <MyEvents /> },
    { path: "/events/:id", title: "Event Details", element: <EventDetails /> },
    { path: "/invites", title: "Invites", element: <Invites /> },
    { path: "/rsvp", title: "RSVP", element: <RSVP /> },
    { path: "/profile", title: "Profile", element: <Profile /> },
    {
      path: "/notifications",
      title: "Notifications",
      element: <Notifications />,
    },
    { path: "/users", title: "User Management", element: <Users /> },
  ];

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          {protectedRoutes.map(({ path, title, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Layout title={title}>{element}</Layout>
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </Router>
      {/* Toast Notifications */}
      <CustomToast />
    </div>
  );
};

export default App;
