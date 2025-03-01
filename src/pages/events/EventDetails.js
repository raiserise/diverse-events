// EventDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p>{error}</p>;
  if (!event) return <p>No event found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <p>
        <strong>Description:</strong> {event.description}
      </p>
      <p>
        <strong>Duration:</strong> {event.duration}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {event.startDate && event.startDate.seconds
          ? new Date(event.startDate.seconds * 1000).toLocaleString()
          : event.startDate}
      </p>
      <p>
        <strong>Status:</strong> {event.status}
      </p>
      <p>
        <strong>Max Participants:</strong> {event.maxParticipants}
      </p>
    </div>
  );
}

export default EventDetails;
