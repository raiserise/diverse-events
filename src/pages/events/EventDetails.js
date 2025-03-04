import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDataById } from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getDataById("/events", id, false);
        setEvent(eventData);

        // Fetch organizer names if organizers exist
        if (eventData.organizers?.length) {
          const organizerData = await Promise.all(
            eventData.organizers.map((organizerId) =>
              getDataById("/users", organizerId, false)
            )
          );
          setOrganizers(organizerData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading)
    return (
      <p className="text-center text-gray-500">Loading event details...</p>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!event)
    return <p className="text-center text-gray-500">No event found.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Featured Image using FirebaseImage */}
      {event.featuredImage ? (
        <FirebaseImage
          path={event.featuredImage}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      ) : (
        <p className="text-gray-500">No image available</p>
      )}

      {/* Event Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div>
          <p>
            <strong className="text-gray-900">Description:</strong>{" "}
            {event.description}
          </p>
          <p>
            <strong className="text-gray-900">Category:</strong>{" "}
            {event.category}
          </p>
          <p>
            <strong className="text-gray-900">Medium:</strong> {event.medium}
          </p>
          <p>
            <strong className="text-gray-900">Language:</strong>{" "}
            {event.language}
          </p>
        </div>

        <div>
          <p>
            <strong className="text-gray-900">Start Date:</strong>{" "}
            {event.startDate?.seconds
              ? new Date(event.startDate.seconds * 1000).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong className="text-gray-900">End Date:</strong>{" "}
            {event.endDate?.seconds
              ? new Date(event.endDate.seconds * 1000).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong className="text-gray-900">Duration:</strong>{" "}
            {event.duration} hours
          </p>
          <p>
            <strong className="text-gray-900">Max Participants:</strong>{" "}
            {event.maxParticipants}
          </p>
        </div>
      </div>

      {/* Organizer Info */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800">Organizers</h2>
        <ul>
          {organizers.length > 0 ? (
            organizers.map((org) => (
              <li key={org.id} className="text-gray-700">
                {org.name || "Unknown Organizer"}
              </li>
            ))
          ) : (
            <p className="text-gray-700">No organizers listed</p>
          )}
        </ul>
      </div>

      {/* Location Info */}
      {event.location && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Location</h2>
          <p className="text-gray-700">{event.location.name}</p>
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-6">
        <span
          className={`px-4 py-2 rounded-lg text-white ${
            event.status === "active" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {event.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default EventDetails;
