// src/pages/Events.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GetEventLogic from "../../Logic/EventsLogic/GetEventLogic";
import FirebaseImage from "../../components/FirebaseImage";
import { useAuth } from "../../context/AuthProvider";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function Events() {
  // Use 'user' from your AuthProvider
  const { user } = useAuth();

  const {
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
  } = GetEventLogic();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for the new event (including status)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "", // comma-separated, e.g., "Sports, Entertainment"
    location: "",
    startDate: "",
    endDate: "",
    duration: "",
    language: "",
    acceptsRSVP: false,
    featuredImage: "",
    maxParticipants: "",
    privacy: "public",
    format: "",
    terms: "",
    status: "active", // new dropdown field with default "active"
  });

  // Handle changes for all input fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission and add a new event document to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error("No user is logged in!");
      toast.error("You must be logged in to create an event.");
      return;
    }

    // Prepare new event data with additional fields:
    // - Use default image if none provided.
    // - Add invitedUsers and participants as empty arrays.
    // - Include status field.
    const newEventData = {
      ...formData,
      category: formData.category.split(",").map((cat) => cat.trim()),
      featuredImage: formData.featuredImage ? formData.featuredImage : DEFAULT_IMAGE,
      organizers: [user.uid],
      creatorId: user.uid,
      invitedUsers: [],
      participants: [],
    };

    const db = getFirestore();

    try {
      const docRef = await addDoc(collection(db, "events"), {
        ...newEventData,
        createdAt: serverTimestamp(),
      });
      console.log("Document written with ID:", docRef.id);

      toast.success("Event created successfully!", {
        autoClose: 1500,
        onClose: () => window.location.reload(),
      });
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Error creating event. Please try again.");
    }
  };

  // Update the filtered events whenever events, filters, or search query changes.
  useEffect(() => {
    const currentFilter = searchParams.get("filter") || "total";
    let filtered = [];

    if (currentFilter === "total") {
      filtered = events;
    } else if (currentFilter === "private") {
      filtered = privateEvent;
    } else if (currentFilter === "public") {
      filtered = publicEvent;
    } else if (currentFilter === "offline") {
      filtered = offlineEvent;
    } else if (currentFilter === "online") {
      filtered = onlineEvent;
    }

    const results = filtered.filter((event) =>
      (event.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredEvents(results);
  }, [
    events,
    privateEvent,
    publicEvent,
    offlineEvent,
    onlineEvent,
    searchParams,
    searchQuery,
  ]);

  return (
    <>
      {/* Search and filter bar */}
      <div className="w-full px-6 my-4 bg-neutral-200 flex items-center justify-between rounded-[18px]">
        <input
          type="text"
          placeholder="Search by title"
          className="w-full bg-transparent py-4 outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          defaultValue={filter}
          onChange={(e) => setSearchParams({ filter: e.target.value })}
          className="w-max bg-transparent py-4 pl-4 outline-none border-l border-neutral-300"
        >
          <option value="total">Total</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center py-4">Loading...</p>
      ) : (
        <div>
          {error && <p>{error}</p>}

          {/* Events Grid: display all filtered events in rows of 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-1 border border-gray-200 rounded-sm flex flex-col items-center"
                >
                  <Link to={`/events/${event.id}`} className="mb-2">
                    <FirebaseImage
                      path={event.featuredImage || DEFAULT_IMAGE}
                      alt={event.title}
                      className="w-full max-h-48 object-contain"
                    />
                  </Link>
                  <Link
                    to={`/events/${event.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    <span className="font-bold">{event.title}</span>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-neutral-500">No events found</p>
            )}
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 transition"
      >
        +
      </button>

      {/* Modal with Input Fields */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] overflow-y-auto max-h-full">
            <h2 className="text-lg font-bold mb-4">Add New Event</h2>
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  rows="3"
                  required
                ></textarea>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category (comma-separated) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Location */}
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Start Date */}
              <div className="mb-4">
                <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* End Date */}
              <div className="mb-4">
                <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label htmlFor="duration" className="block text-sm font-medium mb-1">
                  Duration (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Language */}
              <div className="mb-4">
                <label htmlFor="language" className="block text-sm font-medium mb-1">
                  Language <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Accepts RSVP (Optional) */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="acceptsRSVP"
                  name="acceptsRSVP"
                  checked={formData.acceptsRSVP}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="acceptsRSVP" className="text-sm font-medium">
                  Accepts RSVP
                </label>
              </div>

              {/* Featured Image URL (Optional) */}
              <div className="mb-4">
                <label htmlFor="featuredImage" className="block text-sm font-medium mb-1">
                  Featured Image URL (optional)
                </label>
                <input
                  type="text"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>

              {/* Max Participants */}
              <div className="mb-4">
                <label htmlFor="maxParticipants" className="block text-sm font-medium mb-1">
                  Max Participants <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Privacy */}
              <div className="mb-4">
                <label htmlFor="privacy" className="block text-sm font-medium mb-1">
                  Privacy <span className="text-red-500">*</span>
                </label>
                <select
                  id="privacy"
                  name="privacy"
                  value={formData.privacy}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Format */}
              <div className="mb-4">
                <label htmlFor="format" className="block text-sm font-medium mb-1">
                  Format <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              {/* Status (New Dropdown Field) */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Terms */}
              <div className="mb-4">
                <label htmlFor="terms" className="block text-sm font-medium mb-1">
                  Terms & Conditions <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="terms"
                  name="terms"
                  value={formData.terms}
                  onChange={handleChange}
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
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Events;
