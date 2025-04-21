import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllData, patchData } from "../../api/apiService";

const typeIcons = {
  event_invite: "📩",
  rsvp_received: "📬",
  rsvp_confirmation: "✅",
  default: "🔔",
};

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
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );

      const rsvpTypes = ["rsvp_received", "rsvp_confirmation", "rsvp_update"];
      if (
        rsvpTypes.includes(notification.type) &&
        notification.relatedEventId
      ) {
        navigate(`/rsvp`);
      } else if (notification.relatedEventId) {
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
        return ["rsvp_received", "rsvp_confirmation", "rsvp_update"].includes(
          notification.type
        );
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        ⏳ Loading notifications...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex justify-center gap-2 mb-6">
        {["all", "unread", "invites", "rsvp"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab === "all" && "🧾 ALL"}
            {tab === "unread" && "📬 UNREAD"}
            {tab === "invites" && "📨 INVITES"}
            {tab === "rsvp" && "🎟️ RSVP"}
          </button>
        ))}
      </div>

      {filteredNotifications.length > 0 ? (
        filteredNotifications
          .sort((a, b) => b.createdAt._seconds - a.createdAt._seconds)
          .map((notification) => {
            const icon = typeIcons[notification.type] || typeIcons.default;
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer p-4 mb-4 rounded-md border transition duration-200 shadow-sm hover:shadow-md ${
                  notification.read
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-blue-400"
                }`}
              >
                <h4 className="text-lg font-semibold capitalize text-gray-800 mb-1 flex items-center gap-2">
                  <span>{icon}</span>
                  {notification.type.replace(/_/g, " ")}
                </h4>
                <p className="text-gray-600">{notification.message}</p>
                <small className="text-gray-500 block mt-2">
                  📅{" "}
                  {new Date(
                    notification.createdAt._seconds * 1000
                  ).toLocaleDateString()}{" "}
                  🕒{" "}
                  {new Date(
                    notification.createdAt._seconds * 1000
                  ).toLocaleTimeString()}{" "}
                </small>
              </div>
            );
          })
      ) : (
        <p className="text-center text-gray-500 text-lg">
          🔕 No notifications available.
        </p>
      )}
    </div>
  );
};

export default Notifications;
