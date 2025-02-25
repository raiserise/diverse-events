import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdComputer,
  MdDelete,
  MdEdit,
} from "react-icons/md";
import { ColorExtractor } from "react-color-extractor";
import {
  IoCopy,
  IoLocation,
  IoPeopleOutline,
  IoPersonOutline,
  IoWalletOutline,
} from "react-icons/io5";
import { toast } from "react-hot-toast";
import { db } from "../../firebase.config";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import Loading from "../../components/Loading";
import UserList from "../../components/UserList";

function Event({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colors, setColors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          setEvent(eventSnap.data());
        } else {
          throw new Error("Event not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const deleteEvent = async () => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      toast.success("Event deleted successfully");
      navigate("/dashboard/events");
    } catch (error) {
      toast.error("Error deleting event");
    }
  };

  if (loading) return <Loading />;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full grid md:grid-cols-4 lg:grid-cols-5 gap-4">
      <section className="py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative h-full lg:col-span-2">
          <div className="absolute top-4 left-4 flex gap-2">
            <Link to={`/dashboard/create?id=${eventId}`} className="primary-btn">
              <MdEdit /> Edit Event
            </Link>
            <button onClick={deleteEvent} className="primary-btn">
              <MdDelete /> Delete Event
            </button>
          </div>
          <ColorExtractor rgb getColors={(colors) => setColors(colors)}>
            <img alt="event" className="h-full object-cover w-full" src={event?.image} />
          </ColorExtractor>
        </div>
        <div className="p-2 py-3 rounded space-y-4">
          <h2 className="text-3xl font-bold">{event?.title}</h2>
          <pre className="text-sm text-neutral-600 py-4">{event?.description}</pre>
        </div>
      </section>
    </div>
  );
}

export default Event;