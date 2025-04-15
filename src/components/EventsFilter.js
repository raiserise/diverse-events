import React from "react";

function EventsFilter({ 
  searchQuery, 
  onSearchChange, 
  selectedFormat, 
  onFormatChange 
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <input 
        type="text"
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border p-2 rounded flex-grow sm:flex-grow-0"
      />
      <select
        value={selectedFormat}
        onChange={(e) => onFormatChange(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">All Formats</option>
        <option value="Online">Online</option>
        <option value="Physical">Physical</option>
        <option value="Hybrid">Hybrid</option>
      </select>
    </div>
  );
}

export default EventsFilter;