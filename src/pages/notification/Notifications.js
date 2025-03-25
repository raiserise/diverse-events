import React, { useState, useEffect } from "react";
import { getAllData, patchData } from "../../api/apiService"; // Assuming you have these utility functions

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Fetch all notifications (not just user-specific)
      const data = await getAllData("/notifications"); // Pass false because no authentication is required
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch notifications when component mounts
  }, []);

  // Function to mark a notification as read
  const handleNotificationClick = async (notificationId) => {
    try {
      // Send a request to mark the notification as read
      await patchData(
        `/notifications/${notificationId}/read`,
        notificationId,
        {}
      );
      // Optimistically update UI
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="notifications-container">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification.id)}
            style={{
              backgroundColor: notification.read ? "#ddd" : "#fff",
              padding: "10px",
              margin: "10px 0",
              cursor: "pointer",
              borderRadius: "5px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h4>{notification.type}</h4>
            <p>{notification.message}</p>
            <small>
                {new Date(notification.createdAt._seconds * 1000).toLocaleDateString()}
            </small>
            {/* Converting Firestore timestamp to a readable date */}
          </div>
        ))
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
