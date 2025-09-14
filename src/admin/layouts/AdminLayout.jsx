import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  isStaffLoggedIn,
  getStaffData,
  setupAutoLogout,
  setupIdleLogout,
} from "../../shared/utils/authUtils";

const AdminLayout = () => {
  const [currentStaff, setCurrentStaff] = useState(null);

  useEffect(() => {
    document.title = "Tonsuya Super Health Center Admin";
    // Set favicon to tonuysa image
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) favicon.href = "/Tonsuya.png";

    // Get staff data from localStorage
    const staffData = getStaffData();
    if (staffData) {
      setCurrentStaff(staffData);
    }

    // Setup automatic logout at 12 AM
    const cleanupAutoLogout = setupAutoLogout();

    // Setup idle logout after 30 minutes of inactivity
    const cleanupIdleLogout = setupIdleLogout(30);

    // Cleanup on unmount
    return () => {
      cleanupAutoLogout();
      cleanupIdleLogout();
    };
  }, []);

  // Check authentication periodically
  useEffect(() => {
    const checkAuth = () => {
      if (!isStaffLoggedIn()) {
        window.location.href = "/admin/login";
      }
    };

    // Check every 5 seconds
    const authCheckInterval = setInterval(checkAuth, 5000);

    return () => clearInterval(authCheckInterval);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <AdminHeader currentStaff={currentStaff} />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
