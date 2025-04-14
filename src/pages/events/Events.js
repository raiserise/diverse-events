// src/pages/events/Events.js
import React, { useEffect, useState } from "react";
import { getAllData } from "../../api/apiService";
import EventCard from "../../components/EventCard";


function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  // Fetch all events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getAllData("/events", true);
        setEvents(eventsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search query and format
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      (event.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFormat = !selectedFormat || event.format === selectedFormat;
    
    return matchesSearch && matchesFormat;
  });

  // Rest of your component with rendering logic
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and filters */}
      <div className="mb-6">
        <input 
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded mr-4"
        />
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Formats</option>
          <option value="Online">Online</option>
          <option value="Physical">Physical</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      {/* Events grid */}
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <p>No events found matching your criteria</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Events;