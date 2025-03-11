import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/NavBar";
import Header from "../../components/Header";

const Landing = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar pageTitle="Diverse Events" />
      <Header />
      <main className="p-8 max-w-7xl mx-auto">
        <section className="my-12 text-center">
          <h2 className="text-4xl font-bold text-gray-800">Project Summary</h2>
          <p className="mt-4 text-xl text-gray-700 leading-relaxed">
            <strong>DiverseEvents</strong> is a web-based event management system designed to help users efficiently organize and coordinate various types of events. Whether it&apos;s corporate gatherings, social events, community festivals, or virtual/hybrid events, DiverseEvents has got you covered. Our platform provides comprehensive tools for:
          </p>
          <ul className="list-disc list-inside mt-6 space-y-4 text-lg text-gray-600">
            <li>Event creation and planning</li>
            <li>Vendor coordination</li>
            <li>User management</li>
            <li>Real-time notifications</li>
            <li>Resource allocation management</li>
          </ul>
          <p className="mt-6 text-xl text-gray-700 leading-relaxed">
            Built using modern technologies like React.js for the frontend, Node and Express for the backend, and Firebase for authentication and hosting, DiverseEvents ensures a smooth and efficient event management experience.
          </p>
        </section>

        <section className="my-12 text-center bg-blue-100 p-8 rounded-lg shadow-lg">
          <h2 className="text-4xl font-bold text-gray-800">Get Started with DiverseEvents</h2>
          <p className="mt-4 text-xl text-gray-700 leading-relaxed">
            Ready to make your event planning easier and more efficient? Join us today to experience the future of event management.
          </p>
          <Link 
            to="/signup" 
            className="mt-8 inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold transform hover:scale-105 transition-transform duration-300 shadow-md"
          >
            Get Started
          </Link>
        </section>
      </main>

      <footer className="bg-blue-600 text-white p-4 text-center">
        <p className="text-sm">&copy; 2025 DiverseEvents. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
