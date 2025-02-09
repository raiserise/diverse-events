import React, { useState, useEffect } from "react";
import { Avatar, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Navbar = ({ pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState({ name: "", role: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData({
            name: userSnap.data().name || "User",
            role: userSnap.data().role || "User",
          });
        }
      }
    };

    fetchUserData();
  }, [user]);

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

      {/* RIGHT SECTION: USER INFO */}
      <div className="flex items-center gap-6">
        {user && (
          <>
            <div className="flex flex-col">
              <span className="text-s leading-3 font-medium">
                {userData.name}
              </span>
              <span className="text-xs text-gray-500 text-right">
                {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
              </span>
            </div>
            <Avatar
              className="bg-black cursor-pointer"
              onClick={handleAvatarClick}
            >
              {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
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
