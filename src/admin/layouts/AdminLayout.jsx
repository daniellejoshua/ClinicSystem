import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  const [currentStaff, setCurrentStaff] = useState(null);

  useEffect(() => {
    document.title = "Tonsuya Super Health Center Admin";
    // Set favicon to tonuysa image
    const favicon = document.querySelector("link[rel~='icon']");
    if (favicon) favicon.href = "/Tonsuya.png";

    // Get staff data from localStorage
    const staffData = localStorage.getItem("staffData");
    if (staffData) {
      setCurrentStaff(JSON.parse(staffData));
    }
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
