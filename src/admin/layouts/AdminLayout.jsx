import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
