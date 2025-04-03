import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllData, patchData } from "../../api/apiService";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate(); 

  const fetchNotifications = async () => {
    try {
      const data = await getAllData("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      await patchData(`/notifications/${notification.id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );

      if (notification.relatedEventId) {
        navigate(`/events/${notification.relatedEventId}`);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (activeTab) {
      case "unread":
        return !notification.read;
      case "invites":
        return notification.type === "event_invite";
      case "rsvp":
        return ["rsvp_received", "rsvp_confirmation"].includes(notification.type);
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="notifications-container">
      <div className="tabs">
        {["all", "unread", "invites", "rsvp"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredNotifications.length > 0 ? (
        filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`notification-item ${notification.read ? "read" : ""}`}
          >
            <h4>{notification.type.replace(/_/g, " ")}</h4>
            <p>{notification.message}</p>
            <small>
              {new Date(notification.createdAt._seconds * 1000).toLocaleDateString()}
            </small>
          </div>
        ))
      ) : (
        <p className="no-notifications">No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
