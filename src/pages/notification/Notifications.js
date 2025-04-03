// // import React, { useState, useEffect } from "react";
// // import { getAllData, patchData } from "../../api/apiService";
// // import "./Notifications.css";

// // const Notifications = () => {
// //   const [notifications, setNotifications] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState("all"); // UPDATED: Added tab state

// //   const fetchNotifications = async () => {
// //     try {
// //       const data = await getAllData("/notifications");
// //       setNotifications(data);
// //     } catch (error) {
// //       console.error("Error fetching notifications:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchNotifications();
// //   }, []);

// //   const handleNotificationClick = async (notificationId) => {
// //     try {
// //       await patchData(`/notifications/${notificationId}/read`, {}); // UPDATED: Fixed API call
// //       setNotifications((prev) =>
// //         prev.map((notification) =>
// //           notification.id === notificationId ? { ...notification, read: true } : notification
// //         )
// //       );
// //     } catch (error) {
// //       console.error("Error marking notification as read:", error);
// //     }
// //   };

// //   // UPDATED: Added filtering logic based on active tab
// //   const filteredNotifications = notifications.filter((notification) => {
// //     switch (activeTab) {
// //       case "unread":
// //         return !notification.read;
// //       case "invites":
// //         return notification.type === "event_invite";
// //       case "rsvp":
// //         return ["rsvp_received", "rsvp_confirmation"].includes(notification.type);
// //       default:
// //         return true; // All notifications
// //     }
// //   });

// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }

// //   return (
// //     <div className="notifications-container">
// //       {/* UPDATED: Added tab buttons for filtering notifications */}
// //       <div className="tabs">
// //         {["all", "unread", "invites", "rsvp"].map((tab) => (
// //           <button
// //             key={tab}
// //             onClick={() => setActiveTab(tab)}
// //             className={activeTab === tab ? "active" : ""}
// //             style={{
// //               padding: "10px",
// //               margin: "5px",
// //               border: "none",
// //               cursor: "pointer",
// //               backgroundColor: activeTab === tab ? "#007BFF" : "#f0f0f0",
// //               color: activeTab === tab ? "#fff" : "#000",
// //               borderRadius: "5px",
// //             }}
// //           >
// //             {tab.toUpperCase()}
// //           </button>
// //         ))}
// //       </div>

// //       {/* UPDATED: Filtered notifications based on the selected tab */}
// //       {filteredNotifications.length > 0 ? (
// //         filteredNotifications.map((notification) => (
// //           <div
// //             key={notification.id}
// //             onClick={() => handleNotificationClick(notification.id)}
// //             style={{
// //               backgroundColor: notification.read ? "#ddd" : "#fff",
// //               padding: "10px",
// //               margin: "10px 0",
// //               cursor: "pointer",
// //               borderRadius: "5px",
// //               boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
// //             }}
// //           >
// //             <h4>{notification.type.replace(/_/g, " ")}</h4> {/* UPDATED: Formatting notification type */}
// //             <p>{notification.message}</p>
// //             <small>
// //               {new Date(notification.createdAt._seconds * 1000).toLocaleDateString()}
// //             </small>
// //           </div>
// //         ))
// //       ) : (
// //         <p>No notifications available.</p>
// //       )}
// //     </div>
// //   );
// // };

// // export default Notifications;

// import React, { useState, useEffect } from "react";
// import { getAllData, patchData } from "../../api/apiService";
// import "./Notifications.css";

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("all");

//   const fetchNotifications = async () => {
//     try {
//       const data = await getAllData("/notifications");
//       setNotifications(data);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const handleNotificationClick = async (notificationId) => {
//     try {
//       await patchData(`/notifications/${notificationId}/read`, {});
//       setNotifications((prev) =>
//         prev.map((notification) =>
//           notification.id === notificationId ? { ...notification, read: true } : notification
//         )
//       );
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   const filteredNotifications = notifications.filter((notification) => {
//     switch (activeTab) {
//       case "unread":
//         return !notification.read;
//       case "invites":
//         return notification.type === "event_invite";
//       case "rsvp":
//         return ["rsvp_received", "rsvp_confirmation"].includes(notification.type);
//       default:
//         return true;
//     }
//   });

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="notifications-container">
//       <div className="tabs">
//         {["all", "unread", "invites", "rsvp"].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={activeTab === tab ? "active" : ""}
//           >
//             {tab.toUpperCase()}
//           </button>
//         ))}
//       </div>

//       {filteredNotifications.length > 0 ? (
//         filteredNotifications.map((notification) => (
//           <div
//             key={notification.id}
//             onClick={() => handleNotificationClick(notification.id)}
//             className={`notification-item ${notification.read ? "read" : ""}`}
//           >
//             <h4>{notification.type.replace(/_/g, " ")}</h4>
//             <p>{notification.message}</p>
//             <small>
//               {new Date(notification.createdAt._seconds * 1000).toLocaleDateString()}
//             </small>
//           </div>
//         ))
//       ) : (
//         <p className="no-notifications">No notifications available.</p>
//       )}
//     </div>
//   );
// };

// export default Notifications;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { getAllData, patchData } from "../../api/apiService";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate(); // Hook for navigation

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

      // Navigate to event details page if relatedEventId exists
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
