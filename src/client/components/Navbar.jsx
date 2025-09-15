import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// import { FaMoon, FaSun } from "react-icons/fa";

export default function Navbar({ isMenuOpen, setIsMenuOpen }) {
  const location = useLocation();

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
          {/* Right Side - Appointment Button */}
          <div className="hidden md:flex items-center space-x-4">
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
              <button onClick={toggleMenu} className="text-2xl text-white">
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu Overlay - improved, only one block */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#BFD2F8] bg-opacity-95 z-50 flex items-center justify-center transition-colors duration-300">
          <div className="relative w-[90vw] max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6 items-center">
            {/* Close button */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 text-3xl text-primary hover:text-accent focus:outline-none"
              aria-label="Close menu"
            >
              ✕
            </button>
            <Link
              to="/"
              className={`font-worksans font-bold text-xl ${
                isActive("/") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`font-worksans font-normal text-lg ${
                isActive("/about") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About us
            </Link>
            <Link
              to="/services"
              className={`font-worksans font-normal text-lg ${
                isActive("/services") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/contact"
              className={`font-worksans font-normal text-lg ${
                isActive("/contact") ? "text-accent" : "text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/appointment"
              className="w-full text-center font-worksans font-bold py-3 rounded-lg bg-accent text-white mt-4 text-lg shadow hover:bg-accent/90 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
