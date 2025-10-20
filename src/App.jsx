import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { appointmentReminderService } from "./shared/services/appointmentReminderService";
import { setupAutoLogout, setupIdleLogout } from "./shared/utils/authUtils";

// --- CLIENT SIDE ROUTES & LAYOUT ---
// These imports represent the main public-facing pages and layout for patients and visitors.
import ClientLayout from "./client/layouts/ClientLayout.jsx"; // Wraps all client pages with navigation, footer, etc.
import Home from "./client/pages/Home.jsx"; // Landing page for the clinic system
import AboutUs from "./client/pages/AboutUs.jsx"; // Info about the clinic and team
import Services from "./client/pages/Services.jsx"; // List of available medical services
import Contact from "./client/pages/Contact.jsx"; // Contact form and clinic details
import ServiceDetail from "./client/pages/ServiceDetail.jsx"; // Detailed info for each service

// --- ADMIN SIDE ROUTES & LAYOUT ---
// These imports are for staff/admin users, protected by authentication.
import AdminLogin from "./admin/pages/AdminLogin.jsx"; // Login page for clinic staff
import ForgotPassword from "./admin/pages/ForgotPassword.jsx"; // Forgot password page for staff
import AdminLayout from "./admin/layouts/AdminLayout.jsx"; // Admin dashboard layout
import AdminDashboard from "./admin/pages/AdminDashboard.jsx"; // Main dashboard for staff
import DataManagement from "./admin/pages/DataManagement.jsx"; // Tools for managing clinic data
import PatientsManagement from "./admin/pages/PatientsManagement.jsx"; // Patient records and management
import QueueManagement from "./admin/pages/QueueManagement.jsx"; // Real-time queue and appointment management
import PatientCheckIn from "./admin/pages/PatientCheckIn.jsx"; // Check-in system for walk-ins and appointments
import AppointmentBooking from "./client/pages/AppointmentBooking.jsx"; // Patient appointment booking form
import AppointmentPage from "./admin/pages/AppointmentPage.jsx"; // Admin view of appointments
import AuditLog from "./admin/pages/AuditLog.jsx"; // Audit log page for admin
import QueueLogs from "./admin/pages/QueueLogs.jsx"; // Queue logs page for admin

import ProfileSettings from "./admin/pages/ProfileSettings.jsx";

// --- SHARED COMPONENTS ---
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx"; // Restricts access to admin routes
import AdminOnlyRoute from "./shared/components/AdminOnlyRoute.jsx"; // Restricts access to admin-only routes
import AddStaff from "./admin/pages/AddStaff.jsx"; // Admin tool for adding new staff
import NotFound from "./shared/components/NotFound.jsx";
/**
 * Main App component for the Online Clinic System.
 * Handles all routing logic for both client and admin sides.
 *
 * - Client routes are wrapped in ClientLayout for consistent navigation and UI.
 * - Admin routes are protected by authentication (ProtectedRoute) and use AdminLayout.
 * - Each route points to a specific page/component for the relevant user role.
 */
function App() {
  // Initialize automatic appointment reminder system
  useEffect(() => {
    // Security: Clear any invalid authentication data on app startup
    const validateAuthOnStartup = () => {
      try {
        const isLoggedIn = localStorage.getItem("isStaffLoggedIn");
        const staffData = localStorage.getItem("staffData");
        const adminToken = localStorage.getItem("adminToken");

        if (isLoggedIn === "true" && staffData && adminToken) {
          // Validate staff data structure
          const parsedStaff = JSON.parse(staffData);
          if (!parsedStaff.id || !parsedStaff.email || !parsedStaff.role) {
            console.warn(
              "🔒 Invalid authentication data detected on startup. Clearing..."
            );
            localStorage.removeItem("isStaffLoggedIn");
            localStorage.removeItem("staffData");
            localStorage.removeItem("adminToken");
          }
        }
      } catch (error) {
        console.warn(
          "🔒 Authentication validation error on startup. Clearing..."
        );
        localStorage.removeItem("isStaffLoggedIn");
        localStorage.removeItem("staffData");
        localStorage.removeItem("adminToken");
      }
    };

    // Validate authentication on startup
    validateAuthOnStartup();

    const schedulerInterval =
      appointmentReminderService.startAutomaticReminders();

    // Setup global authentication watchers
    const cleanupAutoLogout = setupAutoLogout();
    const cleanupIdleLogout = setupIdleLogout(30); // 30 minutes idle timeout

    // Cleanup on unmount
    return () => {
      if (schedulerInterval) {
        clearInterval(schedulerInterval);
      }
      cleanupAutoLogout();
      cleanupIdleLogout();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* --- CLIENT ROUTES ---
            These are public-facing pages for patients and visitors.
            The ClientLayout wraps all client pages, providing navigation, notifications, and footer.
        */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} /> {/* Home/Landing page */}
          <Route path="about" element={<AboutUs />} /> {/* Clinic info */}
          <Route path="services" element={<Services />} />{" "}
          {/* List of services */}
          <Route path="services/:id" element={<ServiceDetail />} />{" "}
          {/* Service details */}
          <Route path="contact" element={<Contact />} /> {/* Contact form */}
          <Route path="appointment" element={<AppointmentBooking />} />{" "}
          {/* Patient appointment booking */}
        </Route>
        {/* --- ADMIN ROUTES ---
            These routes are for staff/admin users only.
            ProtectedRoute ensures only authenticaWted users can access these pages.
            AdminLayout provides sidebar, dashboard, and admin navigation.
        */}
        <Route path="/admin/login" element={<AdminLogin />} />{" "}
        {/* Staff login */}
        <Route
          path="/admin/forgot-password"
          element={<ForgotPassword />}
        />{" "}
        {/* Forgot password */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />{" "}
          {/* Default admin dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />{" "}
          {/* Dashboard shortcut */}
          <Route path="data-management" element={<DataManagement />} />{" "}
          {/* Data management tools */}
          <Route path="patients" element={<PatientsManagement />} />{" "}
          {/* Patient records */}
          <Route path="queue" element={<QueueManagement />} />{" "}
          {/* Queue and appointment management */}
          <Route path="check-in" element={<PatientCheckIn />} />{" "}
          {/* Patient check-in */}
          <Route path="appointment" element={<AppointmentPage />} />{" "}
          {/* Appointment details */}
          <Route
            path="add-staff"
            element={
              <AdminOnlyRoute>
                <AddStaff />
              </AdminOnlyRoute>
            }
          />
          <Route path="settings/profile" element={<ProfileSettings />} />
          <Route
            path="audit-log"
            element={
              <AdminOnlyRoute>
                <AuditLog />
              </AdminOnlyRoute>
            }
          />
          {/* Audit log page */}
          <Route
            path="queue-logs"
            element={
              <AdminOnlyRoute>
                <QueueLogs />
              </AdminOnlyRoute>
            }
          />
          {/* Queue logs page for admin */}
        </Route>
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
