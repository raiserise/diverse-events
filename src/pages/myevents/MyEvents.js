// src/pages/MyEvents.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function MyEvents() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    
        // Convert startDate and endDate from string to Date object
        const startDateTimestamp = formData.startDate ? new Date(formData.startDate) : null;
        const endDateTimestamp = formData.endDate ? new Date(formData.endDate) : null;
    
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
          startDate: startDateTimestamp,
          endDate: endDateTimestamp,
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
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Link
          to="/create-event"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </Link>
      </div>
      {!myEvents.length ? (
        <p className="text-center p-6">No events found</p>
      ) : (
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
      )}
      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 transition"
      >
        +
      </button>
      {/* Modal */}
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
    </div>
  );
}

export default MyEvents;
