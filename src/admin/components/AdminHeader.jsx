import React, { useState } from "react";
import { FaBell, FaUser, FaChevronDown, FaSearch } from "react-icons/fa";

const AdminHeader = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-primary transition-colors relative">
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
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <FaUser className="text-white text-sm" />
              </div>
              <span className="font-worksans text-gray-700">Admin</span>
              <FaChevronDown className="text-gray-400 text-sm" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Profile Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Change Password
                </a>
                <hr className="my-2" />
                <a
                  href="#"
                  className="block px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
