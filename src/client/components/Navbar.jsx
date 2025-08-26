import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Navbar({ isMenuOpen, setIsMenuOpen }) {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-primary dark:bg-gray-900 text-white py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center space-x-8 mx-auto lg:mx-0">
            <Link
              to="/"
              className={`font-worksans font-medium hover:text-accent dark:hover:text-accent transition-colors ${
                isActive("/") ? "text-accent" : "text-white dark:text-gray-300"
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`font-worksans font-medium hover:text-accent dark:hover:text-accent transition-colors ${
                isActive("/about")
                  ? "text-accent"
                  : "text-white dark:text-gray-300"
              }`}
            >
              About us
            </Link>
            <Link
              to="/services"
              className={`font-worksans font-medium hover:text-accent dark:hover:text-accent transition-colors ${
                isActive("/services")
                  ? "text-accent"
                  : "text-white dark:text-gray-300"
              }`}
            >
              Services
            </Link>

            <Link
              to="/contact"
              className={`font-worksans font-medium hover:text-accent dark:hover:text-accent transition-colors ${
                isActive("/contact")
                  ? "text-accent"
                  : "text-white dark:text-gray-300"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Side - Search, Dark Mode Toggle and Appointment */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button className="text-white dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
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

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-white dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <FaSun className="w-5 h-5" />
              ) : (
                <FaMoon className="w-5 h-5" />
              )}
            </button>

            {/* Appointment Button */}
            <Link
              to="/appointment"
              className="bg-accent dark:bg-accent/90 text-primary dark:text-white px-6 py-2 rounded-full font-worksans font-semibold hover:bg-accent/90 dark:hover:bg-accent/80 transition-colors"
            >
              Appointment
            </Link>
          </div>

          {/* Mobile: Logo and Hamburger */}
          <div className="md:hidden flex items-center justify-between w-full">
            <Link
              to="/"
              className="text-xl font-yeseva text-white dark:text-gray-300"
            >
              TONSUYA SUPER HEALTH CENTER
            </Link>
            <div className="flex items-center space-x-2">
              {/* Mobile Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1 text-white dark:text-gray-300 hover:text-accent transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <FaSun className="w-5 h-5" />
                ) : (
                  <FaMoon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleMenu}
                className="text-2xl text-white dark:text-gray-300"
              >
                {isMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#BFD2F8] dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-95 z-50 transition-colors duration-300">
          <div className="flex flex-col items-center justify-center h-full gap-8 text-primary dark:text-gray-300 text-2xl pt-20">
            <Link
              to="/"
              className={`font-worksans font-bold ${
                isActive("/")
                  ? "text-accent dark:text-accent"
                  : "text-primary dark:text-gray-300"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`font-worksans font-normal ${
                isActive("/about")
                  ? "text-accent dark:text-accent"
                  : "text-primary dark:text-gray-300"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About us
            </Link>
            <Link
              to="/services"
              className={`font-worksans font-normal ${
                isActive("/services")
                  ? "text-accent dark:text-accent"
                  : "text-primary dark:text-gray-300"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/appointment"
              className={`font-worksans font-bold bg-accent dark:bg-accent/90 text-white px-6 py-3 rounded-lg ${
                isActive("/appointment")
                  ? "bg-primary dark:bg-gray-700 text-accent"
                  : "bg-accent dark:bg-accent/90 text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Book Appointment
            </Link>
            <Link
              to="/contact"
              className={`font-worksans font-normal ${
                isActive("/contact")
                  ? "text-accent dark:text-accent"
                  : "text-primary dark:text-gray-300"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/appointment"
              className="text-accent dark:text-accent font-worksans font-medium py-4 px-12 rounded-[50px] bg-primary dark:bg-gray-700 border border-accent dark:border-accent mt-8 transition-colors duration-300"
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
