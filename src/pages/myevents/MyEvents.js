// src/pages/events/MyEvents.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import EventCard from "../../components/EventCard";
import EventModal from "../../components/EventModal";
import { useEventForm } from "../../hooks/useEventForm";
import { useUserEvents } from "../../hooks/useUserEvents";
import EventsFilter from "../../components/EventsFilter";
import EventBuilder from "../../builders/EventBuilders";

function MyEvents() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { events, loading, error } = useUserEvents(user?.uid);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  const {
    formData,
    handleChange,
    handleFileChange,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useEventForm(() => setIsModalOpen(false));
  const onSubmitEvent = (e) => handleSubmit(e, user?.uid);

  const [builtEvents, setBuiltEvents] = useState([]);
  useEffect(() => {
    if (!events) {
      setBuiltEvents([]);
      return;
    }

    const list = events.map((evt) => {
      // normalize start/end to Date
      let start = evt.startDate;
      if (start?.toDate) start = start.toDate();
      else if (start?.seconds != null) start = new Date(start.seconds * 1000);
      else if (start?._seconds != null) start = new Date(start._seconds * 1000);
      else if (typeof start === "string") start = new Date(start);

      let end = evt.endDate;
      if (end?.toDate) end = end.toDate();
      else if (end?.seconds != null) end = new Date(end.seconds * 1000);
      else if (end?._seconds != null) end = new Date(end._seconds * 1000);
      else if (typeof end === "string") end = new Date(end);

      // format date/time
      const opts = { timeZone: "Asia/Singapore", dateStyle: "medium", timeStyle: "short" };
      const formattedStart = start
        ? start.toLocaleString("en-US", opts)
        : "";
      const formattedEnd = end ? end.toLocaleString("en-US", opts) : "";

      // build with category
      let builder = new EventBuilder()
        .setId(evt.id)
        .setTitle(evt.title)
        .setDescription(evt.description)
        .setFormat(evt.format)
        .setCategory(evt.category || [])
        .setStartDate(formattedStart)
        .setEndDate(formattedEnd)
        .setFeaturedImage(evt.featuredImage)
        .setLocation(evt.location)
        .setUrl(evt.inviteLink);

      // conditional zoom link
      // if (evt.format === "Online" && evt.zoomLink) {
      //   builder = builder.setZoomLink(evt.zoomLink);
      // }

      return builder.build();
    });

    setBuiltEvents(list);
  }, [events]);

  const [filteredEvents, setFilteredEvents] = useState([]);
  useEffect(() => {
    const filtered = builtEvents.filter((evt) => {
      const matchesSearch =
        !searchQuery ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFormat = !selectedFormat || evt.format === selectedFormat;
      return matchesSearch && matchesFormat;
    });
    setFilteredEvents(filtered);
  }, [builtEvents, searchQuery, selectedFormat]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 p-6">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <EventsFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
