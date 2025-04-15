import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

export function useUserEvents(userId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("organizers", "array-contains", userId));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const eventsList = [];
        querySnapshot.forEach((doc) => {
          eventsList.push({ id: doc.id, ...doc.data() });
        });
        setEvents(eventsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error with real-time updates:", err);
        setError("Failed to fetch your events.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { events, loading, error };
}