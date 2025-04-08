// src/pages/Events.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GetEventLogic from "../../Logic/EventsLogic/GetEventLogic";
import FirebaseImage from "../../components/FirebaseImage";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function Events() {
  // Use 'user' from your AuthProvider (if needed)

  const {
    loading,
    error,
    events,
    privateEvent,
    publicEvent,
    offlineEvent,
    onlineEvent,
    searchParams,
  } = GetEventLogic();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Update filtered events when events or search query change
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
