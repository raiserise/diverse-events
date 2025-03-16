// src/pages/events/EventDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDataById, addData } from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, updateDoc, doc, serverTimestamp } from "firebase/firestore";

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

  // State for the edit modal and its form data
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch event data with authentication
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        let eventData;
        try {
          eventData = await getDataById("/events", id, true);
        } catch (err) {
          if (err.message.includes("Not authorized")) {
            eventData = await getDataById("/events", id, false);
          } else {
            throw err;
          }
        }
        if (!eventData) {
          setError("Event not found.");
          return;
        }
        // Inject the event ID into the event object
        setEvent({ id, ...eventData });
        // Fetch organizers if available
        if (eventData.organizers?.length) {
          const orgs = await Promise.all(
            eventData.organizers.map((orgId) => getDataById("/users", orgId, true))
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
        const response = await getDataById("/rsvp/check", id, true);
        setIsRSVP(response.exists);
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
          dietaryRequirements: "",
        },
        true
      );
      setIsRSVP(true);
      toast.success("RSVP successful!");
    } catch (error) {
      toast.error("RSVP failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

// Handler for showing the edit modal (populates edit form data)
const handleEditClick = () => {
  setEditFormData({
    title: event.title || "",
    description: event.description || "",
    category: Array.isArray(event.category) ? event.category.join(", ") : "",
    location: event.location || "",
    startDate:
      event.startDate && event.startDate._seconds
        ? new Date(event.startDate._seconds * 1000).toISOString().slice(0, 16)
        : "",
    endDate:
      event.endDate && event.endDate._seconds
        ? new Date(event.endDate._seconds * 1000).toISOString().slice(0, 16)
        : "",
    duration: event.duration || "",
    language: event.language || "",
    acceptsRSVP: event.acceptsRSVP || false,
    featuredImage: event.featuredImage || "",
    maxParticipants: event.maxParticipants || "",
    privacy: event.privacy || "public",
    format: event.format || "",
    terms: event.terms || "",
    status: event.status || "active",
  });
  setIsEditModalOpen(true);
};

  // Handler for changes in the edit form
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

// Handler for submitting the edit form
const handleEditSubmit = async (e) => {
  e.preventDefault();
  if (!user) {
    toast.error("You must be logged in to edit an event.");
    return;
  }
  // Convert the datetime-local strings to Date objects
  const updatedStartDate = editFormData.startDate ? new Date(editFormData.startDate) : null;
  const updatedEndDate = editFormData.endDate ? new Date(editFormData.endDate) : null;

  // Prepare updated data (convert category to array)
  const updatedData = {
    ...editFormData,
    category: editFormData.category.split(",").map((cat) => cat.trim()),
    updatedAt: serverTimestamp(),
    startDate: updatedStartDate,
    endDate: updatedEndDate,
  };

  const db = getFirestore();
  try {
    await updateDoc(doc(db, "events", event.id), updatedData);
    toast.success("Event updated successfully!");
    setIsEditModalOpen(false);
    // Refresh the event data (or page)
    window.location.reload();
  } catch (error) {
    console.error("Error updating event:", error);
    toast.error("Error updating event. Please try again.");
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
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg relative">
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
                ? new Date(event.startDate._seconds * 1000).toLocaleString("en-US", {
                    timeZone: "Asia/Shanghai",
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })
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
          {organizers.some((org) => org.id === user?.uid) ? (
            <p className="text-yellow-600 text-center py-3">
              Organizers cannot RSVP to their own events
            </p>
          ) : (
            <button
              onClick={handleRSVP}
              disabled={submitting || isRSVP}
              className={`w-full px-6 py-3 rounded-lg transition duration-200 ${
                isRSVP ? "bg-green-500 cursor-default" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Submitting..." : isRSVP ? "RSVP Confirmed" : "RSVP Now"}
            </button>
          )}
        </div>
      )}

      {/* Edit Button for Organizers - now positioned at bottom right */}
      {organizers.some((org) => org.id === user?.uid) && (
        <button
          onClick={handleEditClick}
          className="fixed bottom-6 right-6 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg flex items-center justify-center hover:bg-orange-600 transition"
        >
          Edit Event
        </button>
      )}

      {/* Edit Modal for Organizers */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] overflow-y-auto max-h-full">
            <h2 className="text-lg font-bold mb-4">Edit Event</h2>
            {editFormData && (
              <form onSubmit={handleEditSubmit}>
                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="editTitle" className="block text-sm font-medium mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="editDescription" className="block text-sm font-medium mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="editDescription"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label htmlFor="editCategory" className="block text-sm font-medium mb-1">
                    Category (comma-separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editCategory"
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Location */}
                <div className="mb-4">
                  <label htmlFor="editLocation" className="block text-sm font-medium mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editLocation"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Start Date */}
                <div className="mb-4">
                  <label htmlFor="editStartDate" className="block text-sm font-medium mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="editStartDate"
                    name="startDate"
                    value={editFormData.startDate}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="mb-4">
                  <label htmlFor="editEndDate" className="block text-sm font-medium mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="editEndDate"
                    name="endDate"
                    value={editFormData.endDate}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label htmlFor="editDuration" className="block text-sm font-medium mb-1">
                    Duration (hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editDuration"
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Language */}
                <div className="mb-4">
                  <label htmlFor="editLanguage" className="block text-sm font-medium mb-1">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editLanguage"
                    name="language"
                    value={editFormData.language}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Accepts RSVP */}
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    id="editAcceptsRSVP"
                    name="acceptsRSVP"
                    checked={editFormData.acceptsRSVP}
                    onChange={handleEditChange}
                    className="mr-2"
                  />
                  <label htmlFor="editAcceptsRSVP" className="text-sm font-medium">
                    Accepts RSVP
                  </label>
                </div>

                {/* Featured Image URL */}
                <div className="mb-4">
                  <label htmlFor="editFeaturedImage" className="block text-sm font-medium mb-1">
                    Featured Image URL (optional)
                  </label>
                  <input
                    type="text"
                    id="editFeaturedImage"
                    name="featuredImage"
                    value={editFormData.featuredImage}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                  />
                </div>

                {/* Max Participants */}
                <div className="mb-4">
                  <label htmlFor="editMaxParticipants" className="block text-sm font-medium mb-1">
                    Max Participants <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="editMaxParticipants"
                    name="maxParticipants"
                    value={editFormData.maxParticipants}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Privacy */}
                <div className="mb-4">
                  <label htmlFor="editPrivacy" className="block text-sm font-medium mb-1">
                    Privacy <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="editPrivacy"
                    name="privacy"
                    value={editFormData.privacy}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Format */}
                <div className="mb-4">
                  <label htmlFor="editFormat" className="block text-sm font-medium mb-1">
                    Format <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editFormat"
                    name="format"
                    value={editFormData.format}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>

                {/* Status */}
                <div className="mb-4">
                  <label htmlFor="editStatus" className="block text-sm font-medium mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="editStatus"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Terms */}
                <div className="mb-4">
                  <label htmlFor="editTerms" className="block text-sm font-medium mb-1">
                    Terms & Conditions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="editTerms"
                    name="terms"
                    value={editFormData.terms}
                    onChange={handleEditChange}
                    className="w-full border rounded p-2"
                    rows="3"
                    required
                  ></textarea>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;
