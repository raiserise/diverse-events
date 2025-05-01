import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function FirebaseImage({ path, alt = "Image", className = "" }) {
  const [url, setUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && (
        <div className="absolute inset-0">
           <Skeleton 
            className="w-full h-full" 
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
            duration={1.5}
          />
        </div>
      )}
      {url && (
        <img
          src={url}
          alt={alt}
          className={`${className} ${!imageLoaded ? "opacity-0" : "opacity-100"} transition-opacity`}
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
}

export default FirebaseImage;