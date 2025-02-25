import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Event as EventIcon,
  AccountCircle as ProfileIcon,
} from "@mui/icons-material";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: <HomeIcon />,
        label: "Home",
        href: "/",
      },
      {
        icon: <EventIcon />,
        label: "Events",
        href: "/events",
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: <ProfileIcon />,
        label: "Profile",
        href: "/profile",
      },
    ],
  },
];

const Menu = () => {
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

export default Menu;
