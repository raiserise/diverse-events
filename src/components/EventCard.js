import React from 'react';
import { Link } from "react-router-dom";
import FirebaseImage from "./FirebaseImage";
// import { formatDate } from "../utils/dateUtils;
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
  } = event;

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
          <FirebaseImage
            path={featuredImage || DEFAULT_IMAGE}
            alt={title}
            className="w-full h-48 object-cover"
            loadingElement={
              <Skeleton height={192} width="100%" />
            }
          />
          {category && category.length > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded">
                {Array.isArray(category) ? category[0] : category}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="font-bold text-lg line-clamp-2">{title}</h2>
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>  
            </div>
            {location && (
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{typeof location === 'object' ? location.name : location}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;