// GetEventLogic.js
import { useState, useEffect, useMemo } from "react";
// import { db } from "../../firebase.js";
// import { collection, getDocs } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { getAllData } from "../../api/apiService";

function GetEventLogic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get the current filter from URL search params (default to "total")
  const filter = searchParams.get("filter") || "total";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getAllData("/events", true); // Does not require authentication
        setEvents(eventsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Compute filtered arrays using useMemo for better performance and cleaner code
  const privateEvent = useMemo(
    () => events.filter((event) => event.privacy === "private"),
    [events]
  );
  const publicEvent = useMemo(
    () => events.filter((event) => event.privacy === "public"),
    [events]
  );
  const offlineEvent = useMemo(
    () => events.filter((event) => event.medium === "offline"),
    [events]
  );
  const onlineEvent = useMemo(
    () => events.filter((event) => event.medium === "online"),
    [events]
  );

  return {
    loading,
    error,
    events,
    privateEvent,
    publicEvent,
    offlineEvent,
    onlineEvent,
    filter,
    searchParams,
    setSearchParams,
  };
}

export default GetEventLogic;
