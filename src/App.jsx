import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Client Pages
import Home from "./client/pages/Home.jsx";
import AboutUs from "./client/pages/AboutUs.jsx";
import Services from "./client/pages/Services.jsx";
import ServiceDetail from "./client/pages/ServiceDetail.jsx";
import Contact from "./client/pages/Contact.jsx";
import FirebaseTestPage from "./client/pages/FirebaseTestPage.jsx";
import DataManagementPage from "./client/pages/DataManagementPage.jsx";
import ClientLayout from "./client/layouts/ClientLayout.jsx";

// Admin Pages
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import DataManagement from "./admin/pages/DataManagement.jsx";
import PatientsManagement from "./admin/pages/PatientsManagement.jsx";
import QueueManagement from "./admin/pages/QueueManagement.jsx";
import AdminLayout from "./admin/layouts/AdminLayout.jsx";

// Shared Components
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:serviceId" element={<ServiceDetail />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="firebase-test" element={<FirebaseTestPage />} />
          <Route path="data-management" element={<DataManagementPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/data-management" element={<DataManagement />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="queue" element={<QueueManagement />} />
          <Route path="patients" element={<PatientsManagement />} />
          <Route
            path="appointments"
            element={
              <div className="p-6">Appointment Management - Coming Soon</div>
            }
          />
          <Route
            path="doctors"
            element={<div className="p-6">Doctor Management - Coming Soon</div>}
          />
          <Route
            path="reports"
            element={<div className="p-6">Reports - Coming Soon</div>}
          />
          <Route
            path="settings"
            element={<div className="p-6">Settings - Coming Soon</div>}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
