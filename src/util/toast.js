import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Configure default options
toast.configure({
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
});

export const showToast = (message, type = "success", options = {}) => {
  const toastOptions = {
    position: toast.POSITION.TOP_RIGHT,
    ...options,
  };

  switch (type.toLowerCase()) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "warning":
      toast.warning(message, toastOptions);
      break;
    case "info":
      toast.info(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }
};
