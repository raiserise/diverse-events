import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {
  Event as EventIcon,
  AccountCircle as ProfileIcon,
  Notifications as NotificationsIcon,
  EventAvailable as RSVPIcon,
  Dashboard as DashboardIcon,
  ExitToApp as SignOutIcon,
} from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote"; // For My Events

const menuItems = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <DashboardIcon />,
      },
      {
        label: "Events",
        href: "/events",
        icon: <EventIcon />,
      },
      {
        label: "My Events",
        href: "/myevents",
        icon: <EventNoteIcon />,
      },
      {
        label: "RSVP",
        href: "/rsvp",
        icon: <RSVPIcon />,
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: <NotificationsIcon />,
      },
      {
        label: "Profile",
        href: "/profile",
        icon: <ProfileIcon />,
      },
      {
        label: "Sign Out",
        href: "#",
        icon: <SignOutIcon />,
        onClick: "handleSignOut",
      },
    ],
  },
];

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch custom user data from Firestore to get the name
  useEffect(() => {
    if (user) {
      const db = getFirestore();
      getDoc(doc(db, "users", user.uid))
        .then((docSnap) => {
          if (docSnap.exists()) {
            setProfileName(docSnap.data().name || user.displayName || user.email);
          } else {
            setProfileName(user.displayName || user.email);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setProfileName(user.displayName || user.email);
        });
    }
  }, [user]);
  
  // handle when profile updated
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setProfileName(event.detail.displayName);
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }
  , []);  

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("user");
        navigate("/");
        console.log("Sign out successful");
      })
      .catch((error) => {
        console.error("Sign out error: ", error);
      });
  };

  return (
    <div className="mt-4 text-sm">
      {user && (
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">
            Welcome back!
          </h2>
          <p className="text-sm font-bold">{profileName || "Guest"}</p>
        </div>
      )}
      {menuItems.map((menu, index) => (
        <div className="flex flex-col gap-2" key={index}>
          {menu.title && <span className="hidden lg:block my-4">{menu.title}</span>}
          {menu.items.map((item) => {
            const isActive = location.pathname === item.href;
            return item.label === "Sign Out" ? (
              <button
                key={item.label}
                onClick={handleSignOut}
                className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md ${
                  isActive
                    ? "bg-[#C0C0C0] text-black"
                    : "text-black-500 hover:bg-[#C0C0C0]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ) : (
              <Link
                to={item.href}
                key={item.label}
                className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md ${
                  isActive
                    ? "bg-[#C0C0C0] text-black"
                    : "text-black-500 hover:bg-[#C0C0C0]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
