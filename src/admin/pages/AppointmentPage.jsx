// This page shows all appointments for staff/admin
// Staff can search, view, and filter appointments here
import React, { useState, useEffect, useRef } from "react";
import Badge from "../../components/ui/badge";
import dataService from "../../shared/services/dataService";
import authService from "../../shared/services/authService";
import reportService from "../../shared/services/reportService";
import queueService from "../../shared/services/queueService";
import { Download, AlertCircle } from "lucide-react";
import emailjs from "emailjs-com";

function AppointmentPage() {
  const [services, setServices] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [missedStats, setMissedStats] = useState(null);
  const [showMissedStatsModal, setShowMissedStatsModal] = useState(false);

  // Check if current user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status on component mount
  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    // Load missed appointment statistics for admins
    if (authService.isAdmin()) {
      loadMissedStats();
    }
  }, []);

  // Load missed appointment statistics
  const loadMissedStats = async () => {
    try {
      const stats = await queueService.getMissedAppointmentStats(30); // Last 30 days
      setMissedStats(stats);
    } catch (error) {
      console.error("Error loading missed appointment stats:", error);
    }
  };

  // Manual trigger for missed appointment check (admin only)
  const handleMissedAppointmentCheck = async () => {
    try {
      const result = await queueService.checkForMissedAppointments();
      if (result.processedCount > 0) {
        // Refresh appointments
        const updatedAppointments = await dataService.getAllData(
          "appointments"
        );
        setAppointments(updatedAppointments);

        // Refresh stats
        loadMissedStats();

        alert(
          `Successfully marked ${result.processedCount} appointments as missed.`
        );
      } else {
        alert("No appointments needed to be marked as missed.");
      }
    } catch (error) {
      console.error("Error checking missed appointments:", error);
      alert("Error checking for missed appointments.");
    }
  };

  // Reschedule logic
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDate(
      appointment.appointment_date
        ? new Date(appointment.appointment_date).toISOString().slice(0, 10)
        : ""
    );
    setRescheduleTime(
      appointment.appointment_date
        ? new Date(appointment.appointment_date).toISOString().slice(11, 16)
        : ""
    );
    setShowRescheduleModal(true);
    setRescheduleError("");
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) {
      setRescheduleError("Please select a new date.");
      return;
    }
    // Check if selected date is at least tomorrow
    const selected = new Date(rescheduleDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (selected < tomorrow) {
      setRescheduleError("Please select a date that is at least tomorrow.");
      return;
    }

    setRescheduleLoading(true);
    try {
      await dataService.updateData(`appointments/${selectedAppointment.id}`, {
        preferred_date: rescheduleDate,
        status: "scheduled",
      });

      // Log reschedule action to audit_logs
      const staffId = window.localStorage.getItem("staffId") || "";
      const staffName = window.localStorage.getItem("staffName") || "Staff";
      await dataService.addDataWithAutoId("audit_logs", {
        user_ref: staffId ? `staff/${staffId}` : "staff/unknown",
        staff_full_name: staffName,
        action: `Rescheduled appointment for ${selectedAppointment.patient_full_name} to ${rescheduleDate}`,
        ip_address: "N/A",
        timestamp: new Date().toISOString(),
      });

      setShowRescheduleModal(false);
      setRescheduleLoading(false);
      setRescheduleError("");
      setShowSuccessModal(true); // Show success modal
      // Refresh appointments
      const updatedAppointments = await dataService.getAllData("appointments");
      setAppointments(updatedAppointments);
    } catch (err) {
      setRescheduleError("Failed to reschedule. Please try again.");
      setRescheduleLoading(false);
    }
  };
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const [appointmentsData, servicesData] = await Promise.all([
          dataService.getAllData("appointments"),
          dataService.getAllData("services"),
        ]);
        // Normalize status to 'checked-in' if it is 'checkedin'
        const normalizedAppointments = appointmentsData.map((appt) => ({
          ...appt,
          status: appt.status === "checkedin" ? "checked-in" : appt.status,
        }));
        setAppointments(normalizedAppointments);
        setServices(servicesData);
      } catch (error) {
        setAppointments([]);
        setServices([]);
      }
    }
    fetchAppointments();
  }, []);

  // Helper function to resolve service name from reference
  const getServiceName = (serviceRef) => {
    if (!serviceRef || !services.length) return serviceRef || "Unknown Service";
    const serviceId = serviceRef.split("/").pop();
    const service = services.find((s) => s.id === serviceId);
    return service ? service.service_name : serviceRef;
  };

  // Improved status color helper
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
      case "missed":
        return "text-red-700 bg-red-200 dark:bg-red-900 dark:text-red-300 border border-gray-300 dark:border-red-700";
      case "cutoff":
        return "text-red-800 bg-red-200 dark:bg-red-950 dark:text-red-400 border border-red-400 dark:border-red-800";
      case "scheduled":
        return "text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-700";
      case "checked-in":
        return "text-cyan-700 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
    }
  };

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appt) => {
      // Improved search logic - search in multiple fields and handle empty/null values
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        searchTerm === "" ||
        (appt.patient_full_name || "").toLowerCase().includes(searchLower) ||
        (appt.email_address || "").toLowerCase().includes(searchLower) ||
        (appt.contact_number || "").toLowerCase().includes(searchLower);

      const matchesStatus = filterStatus
        ? appt.status === filterStatus
        : appt.status !== "checkedin";
      const matchesService = filterService
        ? getServiceName(appt.service_ref) === filterService
        : true;
      const matchesType = filterType
        ? appt.appointment_type === filterType
        : true;
      return matchesSearch && matchesStatus && matchesService && matchesType;
    })
    .sort((a, b) => {
      // Convert appointment_date to timestamp for reliable sorting
      const aDate = a.appointment_date
        ? new Date(a.appointment_date).getTime()
        : 0;
      const bDate = b.appointment_date
        ? new Date(b.appointment_date).getTime()
        : 0;
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });

  // Generate a random 6-digit PIN
  function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate PDF Report for Appointments
  const generatePDFReport = async () => {
    // Prepare filters object
    const filters = {};
    if (searchTerm) filters["Search Term"] = searchTerm;
    if (filterStatus) filters["Status"] = filterStatus;
    if (filterService) filters["Service"] = filterService;
    if (filterType) filters["Type"] = filterType;

    // Prepare summary statistics
    const statusCounts = {};
    const serviceCounts = {};
    const typeCounts = {};

    filteredAppointments.forEach((appt) => {
      // Count by status
      const status = appt.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Count by service
      const serviceName = getServiceName(appt.service_ref) || "Unknown Service";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;

      // Count by type
      const type = appt.appointment_type || "Unknown Type";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const summary = {
      "Total Appointments": filteredAppointments.length,
      "Date Range":
        filteredAppointments.length > 0
          ? `${new Date(
              Math.min(
                ...filteredAppointments.map(
                  (appt) => new Date(appt.appointment_date || Date.now())
                )
              )
            ).toLocaleDateString()} - ${new Date(
              Math.max(
                ...filteredAppointments.map(
                  (appt) => new Date(appt.appointment_date || Date.now())
                )
              )
            ).toLocaleDateString()}`
          : "No data",
      ...statusCounts,
    };

    // Define columns for the report
    const columns = [
      { key: "patient_full_name", header: "Patient Name", width: 3 },
      { key: "service_name", header: "Service", width: 3 },
      {
        key: "appointment_date",
        header: "Date & Time",
        width: 3,
        type: "datetime",
      },
      { key: "status", header: "Status", width: 2 },
      { key: "appointment_type", header: "Type", width: 2 },
    ];

    // Prepare data for report
    const reportData = filteredAppointments.map((appt) => ({
      ...appt,
      patient_full_name: appt.patient_full_name || "Unknown Patient",
      service_name: getServiceName(appt.service_ref) || "Unknown Service",
      status: appt.status || "Unknown",
      appointment_type: appt.appointment_type || "Unknown",
    }));

    await reportService.generatePDF({
      title: "Appointments Report",
      data: reportData,
      columns,
      filters,
      summary,
      fileName: `appointments-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`,
    });
  };

  // Call this when booking an appointment
  async function sendConfirmationEmail(appointment) {
    const pin = generatePin();

    // Save the PIN with the appointment (add to your DB logic)
    // appointment.pin = pin;

    // EmailJS send
    const templateParams = {
      to_email: appointment.email_address,
      to_name: appointment.patient_full_name,
      pin_code: pin,
      // ...other params
    };

    await emailjs.send(
      "YOUR_SERVICE_ID",
      "YOUR_TEMPLATE_ID",
      templateParams,
      "YOUR_USER_ID"
    );

    // Save appointment with pin to DB here
  }

  // Render appointment list
  return (
    <div className="p-6 w-full max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-primary dark:text-blue-300">
        Appointments
      </h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            className="border rounded px-3 py-2 w-64 focus:outline-primary dark:focus:outline-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked-in">Checked-in</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
          <select
            className="border rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
          >
            <option value="">All Services</option>
            {services.map((service) => (
              <option key={service.id} value={service.service_name}>
                {service.service_name}
              </option>
            ))}
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
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Sort by date:
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
          {isAdmin && (
            <>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                onClick={generatePDFReport}
                title="Generate PDF Report"
              >
                <Download className="h-4 w-4" />
                PDF Report
              </button>
            </>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <tr>
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm
                      ? "No appointments found matching your search."
                      : "No appointments found. "}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary dark:bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                          {appt.patient_full_name?.charAt(0) || "P"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {appt.patient_full_name || "Unknown Name"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                            <span>{appt.email_address}</span>
                            <span>{appt.contact_number}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {appt.appointment_type === "online" ? (
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
                        {getServiceName(appt.service_ref)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Ref: {appt.service_ref || "No reference"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {appt.appointment_date
                        ? new Date(appt.appointment_date).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                          appt.status
                        )}`}
                        style={{ minWidth: 90, justifyContent: "center" }}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <button
                          className="text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 p-1 rounded transition"
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setShowDialog(true);
                          }}
                          title="View Details"
                        >
                          View
                        </button>
                        {appt.appointment_type === "online" &&
                          appt.status === "scheduled" && (
                            <button
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 p-1 rounded border border-purple-200 dark:border-purple-400 transition"
                              onClick={() => openRescheduleModal(appt)}
                              title="Reschedule Appointment"
                            >
                              Reschedule
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      {showDialog && selectedAppointment && (
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-primary dark:text-blue-400 text-center">
                Appointment Details
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-10 bg-primary/5 dark:bg-gray-700/50 rounded-2xl p-10 mb-10 border border-primary/10 dark:border-gray-600/50">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Patient Name
                </div>
                <div
                  className="font-semibold text-base text-gray-800 dark:text-gray-100 truncate max-w-[300px]"
                  title={selectedAppointment.patient_full_name}
                  style={{ wordBreak: "break-all" }}
                >
                  {selectedAppointment.patient_full_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Email
                </div>
                <div
                  className="font-semibold text-base text-gray-800 dark:text-gray-100 truncate max-w-[300px]"
                  title={selectedAppointment.email_address}
                  style={{ wordBreak: "break-all" }}
                >
                  {selectedAppointment.email_address}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Contact
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedAppointment.contact_number}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Booked By
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedAppointment.booked_by_name ||
                    selectedAppointment.patient_full_name ||
                    "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Type
                </div>
                <div className="font-semibold text-base text-primary dark:text-blue-400">
                  {selectedAppointment.appointment_type}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Relationship to Patient
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedAppointment.relationship_to_patient ||
                    (selectedAppointment.booked_by_name ===
                    selectedAppointment.patient_full_name
                      ? "Self"
                      : "-")}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Service
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {getServiceName(selectedAppointment.service_ref)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Status
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Booking Timestamp
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedAppointment.appointment_date
                    ? new Date(
                        selectedAppointment.appointment_date
                      ).toLocaleString()
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide font-medium">
                  Preferred Date
                </div>
                <div className="font-semibold text-base text-primary dark:text-blue-400">
                  {selectedAppointment.preferred_date
                    ? new Date(
                        selectedAppointment.preferred_date
                      ).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>
            {/* Additional Notes Section */}
            {selectedAppointment.additional_notes && (
              <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/50">
                <div className="text-xs text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wide font-medium flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Additional Notes
                </div>
                <div className="font-medium text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {selectedAppointment.additional_notes}
                </div>
              </div>
            )}
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
      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowRescheduleModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-blue-500/20 max-w-lg w-full p-8 border-2 border-primary/20 dark:border-blue-500/50 z-10 flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-xl transition-all duration-200"
              onClick={() => setShowRescheduleModal(false)}
              title="Close"
            >
              &times;
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary dark:text-blue-400 mb-1">
                Reschedule Appointment
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Select a new date for this appointment
              </p>
            </div>
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Current Date
                </span>
                <span className="text-base font-bold text-gray-800 dark:text-gray-100">
                  {selectedAppointment.preferred_date
                    ? new Date(
                        selectedAppointment.preferred_date
                      ).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="mx-6 flex flex-col items-center">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  className="text-primary dark:text-blue-400 mb-1"
                >
                  <path d="M5 12h14M15 8l4 4-4 4" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Change to
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm text-primary dark:text-blue-400 mb-1">
                  New Date
                </span>
                <input
                  type="date"
                  className="w-36 border-2 border-primary/30 dark:border-blue-500/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-blue-400/50 focus:border-primary dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-all duration-200"
                  value={rescheduleDate}
                  min={(() => {
                    const today = new Date();
                    today.setDate(today.getDate() + 1); // always tomorrow
                    return today.toISOString().slice(0, 10);
                  })()}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
            </div>
            {/* Appointment Details */}
            <div className="mb-6 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600/50">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  Patient Name
                </div>
                <div
                  className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate max-w-[180px]"
                  title={selectedAppointment.patient_full_name}
                  style={{ wordBreak: "break-all" }}
                >
                  {selectedAppointment.patient_full_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  Email
                </div>
                <div
                  className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate max-w-[180px]"
                  title={selectedAppointment.email_address}
                  style={{ wordBreak: "break-all" }}
                >
                  {selectedAppointment.email_address}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  Contact
                </div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  {selectedAppointment.contact_number}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  Type
                </div>
                <div className="font-semibold text-sm text-primary dark:text-blue-400">
                  {selectedAppointment.appointment_type}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  Service
                </div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  {getServiceName(selectedAppointment.service_ref)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  Status
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(
                    selectedAppointment.status
                  )}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
            </div>
            {/* Summary of Changes */}

            {rescheduleError && (
              <div className="text-red-600 dark:text-red-400 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{rescheduleError}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <button
                className={`flex-1 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  rescheduleLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={handleReschedule}
                disabled={rescheduleLoading}
              >
                {rescheduleLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Rescheduling...
                  </div>
                ) : (
                  "Confirm Reschedule"
                )}
              </button>
              <button
                className="flex-1 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => setShowRescheduleModal(false)}
                disabled={rescheduleLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-green-500/20 max-w-md w-full p-8 border-2 border-green-200 dark:border-green-500/50 z-10 flex flex-col items-center">
            <div className="bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 rounded-full p-4 mb-4 ring-4 ring-green-200 dark:ring-green-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 text-center">
              Appointment Rescheduled!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">
              The appointment for{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {selectedAppointment?.patient_full_name}
              </span>{" "}
              has been successfully rescheduled to{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                {rescheduleDate}
              </span>
              .
            </p>
            <button
              className="py-3 px-8 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => setShowSuccessModal(false)}
            >
              Perfect!
            </button>
          </div>
        </div>
      )}

      {/* Missed Appointment Statistics Modal */}
      {showMissedStatsModal && missedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMissedStatsModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-purple-500/20 max-w-md w-full p-8 border-2 border-purple-200 dark:border-purple-500/50 z-10">
            <button
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-xl"
              onClick={() => setShowMissedStatsModal(false)}
            >
              ×
            </button>

            <div className="text-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Missed Appointments
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Statistics for the last 30 days
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Total Missed
                </span>
                <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                  {missedStats.totalMissed}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Recent (30 days)
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">
                  {missedStats.recentMissed}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Auto-marked
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                  {missedStats.autoMissed}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">Manual</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                  {missedStats.manualMissed}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => setShowMissedStatsModal(false)}
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

export default AppointmentPage;
