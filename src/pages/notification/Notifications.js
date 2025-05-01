import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { patchData } from "../../api/apiService";
import notificationService from "../../services/NotificationService";
import { useAuth } from "../../context/AuthProvider";

const typeIcons = {
  event_invite: "📩",
  rsvp_received: "📬",
  rsvp_pending: "⏳",
  rsvp_approved: "✅",
  rsvp_cancelled: "❌",
  rsvp_rejected: "🚫",
  default: "🔔",
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const handleDataChange = (data) => {
      setNotifications(data);
      setLoading(false);
    };

    notificationService.subscribe(handleDataChange);
    notificationService.startListening(user.uid);

    return () => {
      notificationService.unsubscribeObserver(handleDataChange);
      notificationService.stopListening();
    };
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      await patchData(`/notifications/${notification.id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );

      const rsvpTypes = [
        "rsvp_received",
        "rsvp_pending",
        "rsvp_approved",
        "rsvp_rejected",
        "rsvp_cancelled",
      ];

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

  const filteredNotifications = notifications
    .filter((notification) => {
      switch (activeTab) {
        case "unread":
          return !notification.read;
        case "invites":
          return ["event_invite", "event_cancelled"].includes(
            notification.type
          );
        case "rsvp":
          return [
            "rsvp_received",
            "rsvp_pending",
            "rsvp_approved",
            "rsvp_rejected",
            "rsvp_cancelled",
          ].includes(notification.type);
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const aTime =
        a.createdAt?.seconds ||
        a.createdAt?._seconds ||
        new Date(a.createdAt).getTime() / 1000;
      const bTime =
        b.createdAt?.seconds ||
        b.createdAt?._seconds ||
        new Date(b.createdAt).getTime() / 1000;
      return bTime - aTime;
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
        filteredNotifications.map((notification) => {
          const icon = typeIcons[notification.type] || typeIcons.default;
          const timestamp =
            notification.createdAt?.seconds ||
            notification.createdAt?._seconds ||
            new Date(notification.createdAt).getTime() / 1000;
          const date = new Date(timestamp * 1000);

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
                📅 {date.toLocaleDateString("en-GB")} 🕒{" "}
                {date.toLocaleTimeString()}
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
