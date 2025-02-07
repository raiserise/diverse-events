import { useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Google as GoogleIcon } from "@mui/icons-material";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  // Initialize Firebase authentication and navigation
  const auth = getAuth();

  // State variables for managing authentication state, email, password, confirm password, and error messages
  const [authing, setAuthing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  const signUpWithGoogle = async () => {
    setAuthing(true);

    try {
      // Sign up with Google
      const response = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log(response.user.uid);

      // Add user details to Firestore
      await setDoc(doc(db, "users", response.user.uid), {
        uid: response.user.uid,
        email: response.user.email,
        name: response.user.displayName || "",
        createdAt: new Date().toISOString(),
      });

      console.log("User added to Firestore!");
    } catch (error) {
      console.log(error);
      setAuthing(false);
    }
  };

  const signUpWithEmail = async () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setAuthing(true);
    setError("");

    try {
      // Sign up with email and password
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(response.user.uid);

      // Add user details to Firestore
      await setDoc(doc(db, "users", response.user.uid), {
        uid: response.user.uid,
        email: response.user.email,
        name: displayName,
        createdAt: new Date().toISOString(),
      });

      console.log("User added to Firestore!");
    } catch (error) {
      console.log(error);
      setError(error.message);
      setAuthing(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#494d5f]">
      <div className="flex flex-col p-10 bg-[#3b3f45] rounded-lg shadow-lg w-full max-w-[450px]">
        <div className="w-full flex flex-col mb-6 text-white">
          <h3 className="text-3xl font-bold mb-2">Create Account</h3>
          <p className="text-md mb-4">Join DiverseEvents</p>
        </div>

        <div className="w-full flex flex-col mb-4">
          <input
            type="text"
            placeholder="Enter your display name"
            className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-600 focus:outline-none focus:border-white"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-600 focus:outline-none focus:border-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-600 focus:outline-none focus:border-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-600 focus:outline-none focus:border-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="w-full flex flex-col mb-4">
          <button
            onClick={signUpWithEmail}
            disabled={authing}
            className="w-full bg-white text-black font-semibold rounded-md p-3 text-center flex items-center justify-center cursor-pointer"
          >
            Sign Up with Email
          </button>
        </div>

        <div className="w-full flex items-center justify-center relative py-4">
          <div className="w-full h-[1px] bg-gray-500"></div>
          <p className="text-md absolute text-gray-400 bg-[#3b3f45] px-2">OR</p>
        </div>

        <button
          onClick={signUpWithGoogle}
          disabled={authing}
          className="w-full bg-[#ff6f61] text-white font-semibold rounded-md p-3 text-center flex items-center justify-center cursor-pointer mt-4"
        >
          Sign Up with Google <GoogleIcon></GoogleIcon>
        </button>

        <div className="w-full flex items-center justify-center mt-6">
          <p className="text-sm font-normal text-gray-400">
            Already have an account?{" "}
            <span className="font-semibold text-white cursor-pointer underline">
              <a href="/login">Log In</a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
