import React from "react";
import { FaStethoscope, FaHome, FaPhone, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-400 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Medical Icon with Animation */}
        <div className="mb-8 relative">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 p-8 rounded-full mb-6 shadow-2xl mx-auto w-32 h-32 flex items-center justify-center border-4 border-blue-200 dark:border-gray-600 animate-bounce">
            <FaStethoscope className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-ping delay-300 opacity-75"></div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 mb-2 animate-pulse">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 font-yeseva">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 font-worksans leading-relaxed max-w-lg mx-auto">
            The page you're looking for seems to have wandered off from our
            clinic.
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400 font-worksans">
            Don't worry, our medical team is here to help you find your way
            back!
          </p>

          {/* Current Path Display */}
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              Requested:{" "}
              <span className="text-red-500 dark:text-red-400">
                {location.pathname}
              </span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleGoHome}
            className="group flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
          >
            <FaHome className="group-hover:rotate-12 transition-transform duration-300" />
            Go to Homepage
          </button>

          <button
            onClick={handleGoBack}
            className="group flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </button>
        </div>

        {/* Contact Support */}
        <div className="p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 font-yeseva">
            Need Medical Assistance?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-worksans">
            Our support team is always ready to help you navigate our clinic
            services.
          </p>
          <a
            href="mailto:tonsuyasuperhealthcenter499@gmail.com"
            className="group inline-flex items-center gap-2 py-2 px-4 rounded-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 border border-blue-200 dark:border-blue-800"
          >
            <FaPhone className="group-hover:rotate-12 transition-transform duration-300" />
            Contact Support
          </a>
        </div>
      </div>

      {/* Decorative Medical Illustration */}
      <div className="mt-8 opacity-60 dark:opacity-40">
        <svg
          width="200"
          height="150"
          viewBox="0 0 200 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-float"
        >
          {/* Shadow */}
          <ellipse
            cx="100"
            cy="135"
            rx="60"
            ry="10"
            fill="currentColor"
            className="text-gray-300 dark:text-gray-700"
            opacity="0.3"
          />

          {/* Medical Bag */}
          <rect
            x="60"
            y="70"
            width="80"
            height="50"
            rx="8"
            fill="currentColor"
            className="text-red-500"
          />
          <rect
            x="65"
            y="75"
            width="70"
            height="10"
            rx="3"
            fill="currentColor"
            className="text-red-400"
          />

          {/* Cross Symbol */}
          <rect x="95" y="85" width="10" height="20" rx="2" fill="white" />
          <rect x="90" y="90" width="20" height="10" rx="2" fill="white" />

          {/* Handle */}
          <rect
            x="85"
            y="60"
            width="30"
            height="8"
            rx="4"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-400"
          />
          <rect
            x="85"
            y="50"
            width="8"
            height="15"
            rx="4"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-400"
          />
          <rect
            x="107"
            y="50"
            width="8"
            height="15"
            rx="4"
            fill="currentColor"
            className="text-gray-600 dark:text-gray-400"
          />

          {/* Floating Pills */}
          <circle
            cx="40"
            cy="50"
            r="8"
            fill="currentColor"
            className="text-blue-400 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <circle
            cx="160"
            cy="40"
            r="6"
            fill="currentColor"
            className="text-green-400 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          />
          <circle
            cx="170"
            cy="80"
            r="5"
            fill="currentColor"
            className="text-yellow-400 animate-bounce"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="30"
            cy="90"
            r="7"
            fill="currentColor"
            className="text-purple-400 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          />
        </svg>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
