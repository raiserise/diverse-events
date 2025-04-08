
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");

        // Fetch custom user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.name || "");
        }
      }
    });
  }, []);

  const handleUpdateProfile = async () => {
    const auth = getAuth();
    const db = getFirestore();
    try {
      await updateProfile(auth.currentUser, {
        displayName,
      });

      // Update custom user data in Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: displayName,
      });

      
      const event = new CustomEvent("profileUpdated", { detail: { displayName } });
      window.dispatchEvent(event);
      alert("Profile updated successfully12!");
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (!confirmed) {
      return;
    }
    try {
      await auth.currentUser.delete();
      alert("Account deleted successfully!");
    } catch (error) {
      console.error("Error deleting account: ", error);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Profile Page</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button
        onClick={handleUpdateProfile}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Update Profile
      </button>
      <button
        onClick={handleDeleteAccount}
        className="bg-red-500 text-white px-4 py-2 rounded-md ml-4"
      >
        Delete Account
      </button>
    </div>

    
  );
};

export default Profile;