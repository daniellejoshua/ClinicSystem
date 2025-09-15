import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  isStaffLoggedIn,
  setupAutoLogout,
  setupIdleLogout,
} from "../utils/authUtils";

function ProtectedRoute({ children }) {
  // Strict authentication check - no automatic login or bypasses
  const isAuthenticated = isStaffLoggedIn();

  useEffect(() => {
    if (isAuthenticated) {
      // Setup automatic logout at 12 AM
      const cleanupAutoLogout = setupAutoLogout();

      // Setup idle logout after 30 minutes of inactivity
      const cleanupIdleLogout = setupIdleLogout(30);

      return () => {
        cleanupAutoLogout();
        cleanupIdleLogout();
      };
    }
  }, [isAuthenticated]);

  // Strict authentication - redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log(
      "🔒 Access denied: User not authenticated. Redirecting to login."
    );
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
