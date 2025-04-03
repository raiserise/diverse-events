import React from "react";

const EditEventsDetailModal = ({
  isEditModalOpen,
  setIsEditModalOpen,
  editFormData,
  handleEditSubmit,
  handleEditChange,
  handleEditFileChange,
}) => {
  if (!isEditModalOpen) return null; // Prevents rendering if the modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] overflow-y-auto max-h-full">
        <h2 className="text-lg font-bold mb-4">Edit Event</h2>
        {editFormData && (
          <form onSubmit={handleEditSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label
                htmlFor="editTitle"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editDescription"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editCategory"
                className="block text-sm font-medium mb-1"
              >
                Category (comma-separated){" "}
                <span className="text-red-500">*</span>
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
              <label
                htmlFor="editLocation"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editStartDate"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editEndDate"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editDuration"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editLanguage"
                className="block text-sm font-medium mb-1"
              >
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

            {/* Upload Featured Image */}
            <div className="mb-4">
              <label
                htmlFor="editFeaturedImageFile"
                className="block text-sm font-medium mb-1"
              >
                Upload New Featured Image (optional)
              </label>
              <input
                type="file"
                id="editFeaturedImageFile"
                accept="image/*"
                onChange={handleEditFileChange}
                className="w-full"
              />
            </div>

            {/* Max Participants */}
            <div className="mb-4">
              <label
                htmlFor="editMaxParticipants"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editPrivacy"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editFormat"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editStatus"
                className="block text-sm font-medium mb-1"
              >
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
              <label
                htmlFor="editTerms"
                className="block text-sm font-medium mb-1"
              >
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
  );
};

export default EditEventsDetailModal;
