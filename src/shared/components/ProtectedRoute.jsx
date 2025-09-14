import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  isStaffLoggedIn,
  setupAutoLogout,
  setupIdleLogout,
} from "../utils/authUtils";

function ProtectedRoute({ children }) {
  const isAuthenticated = isStaffLoggedIn();

  useEffect(() => {
    if (isAuthenticated) {
      // Setup automatic logout at 12 AM
      const cleanupAutoLogout = setupAutoLogout();

      // Setup idle logout after 30 minutes of inactivity
      const cleanupIdleLogout = setupIdleLogout(30);

      // Cleanup on unmount
      return () => {
        cleanupAutoLogout();
        cleanupIdleLogout();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
