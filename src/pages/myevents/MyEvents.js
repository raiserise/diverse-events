import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { getFirestore, collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import FirebaseImage from "../../components/FirebaseImage";
import EventModal from "../../components/EventModal";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onSnapshot } from "firebase/firestore";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

function MyEvents() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating a new event
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    startDate: "",
    endDate: "",
    duration: "",
    language: "English",
    acceptsRSVP: false,
    featuredImage: "",
    maxParticipants: "",
    privacy: "public",
    format: "Physical",
    terms: "",
    status: "active",
    inviteLink: "",
  });
  // State for file upload
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Convert dates to timestamps
    const startDateTimestamp = formData.startDate ? new Date(formData.startDate) : null;
    const endDateTimestamp = formData.endDate ? new Date(formData.endDate) : null;
  
    // Default featured image
    let featuredImageUrl = DEFAULT_IMAGE;
  
    // Handle image upload
    if (imageFile) {
      try {
        featuredImageUrl = await uploadImage(imageFile);
      } catch (err) {
        console.error("Error uploading image:", err);
        featuredImageUrl = DEFAULT_IMAGE;
      }
    }
  
    // Prepare the event data
    const newEventData = {
      ...formData,
      category: formData.category.split(",").map((cat) => cat.trim()),
      featuredImage: featuredImageUrl,
      organizers: [user.uid],
      creatorId: user.uid,
      invitedUsers: [],
      participants: [],
      startDate: startDateTimestamp,
      endDate: endDateTimestamp,
    };
  
    const db = getFirestore();
    try {
      // Add the event to Firestore
      await addDoc(collection(db, "events"), {
        ...newEventData,
        createdAt: serverTimestamp(),
      });
      // Close the modal after submitting the form
      setIsModalOpen(false);
      
      // Reset the form to its initial state
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        startDate: "",
        endDate: "",
        duration: "",
        language: "English",
        acceptsRSVP: false,
        featuredImage: "",
        maxParticipants: "",
        privacy: "public",
        format: "Physical",
        terms: "",
        status: "active",
        inviteLink: "",
      });
      
      // Clear the selected image file
      setImageFile(null);
      
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("organizers", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsList = [];
      querySnapshot.forEach((doc) => {
        eventsList.push({ id: doc.id, ...doc.data() });
      });
      setMyEvents(eventsList);
      setLoading(false);
    }, (err) => {
      console.error("Error with real-time updates:", err);
      setError("Failed to fetch your events.");
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [user]);

  if (loading) return <p className="text-center p-6">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-6">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My Events</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </button>
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
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalTitle="Create New Event"
        formData={formData}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default MyEvents;
