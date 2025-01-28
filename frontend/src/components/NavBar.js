import React, { useState } from "react";
import { Avatar, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const Navbar = ({ pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleMenuClose();
  };

  return (
    <div className="flex items-center justify-between p-4">
      {/* PAGE TITLE */}
      <div className="text-lg font-bold">{pageTitle}</div>

      {/* RIGHT SECTION: SEARCH BAR, ICONS, USER */}
      <div className="flex items-center gap-6">
        {/* USER */}
        {user && (
          <>
            <div className="flex flex-col">
              <span className="text-s leading-3 font-medium">
                {user.displayName || "User"}
              </span>
              <span className="text-xs text-gray-500 text-right">Admin</span>
            </div>
            <Avatar
              className="bg-black cursor-pointer"
              onClick={handleAvatarClick}
            >
              {user.displayName ? user.displayName.charAt(0) : "U"}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
