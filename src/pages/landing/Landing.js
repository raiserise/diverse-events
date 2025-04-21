import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import Navbar from "../../components/NavBar";
import Header from "../../components/Header";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar pageTitle="Diverse Events" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto flex-grow">
        {/* Introduction Section */}
        <section className="my-12 text-center">
          <p className="mt-4 text-xl text-gray-700 leading-relaxed">
            <strong>DiverseEvents</strong> is a web-based event management
            system designed to help users efficiently organize and coordinate
            various types of events. Whether it&apos;s corporate gatherings,
            social events, community festivals, or virtual/hybrid events,
            DiverseEvents has got you covered. Our platform provides
            comprehensive tools for:
          </p>
          <ul className="list-disc list-inside mt-6 space-y-4 text-lg text-gray-600">
            <li>Event creation and planning</li>
            <li>Vendor coordination</li>
            <li>User management</li>
            <li>Real-time notifications</li>
            <li>Resource allocation management</li>
          </ul>
          <p className="mt-6 text-xl text-gray-700 leading-relaxed">
            Built using modern technologies like React.js for the frontend, Node
            and Express for the backend, and Firebase for authentication and
            hosting, DiverseEvents ensures a smooth and efficient event
            management experience.
          </p>
        </section>

        {/* Call-to-Action Section */}
        <section className="my-12 text-center bg-gradient-to-r from-blue-500 to-blue-700 p-10 rounded-lg shadow-lg text-white">
          <h2 className="text-5xl font-bold mb-6">
            Get Started with DiverseEvents
          </h2>
          <p className="text-2xl leading-relaxed mb-8">
            Ready to make your event planning easier and more efficient? Join us
            today to experience the future of event management.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg text-xl font-semibold transform hover:scale-105 transition-transform duration-300 shadow-md"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-blue-600 border-2 border-white text-white px-10 py-4 rounded-lg text-xl font-semibold transform hover:scale-105 transition-transform duration-300 shadow-md"
            >
              Log In
            </Link>
          </div>
          <p className="mt-8 text-lg leading-relaxed">
            Already have an account? Log in to access your events and start
            planning.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white p-4 text-center">
        <p className="text-sm">
          &copy; 2025 DiverseEvents. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
