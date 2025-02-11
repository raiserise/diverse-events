    import React, { useEffect, useState } from "react";
import { set } from "react-hook-form";

const BrowseEvents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const dummyData = [
    { id: 1, name: "Tech Conference 2025", date: "2025-02-11 10:00 AM", category: "Technology", location: "San Francisco, CA" },
    { id: 2, name: "Music Festival", date: "2025-03-15 02:00 PM", category: "Music", location: "Austin, TX" },
    { id: 3, name: "Art Expo", date: "2025-04-20 06:00 PM", category: "Art", location: "New York, NY" },
    { id: 4, name: "Business Summit", date: "2025-05-10 09:00 AM", category: "Business", location: "Chicago, IL" },
    { id: 5, name: "Health & Wellness Fair", date: "2025-06-25 11:00 AM", category: "Health", location: "Los Angeles, CA" },
    { id: 6, name: "Food & Wine Festival", date: "2025-07-30 05:00 PM", category: "Food & Drink", location: "Napa Valley, CA" },
    { id: 7, name: "Film Festival", date: "2025-08-15 07:00 PM", category: "Film", location: "Cannes, France" },
    { id: 8, name: "Literature Conference", date: "2025-09-10 01:00 PM", category: "Literature", location: "London, UK" },
    { id: 9, name: "Sports Meet", date: "2025-10-05 08:00 AM", category: "Sports", location: "Tokyo, Japan" },
    { id: 10, name: "Environmental Summit", date: "2025-11-20 03:00 PM", category: "Environment", location: "Berlin, Germany" },
  ];

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    // Simulate loading events
    useEffect(() => {
        const fetchEvents = () => {
            setLoading(true);
            try { 
                // const querySnapshot = '';
                // const eventsData = querySnapshot.docs.map((doc) => doc.data());
                const eventsData = dummyData;
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events: ", error);
            } finally {
                setLoading(false);
            }
        };
        setTimeout(fetchEvents, 1000);
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
                <td className="py-2 px-4 border-b">{event.date}</td>
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