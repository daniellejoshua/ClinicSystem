import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaUserMd,
  FaChartBar,
} from "react-icons/fa";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin", icon: FaTachometerAlt, label: "Dashboard", exact: true },
    { path: "/admin/queue", icon: FaClipboardList, label: "Queue Management" },
    { path: "/admin/patients", icon: FaUsers, label: "Patients" },
    { path: "/admin/appointments", icon: FaCalendarAlt, label: "Appointments" },
    { path: "/admin/doctors", icon: FaUserMd, label: "Doctors" },
    { path: "/admin/reports", icon: FaChartBar, label: "Reports" },
    { path: "/admin/settings", icon: FaCog, label: "Settings" },
  ];

  return (
    <div className="w-64 bg-primary shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-yeseva text-white">Clinic Admin</h2>
        <p className="text-accent/80 text-sm font-worksans">Management Panel</p>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-white hover:bg-accent/20 transition-colors ${
                isActive ? "bg-accent border-r-4 border-accent" : ""
              }`
            }
          >
            <item.icon className="mr-3 text-lg" />
            <span className="font-worksans">{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-6 py-3 text-white hover:bg-red-500/20 transition-colors mt-8"
        >
          <FaSignOutAlt className="mr-3 text-lg" />
          <span className="font-worksans">Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;
