import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../shared/config/firebase";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../../shared/services/authService";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaUserMd,
  FaChartBar,
  FaUserCheck,
  FaUser,
  FaListUl,
} from "react-icons/fa";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const staff = authService.getCurrentStaff();
    setCurrentStaff(staff);
    setIsAdmin(authService.isAdmin());
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      path: "/admin",
      icon: FaTachometerAlt,
      label: "Dashboard",
      exact: true,
      adminOnly: false,
    },
    {
      path: "/admin/queue",
      icon: FaClipboardList,
      label: "Queue Management",
      adminOnly: false,
    },
    {
      path: "/admin/check-in",
      icon: FaUserCheck,
      label: "Patient Check-in",
      adminOnly: false,
    },
    {
      path: "/admin/patients",
      icon: FaUsers,
      label: "Patients",
      adminOnly: false,
    },
    // {
    //   path: "/admin/data-management",
    //   icon: FaChartBar,
    //   label: "Data Management",
    //   adminOnly: false,
    // },
    {
      path: "/admin/appointment",
      icon: FaCalendarAlt,
      label: "Appointments",
      adminOnly: false,
    },
    {
      path: "/admin/add-staff",
      icon: FaUserMd,
      label: "Add Staff",
      adminOnly: true,
    },
    {
      path: "/admin/settings/profile",
      icon: FaUser,
      label: "Profile Settings",
      adminOnly: false,
    },
    {
      path: "/admin/audit-log",
      icon: FaClipboardList,
      label: "Audit Log",
      adminOnly: true,
    },
    {
      path: "/admin/queue-logs",
      icon: FaListUl,
      label: "Queue Logs",
      adminOnly: true,
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="w-64 bg-gradient-to-b from-primary to-primary/90 dark:from-gray-800 dark:to-gray-900 shadow-2xl transition-all duration-300 border-r border-primary/20 dark:border-gray-700">
      <div className="p-6 border-b border-primary/20 dark:border-gray-700 bg-gradient-to-r from-primary/10 to-transparent dark:from-gray-700/50 dark:to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src="/Tonsuya.png"
              alt="Tonsuya Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white dark:text-gray-100 font-yeseva">
              {isAdmin ? "Admin" : "Staff"} Panel
            </h2>
          </div>
        </div>
        <div className="bg-white/10 dark:bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm border border-white/20 dark:border-gray-600">
          <p className="text-white dark:text-gray-200 text-sm font-medium font-worksans">
            {currentStaff?.full_name || "Management Panel"}
          </p>
          <p className="text-white/70 dark:text-gray-400 text-xs font-worksans capitalize">
            {currentStaff?.role || "staff"} • Online
          </p>
        </div>
      </div>

      <nav className="mt-6 px-3 space-y-1">
        {filteredMenuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? "bg-white/20 dark:bg-gray-700/70 text-white dark:text-gray-100 shadow-lg backdrop-blur-sm border border-white/30 dark:border-gray-600"
                  : "text-white/80 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:text-white dark:hover:text-gray-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 dark:from-gray-600/50 dark:to-gray-700/30 rounded-xl" />
                )}
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg ${
                    isActive
                      ? "bg-white/20 dark:bg-gray-600 shadow-md"
                      : "bg-white/10 dark:bg-gray-700/50 group-hover:bg-white/20 dark:group-hover:bg-gray-600"
                  } transition-all duration-200`}
                >
                  <item.icon className="text-lg" />
                </div>
                <span className="ml-3 font-worksans relative z-10">
                  {item.label}
                </span>
                {item.adminOnly && (
                  <span className="ml-auto text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-medium shadow-sm relative z-10">
                    Admin
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white dark:bg-gray-300 rounded-l-full shadow-sm" />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-8 pt-4 border-t border-white/20 dark:border-gray-600">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="group w-full flex items-center px-4 py-3 text-sm font-medium text-white/80 dark:text-gray-300 hover:bg-red-500/20 dark:hover:bg-red-500/20 hover:text-white dark:hover:text-gray-100 rounded-xl transition-all duration-200"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 dark:bg-red-500/30 group-hover:bg-red-500/30 dark:group-hover:bg-red-500/40 transition-all duration-200">
              <FaSignOutAlt className="text-lg" />
            </div>
            <span className="ml-3 font-worksans">Logout</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowLogoutDialog(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700 z-10 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                <FaSignOutAlt className="text-red-600 dark:text-red-400 h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Confirm Logout
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Are you sure you want to log out? You will need to log in again
                to access the admin panel.
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={handleLogout}
                >
                  Yes, Logout
                </button>
                <button
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowLogoutDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
