import React, { useState } from "react";
import { FaClock, FaTimes, FaBell, FaUser } from "react-icons/fa";

const QueueNotification = ({ queueData }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!queueData) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500";
      case "serving":
        return "bg-green-500 animate-pulse";
      case "called":
        return "bg-blue-500 animate-pulse";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "waiting":
        return "In Queue";
      case "serving":
        return "Your Turn!";
      case "called":
        return "Please Come In";
      default:
        return "Unknown";
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className={`${getStatusColor(
            queueData.status
          )} text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all`}
        >
          <FaBell className="text-xl" />
          {queueData.queueNumber && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {queueData.queueNumber}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border-l-4 border-primary p-4 max-w-sm z-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(
              queueData.status
            )}`}
          ></div>
          <h4 className="font-worksans font-bold text-primary">
            Queue #{queueData.queueNumber || "N/A"}
          </h4>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            −
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-worksans font-medium text-secondary">
          Status:{" "}
          <span className="text-primary">
            {getStatusText(queueData.status)}
          </span>
        </p>

        {queueData.status === "waiting" && queueData.estimatedWait && (
          <div className="flex items-center gap-2 text-sm text-secondary">
            <FaClock />
            <span>Est. wait: {queueData.estimatedWait} mins</span>
          </div>
        )}

        {queueData.status === "serving" && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="text-green-800 font-worksans font-medium text-sm">
              🎉 It's your turn! Please proceed to the clinic.
            </p>
          </div>
        )}

        {queueData.status === "called" && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-blue-800 font-worksans font-medium text-sm">
              📢 You have been called! Please come to the front desk.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueNotification;
