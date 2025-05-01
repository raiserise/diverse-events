// src/components/NavBar.js
import React, { useEffect, useState } from "react";

const Navbar = ({ pageTitle }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Format date with weekday, month, day, and year
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Format time with hours, minutes, seconds, and AM/PM
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Page Title */}
        <h1 className="text-2xl font-bold">{pageTitle}</h1>

        {/* Right: Current Date and Time - Enhanced Design */}
        <div className="flex items-center">
          <div className="flex flex-col items-end">
            <div className="text-sm font-light text-gray-300">{formattedDate}</div>
            <div className="text-lg font-medium text-white">{formattedTime}</div>
          </div>
          <div className="ml-3 bg-blue-500 bg-opacity-20 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;