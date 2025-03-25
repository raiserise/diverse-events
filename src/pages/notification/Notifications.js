import React, { useState, useEffect } from "react";
import { getAllData, patchData } from "../../api/apiService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleNotificationClick = async (notificationId) => {
    try {
      await patchData(`/notifications/${notificationId}/read`, {}); 
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
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
          </div>
        ))
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
  );
};

export default Notifications;
