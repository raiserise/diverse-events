// src/pages/events/EventDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDataById, addData, patchData } from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import EventModal from "../../components/EventModal";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRSVP, setIsRSVP] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(null);

  // State for the edit modal and its form data
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  // New state for image file in edit mode
  const [editImageFile, setEditImageFile] = useState(null);

  const parseFirestoreTimestamp = (timestamp) => {
    if (timestamp?._seconds) {
      return timestamp._seconds * 1000;
    }
    return 0;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch event data with authentication
  useEffect(() => {
    if (!user) return; // Wait until the auth state is determined
    const fetchEvent = async () => {
      try {
        let eventData;
        try {
          eventData = await getDataById("/events", id, true);
        } catch (err) {
          if (err.message.includes("Not authorized")) {
            eventData = await getDataById("/events", id, false);
          } else {
            throw err;
          }
        }
        if (!eventData) {
          setError("Event not found.");
          return;
        }
        if (eventData.privacy === "private") {
          if (!user) {
            setError("Authentication required to view this private event.");
            return;
          }
          const allowed =
            (eventData.organizers || []).includes(user.uid) ||
            (eventData.invitedUsers || []).includes(user.uid);
          if (!allowed) {
            setError("You are not authorized to view this private event.");
            return;
          }
        }
        setEvent({ id, ...eventData });
        if (eventData.organizers?.length) {
          const orgs = await Promise.all(
            eventData.organizers.map((orgId) => getDataById("/users", orgId, true))
          );
          setOrganizers(orgs);
        }
        if (eventData.participants?.length) {
          const parts = await Promise.all(
            eventData.participants.map((participantId) => getDataById("/users", participantId, true))
          );
          setParticipants(parts);
        }
      } catch (err) {
        setError("Error loading event details");
      } finally {
        setLoading(false);
      }
    };

    const checkRSVP = async () => {
      try {
        const response = await getDataById("/rsvp/check", id, true);
        if (response.exists && response.status === "cancelled") {
          const lastCancelledAt = parseFirestoreTimestamp(response.lastCancelledAt);
          const cooldownOver = Date.now() - lastCancelledAt >= 30 * 60 * 1000;
          if (!cooldownOver) {
            setIsRSVP(true);
            const remainingTime = Math.ceil((30 * 60 * 1000 - (Date.now() - lastCancelledAt)) / 1000);
            setCooldownRemaining(remainingTime);
            return;
          } else {
            setIsRSVP(false);
            return;
          }
        } else if (response.exists) {
          setIsRSVP(true);
        } else {
          setIsRSVP(false);
        }
      } catch (error) {
        console.error("RSVP check failed:", error);
      }
    };

    fetchEvent();
    if (user) checkRSVP();
  }, [user, id]);

  useEffect(() => {
    let interval;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleRSVP = async () => {
    if (!event || isRSVP || submitting) return;
    try {
      setSubmitting(true);
      const response = await getDataById("/rsvp/check", id, true);
      if (response.exists) {
        const { status, lastCancelledAt } = response;
        if (status === "cancelled") {
          const lastCancelledTime = parseFirestoreTimestamp(lastCancelledAt);
          const cooldownDuration = 30 * 60 * 1000;
          if (Date.now() - lastCancelledTime < cooldownDuration) {
            const remainingTime = Math.ceil((cooldownDuration - (Date.now() - lastCancelledTime)) / 60000);
            toast.error(`You can RSVP again in ${remainingTime} minutes.`);
            setSubmitting(false);
            return;
          }
        }
        await patchData(`/rsvp/${response.rsvpId}/status`, { status: "pending" }, true);
        setIsRSVP(true);
        toast.success("RSVP updated successfully!");
      } else {
        await addData(
          "/rsvp",
          {
            eventId: event.id,
            organizers: event.organizers,
            dietaryRequirements: "",
            createdAt: new Date(),
          },
          true
        );
        setIsRSVP(true);
        toast.success("RSVP created successfully!");
      }
    } catch (error) {
      console.error("RSVP error:", error);
      toast.error("RSVP failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canRSVP = !isRSVP && !submitting && cooldownRemaining <= 0;

  const handleEditClick = () => {
    setEditFormData({
      title: event.title || "",
      description: event.description || "",
      category: Array.isArray(event.category) ? event.category.join(", ") : "",
      location: event.location || "",
      startDate:
        event.startDate && event.startDate._seconds
          ? new Date(event.startDate._seconds * 1000).toISOString().slice(0, 16)
          : "",
      endDate:
        event.endDate && event.endDate._seconds
          ? new Date(event.endDate._seconds * 1000).toISOString().slice(0, 16)
          : "",
      duration: event.duration || "",
      language: event.language || "",
      acceptsRSVP: event.acceptsRSVP || false,
      featuredImage: event.featuredImage || "",
      maxParticipants: event.maxParticipants || "",
      privacy: event.privacy || "public",
      format: event.format || "",
      terms: event.terms || "",
      status: event.status || "active",
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
    if (e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `events/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((url) => resolve(url))
            .catch((err) => reject(err));
        }
      );
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to edit an event.");
      return;
    }
    const updatedStartDate = editFormData.startDate ? new Date(editFormData.startDate) : null;
    const updatedEndDate = editFormData.endDate ? new Date(editFormData.endDate) : null;
    let newFeaturedImage = editFormData.featuredImage;
    if (editImageFile) {
      try {
        newFeaturedImage = await uploadImage(editImageFile);
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error("Image upload failed. Using previous image.");
      }
    }
    const updatedData = {
      ...editFormData,
      category: editFormData.category.split(",").map((cat) => cat.trim()),
      updatedAt: serverTimestamp(),
      startDate: updatedStartDate,
      endDate: updatedEndDate,
      featuredImage: newFeaturedImage,
    };
    const db = getFirestore();
    try {
      await updateDoc(doc(db, "events", event.id), updatedData);
      toast.success("Event updated successfully!");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event. Please try again.");
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg relative">
      {/* Featured Image */}
      {event.featuredImage ? (
        <FirebaseImage
          path={event.featuredImage}
          alt={event.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      ) : (
        <p className="text-gray-500">No image available</p>
      )}

      {/* Event Title & Status */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
        <div className="flex items-center space-x-4">
          <span
            className={`px-4 py-2 rounded-lg text-white ${
              event.status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
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

      {/* Date & Participation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Schedule</h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">Start Date:</strong>{" "}
              {event.startDate?._seconds
                ? new Date(event.startDate._seconds * 1000).toLocaleString("en-US", {
                    timeZone: "Asia/Shanghai",
                    dateStyle: "medium",
                    timeStyle: "medium",
                  })
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-900">Duration:</strong>{" "}
              {event.duration} hour(s)
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Participation
          </h3>
          <div className="space-y-4">
            <p>
              <strong className="text-gray-900">RSVP Status:</strong>{" "}
              {event.acceptsRSVP ? "Open" : "Closed"}
            </p>
            <p>
              <strong className="text-gray-900">Participant Count:</strong>{" "}
              {event.participants?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Organizer & Participant Info */}
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

      {/* Participants Section */}
      {participants.length > 0 ? (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {participants.map((participant) => (
            <li
              key={participant.id}
              className="bg-gray-100 p-4 rounded-lg text-center hover:bg-gray-200 transition"
            >
              <p className="font-medium text-gray-700">
                {participant.name !== "Unknown"
                  ? participant.name
                  : "Name not available"}
              </p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            No Participants Yet
          </h3>
        </div>
      )}

      {/* RSVP Section */}
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
                disabled={submitting || (!canRSVP && !isRSVP)}
                className={`w-full px-6 py-3 rounded-lg transition duration-200 ${
                  isRSVP
                    ? "bg-green-500 cursor-default"
                    : canRSVP
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : isRSVP
                  ? "RSVP Confirmed"
                  : canRSVP
                  ? "RSVP Now"
                  : `You can RSVP again in ${Math.floor(cooldownRemaining / 60)}m ${
                      cooldownRemaining % 60
                    }s`}
              </button>
              {!canRSVP &&
                cooldownRemaining > 0 &&
                isRSVP && (
                  <p className="text-red-500 text-center text-sm mt-2">
                    You can RSVP again in {Math.floor(cooldownRemaining / 60)}m{" "}
                    {cooldownRemaining % 60}s
                  </p>
                )}
            </>
          )}
        </div>
      )}

      {/* Edit Button for Organizers */}
      {organizers.some((org) => org.id === user?.uid) && (
        <button
          onClick={handleEditClick}
          className="fixed bottom-6 right-6 bg-orange-500 text-white px-6 py-3 rounded-xl shadow-lg text-lg flex items-center justify-center hover:bg-orange-600 transition"
        >
          Edit Event
        </button>
      )}

      {/* Shared Modal for Adding/Editing */}
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
