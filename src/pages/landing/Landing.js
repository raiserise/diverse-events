import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/NavBar";

const Landing = () => {
  return (
    <div>
      <Navbar pageTitle="Diverse Events" />
      <header className="bg-blue-600 text-white p-8 text-center">
        <h1 className="text-4xl font-bold">Welcome to Diverse Events</h1>
        <p className="mt-4 text-lg">Discover and join events that matter to you.</p>
        <div className="mt-8">
          <Link to="/signup" className="bg-white text-blue-600 px-4 py-2 rounded mr-4">
            Sign Up
          </Link>
          <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded">
            Log In
          </Link>
        </div>
      </header>
      <main className="p-8">
        <section className="my-8">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <p className="mt-4">Stay tuned for exciting events coming your way!</p>
        </section>
        <section className="my-8">
          <h2 className="text-2xl font-bold">Why Join Us?</h2>
          <p className="mt-4">We offer a platform to connect with like-minded individuals and participate in diverse events.</p>
        </section>
      </main>
    </div>
  );
}

export default Landing;