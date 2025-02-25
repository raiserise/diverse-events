import React from "react";
import { ToastContainer } from "react-toastify";

const CustomToast = ({ position, autoClose }) => {
  return (
    <ToastContainer
      position={position ? position : "top-center"}
      autoClose={autoClose ? autoClose : 3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default CustomToast;
