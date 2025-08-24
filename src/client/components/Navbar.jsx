import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ isMenuOpen, setIsMenuOpen }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-primary text-white py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 mx-auto lg:mx-0">
            <Link
              to="/"
              className={`font-worksans font-medium hover:text-accent transition-colors ${
                isActive("/") ? "text-accent" : "text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`font-worksans font-medium hover:text-accent transition-colors ${
                isActive("/about") ? "text-accent" : "text-white"
              }`}
            >
              About us
            </Link>
            <Link
              to="/services"
              className={`font-worksans font-medium hover:text-accent transition-colors ${
                isActive("/services") ? "text-accent" : "text-white"
              }`}
            >
              Services
            </Link>
            <Link
              to="/contact"
              className={`font-worksans font-medium hover:text-accent transition-colors ${
                isActive("/contact") ? "text-accent" : "text-white"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side - Search and Appointment */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button className="text-white hover:text-accent transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Appointment Button */}
            <button className="bg-accent text-primary px-6 py-2 rounded-full font-worksans font-semibold hover:bg-accent/90 transition-colors">
              Appointment
            </button>
          </div>

          {/* Mobile: Logo and Hamburger */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Link to="/" className="text-xl font-yeseva text-white">
              TONSUYA SUPER HEALTH CENTER
            </Link>
            <button onClick={toggleMenu} className="text-2xl">
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#BFD2F8] bg-opacity-95 z-50">
          <div className="flex flex-col items-center justify-center h-full gap-8 text-primary text-2xl pt-20">
            <Link
              to="/"
              className={`font-worksans font-bold ${
                isActive("/") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`font-worksans font-normal ${
                isActive("/about") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About us
            </Link>
            <Link
              to="/services"
              className={`font-worksans font-normal ${
                isActive("/services") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/contact"
              className={`font-worksans font-normal ${
                isActive("/contact") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <button className="text-accent font-worksans font-medium py-4 px-12 rounded-[50px] bg-primary border border-accent mt-8">
              Appointment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
