// src/pages/MyEvents.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { getFirestore, collection, query, where, getDocs} from "firebase/firestore";
import { Link } from "react-router-dom";
import FirebaseImage from "../../components/FirebaseImage";
// import { toast } from "react-toastify";
import CreateEventModal from "../../components/CreateEventModal";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function MyEvents() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state for the new event (including status)
    // const [formData, setFormData] = useState({
    //   title: "",
    //   description: "",
    //   category: "", // comma-separated, e.g., "Sports, Entertainment"
    //   location: "",
    //   startDate: "",
    //   endDate: "",
    //   duration: "",
    //   language: "",
    //   acceptsRSVP: false,
    //   featuredImage: "",
    //   maxParticipants: "",
    //   privacy: "public",
    //   format: "",
    //   terms: "",
    //   status: "active", // new dropdown field with default "active"
    // });
  
    // Handle changes for all input fields
    // const handleChange = (e) => {
    //   const { name, value, type, checked } = e.target;
    //   setFormData((prev) => ({
    //     ...prev,
    //     [name]: type === "checkbox" ? checked : value,
    //   }));
    // };

    // // Handle form submission and add a new event document to Firestore
    //   const handleSubmit = async (e) => {
    //     e.preventDefault();
    
    //     if (!user) {
    //       console.error("No user is logged in!");
    //       toast.error("You must be logged in to create an event.");
    //       return;
    //     }
    
    //     // Convert startDate and endDate from string to Date object
    //     const startDateTimestamp = formData.startDate ? new Date(formData.startDate) : null;
    //     const endDateTimestamp = formData.endDate ? new Date(formData.endDate) : null;
    
    //     // Prepare new event data with additional fields:
    //     // - Use default image if none provided.
    //     // - Add invitedUsers and participants as empty arrays.
    //     // - Include status field.
    //     const newEventData = {
    //       ...formData,
    //       category: formData.category.split(",").map((cat) => cat.trim()),
    //       featuredImage: formData.featuredImage ? formData.featuredImage : DEFAULT_IMAGE,
    //       organizers: [user.uid],
    //       creatorId: user.uid,
    //       invitedUsers: [],
    //       participants: [],
    //       startDate: startDateTimestamp,
    //       endDate: endDateTimestamp,
    //     };
    
    //     const db = getFirestore();
    
    //     try {
    //       const docRef = await addDoc(collection(db, "events"), {
    //         ...newEventData,
    //         createdAt: serverTimestamp(),
    //       });
    //       console.log("Document written with ID:", docRef.id);
    
    //       toast.success("Event created successfully!", {
    //         autoClose: 1500,
    //         onClose: () => window.location.reload(),
    //       });
    //     } catch (error) {
    //       console.error("Error adding document:", error);
    //       toast.error("Error creating event. Please try again.");
    //     }
    //   };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyEvents = async () => {
      try {
        const db = getFirestore();
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, where("organizers", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const eventsList = [];
        querySnapshot.forEach((doc) => {
          eventsList.push({ id: doc.id, ...doc.data() });
        });
        setMyEvents(eventsList);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to fetch your events.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Link
          to="/create-event"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </Link>
      </div>
      {!myEvents.length ? (
        <p className="text-center p-6">No events found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {myEvents.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded p-2">
              <Link to={`/events/${event.id}`}>
                <FirebaseImage
                  path={event.featuredImage || DEFAULT_IMAGE}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
                <h2 className="font-bold text-lg">{event.title}</h2>
                {event.startDate && event.startDate._seconds && (
                  <p className="text-sm text-gray-500">
                    Start Date:{" "}
                    {new Date(event.startDate._seconds * 1000).toLocaleString("en-US", {
                      timeZone: "Asia/Shanghai",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 transition"
      >
        +
      </button>
      {/* Modal */}
      <CreateEventModal isOpen={isModalOpen} user={user} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default MyEvents;
