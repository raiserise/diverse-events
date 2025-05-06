import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
// import Navbar from "../../components/NavBar";

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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Welcome to DiverseEvents
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Plan, organize, and attend diverse events with ease
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white p-8 rounded-xl shadow-2xl">
                <div className="text-6xl flex gap-4 flex-wrap justify-center">
                  <span>🎭</span>
                  <span>🎵</span>
                  <span>🎪</span>
                  <span>🎨</span>
                  <span>🎤</span>
                  <span>🎬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Discover What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-blue-500">✨</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Create & Customize
              </h3>
              <p className="text-gray-600">
                Build personalized events with our intuitive tools, from small
                gatherings to large conferences.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-green-500">🔔</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Real-time Notifications
              </h3>
              <p className="text-gray-600">
                Stay updated with instant notifications for RSVPs, invitations,
                and event changes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4 text-purple-500">👥</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                Simplified RSVP
              </h3>
              <p className="text-gray-600">
                Manage attendance with our streamlined RSVP system, perfect for
                hosts and attendees.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">
                Create your free account in seconds
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Create an Event</h3>
              <p className="text-gray-600 text-sm">
                Set up your event with all the details
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Invite People</h3>
              <p className="text-gray-600 text-sm">
                Share with friends or make it public
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Manage RSVPs</h3>
              <p className="text-gray-600 text-sm">
                Track attendance with ease
              </p>
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to create your first event?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join thousands of event organizers who are creating memorable
            experiences with DiverseEvents.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>
      </main>

      {/* Testimonials Section (Optional) */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            What Our Users Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-4">
                &ldquo;DiverseEvents made planning our company retreat so much
                easier. The RSVP system saved us hours of work!&rdquo;
              </p>
              <p className="font-medium">- Aniq, Marketing Director</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-4">
                &ldquo;I love how easy it is to create and manage events. The
                notification system keeps everyone in the loop.&rdquo;
              </p>
              <p className="font-medium">- Chris, Event Organizer</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-4">
                &ldquo;From community meetups to workshops, this platform
                handles everything I need for my events.&rdquo;
              </p>
              <p className="font-medium">- Ryan, Community Leader</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold">DiverseEvents</h3>
              <p className="text-gray-400 mt-2">Making event planning simple</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} DiverseEvents. All Rights
                Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
