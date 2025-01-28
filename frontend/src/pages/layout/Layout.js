import React from "react";
import Menu from "../../components/Menu"; // Adjust the import paths as needed
import Navbar from "../../components/NavBar";
import { Home } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Layout = ({ children, title }) => {
  return (
    <div className="h-screen flex bg-[#F0F0F0]">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          to="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Home />
          <span className="hidden lg:block font-bold">Diverse Events</span>
        </Link>
        <Menu />
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
