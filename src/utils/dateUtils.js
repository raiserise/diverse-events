// utils/dateUtils.js

export const formatFirestoreDate = (timestamp) => {
  if (!timestamp) return "N/A";

  try {
    // Check if it's a Firestore Timestamp
    if (timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
      return date.toLocaleString("en-US", {
        timeZone: "Asia/Shanghai",
        dateStyle: "medium",
        timeStyle: "medium",
      });
    }
  } catch (error) {
    console.error("Date formatting error:", error);
    return "N/A";
  }
};

export const formatDate = (timestamp) => {
  return formatFirestoreDate(timestamp, false); // Only date, no time
};

export const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const timeString = formatFirestoreDate(timestamp, true);
    return timeString.split(", ")[1]; // Extract time part from formatted string
  } catch (error) {
    return "N/A";
  }
};
