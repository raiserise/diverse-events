import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || "");

        try {
          // Fetch custom user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayName(userData.name || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load profile data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

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

      const event = new CustomEvent("profileUpdated", {
        detail: { displayName },
      });
      window.dispatchEvent(event);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error("Failed to update profile");
    }
  };

  // const handleDeleteAccount = async () => {
  //   const auth = getAuth();
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete your account? This action cannot be undone."
  //   );
  //   if (!confirmed) {
  //     return;
  //   }

  //   try {
  //     await auth.currentUser.delete();
  //     toast.success("Account deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting account: ", error);
  //     toast.error(
  //       "Failed to delete account. You may need to re-authenticate first."
  //     );
  //   }
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-gray-600">Not logged in</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 md:p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500">Manage your personal information</p>
      </div>

      <div className="container mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="md:col-span-2 h-full">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Profile Information
                </h2>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your email address cannot be changed
                  </p>
                </div>

                <div className="flex-grow"></div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management Card */}
          <div className="md:col-span-1 h-full">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Account Management
                </h2>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      Account Status
                    </h3>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      <p className="text-sm text-gray-500">Active</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      Member Since
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.metadata?.creationTime
                        ? new Date(
                            user.metadata.creationTime
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      Last Sign In
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user.metadata?.lastSignInTime
                        ? new Date(
                            user.metadata.lastSignInTime
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex-grow"></div>

                {/* <div className="pt-4 border-t border-gray-100 mt-auto">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white w-full px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                    Delete Account
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    This action cannot be undone.
                  </p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
