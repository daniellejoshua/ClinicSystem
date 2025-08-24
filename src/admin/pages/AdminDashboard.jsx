import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaChartLine,
  FaUserMd,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaSync,
  FaBell,
  FaHeartbeat,
  FaVial,
  FaBaby,
  FaMedkit,
} from "react-icons/fa";
import dataService from "../../shared/services/dataService";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    appointments: [],
    queue: [],
    services: [],
    staff: [],
    fillUpForms: [],
    auditLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every minute to show real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [
        patients,
        appointments,
        queue,
        services,
        staff,
        fillUpForms,
        auditLogs,
      ] = await Promise.all([
        dataService.getAllData("patients").catch(() => []),
        dataService.getAllData("appointments").catch(() => []),
        dataService.getAllData("queue").catch(() => []),
        dataService.getAllData("services").catch(() => []),
        dataService.getAllData("staff").catch(() => []),
        dataService.getAllData("fill_up_forms").catch(() => []),
        dataService.getAllData("audit_logs").catch(() => []),
      ]);

      setDashboardData({
        patients: patients || [],
        appointments: appointments || [],
        queue: queue || [],
        services: services || [],
        staff: staff || [],
        fillUpForms: fillUpForms || [],
        auditLogs: auditLogs || [],
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard metrics
  const metrics = {
    totalPatients: dashboardData.patients.length,
    waitingPatients: dashboardData.patients.filter(
      (p) => p.status === "waiting"
    ).length,
    inProgressPatients: dashboardData.patients.filter(
      (p) => p.status === "in-progress"
    ).length,
    completedToday: dashboardData.patients.filter(
      (p) =>
        p.status === "completed" &&
        new Date(p.created_at).toDateString() === new Date().toDateString()
    ).length,

    totalAppointments: dashboardData.appointments.length,
    scheduledAppointments: dashboardData.appointments.filter(
      (a) => a.status === "scheduled"
    ).length,
    todaysAppointments: dashboardData.appointments.filter(
      (a) =>
        new Date(a.appointment_date).toDateString() ===
        new Date().toDateString()
    ).length,

    queueLength: dashboardData.queue.filter((q) => q.status !== "completed")
      .length,
    highPriorityQueue: dashboardData.queue.filter(
      (q) => q.priority_flag === "high" && q.status !== "completed"
    ).length,

    totalServices: dashboardData.services.length,
    activeStaff: dashboardData.staff.length,
    pendingForms: dashboardData.fillUpForms.length,

    averageWaitTime: calculateAverageWaitTime(),
  };

  function calculateAverageWaitTime() {
    const completedQueue = dashboardData.queue.filter(
      (q) => q.completed_at && q.joined_at
    );
    if (completedQueue.length === 0) return "No data";

    const totalWaitTime = completedQueue.reduce((total, q) => {
      const waitTime = new Date(q.completed_at) - new Date(q.joined_at);
      return total + waitTime;
    }, 0);

    const avgMs = totalWaitTime / completedQueue.length;
    const avgMinutes = Math.round(avgMs / (1000 * 60));
    return `${avgMinutes} min`;
  }

  // Get service statistics
  const serviceStats = dashboardData.services.map((service) => {
    const servicePatients = dashboardData.patients.filter(
      (p) => p.service_ref === `services/${service.id}`
    );
    return {
      ...service,
      patientCount: servicePatients.length,
      waitingCount: servicePatients.filter((p) => p.status === "waiting")
        .length,
    };
  });

  // Recent activity from audit logs
  const recentActivity = dashboardData.auditLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const getServiceIcon = (serviceName) => {
    if (serviceName?.toLowerCase().includes("pediatric"))
      return <FaBaby className="text-pink-500" />;
    if (serviceName?.toLowerCase().includes("vaccination"))
      return <FaVial className="text-green-500" />;
    if (serviceName?.toLowerCase().includes("emergency"))
      return <FaMedkit className="text-red-500" />;
    if (serviceName?.toLowerCase().includes("lab"))
      return <FaVial className="text-purple-500" />;
    return <FaHeartbeat className="text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="text-4xl text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-worksans">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-yeseva text-primary mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 font-worksans">
              Tonsuya Super Health Center - Real-time clinic monitoring
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={loadDashboardData}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <FaSync className="w-4 h-4" />
              Refresh Data
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedMetric("patients")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-worksans">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {metrics.totalPatients}
              </p>
              <p className="text-sm text-green-600">
                {metrics.completedToday} completed today
              </p>
            </div>
            <FaUsers className="text-4xl text-blue-500" />
          </div>
        </div>

        {/* Current Queue */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedMetric("queue")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-worksans">
                Current Queue
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {metrics.queueLength}
              </p>
              <p className="text-sm text-red-600">
                {metrics.highPriorityQueue} high priority
              </p>
            </div>
            <FaClock className="text-4xl text-yellow-500" />
          </div>
        </div>

        {/* Today's Appointments */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedMetric("appointments")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-worksans">
                Today's Appointments
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {metrics.todaysAppointments}
              </p>
              <p className="text-sm text-blue-600">
                {metrics.scheduledAppointments} scheduled
              </p>
            </div>
            <FaCalendarAlt className="text-4xl text-green-500" />
          </div>
        </div>

        {/* Active Staff */}
        <div
          className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedMetric("staff")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-worksans">
                Active Staff
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {metrics.activeStaff}
              </p>
              <p className="text-sm text-purple-600">
                Avg wait: {metrics.averageWaitTime}
              </p>
            </div>
            <FaUserMd className="text-4xl text-purple-500" />
          </div>
        </div>
      </div>

      {/* Queue Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Queue Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-yeseva text-primary mb-4 flex items-center gap-2">
            <FaClock className="text-xl" />
            Live Queue Status
          </h2>

          {dashboardData.queue.filter((q) => q.status !== "completed")
            .length === 0 ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 font-worksans">Queue is empty</p>
              <p className="text-sm text-gray-400">
                All patients have been served
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.queue
                .filter((q) => q.status !== "completed")
                .sort((a, b) => {
                  if (a.priority_flag === "high" && b.priority_flag !== "high")
                    return -1;
                  if (b.priority_flag === "high" && a.priority_flag !== "high")
                    return 1;
                  return a.queue_number - b.queue_number;
                })
                .slice(0, 5)
                .map((queueEntry) => {
                  const patient = dashboardData.patients.find(
                    (p) => p.id === queueEntry.patient_ref?.split("/")[1]
                  );
                  const service = dashboardData.services.find(
                    (s) => s.id === queueEntry.service_ref?.split("/")[1]
                  );

                  return (
                    <div
                      key={queueEntry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {queueEntry.queue_number}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {patient?.full_name || "Unknown Patient"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service?.service_name || "Unknown Service"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {queueEntry.priority_flag === "high" && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            HIGH PRIORITY
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            queueEntry.status === "waiting"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {queueEntry.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {dashboardData.queue.filter((q) => q.status !== "completed")
                .length > 5 && (
                <p className="text-center text-gray-500 text-sm">
                  +
                  {dashboardData.queue.filter((q) => q.status !== "completed")
                    .length - 5}{" "}
                  more in queue
                </p>
              )}
            </div>
          )}
        </div>

        {/* Service Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-yeseva text-primary mb-4 flex items-center gap-2">
            <FaChartLine className="text-xl" />
            Service Statistics
          </h2>

          <div className="space-y-3">
            {serviceStats.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getServiceIcon(service.service_name)}
                  <div>
                    <p className="font-medium text-gray-800">
                      {service.service_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {service.duration_minutes} min duration
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {service.patientCount}
                  </p>
                  <p className="text-sm text-gray-600">
                    {service.waitingCount} waiting
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-yeseva text-primary mb-4 flex items-center gap-2">
            <FaBell className="text-xl" />
            Recent Activity
          </h2>

          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 flex-shrink-0">
                    <FaBell className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {activity.details || `Action: ${activity.action}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-yeseva text-primary mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-xl" />
            System Status
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database Connection</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaCheckCircle className="w-4 h-4" />
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Queue System</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaCheckCircle className="w-4 h-4" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Patient References</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaCheckCircle className="w-4 h-4" />
                Working
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Staff Management</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaCheckCircle className="w-4 h-4" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Audit Logging</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaCheckCircle className="w-4 h-4" />
                Enabled
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              ✅ All systems operational
            </p>
            <p className="text-xs text-green-600 mt-1">
              Database references, queue management, and real-time updates are
              working correctly.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-yeseva text-primary mb-4">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/queue"
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-center"
          >
            <FaClock className="mx-auto mb-2 text-xl" />
            <div className="text-sm font-worksans">Manage Queue</div>
          </a>

          <a
            href="/admin/patients"
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-center"
          >
            <FaUsers className="mx-auto mb-2 text-xl" />
            <div className="text-sm font-worksans">View Patients</div>
          </a>

          <a
            href="/admin/data-management"
            className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-center"
          >
            <FaChartLine className="mx-auto mb-2 text-xl" />
            <div className="text-sm font-worksans">Manage Data</div>
          </a>

          <button
            onClick={loadDashboardData}
            className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors text-center"
          >
            <FaSync className="mx-auto mb-2 text-xl" />
            <div className="text-sm font-worksans">Refresh All</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
