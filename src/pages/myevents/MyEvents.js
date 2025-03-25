// src/pages/MyEvents.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import FirebaseImage from "../../components/FirebaseImage";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function MyEvents() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyEvents = async () => {
      try {
        const db = getFirestore();
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("organizers", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const eventsList = [];
        querySnapshot.forEach((doc) => {
          eventsList.push({ id: doc.id, ...doc.data() });
        });
        setMyEvents(eventsList);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to fetch your events.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;
  if (!myEvents.length)
    return <p className="text-center p-6">No events found</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">My Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {myEvents.map((event) => (
          <div key={event.id} className="border border-gray-200 rounded p-2">
            <Link to={`/events/${event.id}`}>
              <FirebaseImage
                path={event.featuredImage || DEFAULT_IMAGE}
                alt={event.title}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h2 className="font-bold text-lg">{event.title}</h2>
              {event.startDate && event.startDate._seconds && (
                <p className="text-sm text-gray-500">
                  Start Date:{" "}
                  {new Date(event.startDate._seconds * 1000).toLocaleString("en-US", {
                    timeZone: "Asia/Shanghai",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyEvents;
