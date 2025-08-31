import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return null; // or a loading spinner
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

export default ProtectedRoute;
