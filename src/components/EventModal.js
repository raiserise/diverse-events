// src/components/EventModal.js
import React from "react";

const EventModal = ({
  isOpen,
  onClose,
  modalTitle,
  formData,
  onChange,
  onFileChange,
  onSubmit,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] overflow-y-auto max-h-full">
        <h2 className="text-lg font-bold mb-4">{modalTitle}</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              ></textarea>
            </div>
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category (comma-separated) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                id="category"
                value={formData.category}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                id="duration"
                value={formData.duration}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Language */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Language <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="language"
                id="language"
                value={formData.language}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Accepts RSVP */}
            <div className="col-span-2 flex items-center">
              <input
                type="checkbox"
                name="acceptsRSVP"
                id="acceptsRSVP"
                checked={formData.acceptsRSVP}
                onChange={onChange}
                className="mr-2"
              />
              <label htmlFor="acceptsRSVP" className="text-sm font-medium text-gray-700">
                Accepts RSVP
              </label>
            </div>
            {/* File Upload for Featured Image */}
            <div className="col-span-2">
              <label htmlFor="featuredImageFile" className="block text-sm font-medium text-gray-700">
                Upload Featured Image (optional)
              </label>
              <input
                type="file"
                name="featuredImageFile"
                id="featuredImageFile"
                accept="image/*"
                onChange={onFileChange}
                className="mt-1 block w-full"
              />
            </div>
            {/* Max Participants */}
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                Max Participants <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxParticipants"
                id="maxParticipants"
                value={formData.maxParticipants}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Privacy */}
            <div>
              <label htmlFor="privacy" className="block text-sm font-medium text-gray-700">
                Privacy <span className="text-red-500">*</span>
              </label>
              <select
                name="privacy"
                id="privacy"
                value={formData.privacy}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            {/* Format */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                Format <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="format"
                id="format"
                value={formData.format}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* Terms */}
            <div className="col-span-2">
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                Terms & Conditions <span className="text-red-500">*</span>
              </label>
              <textarea
                name="terms"
                id="terms"
                rows={3}
                value={formData.terms}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              ></textarea>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit
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

export default EventModal;
