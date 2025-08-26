import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Client Pages
import ClientLayout from "./client/layouts/ClientLayout.jsx";
import Home from "./client/pages/Home.jsx";
import AboutUs from "./client/pages/AboutUs.jsx";
import Services from "./client/pages/Services.jsx";
import Contact from "./client/pages/Contact.jsx";
import ServiceDetail from "./client/pages/ServiceDetail.jsx";

// Admin Pages
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminLayout from "./admin/layouts/AdminLayout.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import DataManagement from "./admin/pages/DataManagement.jsx";
import PatientsManagement from "./admin/pages/PatientsManagement.jsx";
import QueueManagement from "./admin/pages/QueueManagement.jsx";
import PatientCheckIn from "./admin/pages/PatientCheckIn.jsx";
import AppointmentBooking from "./client/pages/AppointmentBooking.jsx";
// Shared Components
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Client Routes with Layout */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="appointment" element={<AppointmentBooking />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
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
          <Route path="data-management" element={<DataManagement />} />
          <Route path="patients" element={<PatientsManagement />} />
          <Route path="queue" element={<QueueManagement />} />
          <Route path="check-in" element={<PatientCheckIn />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
