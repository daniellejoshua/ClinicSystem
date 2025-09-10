import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// import { FaMoon, FaSun } from "react-icons/fa";

export default function Navbar({ isMenuOpen, setIsMenuOpen }) {
  const location = useLocation();
  // Removed dark mode state

  // Removed dark mode effect

  // Removed dark mode toggle

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-primary text-white py-4 transition-colors duration-300">
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

          {/* Right Side - Search, Dark Mode Toggle and Appointment */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Removed dark mode toggle button */}

            {/* Appointment Button */}
            <Link
              to="/appointment"
              className="bg-accent text-primary px-6 py-2 rounded-full font-worksans font-semibold hover:bg-accent/90 transition-colors"
            >
              Appointment
            </Link>
          </div>

          {/* Mobile: Logo and Hamburger */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Link to="/" className="text-xl font-yeseva text-white">
              TONSUYA SUPER HEALTH CENTER
            </Link>
            <div className="flex items-center space-x-2">
              {/* Removed mobile dark mode toggle button */}
              <button onClick={toggleMenu} className="text-2xl text-white">
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#BFD2F8] bg-opacity-95 z-50 transition-colors duration-300">
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
              to="/appointment"
              className={`font-worksans font-bold bg-accent text-white px-6 py-3 rounded-lg ${
                isActive("/appointment")
                  ? "bg-primary text-accent"
                  : "bg-accent text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Book Appointment
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
            <Link
              to="/appointment"
              className="text-accent font-worksans font-medium py-4 px-12 rounded-[50px] bg-primary border border-accent mt-8 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Appointment
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
