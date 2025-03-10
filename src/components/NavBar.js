// src/components/NavBar.js
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = ({ pageTitle }) => {
  const [navBarData, setNavBarData] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        // Consider setting toast to show that user has signed out
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  useEffect(() => {
    setNavBarData([
      {
        title: "Dashboard",
        link: "/dashboard",
        show: user ? true : false,
      },
      {
        title: user ? "Signout" : "Login",
        link: user ? "/" : "/login",
        show: true,
        onclick: user ? handleSignOut : null,
      },
      {
        title: "Signup",
        link: "/signup",
        show: user ? false : true,
      },
    ]);
  }, [user]);

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
