import React from "react";
import { FaEnvelopeOpenText } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center">
        <div className="bg-blue-100 dark:bg-gray-800 p-6 rounded-full mb-6 shadow-lg">
          <FaEnvelopeOpenText className="h-16 w-16 text-blue-600 dark:text-blue-300" />
        </div>
        <h1 className="text-4xl font-bold text-blue-800 dark:text-white mb-2 text-center">
          Oops! Page Not Found
        </h1>
        <p className="text-lg text-blue-600 dark:text-gray-300 mb-6 text-center">
          The page you are looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track!
        </p>
        <div className="flex gap-4">
          <a
            href="/"
            className="py-2 px-6 rounded-lg font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 transition shadow-lg"
          >
            Go Home
          </a>
          <a
            href="mailto:support@clinic.com"
            className="py-2 px-6 rounded-lg font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-gray-800 border border-blue-300 dark:border-gray-700 hover:bg-blue-200 dark:hover:bg-gray-700 transition shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center">
        <svg
          width="180"
          height="120"
          viewBox="0 0 180 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="90" cy="100" rx="80" ry="15" fill="#E0E7FF" />
          <rect
            x="40"
            y="40"
            width="100"
            height="50"
            rx="10"
            fill="#F3F4F6"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          <path
            d="M50 60 L90 80 L130 60"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="70"
            y="55"
            width="40"
            height="10"
            rx="3"
            fill="#3B82F6"
            opacity="0.2"
          />
          <circle cx="60" cy="65" r="3" fill="#3B82F6" />
          <circle cx="120" cy="65" r="3" fill="#3B82F6" />
        </svg>
        <span className="mt-2 text-blue-400 dark:text-blue-300 text-sm">
          Lost in the inbox?
        </span>
      </div>
    </div>
  );
};

export default NotFound;
