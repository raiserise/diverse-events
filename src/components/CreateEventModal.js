import React, { useState } from "react";
import { toast } from "react-toastify";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const CreateEventModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    endDate: "",
    duration: "",
    language: "English",
    acceptsRSVP: false,
    featuredImage: "",
    maxParticipants: "",
    privacy: "public",
    format: "Physical",
    terms: "",
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create an event.");
      return;
    }

    const db = getFirestore();
    const newEventData = {
      ...formData,
      category: formData.category.split(",").map((cat) => cat.trim()), // Convert category to array
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      maxParticipants: parseInt(formData.maxParticipants, 10) || 0,
      organizers: [user.uid],
      creatorId: user.uid,
      invitedUsers: [],
      participants: [],
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "events"), newEventData);
      toast.success("Event created successfully!");
      onClose(); // Close the modal after successful submission
    } catch (error) {
      toast.error("Error creating event. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] overflow-y-auto max-h-full">
        <h2 className="text-lg font-bold mb-4">Create New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category (comma-separated)
              </label>
              <input
                type="text"
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="datetime-local"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (hours)
              </label>
              <input
                type="text"
                name="duration"
                id="duration"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <input
                type="text"
                name="language"
                id="language"
                value={formData.language}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Accepts RSVP */}
            <div className="col-span-2 flex items-center">
              <input
                type="checkbox"
                name="acceptsRSVP"
                id="acceptsRSVP"
                checked={formData.acceptsRSVP}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="acceptsRSVP" className="text-sm font-medium text-gray-700">
                Accepts RSVP
              </label>
            </div>

            {/* Featured Image */}
            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700">
                Featured Image URL
              </label>
              <input
                type="text"
                name="featuredImage"
                id="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Max Participants */}
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                id="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Privacy */}
            <div>
              <label htmlFor="privacy" className="block text-sm font-medium text-gray-700">
                Privacy
              </label>
              <select
                name="privacy"
                id="privacy"
                value={formData.privacy}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                Format
              </label>
              <input
                type="text"
                name="format"
                id="format"
                value={formData.format}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            {/* Terms */}
            <div className="col-span-2">
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                Terms & Conditions
              </label>
              <textarea
                id="terms"
                name="terms"
                rows={3}
                value={formData.terms}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;