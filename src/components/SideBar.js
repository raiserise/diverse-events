import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Event as EventIcon,
  AccountCircle as ProfileIcon,
  Notifications as NotificationsIcon,
  EventAvailable as RSVPIcon,
  Dashboard as DashboardIcon,
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
      }
    ],
  },
];

const SideBar = () => {
  const location = useLocation();

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((menu) => (
        <div className="flex flex-col gap-2" key={menu.title}>
          <span className="hidden lg:block my-4">{menu.title}</span>
          {menu.items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
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