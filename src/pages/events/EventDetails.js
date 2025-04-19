// src/pages/events/EventDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllData,
  getDataById,
  addData,
  deleteData,
} from "../../api/apiService";
import FirebaseImage from "../../components/FirebaseImage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
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
import EventBuilder from "../../builders/EventBuilders";

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = getAuth();

  // State
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
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const isEventFull =
    event?.maxParticipants &&
    event.participants?.length >= event.maxParticipants;

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

  // Load users for invite
  useEffect(() => {
    if (!isInviteOpen) return;
    getAllData("/users", false)
      .then((data) => setUsers(data || []))
      .catch((err) => console.error(err));
  }, [isInviteOpen]);

  // Fetch event and related data
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        let data;
        try {
          data = await getDataById("/events", id, true);
        } catch (e) {
          if (e.message.includes("Not authorized"))
            data = await getDataById("/events", id, false);
          else throw e;
        }
        if (!data) {
          setError("Event not found");
          return;
        }
        if (data.privacy === "private") {
          if (!user) {
            setError("Login required");
            return;
          }
          const allowed =
            data.organizers?.includes(user.uid) ||
            data.invitedUsers?.includes(user.uid);
          if (!allowed) {
            setError("Not authorized");
            return;
          }
        }
        // setEvent({ id, ...data });
        const built = new EventBuilder()
          .setId(id)
          .setTitle(data.title)
          .setDescription(data.description)
          .setFeaturedImage(data.featuredImage)
          .setStatus(data.status)
          .setAcceptsRSVP(data.acceptsRSVP)
          .setPrivacy(data.privacy)
          .setFormat(data.format)
          .setCategory(data.category)
          .setStartDate(data.startDate)
          .setEndDate(data.endDate)
          .setMaxParticipants(data.maxParticipants)
          .setInvitedUsers(data.invitedUsers)
          .setOrganizers(data.organizers)
          .setParticipants(data.participants)
          .build();
        setEvent(built);

        setInvitedUsers(data.invitedUsers || []);
        if (data.organizers?.length) {
          const orgs = await Promise.all(
            data.organizers.map((o) => getDataById("/users", o, true))
          );
          setOrganizers(orgs);
        }
        if (data.participants?.length) {
          const parts = await Promise.all(
            data.participants.map((p) => getDataById("/users", p, true))
          );
          setParticipants(parts);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, id]);

  // Check RSVP status
  useEffect(() => {
    if (!user || !event) return;
    (async () => {
      try {
        const resp = await getDataById("/rsvp/check", id, true);
        if (isEventFull) {
          setCanRSVP(false);
          setIsRSVP(false);
          return;
        }
        const toMs = (ts) => ts?._seconds * 1000;
        if (resp.exists && resp.status === "cancelled") {
          const last = toMs(resp.lastCancelledAt);
          const cooldown = 30 * 60 * 1000;
          const diff = Date.now() - last;
          if (diff < cooldown) {
            setCooldownRemaining(Math.ceil((cooldown - diff) / 1000));
            setCanRSVP(false);
          } else setCanRSVP(true);
        } else if (resp.exists) {
          setIsRSVP(true);
          setCanRSVP(false);
        } else setCanRSVP(true);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user, event, id, isEventFull]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const iv = setInterval(() => {
      setCooldownRemaining((c) => {
        if (c <= 1) {
          clearInterval(iv);
          setCanRSVP(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [cooldownRemaining]);

  // RSVP
  const handleRSVP = async () => {
    if (!event || isRSVP || submitting) return;
    try {
      setSubmitting(true);
      if (isEventFull) {
        toast.error("Event full");
        return;
      }
      const resp = await getDataById("/rsvp/check", id, true);
      if (resp.exists && resp.status === "cancelled") {
        const last = resp.lastCancelledAt._seconds * 1000;
        if (Date.now() - last < 30 * 60 * 1000) {
          toast.error("Wait before retry");
          return;
        }
      }
      await addData(
        "/rsvp",
        { eventId: event.id, organizers: event.organizers },
        true
      );
      setIsRSVP(true);
      toast.success("RSVP sent");
      setCanRSVP(false);
    } catch (err) {
      console.error(err);
      toast.error("RSVP failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Upload helper
  const uploadImage = (file) =>
    new Promise((res, rej) => {
      const storage = getStorage();
      const refPath = ref(storage, `events/${file.name}`);
      const task = uploadBytesResumable(refPath, file);
      task.on("state_changed", null, rej, () =>
        getDownloadURL(task.snapshot.ref).then(res).catch(rej)
      );
    });

  // Delete
  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteData("/events", event.id, true);
      toast.success("Deleted");
      navigate("/events");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // Edit
  const handleEditClick = () => {
    if (!event) return;
    setEditFormData({
      ...event,
      startDate: event.startDate?._seconds
        ? new Date(event.startDate._seconds * 1000).toISOString().slice(0, 16)
        : "",
      endDate: event.endDate?._seconds
        ? new Date(event.endDate._seconds * 1000).toISOString().slice(0, 16)
        : "",
      category: Array.isArray(event.category) ? event.category.join(", ") : "",
    });
    setEditImageFile(null);
    setIsEditModalOpen(true);
  };
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleEditFileChange = (e) => {
    if (e.target.files?.[0]) setEditImageFile(e.target.files[0]);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Login needed");
      return;
    }
    let imgUrl = editFormData.featuredImage;
    if (editImageFile) {
      try {
        imgUrl = await uploadImage(editImageFile);
      } catch {
        toast.error("Img upload fail");
      }
    }
    const updated = {
      ...editFormData,
      category: editFormData.category.split(",").map((c) => c.trim()),
      updatedAt: serverTimestamp(),
      featuredImage: imgUrl,
      startDate: editFormData.startDate
        ? new Date(editFormData.startDate)
        : null,
      endDate: editFormData.endDate ? new Date(editFormData.endDate) : null,
    };
    try {
      const db = getFirestore();
      await updateDoc(doc(db, "events", event.id), updated);
      toast.success("Updated");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Update fail");
    }
  };

  // Render
  return (
    <div className="max-w-5xl mx-auto p-6">
      {loading ? (
        <div className="animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          {event.featuredImage && (
            <FirebaseImage
              path={event.featuredImage}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="mb-6 text-gray-700">{event.description}</p>
          <div className="flex gap-4 mb-6">
            <span
              className={`px-4 py-2 rounded-full text-white ${event.status === "active" ? "bg-green-500" : "bg-red-500"}`}
            >
              {event.status.toUpperCase()}
            </span>
            {event.acceptsRSVP && (
              <span className="px-4 py-2 bg-blue-500 text-white rounded-full">
                RSVP Open
              </span>
            )}
          </div>
          <button
            onClick={handleRSVP}
            disabled={submitting || (!canRSVP && !isRSVP) || isEventFull}
            className={`w-full py-3 text-white mb-8 font-semibold rounded-lg ${isRSVP ? "bg-green-500" : isEventFull ? "bg-red-400" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {submitting
              ? "Submitting..."
              : isRSVP
                ? "RSVP Confirmed"
                : isEventFull
                  ? "Event Full"
                  : "RSVP Now"}
          </button>
          <h2 className="text-2xl font-semibold mb-4">Organizers</h2>
          <div className="flex flex-wrap gap-4 mb-8">
            {organizers.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {o.avatar ? (
                    <FirebaseImage
                      path={o.avatar}
                      alt={o.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    o.name[0]
                  )}
                </div>
                <div>
                  <p className="font-medium">{o.name}</p>
                  {o.contact && (
                    <p className="text-sm text-gray-600">{o.contact}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-semibold mb-4">
            Participants ({participants.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {(showAll ? participants : participants.slice(0, 10)).map((p) => (
              <div
                key={p.id}
                className="p-4 bg-gray-100 rounded-lg text-center"
              >
                {p.name || "Unknown"}
              </div>
            ))}
          </div>
          {participants.length > 10 && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="text-blue-500 hover:underline mb-8"
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
          )}
          {organizers.some((o) => o.id === user?.uid) && (
            <div className="fixed bottom-6 right-6 flex gap-4">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600"
              >
                Invite
              </button>
              <button
                onClick={handleEditClick}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
          {isInviteOpen && (
            <CustomModal
              isOpen={isInviteOpen}
              onRequestClose={() => setIsInviteOpen(false)}
            >
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Invite Users</h3>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                  placeholder="Search..."
                />
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {users
                    .filter(
                      (u) =>
                        !event.organizers.includes(u.id) &&
                        u.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.id}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-gray-600">{u.email}</p>
                        </div>
                        {invitedUsers.includes(u.id) ? (
                          <span className="text-green-500">Invited</span>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                const base = new InviteBase(
                                  event.id,
                                  event.title
                                );
                                const dec = new NotifyDecorator(base);
                                await dec.invite(u, event);
                                setInvitedUsers((prev) => [...prev, u.id]);
                                toast.success("Invited");
                              } catch {
                                toast.error("Fail");
                              }
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Invite
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CustomModal>
          )}
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
