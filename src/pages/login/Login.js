import React from "react";
import { useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthProvider"; // Import the useAuth hook
import "../../firebase"; // Ensure you have this import to initialize Firebase

const Login = () => {
  const auth = getAuth(); // getAuth from the initialized app
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from AuthProvider

  const [authing, setAuthing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setAuthing(true);
    try {
      const response = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log(response.user.uid);
      login(response.user); // Dispatch the login action
      navigate("/");
    } catch (error) {
      console.log(error);
      setAuthing(false);
    }
  };

  const signInWithEmail = async () => {
    setAuthing(true);
    setError("");
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response.user.uid);
      login(response.user); // Dispatch the login action
      navigate("/");
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
          <h3 className="text-4xl font-bold mb-2">Login</h3>
          <p className="text-lg mb-4">
            Welcome Back! Please enter your details.
          </p>
        </div>

        <div className="w-full flex flex-col mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full text-white py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col mb-4">
          <button
            className="w-full bg-transparent border border-white text-white my-2 font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer"
            onClick={signInWithEmail}
            disabled={authing}
          >
            Log In With Email and Password
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="w-full flex items-center justify-center relative py-4">
          <div className="w-full h-[1px] bg-gray-500"></div>
          <p className="text-md absolute text-gray-400 bg-[#3b3f45] px-2">OR</p>
        </div>

        <button
          className="w-full bg-[#ff6f61] text-white font-semibold rounded-md p-4 text-center flex items-center justify-center cursor-pointer mt-7"
          onClick={signInWithGoogle}
          disabled={authing}
        >
          Log In With Google <GoogleIcon></GoogleIcon>
        </button>

        <div className="w-full flex items-center justify-center mt-10">
          <p className="text-sm font-normal text-gray-400">
            Don&apos;t have an account?{" "}
            <span className="font-semibold text-white cursor-pointer underline">
              <a href="/signup">Sign Up</a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
