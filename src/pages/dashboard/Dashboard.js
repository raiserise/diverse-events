import React, { useState, useEffect } from "react";
import { getAllData } from "../../api/apiService";
import { Link } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import Notifications from "../notification/Notifications";
import FirebaseImage from "../../components/FirebaseImage";

const DashboardPage = () => {
  // const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    yourRsvps: 0
  });

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDate(new Date());
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllData("/events", true);
        
        // Sort events by date (most recent first)
        const sortedEvents = [...data].sort((a, b) => {
          const dateA = a.startDate?._seconds 
            ? new Date(a.startDate._seconds * 1000) 
            : new Date(a.startDate);
          const dateB = b.startDate?._seconds 
            ? new Date(b.startDate._seconds * 1000) 
            : new Date(b.startDate);
          return dateA - dateB;
        });
        
        setEvents(sortedEvents);
        
        // Update stats
        const now = new Date();
        const upcoming = sortedEvents.filter(event => {
          const eventDate = event.startDate?._seconds 
            ? new Date(event.startDate._seconds * 1000) 
            : new Date(event.startDate);
          return eventDate > now;
        });
        
        setStats({
          totalEvents: data.length,
          upcomingEvents: upcoming.length,
          yourRsvps: Math.floor(Math.random() * 5) // Placeholder - replace with actual RSVP count
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // // Format date to display
  // const formattedDate = date.toLocaleDateString('en-US', { 
  //   weekday: 'long', 
  //   year: 'numeric', 
  //   month: 'long', 
  //   day: 'numeric' 
  // });

  const formatEventDate = (timestamp) => {
    if (!timestamp) return "";
    const eventDate = timestamp._seconds 
      ? new Date(timestamp._seconds * 1000) 
      : new Date(timestamp);
    return eventDate.toLocaleDateString();
  };

  // Filter to get only upcoming events
  const upcomingEvents = events.filter(event => {
    const eventDate = event.startDate?._seconds 
      ? new Date(event.startDate._seconds * 1000) 
      : new Date(event.startDate);
    return eventDate > new Date();
  });

  // Get just the first 5 upcoming events
  const displayEvents = upcomingEvents.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">

<main className="container mx-auto px-6 pt-8 pb-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Total Events</p>
                <p className="text-3xl font-bold mt-1">{stats.totalEvents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold mt-1">{stats.upcomingEvents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Your RSVPs</p>
                <p className="text-3xl font-bold mt-1">{stats.yourRsvps}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Updated Upcoming Events Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
                <Link to="/events" className="text-sm font-medium text-blue-600 hover:underline">
                  View More
                </Link>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg m-6">
                  <p className="font-medium">Error loading events</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              ) : displayEvents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {displayEvents.map((event) => (
  <Link to={`/events/${event.id}`} key={event.id} 
    className="block p-6 hover:bg-gray-50 transition-colors">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 w-full sm:w-auto">
        <FirebaseImage
          path={event.featuredImage}
          alt={event.title || "Event image"}
          className="w-full sm:w-32 h-32 object-cover rounded-lg"
        />
      </div>
      <div className="flex-grow min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors truncate">
            {event.title || "Untitled Event"}
          </h3>
          <span className="inline-block whitespace-nowrap px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {formatEventDate(event.startDate)}
          </span>
        </div>
        <p className="mt-2 text-gray-500 line-clamp-2">
          {event.description || "No description available"}
        </p>
        <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
          <span className="text-sm text-gray-500 truncate max-w-[50%]">
            {event.location || "Location TBA"}
          </span>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {event.category || "Event"}
          </span>
        </div>
      </div>
    </div>
  </Link>
))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 m-6 rounded-lg">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                    </path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-600">No upcoming events</h3>
                  <p className="text-gray-500 mt-1">Check back later for new events</p>
                </div>
              )}

              {displayEvents.length > 0 && stats.upcomingEvents > 5 && (
                <div className="p-6 pt-0 text-center">
                  <Link to="/events" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    View All Events
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Notifications Panel - remains the same */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-full">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">New</span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
                <Notifications />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;