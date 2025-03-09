// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./pages/layout/Layout";
import Landing from "./pages/landing/Landing.js";
import Dashboard from "./pages/dashboard/Dashboard.js";
import EventsPage from "./pages/events/Events";
import EventDetails from "./pages/events/EventDetails";
import Invites from "./pages/invite/Invites";
import RSVP from "./pages/rsvp/RSVP";
import Notifications from "./pages/notification/Notifications";
import Profile from "./pages/profile/Profile";

import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./pages/users/Users";
import "react-toastify/dist/ReactToastify.css";
import CustomToast from "./components/CustomToast";

const App = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout title={"Dashboard"}>
                  <Dashboard />
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
            path="/events/:id"
            element={
              <ProtectedRoute>
                <Layout title={"Event Details"}>
                  <EventDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invites"
            element={
              <ProtectedRoute>
                <Layout title={"Invites"}>
                  <Invites />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rsvp"
            element={
              <ProtectedRoute>
                <Layout title={"RSVP"}>
                  <RSVP />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout title={"Profile"}>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout title={"Notifications"}>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Layout title={"User Management"}>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
      <CustomToast />
    </div>
  );
};

export default App;
