import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children }) => {
  // Check if any staff member is logged in (admin, doctor, nurse, receptionist)
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
