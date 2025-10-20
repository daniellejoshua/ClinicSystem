import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isStaffLoggedIn, getStaffData } from "../utils/authUtils";
import { Card, CardContent } from "../../components/ui/card";
import {
  FaShieldAlt,
  FaUserShield,
  FaArrowLeft,
  FaHome,
  FaExclamationTriangle,
} from "react-icons/fa";

const AdminOnlyRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = isStaffLoggedIn();
  const staffData = getStaffData();
  const isAdmin = staffData?.role?.toLowerCase() === "admin";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/admin");
    }
  };

  const handleGoHome = () => {
    navigate("/admin");
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-400 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Security Icon */}
          <div className="mb-8 relative">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 dark:from-gray-700 dark:to-gray-800 p-8 rounded-full mb-6 shadow-2xl mx-auto w-32 h-32 flex items-center justify-center border-4 border-red-200 dark:border-gray-600">
              <FaShieldAlt className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-800 bg-clip-text text-transparent dark:from-red-400 dark:via-orange-400 dark:to-red-300 mb-2 ">
              303
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-400 to-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 font-yeseva">
              Access Denied
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 font-worksans leading-relaxed max-w-lg mx-auto">
              This section is restricted to administrators only.
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 font-worksans mb-4">
              Your current role:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">
                {staffData?.role || "Unknown"}
              </span>
            </p>

            {/* Current User Display */}
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaUserShield className="text-blue-500" />
                <span className="font-medium">
                  {staffData?.full_name || "Staff Member"}
                </span>
                <span className="mx-2">•</span>
                <span className="capitalize">
                  {staffData?.role || "Staff"} Account
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleGoHome}
              className="group flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
            >
              <FaHome className="group-hover:rotate-12 transition-transform duration-300" />
              Go to Dashboard
            </button>

            <button
              onClick={handleGoBack}
              className="group flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </button>
          </div>

          {/* Contact Administrator */}
          <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 font-yeseva">
              Need Administrative Access?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-worksans">
              Contact your system administrator if you believe you should have
              access to this administrative section.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Current permissions:
              </span>
              <span className="font-medium text-blue-600 dark:text-blue-400 capitalize">
                {staffData?.role || "Standard"} Level Access
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminOnlyRoute;
