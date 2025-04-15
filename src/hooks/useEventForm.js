import { useState } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const DEFAULT_IMAGE = "gs://diverseevents-af6ea.firebasestorage.app/noimage.jpg";

const initialFormState = {
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
};

export function useEventForm(onSuccess) {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
            .then(resolve)
            .catch(reject);
        }
      );
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setSubmitError(null);
  };

  const handleSubmit = async (e, userId) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Convert dates to timestamps
      const startDateTimestamp = formData.startDate ? new Date(formData.startDate) : null;
      const endDateTimestamp = formData.endDate ? new Date(formData.endDate) : null;
    
      // Handle image upload
      let featuredImageUrl = DEFAULT_IMAGE;
      if (imageFile) {
        try {
          featuredImageUrl = await uploadImage(imageFile);
        } catch (err) {
          console.error("Error uploading image:", err);
        }
      }
    
      // Prepare the event data
      const newEventData = {
        ...formData,
        category: formData.category.split(",").map((cat) => cat.trim()),
        featuredImage: featuredImageUrl,
        organizers: [userId],
        creatorId: userId,
        invitedUsers: [],
        participants: [],
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
      };
    
      const db = getFirestore();
      await addDoc(collection(db, "events"), {
        ...newEventData,
        createdAt: serverTimestamp(),
      });
      
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding document:", error);
      setSubmitError("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    imageFile,
    isSubmitting,
    submitError,
    handleChange,
    handleFileChange,
    handleSubmit,
    resetForm
  };
}