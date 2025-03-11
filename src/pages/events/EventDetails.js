import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDataById, addData } from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRSVP, setIsRSVP] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes <button class="citation-flag" data-index="6">
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [auth]);

  // Fetch event data with authentication
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        let eventData;

        // Attempt to fetch with authentication
        try {
          eventData = await getDataById("/events", id, true); // Require auth
        } catch (err) {
          if (err.message.includes("Not authorized")) {
            // If unauthorized, attempt without authentication
            eventData = await getDataById("/events", id, false);
          } else {
            throw err; // Re-throw unexpected errors
          }
        }

        if (!eventData) {
          setError("Event not found.");
          return;
        }

        setEvent(eventData);

        // Fetch organizers if available
        if (eventData.organizers?.length) {
          const orgs = await Promise.all(
            eventData.organizers.map(
              (orgId) => getDataById("/users", orgId, true) // Keep auth for user data
            )
          );
          setOrganizers(orgs);
        }
      } catch (err) {
        setError("Error loading event details");
      } finally {
        setLoading(false);
      }
    };

    const checkRSVP = async () => {
      try {
        // Use existing getDataById method <button class="citation-flag" data-index="2">
        const response = await getDataById("/rsvp/check", id, true);
        setIsRSVP(response.exists); // Matches your backend response
        console.log("RSVP check successful:", response);
      } catch (error) {
        console.error("RSVP check failed:", error);
      }
    };

    fetchEvent();

    if (user) checkRSVP();
  }, [user, id]);

  // Handle RSVP submission
  const handleRSVP = async () => {
    if (!event) return;

    try {
      setSubmitting(true);
      await addData(
        "/rsvp",
        {
          eventId: event.id,
          dietaryRequirements: "", // Add form field if needed
          // Include inviteId if applicable
        },
        true
      ); // Requires authentication

      setIsRSVP(true);
      toast.success("RSVP successful!");
    } catch (error) {
      toast.error("RSVP failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse bg-white shadow-lg rounded-lg">
          <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
          <div className="space-y-4 p-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-gray-300 rounded"></div>
              <div className="h-48 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );

  if (!event)
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-gray-500">No event found</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Featured Image */}
      {event.featuredImage ? (
        <FirebaseImage
          path={event.featuredImage}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      ) : (
        <p className="text-gray-500">No image available</p>
      )}

      {/* Event Title & Status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 rounded-lg text-white ${
              event.status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {event.status.toUpperCase()}
          </span>
          {event.acceptsRSVP && (
            <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              RSVP Available
            </span>
          )}
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Event Overview
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Description:</strong>{" "}
              {event.description}
            </p>
            <p>
              <strong className="text-gray-900">Privacy:</strong>{" "}
              {event.privacy.charAt(0).toUpperCase() + event.privacy.slice(1)}
            </p>
            {event.terms && (
              <p>
                <strong className="text-gray-900">Terms:</strong> {event.terms}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Event Details
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Category:</strong>{" "}
              {Array.isArray(event.category)
                ? event.category.map((cat, index) => (
                    <span
                      key={index}
                      className="bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2 mb-2 inline-block"
                    >
                      {cat}
                    </span>
                  ))
                : "No categories"}
            </p>
            <p>
              <strong className="text-gray-900">Event Type:</strong>{" "}
              {event.format}
            </p>
            <p>
              <strong className="text-gray-900">Language:</strong>{" "}
              {event.language}
            </p>
            <p>
              <strong className="text-gray-900">Max Participants:</strong>{" "}
              {event.maxParticipants}
            </p>
          </div>
        </div>
      </div>

      {/* Date & Participation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Schedule</h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Start Date:</strong>{" "}
              {event.startDate?._seconds
                ? new Date(event.startDate._seconds * 1000).toLocaleString(
                    "en-US",
                    {
                      timeZone: "Asia/Shanghai",
                      dateStyle: "medium",
                      timeStyle: "medium",
                    }
                  )
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-900">Duration:</strong>{" "}
              {event.duration} hour(s)
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Participation
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">RSVP Status:</strong>{" "}
              {event.acceptsRSVP ? "Open" : "Closed"}
            </p>
            <p>
              <strong className="text-gray-900">Participant Count:</strong>{" "}
              {event.participants?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Organizer & Participant Info */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Organizers</h3>
        <div className="flex flex-wrap gap-4">
          {organizers.map((org) => (
            <div key={org.id} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                {org.avatar ? (
                  <FirebaseImage
                    path={org.avatar}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">{org.name?.[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{org.name || "Unknown Organizer"}</p>
                {org.contact && (
                  <p className="text-sm text-gray-600">{org.contact}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participants Section */}
      {event.participants?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Participants ({event.participants.length})
          </h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {event.participants.map((participantId) => (
              <li
                key={participantId}
                className="bg-gray-100 p-4 rounded-lg text-center"
              >
                <p className="font-medium">User {participantId.slice(0, 6)}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* RSVP Section */}
      {event.acceptsRSVP && (
        <div className="fixed md:relative bottom-0 left-0 right-0 md:mb-8 bg-white md:bg-transparent p-4 md:p-0">
          {/* Organizer Check */}
          {organizers.some((org) => org.id === user?.uid) ? (
            <p className="text-yellow-600 text-center py-3">
              Organizers cannot RSVP to their own events
            </p>
          ) : (
            <button
              onClick={handleRSVP}
              disabled={submitting || isRSVP}
              className={`w-full px-6 py-3 rounded-lg transition duration-200 ${
                isRSVP
                  ? "bg-green-500 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting
                ? "Submitting..."
                : isRSVP
                  ? "RSVP Confirmed"
                  : "RSVP Now"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EventDetails;
