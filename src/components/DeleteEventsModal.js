import React from "react";

const DeleteEventModal = ({ isOpen, onClose, onDelete, eventTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[450px] max-w-full text-left">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Are you sure you want to delete this event?
        </h2>
        <p className="text-gray-600 mb-2">This action will:</p>
        <ul className="list-disc list-inside text-gray-600 ml-2 mb-3">
          <li>
            Remove <strong>{eventTitle}</strong> from everyone&apos;s view
          </li>
          <li>Delete all associated RSVPs</li>
          <li>Notify RSVP&apos;d users that the event was cancelled</li>
        </ul>
        <p className="text-red-600 font-medium mb-4">This cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            No, Keep Event
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Yes, Delete Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;
