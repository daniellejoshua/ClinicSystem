import React from "react";

const InactivityModal = ({ show, onStayLoggedIn, onLogout, timeLeft }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Session Expiring Soon
        </h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          You have been inactive for a while. You will be logged out in{" "}
          <span className="font-semibold">{timeLeft}</span> seconds.
          <br />
          Do you want to stay logged in?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onStayLoggedIn}
          >
            Stay Logged In
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityModal;
