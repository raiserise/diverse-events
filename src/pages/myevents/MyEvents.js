// src/pages/events/MyEvents.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import EventCard from "../../components/EventCard";
import EventModal from "../../components/EventModal";
import { useEventForm } from "../../hooks/useEventForm";
import { useUserEvents } from "../../hooks/useUserEvents";
import EventsFilter from "../../components/EventsFilter";

// Utility to normalize various timestamp types into JS Date
const normalizeEventDates = (event) => {
  let startDate = event.startDate;
  if (startDate && typeof startDate.toDate === 'function') {
    startDate = startDate.toDate();
  } else if (startDate && typeof startDate.seconds === 'number') {
    startDate = new Date(startDate.seconds * 1000);
  } else if (startDate && startDate._seconds) {
    startDate = new Date(startDate._seconds * 1000);
  } else if (typeof startDate === 'string') {
    startDate = new Date(startDate);
  }

  let endDate = event.endDate;
  if (endDate && typeof endDate.toDate === 'function') {
    endDate = endDate.toDate();
  } else if (endDate && typeof endDate.seconds === 'number') {
    endDate = new Date(endDate.seconds * 1000);
  } else if (endDate && endDate._seconds) {
    endDate = new Date(endDate._seconds * 1000);
  } else if (typeof endDate === 'string') {
    endDate = new Date(endDate);
  }

  return {
    ...event,
    startDate,
    endDate,
  };
};



function MyEvents() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { events, loading, error } = useUserEvents(user?.uid);

  const handleModalClose = () => setIsModalOpen(false);

  const {
    formData,
    handleChange,
    handleFileChange,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useEventForm(() => setIsModalOpen(false));

  const onSubmitEvent = (e) => handleSubmit(e, user?.uid);

  // Normalize dates once events load
  const [normalizedEvents, setNormalizedEvents] = useState([]);
  useEffect(() => {
    if (events) {
      setNormalizedEvents(events.map(normalizeEventDates));
    }
  }, [events]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <EventsFilter
          searchQuery={formData.title}
          onSearchChange={(query) =>
            handleChange({ target: { name: "title", value: query } })
          }
          selectedFormat={formData.format}
          onFormatChange={(format) =>
            handleChange({ target: { name: "format", value: format } })
          }
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {normalizedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        modalTitle="Create New Event"
        formData={formData}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={onSubmitEvent}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}

export default MyEvents;
