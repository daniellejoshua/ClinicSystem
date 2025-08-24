import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlayCircle,
  FaStopCircle,
  FaSync,
  FaBell,
  FaEye,
  FaEdit,
} from "react-icons/fa";
import dataService from "../../shared/services/dataService";

const QueueManagement = () => {
  const [queueData, setQueueData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time queue monitoring
  useEffect(() => {
    loadQueueData();

    // Auto-refresh every 30 seconds to simulate real-time updates
    const interval = setInterval(() => {
      loadQueueData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadQueueData = async () => {
    try {
      setIsLoading(true);

      // Load all necessary data
      const [queue, patients, services, staff] = await Promise.all([
        dataService.getAllData("queue"),
        dataService.getAllData("patients"),
        dataService.getAllData("services"),
        dataService.getAllData("staff"),
      ]);

      setQueueData(queue || []);
      setPatientsData(patients || []);
      setServicesData(services || []);
      setStaffData(staff || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading queue data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to resolve references
  const getPatientById = (patientRef) => {
    const patientId = patientRef?.split("/")[1];
    return patientsData.find((p) => p.id === patientId);
  };

  const getServiceById = (serviceRef) => {
    const serviceId = serviceRef?.split("/")[1];
    return servicesData.find((s) => s.id === serviceId);
  };

  const getStaffById = (staffRef) => {
    const staffId = staffRef?.split("/")[1];
    return staffData.find((s) => s.id === staffId);
  };

  // Queue statistics
  const queueStats = {
    total: queueData.length,
    waiting: queueData.filter((q) => q.status === "waiting").length,
    inProgress: queueData.filter((q) => q.status === "in-progress").length,
    completed: queueData.filter((q) => q.status === "completed").length,
    highPriority: queueData.filter((q) => q.priority_flag === "high").length,
  };

  const updateQueueStatus = async (queueId, newStatus) => {
    try {
      const updateData = { status: newStatus };

      if (
        newStatus === "in-progress" &&
        !queueData.find((q) => q.id === queueId)?.called_at
      ) {
        updateData.called_at = new Date().toISOString();
      }

      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      await dataService.updateData(`queue/${queueId}`, updateData);

      // Update local state
      setQueueData((prev) =>
        prev.map((q) => (q.id === queueId ? { ...q, ...updateData } : q))
      );

      // Also update patient status
      const queueEntry = queueData.find((q) => q.id === queueId);
      if (queueEntry?.patient_ref) {
        const patientId = queueEntry.patient_ref.split("/")[1];
        await dataService.updateData(`patients/${patientId}`, {
          status: newStatus,
        });
      }
    } catch (error) {
      console.error("Error updating queue status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    return priority === "high"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="text-4xl text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-worksans">Loading queue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaClock className="text-3xl text-primary" />
              <div>
                <h1 className="text-3xl font-yeseva text-primary">
                  Queue Management
                </h1>
                <p className="text-gray-600 font-worksans">
                  Real-time patient queue monitoring and management
                </p>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={loadQueueData}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <FaSync className="w-4 h-4" />
                Refresh
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaUsers className="text-3xl text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {queueStats.total}
            </p>
            <p className="text-sm text-gray-600 font-worksans">
              Total in Queue
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaClock className="text-3xl text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {queueStats.waiting}
            </p>
            <p className="text-sm text-gray-600 font-worksans">Waiting</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaPlayCircle className="text-3xl text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {queueStats.inProgress}
            </p>
            <p className="text-sm text-gray-600 font-worksans">In Progress</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {queueStats.completed}
            </p>
            <p className="text-sm text-gray-600 font-worksans">Completed</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <FaExclamationTriangle className="text-3xl text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {queueStats.highPriority}
            </p>
            <p className="text-sm text-gray-600 font-worksans">High Priority</p>
          </div>
        </div>

        {/* Queue List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-yeseva text-primary mb-4">
            Current Queue
          </h2>

          {queueData.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-worksans">
                No patients in queue
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Queue entries will appear here when patients join
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueData
                .sort((a, b) => {
                  // Sort by priority first, then by queue number
                  if (a.priority_flag === "high" && b.priority_flag !== "high")
                    return -1;
                  if (b.priority_flag === "high" && a.priority_flag !== "high")
                    return 1;
                  return a.queue_number - b.queue_number;
                })
                .map((queueEntry) => {
                  const patient = getPatientById(queueEntry.patient_ref);
                  const service = getServiceById(queueEntry.service_ref);
                  const staff = getStaffById(queueEntry.staff_ref);

                  return (
                    <div
                      key={queueEntry.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Queue Number */}
                          <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                            {queueEntry.queue_number}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-worksans font-semibold text-lg">
                                {patient?.full_name || "Unknown Patient"}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(
                                  queueEntry.priority_flag
                                )}`}
                              >
                                {queueEntry.priority_flag === "high"
                                  ? "🔴 High Priority"
                                  : "🟡 Normal"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <FaCalendarCheck className="w-4 h-4" />
                                <span>
                                  {service?.service_name || "Unknown Service"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaUserMd className="w-4 h-4" />
                                <span>{staff?.full_name || "Unassigned"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaClock className="w-4 h-4" />
                                <span>
                                  {queueEntry.estimated_wait_time ||
                                    "Calculating..."}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                              queueEntry.status
                            )}`}
                          >
                            {queueEntry.status.charAt(0).toUpperCase() +
                              queueEntry.status.slice(1)}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {queueEntry.status === "waiting" && (
                              <button
                                onClick={() =>
                                  updateQueueStatus(
                                    queueEntry.id,
                                    "in-progress"
                                  )
                                }
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                              >
                                <FaPlayCircle className="w-3 h-3" />
                                Call
                              </button>
                            )}

                            {queueEntry.status === "in-progress" && (
                              <button
                                onClick={() =>
                                  updateQueueStatus(queueEntry.id, "completed")
                                }
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                              >
                                <FaCheckCircle className="w-3 h-3" />
                                Complete
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedPatient(patient)}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                              <FaEye className="w-3 h-3" />
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-yeseva text-primary">
                  Patient Details
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Personal Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedPatient.full_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedPatient.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedPatient.phone_number}
                    </p>
                    <p>
                      <span className="font-medium">DOB:</span>{" "}
                      {selectedPatient.date_of_birth}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Queue Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Queue #:</span>{" "}
                      {selectedPatient.queue_number}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {selectedPatient.status}
                    </p>
                    <p>
                      <span className="font-medium">Priority:</span>{" "}
                      {selectedPatient.priority_flag}
                    </p>
                    <p>
                      <span className="font-medium">Service:</span>{" "}
                      {
                        getServiceById(selectedPatient.service_ref)
                          ?.service_name
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Address</h4>
                <p className="text-sm text-gray-600">
                  {selectedPatient.address}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;
