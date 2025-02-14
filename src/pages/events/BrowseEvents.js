import React, { useEffect, useState } from "react";
import { getEvents } from "../../api/apiService";
const BrowseEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      console.log(data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
  }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Events</h1>
      {/* Search box */}
      <input
        type="text"
        placeholder="Search events"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      
      {/* Loading indicator */}
      {loading ? (
        <p>Loading events...</p>
      ) : (
        /* Table of Events */
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Event Name</th>
              <th className="py-2 px-4 border-b">Date & Time</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, index) => (
              <tr key={event.id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{event.name}</td>
                <td className="py-2 px-4 border-b">{event.description}</td>
                <td className="py-2 px-4 border-b">{event.category}</td>
                <td className="py-2 px-4 border-b">{event.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BrowseEvents;