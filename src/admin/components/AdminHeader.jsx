import React, { useState } from "react";
import {
  FaBell,
  FaUser,
  FaChevronDown,
  FaSearch,
  FaBars,
  FaMoon,
  FaSun,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { logout } from "../../shared/utils/authUtils";

const AdminHeader = ({ onToggleSidebar, title, subtitle, currentStaff }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [notifications] = useState(1); // Mock notification count
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Sync dark mode with document and localStorage
  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  // Ensure theme is applied on mount
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={handleToggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <FaSun className="w-5 h-5 text-yellow-400" />
            ) : (
              <FaMoon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors relative">
              <FaBell className="text-xl" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <span className="font-worksans text-gray-700 dark:text-gray-300">
                {currentStaff?.full_name || "Admin"}
              </span>
              <FaChevronDown className="text-gray-400 dark:text-gray-500 text-sm" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-10 transition-colors duration-200">
                <Link
                  to="/admin/settings/profile"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Profile Settings
                </Link>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowLogoutDialog(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-8 border-2 border-red-500 z-10 flex flex-col items-center">
            <FaSignOutAlt className="text-red-500 h-10 w-10 mb-4" />
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2 text-center">
              Confirm Logout
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
              Are you sure you want to log out? You will need to log in again to
              access the admin panel.
            </p>
            <div className="flex gap-4 mt-2">
              <button
                className="py-2 px-6 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition"
                onClick={() => {
                  logout();
                  setShowLogoutDialog(false);
                }}
              >
                Yes, Logout
              </button>
              <button
                className="py-2 px-6 rounded-lg font-semibold text-red-600 bg-white dark:bg-gray-700 border border-red-600 hover:bg-red-50 dark:hover:bg-gray-600 transition"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
