// src/pages/events/EventDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getDataById,
  getAllData,
  addData,
  patchData,
  deleteData,
} from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import EventModal from "../../components/EventModal";
import CustomModal from "../../components/CustomModal";
import { InviteBase } from "../../invite/InviteBase";
import { NotifyDecorator } from "../../invite/NotifyDecorator";

function EventDetails() {
  const { id } = useParams();
  const auth = getAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isRSVP, setIsRSVP] = useState(false);
  const [canRSVP, setCanRSVP] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [users, setUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editImageFile, setEditImageFile] = useState(null);
  const [showAll, setShowAll] = useState(false); // Toggle for participants list

  const parseFirestoreTimestamp = (timestamp) =>
    timestamp?._seconds ? timestamp._seconds * 1000 : 0;

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, [auth]);

  // Fetch event on load
  useEffect(() => {
    const loadEvent = async () => {
      try {
        let data;
        try {
          data = await getDataById("/events", id, true);
        } catch (err) {
          if (err.message.includes("Not authorized")) {
            data = await getDataById("/events", id, false);
          } else throw err;
        }
        if (!data) {
          setError("Event not found.");
          return;
        }
        // Private guard
        if (
          data.privacy === "private" &&
          !(
            user &&
            [...(data.organizers || []), ...(data.invitedUsers || [])].includes(
              user.uid
            )
          )
        ) {
          setError("You are not authorized to view this private event.");
          return;
        }
        setEvent({ id, ...data });
        setInvitedUsers(data.invitedUsers || []);
        if (data.organizers?.length) {
          const orgs = await Promise.all(
            data.organizers.map((uid) => getDataById("/users", uid, true))
          );
          setOrganizers(orgs);
        }
        if (data.participants?.length) {
          const parts = await Promise.all(
            data.participants.map((uid) => getDataById("/users", uid, true))
          );
          setParticipants(parts);
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setError("Error loading event details.");
      } finally {
        setLoading(false);
      }
    };
    if (user !== null) loadEvent();
  }, [user, id]);

  // Check RSVP status and cooldown
  useEffect(() => {
    if (!user || !event) return;
    const check = async () => {
      try {
        const resp = await getDataById("/rsvp/check", id, true);
        const full =
          event.maxParticipants &&
          event.participants.length >= event.maxParticipants;
        if (full) {
          setIsRSVP(false);
          setCanRSVP(false);
          return;
        }
        if (resp.exists) {
          if (resp.status === "cancelled") {
            const last = parseFirestoreTimestamp(resp.lastCancelledAt);
            const elapsed = Date.now() - last;
            const limit = 30 * 60 * 1000;
            if (elapsed < limit) {
              setCooldownRemaining(Math.ceil((limit - elapsed) / 1000));
              setCanRSVP(false);
              return;
            }
            setIsRSVP(false);
            setCanRSVP(true);
          } else {
            setIsRSVP(true);
            setCanRSVP(false);
          }
        } else {
          setIsRSVP(false);
          setCanRSVP(true);
        }
      } catch (err) {
        console.error("RSVP check failed:", err);
      }
    };
    check();
    // eslint-disable-next-line
  }, [user, event]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setCanRSVP(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleRSVP = async () => {
    if (!event || isRSVP || submitting) return;
    setSubmitting(true);
    try {
      if (
        event.maxParticipants &&
        event.participants.length >= event.maxParticipants
      ) {
        toast.error("Event is full. RSVP is not allowed.");
        return;
      }
      const resp = await getDataById("/rsvp/check", id, true);
      if (resp.exists && resp.status === "cancelled") {
        const last = parseFirestoreTimestamp(resp.lastCancelledAt);
        const elapsed = Date.now() - last;
        if (elapsed < 30 * 60 * 1000) {
          const mins = Math.ceil((30 * 60 * 1000 - elapsed) / 60000);
          toast.error(`You can RSVP again in ${mins} minutes.`);
          return;
        }
      }
      await addData(
        "/rsvp",
        {
          eventId: event.id,
          organizers: event.organizers,
          createdAt: new Date(),
        },
        true
      );
      setIsRSVP(true);
      setCanRSVP(false);
      toast.success("RSVP successful!");
    } catch (err) {
      console.error("RSVP error:", err);
      toast.error("RSVP failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Load users for invite
  useEffect(() => {
    if (!isInviteOpen) return;
    getAllData("/users", false)
      .then((data) => setUsers(data || []))
      .catch((err) => console.error("Error fetching users:", err));
  }, [isInviteOpen]);


  const handleEditClick = () => {
    const {
      title,
      description,
      category = [],
      location,
      startDate,
      endDate,
      language,
      acceptsRSVP,
      featuredImage,
      maxParticipants,
      privacy,
      format,
      terms,
      status,
      inviteLink,
    } = event;
    setEditFormData({
      title,
      description,
      category: category.join(", "),
      location,
      startDate: startDate?._seconds
        ? new Date(startDate._seconds * 1000).toISOString().slice(0, 16)
        : "",
      endDate: endDate?._seconds
        ? new Date(endDate._seconds * 1000).toISOString().slice(0, 16)
        : "",
      language,
      acceptsRSVP,
      featuredImage,
      maxParticipants,
      privacy,
      format,
      terms,
      status,
      inviteLink,
    });
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditFileChange = (e) => {
    if (e.target.files[0]) setEditImageFile(e.target.files[0]);
  };

  const uploadImage = (file) =>
    new Promise((res, rej) => {
      const storage = getStorage();
      const storageRef = ref(storage, `events/${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed", null, rej, async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          res(url);
        } catch (e) {
          rej(e);
        }
      });
    });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Login required to edit.");
      return;
    }
    let imageUrl = editFormData.featuredImage;
    if (editImageFile) {
      try {
        imageUrl = await uploadImage(editImageFile);
      } catch {
        toast.warn("Image upload failed, using existing.");
      }
    }
    const updated = {
      ...editFormData,
      category: editFormData.category.split(",").map((s) => s.trim()),
      startDate: editFormData.startDate
        ? new Date(editFormData.startDate)
        : null,
      endDate: editFormData.endDate ? new Date(editFormData.endDate) : null,
      featuredImage: imageUrl,
      updatedAt: new Date(),
    };
    try {
      await patchData(`/events/${event.id}`, updated, true);
      toast.success("Event updated!");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteData("/events", event.id, true);
      toast.success("Event deleted successfully");
      window.location.href = "/events"; // redirect to events list
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete event.");
    }
  };

  // Render states
  if (loading)
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse bg-white shadow-lg rounded-lg">
          <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
          <div className="space-y-4 p-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-gray-300 rounded"></div>
              <div className="h-48 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  if (!event)
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-gray-500">No event found</p>
      </div>
    );

  const inviteURL =
    event.inviteLink && !event.inviteLink.startsWith("http")
      ? `http://${event.inviteLink}`
      : event.inviteLink;
  const isEventFull =
    event.maxParticipants && event.participants.length >= event.maxParticipants;
  const visibleParticipants = participants.slice(0, 10);

/**
 * Accepts either:
 *   • Firestore Timestamp object { _seconds, _nanoseconds }
 *   • ISO‑string or JS Date
 * Returns a nicely formatted date or “N/A”.
 */
const formatEventDate = (field) => {
  if (!field) return "N/A";

  // 1) Firestore Timestamp
  if (field._seconds != null) {
    return new Date(field._seconds * 1000).toLocaleString("en-US", {
      timeZone: "Asia/Shanghai",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  }

  // 2) ISO‑string (or native Date)
  const d = new Date(field);
  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleString("en-US", {
    timeZone: "Asia/Shanghai",
    dateStyle: "medium",
    timeStyle: "medium",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg relative">
      {event.featuredImage ? (
        <FirebaseImage
          path={event.featuredImage}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      ) : (
        <p className="text-gray-500">No image available</p>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 rounded-lg text-white ${event.status === "active" ? "bg-green-500" : "bg-red-500"}`}
          >
            {event.status.toUpperCase()}
          </span>
          {event.acceptsRSVP && (
            <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              RSVP Available
            </span>
          )}
        </div>
      </div>
      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Event Overview
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Description:</strong>{" "}
              {event.description}
            </p>
            <p>
              <strong className="text-gray-900">Privacy:</strong>{" "}
              {event.privacy.charAt(0).toUpperCase() + event.privacy.slice(1)}
            </p>
            {event.terms && (
              <p>
                <strong className="text-gray-900">Terms:</strong> {event.terms}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Event Details
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Category:</strong>{" "}
              {Array.isArray(event.category)
                ? event.category.map((cat, index) => (
                    <span
                      key={index}
                      className="bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2 mb-2 inline-block"
                    >
                      {cat}
                    </span>
                  ))
                : "No categories"}
            </p>
            <p>
              <strong className="text-gray-900">Event Type:</strong>{" "}
              {event.format}
            </p>
            <p>
              <strong className="text-gray-900">Language:</strong>{" "}
              {event.language}
            </p>
            <p>
              <strong className="text-gray-900">Max Participants:</strong>{" "}
              {event.maxParticipants}
            </p>
          </div>
        </div>
      </div>
      {event.format === "Online" && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Invite Link
          </h3>
          <p className="text-sm text-blue-600">
            {event.inviteLink ? (
              <a href={inviteURL} target="_blank" rel="noopener noreferrer">
                {event.inviteLink}
              </a>
            ) : (
              "No invite link provided."
            )}
          </p>
        </div>
      )}
      {/* Date & Participation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Schedule</h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Start Date:</strong>{" "}
              {formatEventDate(event.startDate)}
            </p>
            <p>
              <strong className="text-gray-900">End Date:</strong>{" "}
              {formatEventDate(event.endDate)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Participation
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Participant Count:</strong>{" "}
              {event.participants?.length || 0}
            </p>
          </div>
        </div>
      </div>
      {/* Organizers */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Organizers</h3>
        <div className="flex flex-wrap gap-4">
          {organizers.map((org) => (
            <div key={org.id} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                {org.avatar ? (
                  <FirebaseImage
                    path={org.avatar}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">{org.name?.[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{org.name || "Unknown Organizer"}</p>
                {org.contact && (
                  <p className="text-sm text-gray-600">{org.contact}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Participants List */}
      {participants.length > 0 ? (
        <>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            List of Participants
          </h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleParticipants.map((participant) => (
              <li
                key={participant.id}
                className="bg-gray-100 p-4 rounded-lg text-center hover:bg-gray-200 transition"
              >
                <p className="font-medium text-gray-700">
                  {participant.name || "Name not available"}
                </p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </li>
            ))}
          </ul>
          {participants.length > 10 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="mt-4 text-blue-500 hover:underline text-sm"
            >
              {showAll ? "Show Less" : `Show All (${participants.length})`}
            </button>
          )}
        </>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            No Participants Yet
          </h3>
        </div>
      )}
      {/* RSVP Button */}
      {event.acceptsRSVP && (
        <div className="fixed md:relative bottom-0 left-0 right-0 md:mb-8 bg-white md:bg-transparent p-4 md:p-0 md:mt-8">
          {organizers.some((org) => org.id === user?.uid) ? (
            <p className="text-yellow-600 text-center py-3">
              Organizers cannot RSVP to their own events
            </p>
          ) : (
            <>
              <button
                onClick={handleRSVP}
                disabled={submitting || (!canRSVP && !isRSVP) || isEventFull}
                className={`w-full px-6 py-3 rounded-lg transition duration-200 ${
                  isRSVP
                    ? "bg-green-500 cursor-default"
                    : isEventFull
                      ? "bg-red-400 cursor-not-allowed"
                      : canRSVP
                        ? "bg-blue-400 hover:bg-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : isRSVP
                    ? "RSVP Confirmed"
                    : isEventFull
                      ? "Event is full"
                      : canRSVP
                        ? "RSVP Now"
                        : `You can RSVP again in ${Math.floor(cooldownRemaining / 60)}m ${cooldownRemaining % 60}s`}
              </button>
              {!canRSVP && cooldownRemaining > 0 && isRSVP && (
                <p className="text-red-500 text-center text-sm mt-2">
                  You can RSVP again in {Math.floor(cooldownRemaining / 60)}m{" "}
                  {cooldownRemaining % 60}s
                </p>
              )}
            </>
          )}
        </div>
      )}
      {/* Invite/Edit/Delete Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-4">
        {organizers.some((org) => org.id === user?.uid) && (
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg text-lg hover:bg-red-700 transition"
          >
            Delete Event
          </button>
        )}
        {organizers.some((org) => org.id === user?.uid) && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg hover:bg-purple-600 transition"
          >
            Invite Users
          </button>
        )}
        {organizers.some((org) => org.id === user?.uid) && (
          <button
            onClick={handleEditClick}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg hover:bg-orange-600 transition"
          >
            Edit Event
          </button>
        )}
      </div>
      {/* Invite Modal */}
      <CustomModal
        isOpen={isInviteOpen}
        onRequestClose={() => setIsInviteOpen(false)}
        contentLabel="Invite Users"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[80vh] flex flex-col p-6">
          <h2 className="text-2xl font-bold mb-4">Invite Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-3 border rounded w-full"
          />
          <ul className="flex-1 overflow-y-auto w-full space-y-2">
            {users
              .filter(
                (u) =>
                  !event.organizers.includes(u.id) &&
                  u.name?.includes(searchTerm)
              )
              .map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between p-2 border-b gap-x-40"
                >
                  <div className="flex-1 mr-4">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </div>
                  {invitedUsers.includes(u.id) ? (
                    <span className="text-green-500 font-semibold">
                      Invited
                    </span>
                  ) : (
                    <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={async () => {
                      const base = new InviteBase(event.id, event.title); 
                      const decorated = new NotifyDecorator(base);
                    
                      try {
                        await decorated.invite(u, event);
                        setInvitedUsers((prev) => [...prev, u.id]);
                      } catch (err) {
                        console.error("Error inviting user:", err);
                        toast.error("Failed to invite user.");
                      }
                    }}
                  >
                    Invite
                  </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </CustomModal>
      {/* Edit Modal */}
      {isEditModalOpen && (
        <EventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          modalTitle="Edit Event"
          formData={editFormData}
          onChange={handleEditChange}
          onFileChange={handleEditFileChange}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}

export default EventDetails;
