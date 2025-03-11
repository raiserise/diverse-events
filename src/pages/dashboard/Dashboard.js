import React, { useState, useEffect } from "react";
import { getAllData } from "../../api/apiService";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const DashboardPage = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllData("/events");
        setEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const data = await getAllData("/user-events");
        setUserEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
            <h2 className="text-xl mb-2">Current Date & Time</h2>
            <p>{date.toString()}</p>
            <Calendar
              value={date}
              className="reactp-2 border border-gray-300 rounded-lg shadow-inner"
            />
          </div>
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
            <h2 className="text-xl mb-2">Upcoming Events</h2>
            {loading ? (
              <p>Loading events...</p>
            ) : error ? (
              <p>{error}</p>
            ) : events.length > 0 ? (
              <ul>
                {events.map((event) => (
                  <li key={event.id}>
                    <strong>{event.title}</strong>: {event.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming events</p>
            )}
          </div>
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
            <h2 className="text-xl mb-2">Your Events</h2>
            {loading ? (
              <p>Loading your events...</p>
            ) : error ? (
              <p>{error}</p>
            ) : userEvents.length > 0 ? (
              <ul>
                {userEvents.map((event) => (
                  <li key={event.id}>
                    <strong>{event.title}</strong>: {event.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No events found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;