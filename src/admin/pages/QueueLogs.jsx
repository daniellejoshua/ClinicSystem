// This page shows all queue logs for admin users
// Displays historical queue data with filtering, search, and PDF export capabilities
import React, { useState, useEffect } from "react";
import Badge from "../../components/ui/badge";
import dataService from "../../shared/services/dataService";
import authService from "../../shared/services/authService";
import reportService from "../../shared/services/reportService";
import { Download, Search, Clock, User, Filter, Calendar } from "lucide-react";

function QueueLogs() {
  const [queueLogs, setQueueLogs] = useState([]);
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status on component mount
  useEffect(() => {
    const adminStatus = authService.isAdmin();
    setIsAdmin(adminStatus);

    if (!adminStatus) {
      // Redirect non-admin users
      window.location.href = "/admin";
      return;
    }

    fetchQueueLogs();
    fetchServices();
  }, []);

  // Effect to refetch data when date filter changes for better performance
  useEffect(() => {
    if (filterDate) {
      // If a specific date is selected, fetch only that date's data
      fetchQueueLogs(filterDate);
    } else {
      // If no date filter, fetch all data
      fetchQueueLogs();
    }
  }, [filterDate]);

  // Fetch all queue logs from all dates (optimized for date-based structure)
  const fetchQueueLogs = async (specificDate = null) => {
    setIsLoading(true);
    try {
      let queueData;

      if (specificDate) {
        // Fetch only specific date for better performance
        queueData = await dataService.getData(`queue/${specificDate}`);
        queueData = { [specificDate]: queueData };
      } else {
        // Get queue data from all dates
        queueData = await dataService.getAllData("queue");
      }

      const allQueueLogs = [];

      if (queueData) {
        // Process each date's queue data
        Object.entries(queueData).forEach(([date, dayQueue]) => {
          if (dayQueue && typeof dayQueue === "object") {
            Object.entries(dayQueue).forEach(([queueId, queueItem]) => {
              allQueueLogs.push({
                id: queueId,
                date: date, // This is the Firebase date key (YYYY-MM-DD)
                ...queueItem,
                // Use exact field names from your Firebase structure
                queue_number: queueItem.queue_number || "N/A",
                full_name: queueItem.full_name || "Unknown",
                email: queueItem.email || "N/A",
                phone_number: queueItem.phone_number || "N/A",
                appointment_type: queueItem.appointment_type || "walkin",
                status: queueItem.status || "completed",
                priority_flag: queueItem.priority_flag || "normal",
                service_ref: queueItem.service_ref || "N/A",
                arrival_time:
                  queueItem.arrival_time ||
                  queueItem.created_at ||
                  queueItem.booking_time,
                booking_time: queueItem.booking_time || queueItem.arrival_time,
                updated_at:
                  queueItem.updated_at ||
                  queueItem.arrival_time ||
                  queueItem.booking_time,
                patient_id: queueItem.patient_id || "N/A",
                appointment_id: queueItem.appointment_id || "N/A",
              });
            });
          }
        });
      }

      // Sort by date and time (newest first by default)
      allQueueLogs.sort((a, b) => {
        const aTime = new Date(a.arrival_time || a.created_at || a.date);
        const bTime = new Date(b.arrival_time || b.created_at || b.date);
        return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
      });

      setQueueLogs(allQueueLogs);
    } catch (error) {
      console.error("Error fetching queue logs:", error);
      setQueueLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch services for reference resolution
  const fetchServices = async () => {
    try {
      const servicesData = await dataService.getAllData("services");
      setServices(servicesData || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  // Helper function to resolve service name from reference
  const getServiceName = (serviceRef) => {
    if (!serviceRef || !services.length) return serviceRef || "Unknown Service";
    const serviceId = serviceRef.split("/").pop();
    const service = services.find((s) => s.id === serviceId);
    return service ? service.service_name : serviceRef;
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700";
      case "in-progress":
        return "text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 border border-orange-300 dark:border-orange-700";
      case "completed":
        return "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 border border-green-300 dark:border-green-700";
      case "cancelled":
        return "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-700";
      case "no-show":
      case "missed":
        return "text-red-700 bg-red-200 dark:bg-red-900 dark:text-red-300 border border-gray-300 dark:border-red-700";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
    }
  };

  // Priority color helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 border border-red-300 dark:border-red-700";
      case "emergency":
        return "text-red-800 bg-red-200 dark:bg-red-950 dark:text-red-400 border border-red-400 dark:border-red-800";
      case "normal":
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
    }
  };

  // Filter and sort queue logs
  const filteredQueueLogs = queueLogs
    .filter((log) => {
      // Filter out Unknown records from display (but keep in database)
      if (
        log.full_name === "Unknown" ||
        !log.full_name ||
        log.full_name.trim() === ""
      ) {
        return false;
      }

      // Search filter
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        searchTerm === "" ||
        (log.full_name || "").toLowerCase().includes(searchLower) ||
        (log.email || "").toLowerCase().includes(searchLower) ||
        (log.phone_number || "").includes(searchTerm) ||
        (log.queue_number || "").toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = filterStatus ? log.status === filterStatus : true;

      // Type filter
      const matchesType = filterType
        ? log.appointment_type === filterType
        : true;

      // Priority filter
      const matchesPriority = filterPriority
        ? log.priority_flag === filterPriority
        : true;

      // Date filter - handle timezone issues by using UTC date extraction
      const matchesDate = filterDate
        ? (() => {
            try {
              // Extract UTC date from arrival_time to match Firebase date key
              const arrivalDate = new Date(log.arrival_time);
              const utcDateString =
                arrivalDate.getUTCFullYear() +
                "-" +
                String(arrivalDate.getUTCMonth() + 1).padStart(2, "0") +
                "-" +
                String(arrivalDate.getUTCDate()).padStart(2, "0");
              return utcDateString === filterDate;
            } catch (error) {
              // Fallback to Firebase date key if arrival_time parsing fails
              return log.date === filterDate;
            }
          })()
        : true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPriority &&
        matchesDate
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.arrival_time || a.created_at || a.date);
      const bTime = new Date(b.arrival_time || b.created_at || b.date);
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });

  // Generate PDF Report for Queue Logs
  const generatePDFReport = async () => {
    const filters = {};
    if (searchTerm) filters["Search Term"] = searchTerm;
    if (filterStatus) filters["Status"] = filterStatus;
    if (filterType) filters["Type"] = filterType;
    if (filterPriority) filters["Priority"] = filterPriority;
    if (filterDate) filters["Date"] = filterDate;

    // Summary statistics
    const statusCounts = {};
    const typeCounts = {};
    const priorityCounts = {};

    filteredQueueLogs.forEach((log) => {
      const status = log.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      const type = log.appointment_type || "Unknown";
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      const priority = log.priority_flag || "normal";
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
    });

    const summary = {
      "Total Queue Entries": filteredQueueLogs.length,
      "Date Range":
        filteredQueueLogs.length > 0
          ? `${new Date(
              Math.min(...filteredQueueLogs.map((log) => new Date(log.date)))
            ).toLocaleDateString()} - ${new Date(
              Math.max(...filteredQueueLogs.map((log) => new Date(log.date)))
            ).toLocaleDateString()}`
          : "No data",
      ...statusCounts,
      ...typeCounts,
      ...priorityCounts,
    };

    // Define columns for the report
    const columns = [
      { key: "queue_number", header: "Queue #", width: 2 },
      { key: "full_name", header: "Patient Name", width: 3 },
      { key: "appointment_type", header: "Type", width: 2 },
      { key: "service_name", header: "Service", width: 3 },
      { key: "status", header: "Status", width: 2 },
      { key: "priority_flag", header: "Priority", width: 2 },
      { key: "date", header: "Date", width: 2 },
      {
        key: "arrival_time",
        header: "Arrival Time",
        width: 3,
        type: "datetime",
      },
    ];

    // Prepare data for report
    const reportData = filteredQueueLogs.map((log) => ({
      ...log,
      service_name: getServiceName(log.service_ref) || "Unknown Service",
      full_name: log.full_name || "Unknown Patient",
      appointment_type: log.appointment_type || "Unknown",
      status: log.status || "Unknown",
      priority_flag: log.priority_flag || "normal",
    }));

    await reportService.generatePDF({
      title: "Queue Logs Report",
      data: reportData,
      columns,
      filters,
      summary,
      fileName: `queue-logs-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`,
    });
  };

  // Format datetime display (timezone-aware)
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === "N/A") return "-";
    try {
      const date = new Date(dateTimeString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "-";
      }
      return date.toLocaleString();
    } catch (error) {
      return "-"; // Return dash for invalid dates
    }
  };

  // Format date display (timezone-aware for consistency)
  const formatDateTimeForDisplay = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === "N/A") return "-";
    try {
      const date = new Date(dateTimeString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "-";
      }
      // Show both date and time in local timezone
      return date.toLocaleString();
    } catch (error) {
      return "-";
    }
  };

  // Format date display (for dates in YYYY-MM-DD format)
  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "-";
    try {
      // For YYYY-MM-DD format dates, create date and format properly
      const date = new Date(dateString + "T00:00:00"); // Add time to avoid timezone issues
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }
      return date.toLocaleDateString();
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Render queue logs
  return (
    <div className="p-6 w-full max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-primary dark:text-blue-300">
        Queue Logs
      </h1>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            className="border rounded px-3 py-2 w-64 focus:outline-primary dark:focus:outline-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Search by name, email, phone, or queue #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>

          <select
            className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="online">Online</option>
            <option value="walkin">Walk-in</option>
          </select>

          <select
            className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Filter by date"
            title="Filter by specific date"
          />

          {/* Clear Filters Button */}
          <button
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("");
              setFilterType("");
              setFilterPriority("");
              setFilterDate("");
            }}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Sort by time:
          </span>
          <button
            className={`px-3 py-1 rounded border ${
              sortOrder === "asc"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-900 text-primary dark:text-blue-300"
            }`}
            onClick={() => setSortOrder("asc")}
          >
            Oldest
          </button>
          <button
            className={`px-3 py-1 rounded border ${
              sortOrder === "desc"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-900 text-primary dark:text-blue-300"
            }`}
            onClick={() => setSortOrder("desc")}
          >
            Newest
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            onClick={generatePDFReport}
            title="Generate PDF Report"
          >
            <Download className="h-4 w-4" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Results Summary */}

      {/* Queue Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Queue #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading queue logs...
                  </td>
                </tr>
              ) : filteredQueueLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm ||
                    filterStatus ||
                    filterType ||
                    filterPriority ||
                    filterDate
                      ? "No queue logs found matching your filters."
                      : "No queue logs found."}
                  </td>
                </tr>
              ) : (
                filteredQueueLogs.map((log, idx) => (
                  <tr
                    key={`${log.date}-${log.id}-${idx}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {log.queue_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary dark:bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                          {log.full_name?.charAt(0) || "P"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.full_name || "Unknown Name"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                            <span>{log.email}</span>
                            <span>{log.phone_number}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {log.appointment_type === "online" ? (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            Online
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-200">
                            Walk-in
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {getServiceName(log.service_ref)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                          log.status
                        )}`}
                        style={{ minWidth: 80, justifyContent: "center" }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(
                          log.priority_flag
                        )}`}
                        style={{ minWidth: 70, justifyContent: "center" }}
                      >
                        {log.priority_flag}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      <div className="text-sm">
                        {formatDateTime(log.arrival_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <button
                        className="text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 p-1 rounded transition"
                        onClick={() => {
                          setSelectedQueueItem(log);
                          setShowDialog(true);
                        }}
                        title="View Details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue Item Details Dialog */}
      {showDialog && selectedQueueItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDialog(false)}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-blue-500/20 max-w-4xl w-full p-12 border-2 border-primary/20 dark:border-blue-500/50 z-10 flex flex-col">
            <button
              className="absolute top-6 right-8 text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-2xl transition-all duration-200"
              onClick={() => setShowDialog(false)}
              title="Close"
            >
              &times;
            </button>
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-primary/10 dark:bg-blue-600/20 text-primary dark:text-blue-400 rounded-full p-4 ring-2 ring-primary/20 dark:ring-blue-500/30">
                <Clock className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-primary dark:text-blue-400 text-center">
                Queue Entry Details
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-10 bg-primary/5 dark:bg-gray-700/50 rounded-2xl p-10 mb-10 border border-primary/10 dark:border-gray-600/50">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Queue Number
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedQueueItem.queue_number}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Patient Name
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedQueueItem.full_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Email
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedQueueItem.email}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Phone
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedQueueItem.phone_number}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Appointment Type
                </div>
                <div className="font-semibold text-base text-primary dark:text-blue-400">
                  {selectedQueueItem.appointment_type}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Service
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {getServiceName(selectedQueueItem.service_ref)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Status
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(
                    selectedQueueItem.status
                  )}`}
                >
                  {selectedQueueItem.status}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Priority
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${getPriorityColor(
                    selectedQueueItem.priority_flag
                  )}`}
                >
                  {selectedQueueItem.priority_flag}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Arrival Time
                </div>
                <div className="font-semibold text-base text-primary dark:text-blue-400">
                  {formatDateTime(selectedQueueItem.arrival_time)}
                </div>
              </div>
              {selectedQueueItem.booking_time && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                    Booking Time
                  </div>
                  <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                    {formatDateTime(selectedQueueItem.booking_time)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <button
                className="py-3 px-12 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => setShowDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QueueLogs;
