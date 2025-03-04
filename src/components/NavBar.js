import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { Avatar, Menu, MenuItem } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthProvider";
// import { db } from "../firebase";
// import { doc, getDoc } from "firebase/firestore";

const Navbar = ({ pageTitle }) => {
  const [navBarData, setNavBarData] = useState([]);
  const [token, setToken] = useState('');

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((idToken) => {
          setToken(idToken);
        });
      } else {
        setToken('');
      }
    });
  }, []);

  useEffect(() => {
    setNavBarData([
      {
        title: "Dashboard",
        link: "/dashboard",
        show: token ? true : false
      },
      {
        title: token ? "Signout" : "Login",
        link: token ? "/signout" : "/auth/login",
        show: true
      },
      {
        title: "Signup",
        link: "/auth/signup",
        show: token ? false : true
      }
    ]);
  }, [token]);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <ul className="flex gap-4">
          {navBarData.map((item, index) => {
            return (
              <li key={index}>
                {item.show && (
                  <a href={item.link} className="hover:underline">
                    {item.title}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;