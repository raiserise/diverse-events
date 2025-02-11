import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Event as EventIcon,
  Person as UserIcon,
  AccountCircle as ProfileIcon,
  Search as BrowseIcon,
  EventAvailable as MyEventsIcon,
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
        subItems: [
          {
            icon: <BrowseIcon />,
            label: "Browse Events",
            href: "/events/browse-events",
          },
          {
            icon: <MyEventsIcon />,
            label: "My Events",
            href: "/events/my-events",
          },
        ],
      },
      {
        icon: <UserIcon />,
        label: "Users",
        href: "/users",
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
              <div key={item.label}>
                <Link
                  to={item.href}
                  className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md ${
                    isActive
                      ? "bg-[#C0C0C0] text-black"
                      : "text-black-500 hover:bg-[#C0C0C0]"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
                {item.subItems && (
                  <div className="ml-4">
                    {item.subItems.map((subItem) => {
                      const isSubItemActive = location.pathname === subItem.href;
                      return (
                        <Link
                          to={subItem.href}
                          key={subItem.label}
                          className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md ${
                            isSubItemActive
                              ? "bg-[#C0C0C0] text-black"
                              : "text-black-500 hover:bg-[#C0C0C0]"
                          }`}
                        >
                          <span className="text-lg">{subItem.icon}</span>
                          <span className="hidden lg:block">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;