// This page lets staff manage the patient queue for today
// Staff can see who's waiting, in progress, completed, online, or walk-in
// The queue resets every day at 3:00AM so staff always start fresh
// Staff can select patients, update their status, and add walk-ins
// The UI updates in real time as patients move through the queue

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
  FaUserPlus,
  FaStar,
  FaGlobe,
  FaWalking,
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import queueService from "../../shared/services/queueService";
import customDataService from "../../shared/services/customDataService";
import { Badge } from "../../components/ui/badge";

const QueueManagement = () => {
  const [queueData, setQueueData] = useState([]);
  const [services, setServices] = useState([]);
  const [queueStats, setQueueStats] = useState({
    total: 0,
    waiting: 0,
    inProgress: 0,
    completed: 0,
    online: 0,
    walkin: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showWalkinForm, setShowWalkinForm] = useState(false);
  const [walkinFormData, setWalkinFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    service_ref: "General Consultation",
  });

  // Removed walk-in modal state for cleaner UI
  // Helper to resolve service name from reference
  const getServiceName = (serviceRef) => {
    if (!serviceRef || !services.length) return "Unknown Service";
    const serviceId = serviceRef.split("/").pop();
    const service = services.find((s) => s.id === serviceId);
    return service ? service.service_name : serviceRef;
  };

  useEffect(() => {
    // Load all services for reference resolution
    customDataService.getAllData("services").then(setServices);

    // Helper to check if we need to reset queue
    const checkAndResetQueue = () => {
      const now = new Date();
      const last =
        lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
      // 3:00AM today
      const resetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        3,
        0,
        0,
        0
      );
      // If now is after 3:00AM and lastUpdated is before 3:00AM today, reset
      if (now >= resetTime && last < resetTime) {
        setQueueData([]);
        setQueueStats({
          total: 0,
          waiting: 0,
          inProgress: 0,
          completed: 0,
          online: 0,
          walkin: 0,
        });
      }
    };

    loadQueueData();

    // Subscribe to real-time updates
    const unsubscribe = queueService.subscribeToTodayQueue((queue) => {
      // Sort: emergency/high priority first, then online, then normal walk-ins
      const sortedQueue = [...queue].sort((a, b) => {
        // Emergency/high priority always first
        if (a.priority_flag === "high" && b.priority_flag !== "high") return -1;
        if (a.priority_flag !== "high" && b.priority_flag === "high") return 1;
        // Online next
        if (a.appointment_type === "online" && b.appointment_type !== "online")
          return -1;
        if (a.appointment_type !== "online" && b.appointment_type === "online")
          return 1;
        // Then walk-ins by arrival time
        return new Date(a.arrival_time) - new Date(b.arrival_time);
      });
      setQueueData(sortedQueue);
      updateQueueStats(sortedQueue);
      setLastUpdated(new Date());
      checkAndResetQueue();
    });

    // Also check on mount
    checkAndResetQueue();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadQueueData = async () => {
    try {
      setIsLoading(true);
      const queue = await queueService.getTodayQueue();
      setQueueData(queue);
      updateQueueStats(queue);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading queue data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQueueStats = async (queue = queueData) => {
    const stats = {
      total: queue.length,
      waiting: queue.filter((q) => q.status === "waiting").length,
      inProgress: queue.filter((q) => q.status === "in-progress").length,
      completed: queue.filter((q) => q.status === "completed").length,
      online: queue.filter((q) => q.appointment_type === "online").length,
      walkin: queue.filter((q) => q.appointment_type === "walkin").length,
    };
    setQueueStats(stats);
  };

  const updateQueueStatus = async (queueId, newStatus) => {
    try {
      // Update queue status
      await queueService.updateQueueStatus(queueId, newStatus);

      // Find the queue entry to get appointment_id or patient_id
      const queueEntry = queueData.find((entry) => entry.id === queueId);
      if (queueEntry) {
        // Try appointment_id first (for online), fallback to patient_id (for walk-in)
        const patientId = queueEntry.appointment_id || queueEntry.patient_id;
        if (patientId) {
          // Update patient status in 'patients' collection
          const db = require("firebase/database").getDatabase();
          const patientRef = require("firebase/database").ref(
            db,
            `patients/${patientId}`
          );
          await require("firebase/database").update(patientRef, {
            status: newStatus,
          });
        }
      }
      // Real-time subscription will update the UI automatically
    } catch (error) {
      console.error("Error updating queue status:", error);
    }
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await queueService.addWalkinToQueue(walkinFormData);
      if (result.success) {
        setShowWalkinForm(false);
        setWalkinFormData({
          full_name: "",
          email: "",
          phone_number: "",
          service_ref: "General Consultation",
        });
        alert(`Success! Queue number: ${result.queueNumber}`);
      } else {
        alert("Error adding walk-in patient");
      }
    } catch (error) {
      console.error("Error adding walk-in:", error);
      alert("Error adding walk-in patient");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getTypeColor = (type) => {
    return type === "online"
      ? "bg-blue-500 text-white"
      : "bg-gray-500 text-white";
  };

  const getQueueNumberDisplay = (queueNumber, appointmentType) => {
    if (typeof queueNumber === "string" && queueNumber.startsWith("E-")) {
      // Emergency/high priority walk-in
      return (
        <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
          <div className="text-center">
            <div className="text-xs">⚡</div>
            <div>{queueNumber}</div>
          </div>
        </div>
      );
    } else if (appointmentType === "online") {
      return (
        <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-sm">
          <div className="text-center">
            <div className="text-xs">🌟</div>
            <div>{queueNumber}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
          {queueNumber}
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading queue data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Emergency Notification */}
        {queueData.some(
          (q) => q.priority_flag === "high" && q.status !== "completed"
        ) && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-400 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
            <div>
              <span className="font-bold text-red-800">Emergency Alert:</span>
              <span className="ml-2 text-red-700">
                There is a high priority patient in the queue. Please attend
                immediately!
              </span>
            </div>
          </div>
        )}
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaClock className="text-3xl text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Queue Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Real-time patient queue with priority system
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={loadQueueData}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <FaSync className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FaUsers className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {queueStats.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FaClock className="text-2xl text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {queueStats.waiting}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Waiting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FaPlayCircle className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {queueStats.inProgress}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {queueStats.completed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FaGlobe className="text-2xl text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {queueStats.online}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FaWalking className="text-2xl text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {queueStats.walkin}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Walk-in
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Priority System Info */}
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="py-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Priority Queue System:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
              <div>
                <strong>Online Appointments (Priority):</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Get queue numbers with O- prefix (O-001, O-002)</li>
                  <li>• Served before walk-ins regardless of arrival time</li>
                  <li>• Priority based on original booking time</li>
                </ul>
              </div>
              <div>
                <strong>Walk-in Patients:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Get regular queue numbers (001, 002, 003)</li>
                  <li>• Served after online patients</li>
                  <li>• Served in arrival order</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Current Queue ({queueData.length} patients)
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sorted by priority: Online appointments first, then walk-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queueData.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No patients in queue
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Queue entries will appear here when patients check in
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="min-w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow">
                    <tr>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Queue #
                      </th>
                      <th className="px-6 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 min-w-[180px]">
                        Name
                      </th>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Service
                      </th>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Type
                      </th>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Status
                      </th>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Time
                      </th>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Phone
                      </th>
                      <th className="px-4 py-3 border-b text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueData.map((queueEntry) => (
                      <tr
                        key={queueEntry.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 border-b">
                          {getQueueNumberDisplay(
                            queueEntry.queue_number,
                            queueEntry.appointment_type
                          )}
                        </td>
                        <td className="px-6 py-3 border-b font-semibold text-gray-900 dark:text-white min-w-[180px]">
                          <span
                            className="block truncate max-w-[220px] cursor-pointer"
                            title={queueEntry.full_name}
                          >
                            {queueEntry.full_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b">
                          {getServiceName(queueEntry.service_ref)}
                        </td>
                        <td className="px-6 py-3 border-b min-w-[160px]">
                          <Badge
                            className={getTypeColor(
                              queueEntry.appointment_type
                            )}
                          >
                            {queueEntry.appointment_type === "online" ? (
                              <>
                                <FaStar className="w-3 h-3 mr-1" />
                                Online
                              </>
                            ) : (
                              <>
                                <FaWalking className="w-3 h-3 mr-1" />
                                Walk-in
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 border-b">
                          <Badge className={getStatusColor(queueEntry.status)}>
                            {queueEntry.status.charAt(0).toUpperCase() +
                              queueEntry.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 border-b">
                          {queueEntry.appointment_type === "online"
                            ? `Booked: ${
                                queueEntry.booked_at
                                  ? new Date(
                                      queueEntry.booked_at
                                    ).toLocaleTimeString()
                                  : "-"
                              }`
                            : `Arrived: ${
                                queueEntry.arrival_time
                                  ? new Date(
                                      queueEntry.arrival_time
                                    ).toLocaleTimeString()
                                  : "-"
                              }`}
                        </td>
                        <td className="px-4 py-3 border-b">
                          {queueEntry.phone_number}
                        </td>
                        <td className="px-4 py-3 border-b">
                          <div className="flex gap-2">
                            {queueEntry.status === "waiting" && (
                              <Button
                                onClick={() =>
                                  updateQueueStatus(
                                    queueEntry.id,
                                    "in-progress"
                                  )
                                }
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                <FaPlayCircle className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                            )}
                            {queueEntry.status === "in-progress" && (
                              <Button
                                onClick={() =>
                                  updateQueueStatus(queueEntry.id, "completed")
                                }
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <FaCheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            <Button
                              onClick={() => setSelectedPatient(queueEntry)}
                              size="sm"
                              variant="outline"
                            >
                              <FaEye className="w-3 h-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Walk-in Form Modal */}
        {showWalkinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Add Walk-in Patient</CardTitle>
                <CardDescription>
                  Register a new walk-in patient to the queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWalkinSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      required
                      value={walkinFormData.full_name}
                      onChange={(e) =>
                        setWalkinFormData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={walkinFormData.email}
                      onChange={(e) =>
                        setWalkinFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      required
                      value={walkinFormData.phone_number}
                      onChange={(e) =>
                        setWalkinFormData((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="service_ref">Service</Label>
                    <Input
                      id="service_ref"
                      type="text"
                      value={walkinFormData.service_ref}
                      onChange={(e) =>
                        setWalkinFormData((prev) => ({
                          ...prev,
                          service_ref: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      Add to Queue
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWalkinForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    className={getTypeColor(selectedPatient.appointment_type)}
                  >
                    {selectedPatient.appointment_type === "online"
                      ? "Online Appointment"
                      : "Walk-in Patient"}
                  </Badge>
                  <Badge className={getStatusColor(selectedPatient.status)}>
                    {selectedPatient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Patient Information
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
                        <span className="font-medium">Service:</span>{" "}
                        {selectedPatient.service_ref}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Queue Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Queue Number:</span>{" "}
                        {selectedPatient.queue_number}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {selectedPatient.appointment_type}
                      </p>
                      <p>
                        <span className="font-medium">Priority:</span>{" "}
                        {selectedPatient.priority_flag === "high"
                          ? "High"
                          : selectedPatient.appointment_type === "online"
                          ? "High (Online)"
                          : "Normal"}
                      </p>
                      {selectedPatient.appointment_type === "online" ? (
                        <p>
                          <span className="font-medium">Booked:</span>{" "}
                          {selectedPatient.booked_at
                            ? new Date(
                                selectedPatient.booked_at
                              ).toLocaleString()
                            : "-"}
                        </p>
                      ) : (
                        <p>
                          <span className="font-medium">Arrived:</span>{" "}
                          {selectedPatient.arrival_time
                            ? new Date(
                                selectedPatient.arrival_time
                              ).toLocaleString()
                            : "-"}
                        </p>
                      )}
                      {selectedPatient.checked_in_at && (
                        <p>
                          <span className="font-medium">Checked In:</span>{" "}
                          {new Date(
                            selectedPatient.checked_in_at
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setSelectedPatient(null)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;
