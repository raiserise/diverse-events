import React from 'react';
import { Link } from "react-router-dom";
import FirebaseImage from "./FirebaseImage";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

const EventCard = ({ event }) => {
  
  // Destructure the properties we need from the event
  const { 
    id, 
    title, 
    featuredImage, 
    startDate, 
    location, 
    category 
  } = event || {};

  // Format the date if it exists
  let formattedDate = startDate ? new Date(startDate).toLocaleDateString() : "No date available";
  if (startDate) {
    if (startDate._seconds) {
      // Convert Firestore timestamp to Date object
      const date = new Date(startDate._seconds * 1000);
      formattedDate = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (typeof startDate === 'string') {
      formattedDate = startDate;
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/events/${id}`} className="block h-full">
        <div className="relative">
          <div className="w-[300px] h-[200px] overflow-hidden bg-gray-100">
            <FirebaseImage 
              path={featuredImage || DEFAULT_IMAGE}
              alt={title || "Event image"}
              className="w-full h-full object-cover object-center"
            />
          </div>
              {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-sm font-semibold px-3 py-1 rounded">
          {category}
        </div>
          {/* {category && (
            <div className="absolute top-2 right-2 z-20">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {Array.isArray(category) ? category[0] : category}
              </span>
            </div>
          )} */}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
          <div className="text-sm text-gray-600">
            <div className="flex items-center mb-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>{formattedDate}</span>
            </div>
            {location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="truncate">
                  {typeof location === 'object' ? location.name : location}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;