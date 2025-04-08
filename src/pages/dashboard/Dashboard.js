import React, { useState, useEffect } from "react";
import { getAllData } from "../../api/apiService";
// import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Notifications from "../notification/Notifications";
import FirebaseImage from "../../components/FirebaseImage";

const DashboardPage = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  // const [userEvents, setUserEvents] = useState([]);
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
        const data = await getAllData("/events", true);
        setEvents(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // useEffect(() => {
  //   const fetchUserEvents = async () => {
  //     try {
  //       const data = await getAllData("/user-events", false);
  //       setUserEvents(data);
  //     } catch (error) {
  //       setError(error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserEvents();
  // }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-wrap gap-4">
          {/* Current Date & Time */}
          {/* <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
            <Calendar
              value={date}
              className="reactp-2 border border-gray-300 rounded-lg shadow-inner"
            />
          </div> */}

          {/* Upcoming Events */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[300px]">
            <h2 className="text-xl mb-4">Upcoming Events</h2>
            {loading ? (
              <p>Loading events...</p>
            ) : error ? (
              <p>{error}</p>
            ) : events.length > 0 ? (
              <ul className="space-y-6">
                {events.map((event) => (
                  <li key={event.id} className="flex items-start gap-6">
                    <FirebaseImage
                      path={event.featuredImage}
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-md"
                    />
                    <div className="flex-1">
                      <strong className="block text-lg font-semibold">
                        {event.title}
                      </strong>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No upcoming events</p>
            )}
          </div>
          {/* Notifications */}
          <Notifications />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
