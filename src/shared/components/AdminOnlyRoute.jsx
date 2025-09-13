import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";
import { Card, CardContent } from "../../components/ui/card";
import { AlertCircle } from "lucide-react";

const AdminOnlyRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 w-full max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <Card className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
              Access Denied
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">
              This page is restricted to administrators only.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Contact your system administrator if you believe you should have
              access to this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
};

export default AdminOnlyRoute;
