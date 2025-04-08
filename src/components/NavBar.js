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

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: Page Title */}
        <h1 className="text-2xl font-bold">{pageTitle}</h1>

        {/* Right: Current Date and Time */}
        <div className="text-sm">
          {currentTime.toLocaleString("en-US", {
            timeZone: "Asia/Shanghai",
            dateStyle: "medium",
            timeStyle: "medium",
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;