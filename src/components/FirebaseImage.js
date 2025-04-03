import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

function FirebaseImage({ path, alt = "Image", className = "" }) {
  const [url, setUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!path) return;

    const storage = getStorage();
    const imageRef = ref(storage, path);

    getDownloadURL(imageRef)
      .then((downloadUrl) => setUrl(downloadUrl))
      .catch((error) => {
        console.error("Error fetching image:", error);
        setErrorMsg("Error loading image");
      });
  }, [path]);

  if (errorMsg) return <p className="text-red-500">{errorMsg}</p>;
  if (!url) return <p className="text-gray-500">Loading image...</p>;

  return <img src={url} alt={alt} className={className} />;
}

export default FirebaseImage;
