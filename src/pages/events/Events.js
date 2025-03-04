// Events.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GetEventLogic from "../../Logic/EventsLogic/GetEventLogic";
import FirebaseImage from "../../components/FirebaseImage";

function Events() {
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

  // Pagination states
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

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
    setCurrentIndex(0); // Reset to the first page whenever filter or search changes
  }, [
    events,
    privateEvent,
    publicEvent,
    offlineEvent,
    onlineEvent,
    searchParams,
    searchQuery,
  ]);

  // Determine which events to display on the current "page"
  const totalEvents = filteredEvents.length;
  const displayedEvents = filteredEvents.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  // Move to previous or next page (in sets of 4)
  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };
  const handleNext = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + itemsPerPage, totalEvents - itemsPerPage)
    );
  };

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

          {/* Grid for exactly 4 columns. Each "page" shows 4 events. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {displayedEvents && displayedEvents.length > 0 ? (
              displayedEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-1 border border-gray-200 rounded-sm flex flex-col items-center"
                >
                  {event.featuredImage && (
                    <Link to={`/events/${event.id}`} className="mb-2">
                      <FirebaseImage
                        path={event.featuredImage} // gs:// URL
                        alt={event.title}
                        className="w-full max-h-48 object-contain"
                      />
                    </Link>
                  )}
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

          {/* Pagination controls: only show if totalEvents > itemsPerPage */}
          {totalEvents > itemsPerPage && (
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                &larr; Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex + itemsPerPage >= totalEvents}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Events;
