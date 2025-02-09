import React from "react";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "1rem",
    borderRadius: "0.5rem",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const CustomModal = ({ isOpen, onRequestClose, children }) => {
  return (
    <Modal style={customStyles} isOpen={isOpen} onRequestClose={onRequestClose}>
      {children}
    </Modal>
  );
};

export default CustomModal;
