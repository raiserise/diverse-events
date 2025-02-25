// Events.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import { collection, getDocs } from "firebase/firestore";
import EventCard from "../../components/EventCard";
import Loading from "../../components/Loading";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("total");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    (filter === "total" || event.privacy === filter || event.medium === filter) &&
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    test
      <div className="w-full px-6 my-4 rounded bg-neutral-200 flex items-center justify-between">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent py-4"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          defaultValue={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent py-4 pl-4 border-l"
        >
          <option value="total">Total</option>
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <p className="text-neutral-500">No events found</p>
          )}
        </div>
      )}
    </>
  );
}

export default Events;