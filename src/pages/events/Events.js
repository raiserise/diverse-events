// src/pages/Events.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GetEventLogic from "../../Logic/EventsLogic/GetEventLogic";
import FirebaseImage from "../../components/FirebaseImage";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function Events() {
  const {
    loading,
    error,
    events,
  } = GetEventLogic();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // New state for filtering by event format
  const [selectedFormat, setSelectedFormat] = useState("");

  // Update the filtered events when any dependency changes
  useEffect(() => {
    let filtered = [];
    filtered = events;
    // First filter by title search
    let results = filtered.filter((event) =>
      (event.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then filter by selected event format if one is chosen
    if (selectedFormat) {
      results = results.filter((event) => event.format === selectedFormat);
    }

    setFilteredEvents(results);
  }, [
    events,
    searchQuery,
    selectedFormat,
  ]);

  return (
    <>
      {/* Search and filter bar */}
      <div className="w-full px-6 my-4 bg-neutral-200 flex items-center rounded-[18px]">
        <input
          type="text"
          placeholder="Search by title"
          className="flex-grow bg-transparent py-4 outline-none"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="w-max bg-transparent py-4 pl-4 outline-none border-l border-neutral-300"
        >
          <option value="">All Formats</option>
          <option value="Online">Online</option>
          <option value="Physical">Physical</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center py-4">Loading...</p>
      ) : (
        <div>
          {error && <p>{error}</p>}
          {/* Events Grid */}
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
    </>
  );
}

export default Events;
