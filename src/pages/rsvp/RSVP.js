import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { patchData, getAllData, postData } from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { formatDate, formatTime } from "../../utils/dateUtils";
import { toast } from "react-toastify";
import CustomModal from "../../components/CustomModal";
import "react-toastify/dist/ReactToastify.css";

const RSVP = () => {
  const [activeTab, setActiveTab] = useState("my-rsvps");
  const [myRSVPs, setMyRSVPs] = useState([]);
  const [pendingRSVPs, setPendingRSVPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      //Fetch all events managed by the user
      const userEventsData = await getAllData("/events/me", true);
      console.log("userEventsData:", userEventsData);

      const userEventIds = userEventsData.map((event) => event.id);
      console.log("userEventIds:", userEventIds);

      //Fetch pending RSVPs for those events
      const fetchManagedRSVPs = async (eventId) => {
        try {
          const result = await getAllData(`/rsvp/${eventId}`, true);
          return result?.rsvps || [];
        } catch (error) {
          console.error(`Error fetching RSVPs for event ${eventId}:`, error);
          return [];
        }
      };

      const managedResults = await Promise.all(
        userEventIds.map(fetchManagedRSVPs)
      );
      const allManagedRSVPs = managedResults.flat();
      console.log("RSVP for managed events:", allManagedRSVPs);

      //Fetch RSVPs made by the user
      const myRSVPData = await getAllData("/rsvp/user", true);
      const rsvps = myRSVPData?.rsvps || [];
      console.log("RSVP by current user:", rsvps);

      //Fetch event details in batch for user's RSVPs
      const eventIdsFromRSVPs = [...new Set(rsvps.map((rsvp) => rsvp.eventId))];
      let events = [];

      if (eventIdsFromRSVPs.length > 0) {
        const eventBatchResponse = await postData(
          "/events/batch",
          { ids: eventIdsFromRSVPs },
          true
        );
        events = eventBatchResponse.events || [];
        console.log("Events from my RSVPs:", events);
      }

      //Fetch event details for managed RSVPs in batch
      const eventIdsFromPendingRSVPs = [
        ...new Set(allManagedRSVPs.map((rsvp) => rsvp.eventId)),
      ];
      let userEvents = [];

      if (eventIdsFromPendingRSVPs.length > 0) {
        const userEventBatchResponse = await postData(
          "/events/batch",
          { ids: eventIdsFromPendingRSVPs },
          true
        );
        userEvents = userEventBatchResponse.events || [];
        console.log("Events from managed RSVPs:", userEvents);
      }

      //Batch fetch users involved in managed RSVPs
      const uniqueUserIds = [
        ...new Set(allManagedRSVPs.map((rsvp) => rsvp.userId)),
      ];
      let userBatchResponse = { users: [] };

      if (uniqueUserIds.length > 0) {
        userBatchResponse = await postData(
          "/users/batch",
          { ids: uniqueUserIds },
          true
        );
        console.log("Batch-fetched users:", userBatchResponse.users);
      }

      const userMap = new Map();
      userBatchResponse.users.forEach((user) => {
        userMap.set(user.id, user);
      });

      //Enrich pending RSVPs with user + event
      const enrichedPendingRSVPs = allManagedRSVPs.map((rsvp) => {
        const user = userMap.get(rsvp.userId) || {
          name: "Unknown User",
          email: "Unknown Email",
        };
        const event = userEvents.find((event) => event.id === rsvp.eventId);
        return {
          ...rsvp,
          event,
          userName: user.name,
          email: user.email,
        };
      });
      console.log("Enriched pending RSVPs:", enrichedPendingRSVPs);

      //Enrich current user's RSVPs with event + name
      const enrichedRSVPs = rsvps.map((rsvp) => {
        const event = events.find((event) => event.id === rsvp.eventId);
        const user = userMap.get(rsvp.userId); // Might be undefined
        return {
          ...rsvp,
          event,
          userName: user?.name || "You",
        };
      });

      //Update UI state
      setMyRSVPs(enrichedRSVPs);
      setPendingRSVPs(enrichedPendingRSVPs);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      toast.error("Failed to load RSVP data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (rsvpId, status) => {
    try {
      await patchData(`/rsvp/${rsvpId}/status`, { status }, true);
      toast.success(`RSVP ${status} successfully`);

      // Optimistic update
      setPendingRSVPs((prev) => prev.filter((rsvp) => rsvp.id !== rsvpId));

      if (status === "cancelled") {
        setMyRSVPs((prev) => prev.filter((rsvp) => rsvp.id !== rsvpId));
      }

      fetchData();
    } catch (error) {
      toast.error("Failed to update RSVP status");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`pb-3 font-medium ${
              activeTab === "my-rsvps"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("my-rsvps")}
          >
            My RSVPs
          </button>
          <button
            className={`pb-3 font-medium ${
              activeTab === "manage"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            Manage RSVPs ({pendingRSVPs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <RSVPLoader />
      ) : error ? (
        <ErrorState />
      ) : (
        <>
          {activeTab === "my-rsvps" && (
            <MyRSVPList
              rsvps={myRSVPs}
              onCancel={(id) => handleStatusUpdate(id, "cancelled")}
            />
          )}

          {activeTab === "manage" && (
            <ManageRSVPList
              rsvps={pendingRSVPs}
              onApprove={(id) => handleStatusUpdate(id, "approved")}
              onReject={(id) => handleStatusUpdate(id, "rejected")}
            />
          )}
        </>
      )}
    </div>
  );
};

const MyRSVPList = ({ rsvps, onCancel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRSVP, setSelectedRSVP] = useState(null);

  const openModal = (rsvp) => {
    setSelectedRSVP(rsvp);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRSVP(null);
  };

  const handleConfirmCancel = () => {
    if (selectedRSVP) {
      onCancel(selectedRSVP.id);
    }
    closeModal();
  };

  console.log("My Rsvps", rsvps);
  if (rsvps.length === 0) {
    return (
      <EmptyState
        title="No RSVPs Yet"
        message="You haven't responded to any events"
        buttonText="Find Events"
        link="/events"
        icon="calendar"
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rsvps.map((rsvp) => (
          <div
            key={rsvp.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <FirebaseImage
                path={rsvp.event.featuredImage}
                alt={rsvp.event.title}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm ${
                  rsvp.status === "approved"
                    ? "bg-green-500"
                    : rsvp.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                {rsvp.status.toUpperCase()}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-2">{rsvp.event.title}</h3>
              <div className="text-gray-600 mb-4 space-y-2">
                <p>📅 {formatDate(rsvp.event.startDate)}</p>
                <p>🕒 {formatTime(rsvp.event.startDate)}</p>
                <p className="text-xs text-gray-500">
                  RSVPed on {formatDate(rsvp.createdAt)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  to={`/events/${rsvp.event.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Event Details
                </Link>
                <button
                  onClick={() => openModal(rsvp)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={
                    rsvp.status === "rejected" || rsvp.status === "cancelled"
                  }
                >
                  Cancel RSVP
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Confirmation */}
      <CustomModal isOpen={isModalOpen} onRequestClose={closeModal}>
        <h2 className="text-lg font-semibold text-gray-800">
          Are you sure you want to cancel?
        </h2>
        <p className="text-gray-600 mt-2">
          If you cancel, you will need to wait **30 minutes** before RSVPing
          again.
        </p>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            onClick={closeModal}
          >
            No, Keep RSVP
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={handleConfirmCancel}
          >
            Yes, Cancel RSVP
          </button>
        </div>
      </CustomModal>
    </div>
  );
};

const ManageRSVPList = ({ rsvps, onApprove, onReject }) => {
  const [filter, setFilter] = useState("all");

  const filteredRsvps = rsvps.filter((rsvp) =>
    filter === "all" ? true : rsvp.status.toLowerCase() === filter
  );

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-4">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status ? "bg-blue-500 text-white" : "bg-gray-200"
            } hover:bg-blue-600 transition-colors`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Show Empty State if No Filtered RSVPs */}
      {filteredRsvps.length === 0 ? (
        <EmptyState
          title="No Matching RSVPs"
          message="Try changing your filter criteria."
          icon="checklist"
        />
      ) : (
        filteredRsvps.map((rsvp) => (
          <div key={rsvp.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between space-x-6">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{rsvp.userName}</h3>
                <p className="text-gray-600 mb-4">
                  📧 {rsvp.email}
                  <br />
                  📅 {formatDate(rsvp.event.startDate)}
                </p>
                {/* Conditionally render buttons for pending RSVPs */}
                {rsvp.status.toLowerCase() === "pending" && (
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => onApprove(rsvp.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(rsvp.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {/* Display status badge for non-pending RSVPs */}
                {rsvp.status.toLowerCase() !== "pending" && (
                  <div className="mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        rsvp.status === "approved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {rsvp.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <h4 className="font-medium mb-2">{rsvp.event.title}</h4>
                <FirebaseImage
                  path={rsvp.event.featuredImage}
                  alt={rsvp.event.title}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const RSVPLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-24"></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ title, message, buttonText, link, icon }) => (
  <div className="text-center py-12">
    <svg
      className={`mx-auto h-16 w-16 text-gray-400 mb-4 ${icon === "calendar" ? "block" : icon === "checklist" ? "block" : "hidden"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {icon === "calendar" && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      )}
      {icon === "checklist" && (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17l-2-2m0 0l2-2m-2 2V9m4 8l-2-2m0 0l2-2m-2 2V5m6 12l-2-2m0 0l2-2m-2 2V3"
        />
      )}
    </svg>
    <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-gray-500">{message}</p>
    {buttonText && (
      <Link to={link}>
        <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {buttonText}
        </button>
      </Link>
    )}
  </div>
);

const ErrorState = () => (
  <div className="text-center py-12">
    <svg
      className="mx-auto h-16 w-16 text-red-500 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h3 className="mt-4 text-lg font-medium text-gray-900">
      Something went wrong
    </h3>
    <p className="mt-1 text-gray-500">
      Failed to load RSVP data. Please try again later.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default RSVP;
