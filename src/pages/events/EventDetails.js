// src/pages/events/EventDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllData, getDataById, addData, deleteData } from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import EventModal from "../../components/EventModal";
import CustomModal from "../../components/CustomModal";
import { InviteBase } from "../../invite/InviteBase";
import { NotifyDecorator } from "../../invite/NotifyDecorator";
import { useNavigate } from "react-router-dom";


function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = getAuth();

  // State variables
  const [event, setEvent] = useState(null);
  const [organizers, setOrganizers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isRSVP, setIsRSVP] = useState(false);
  const [canRSVP, setCanRSVP] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Derived state
  const isEventFull = event?.maxParticipants && event.participants?.length >= event.maxParticipants;

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  // Fetch all users when invite modal opens
  useEffect(() => {
    if (isInviteOpen) {
      getAllData("/users", false)
        .then(data => setUsers(data || []))
        .catch(err => console.error("Error fetching users:", err));
    }
  }, [isInviteOpen]);

  // Fetch event details once user is known
  useEffect(() => {
    if (!user) return;
    fetchEventDetails();
  }, [user, id]);

  const fetchEventDetails = async () => {
    try {
      const eventData = await fetchEventById(id);
      if (!eventData) {
        setError("Event not found.");
        return;
      }
      // Private event authorization
      if (eventData.privacy === "private") {
        if (!user) {
          setError("Authentication required to view this private event.");
          return;
        }
        const allowed = eventData.organizers?.includes(user.uid) || eventData.invitedUsers?.includes(user.uid);
        if (!allowed) {
          setError("You are not authorized to view this private event.");
          return;
        }
      }
      setEvent({ id, ...eventData });
      setInvitedUsers(eventData.invitedUsers || []);
      // Fetch organizers details
      if (eventData.organizers?.length) {
        const orgs = await Promise.all(
          eventData.organizers.map(orgId => getDataById("/users", orgId, true))
        );
        setOrganizers(orgs);
      }
      // Fetch participants details
      if (eventData.participants?.length) {
        const parts = await Promise.all(
          eventData.participants.map(pid => getDataById("/users", pid, true))
        );
        setParticipants(parts);
      }
    } catch (err) {
      console.error("Error loading event:", err);
      setError("Error loading event details");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventById = async eventId => {
    try {
      return await getDataById("/events", eventId, true);
    } catch (err) {
      if (err.message.includes("Not authorized")) {
        return await getDataById("/events", eventId, false);
      }
      throw err;
    }
  };

  const parseTimestamp = ts => (ts?._seconds ? ts._seconds * 1000 : 0);

  // Check RSVP status
  useEffect(() => {
    if (!user || !event) return;
    checkRSVPStatus();
  }, [user, event, id]);

  const checkRSVPStatus = async () => {
    try {
      const resp = await getDataById("/rsvp/check", id, true);
      if (isEventFull) {
        setCanRSVP(false);
        setIsRSVP(false);
        return;
      }
      if (resp.exists && resp.status === "cancelled") {
        const last = parseTimestamp(resp.lastCancelledAt);
        const cooldown = 30 * 60 * 1000;
        const diff = Date.now() - last;
        if (diff < cooldown) {
          setCooldownRemaining(Math.ceil((cooldown - diff) / 1000));
          setCanRSVP(false);
        } else {
          setCanRSVP(true);
        }
      } else if (resp.exists) {
        setIsRSVP(true);
        setCanRSVP(false);
      } else {
        setCanRSVP(true);
      }
    } catch (err) {
      console.error("RSVP check error:", err);
    }
  };

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanRSVP(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // RSVP handler
  const handleRSVP = async () => {
    if (!event || isRSVP || submitting) return;
    try {
      setSubmitting(true);
      if (isEventFull) {
        toast.error("Event is full. RSVP is not allowed.");
        return;
      }
      const resp = await getDataById("/rsvp/check", id, true);
      if (resp.exists && resp.status === "cancelled") {
        const last = parseTimestamp(resp.lastCancelledAt);
        if (Date.now() - last < 30 * 60 * 1000) {
          toast.error(`Please wait before RSVPing again.`);
          return;
        }
      }
      await addData("/rsvp", { eventId: event.id, organizers: event.organizers }, true);
      setIsRSVP(true);
      toast.success("RSVP successful!");
      setCanRSVP(false);
    } catch (err) {
      console.error("RSVP error:", err);
      toast.error("RSVP failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Upload image helper
  const uploadImage = file =>
    new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `events/${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        null,
        reject,
        () => getDownloadURL(task.snapshot.ref).then(resolve).catch(reject)
      );
    });

    // Delete handler
    const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to delete this event?')) return;
      try {
        await deleteData('/events', event.id, true);
        toast.success('Event deleted successfully.');
        navigate('/events');
      } catch (err) {
        console.error('Delete error:', err);
        toast.error('Failed to delete event.');
      }
    };

  // Edit handlers
  const handleEditClick = () => {
    if (!event) return;
    setEditFormData({
      title: event.title || "",
      description: event.description || "",
      category: Array.isArray(event.category) ? event.category.join(", ") : "",
      location: event.location || "",
      startDate: event.startDate?._seconds ? new Date(event.startDate._seconds * 1000).toISOString().slice(0,16) : "",
      endDate: event.endDate?._seconds ? new Date(event.endDate._seconds * 1000).toISOString().slice(0,16) : "",
      language: event.language || "",
      acceptsRSVP: event.acceptsRSVP || false,
      featuredImage: event.featuredImage || "",
      maxParticipants: event.maxParticipants || "",
      privacy: event.privacy || "public",
      format: event.format || "",
      terms: event.terms || "",
      status: event.status || "active",
      inviteLink: event.inviteLink || ""
    });
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditChange = e => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditFileChange = e => {
    if (e.target.files?.[0]) setEditImageFile(e.target.files[0]);
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    if (!user) {
      toast.error("Login required to edit.");
      return;
    }
    let newImage = editFormData.featuredImage;
    if (editImageFile) {
      try { newImage = await uploadImage(editImageFile); }
      catch { toast.error("Image upload failed. Keeping old image."); }
    }
    const updated = {
      ...editFormData,
      category: editFormData.category.split(",").map(c => c.trim()),
      updatedAt: serverTimestamp(),
      startDate: editFormData.startDate ? new Date(editFormData.startDate) : null,
      endDate: editFormData.endDate ? new Date(editFormData.endDate) : null,
      featuredImage: newImage
    };
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "events", event.id), updated);
      toast.success("Event updated!");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update event.");
    }
  };

  // Render
  return (
    <div className="max-w-5xl mx-auto p-6">
      {loading ? (
        <div className="animate-pulse">Loading event...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {/* Featured image */}
          {event.featuredImage && (
            <FirebaseImage path={event.featuredImage} alt={event.title} className="w-full h-64 object-cover rounded-lg mb-4" />
          )}
          {/* Title & Description */}
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-700 mb-6">{event.description}</p>
          {/* Status & RSVP Available */}
          <div className="flex gap-4 mb-6">
            <span className={`px-4 py-2 rounded-full text-white ${event.status === "active" ? "bg-green-500" : "bg-red-500"}`}> {event.status.toUpperCase()} </span>
            {event.acceptsRSVP && <span className="px-4 py-2 bg-blue-500 text-white rounded-full">RSVP Open</span>}
          </div>
          {/* RSVP Button */}
          <button onClick={handleRSVP} disabled={submitting || (!canRSVP && !isRSVP) || isEventFull} className={`w-full py-3 text-white font-semibold mb-8 rounded-lg ${
            isRSVP ? "bg-green-500 cursor-default" :
            isEventFull ? "bg-red-400 cursor-not-allowed" :
            canRSVP ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
          }`}>
            {submitting ? "Submitting..." : isRSVP ? "RSVP Confirmed" : isEventFull ? "Event Full" : canRSVP ? "RSVP Now" : `Wait ${Math.floor(cooldownRemaining/60)}m ${cooldownRemaining%60}s`}
          </button>

          {/* Organizers List */}
          <h2 className="text-2xl font-semibold mb-4">Organizers</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {organizers.map(org => (
              <div key={org.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {org.avatar ? <FirebaseImage path={org.avatar} alt={org.name} className="w-full h-full object-cover" /> : org.name[0]}
                </div>
                <div>
                  <p className="font-medium">{org.name}</p>
                  {org.contact && <p className="text-sm text-gray-600">{org.contact}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Participants List */}
          <h2 className="text-2xl font-semibold mb-4">Participants ({participants.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {(showAll ? participants : participants.slice(0,10)).map(p => (
              <div key={p.id} className="p-4 bg-gray-100 rounded-lg text-center">{p.name || 'Unknown'}</div>
            ))}
          </div>
          {participants.length > 10 && <button onClick={() => setShowAll(prev => !prev)} className="text-blue-500 hover:underline mb-8">{showAll ? "Show Less" : "Show All"}</button>}

          {/* Organizer Actions */}
          {organizers.some(o => o.id === user?.uid) && (
            <div className="fixed bottom-6 right-6 flex gap-4">
              <button onClick={() => setIsInviteOpen(true)} className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600">Invite Users</button>
              <button onClick={handleEditClick} className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600">Edit Event</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600">Delete Event</button>
            </div>
          )}

          {/* Invite Modal */}
          {isInviteOpen && (
            <CustomModal isOpen={isInviteOpen} onRequestClose={() => setIsInviteOpen(false)}>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Invite Users</h3>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded mb-4" placeholder="Search by name..." />
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {users.filter(u => !event.organizers.includes(u.id) && u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                    <div key={u.id} className="flex justify-between items-center p-2 border-b">
                      <div><p className="font-medium">{u.name}</p><p className="text-sm text-gray-600">{u.email}</p></div>
                      {invitedUsers.includes(u.id) ? <span className="text-green-500">Invited</span> : <button onClick={async () => {
                        try {
                          const base = new InviteBase(event.id, event.title);
                          const dec = new NotifyDecorator(base);
                          await dec.invite(u, event);
                          setInvitedUsers(prev => [...prev, u.id]);
                          toast.success("User invited!");
                        } catch { toast.error("Invite failed."); }
                      }} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Invite</button>}
                    </div>
                  ))}
                </div>
              </div>
            </CustomModal>
          )}

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
        </>
      )}
    </div>
  );
}

export default EventDetails;
