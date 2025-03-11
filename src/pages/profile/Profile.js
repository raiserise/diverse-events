// src/pages/ProfilePage.js
import React from "react";
import { useAuth } from "../../context/AuthProvider"; // Adjust the path if needed

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      {user ? (
        <p>Your email: {user.email}</p>
      ) : (
        <p>No user is logged in.</p>
      )}
    </div>
  );
};

export default ProfilePage;
