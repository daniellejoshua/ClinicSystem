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
    {
      path: "/admin/data-management",
      icon: FaChartBar,
      label: "Data Management",
      adminOnly: false,
    },
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
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="w-64 bg-primary dark:bg-gray-800 shadow-lg transition-colors duration-300">
      <div className="p-6">
        <h2 className="text-2xl font-yeseva text-white dark:text-gray-100">
          Clinic {isAdmin ? "Admin" : "Staff"}
        </h2>
        <p className="text-accent/80 dark:text-gray-400 text-sm font-worksans">
          {currentStaff?.full_name || "Management Panel"}
        </p>
        <p className="text-accent/60 dark:text-gray-500 text-xs font-worksans">
          Role: {currentStaff?.role || "staff"}
        </p>
      </div>

      <nav className="mt-8">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-white dark:text-gray-300 hover:bg-accent/20 dark:hover:bg-gray-700 transition-colors ${
                isActive
                  ? "bg-accent dark:bg-gray-700 border-r-4 border-accent dark:border-blue-400"
                  : ""
              }`
            }
          >
            <item.icon className="mr-3 text-lg" />
            <span className="font-worksans">{item.label}</span>
            {item.adminOnly && (
              <span className="ml-auto text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center px-6 py-3 text-white dark:text-gray-300 hover:bg-red-500/20 dark:hover:bg-red-500/20 transition-colors mt-8"
        >
          <FaSignOutAlt className="mr-3 text-lg" />
          <span className="font-worksans">Logout</span>
        </button>
      </nav>

      {/* Logout Confirmation Dialog */}
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
                onClick={handleLogout}
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
    </div>
  );
};

export default AdminSidebar;
