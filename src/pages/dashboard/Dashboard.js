import React, { useState, useEffect } from "react";

const DashboardPage = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">

    <main className="flex-1 p-4 overflow-y-auto">
      <div className="flex flex-wrap gap-4">
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
          <h2 className="text-xl mb-2">Current Date & Time</h2>
          <p>{date.toString()}</p>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
          <h2 className="text-xl mb-2">Upcoming Events</h2>
          <p>List of upcoming events...</p>
        </div>
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md flex-1 min-w-[200px]">
          <h2 className="text-xl mb-2">Statistics</h2>
          <p>Some statistics...</p>
        </div>
      </div>
    </main>
  </div>
  );
};

export default DashboardPage;