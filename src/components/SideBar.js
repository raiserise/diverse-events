import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  Event as EventIcon,
  AccountCircle as ProfileIcon,
  Notifications as NotificationsIcon,
  EventAvailable as RSVPIcon,
  Dashboard as DashboardIcon,
  ExitToApp as SignOutIcon,
} from "@mui/icons-material";

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
        label: "Invites",
        href: "/invites",
        icon: <ProfileIcon />,
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
      }
    ],
  },
];

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Clear local storage
        localStorage.removeItem("user");
        // Navigate to login
        navigate("/");
        console.log("Sign out successful");
      })
      .catch((error) => {
        console.error("Sign out error: ", error);
      });
  };

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((menu) => (
        <div className="flex flex-col gap-2" key={menu.title}>
          <span className="hidden lg:block my-4">{menu.title}</span>
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