// src/pages/layout/Layout.js
import React from "react";
import SideBar from "../../components/SideBar";
import Navbar from "../../components/NavBar";

const Layout = ({ children, title }) => {
  return (
    <div className="h-screen flex bg-[#F0F0F0]">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        {/* Welcome back user */}
        <div className="mt-4 text-lg font-bold">Welcome back</div>
        <SideBar />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar pageTitle={title} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
