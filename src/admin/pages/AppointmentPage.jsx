// This page shows all appointments for staff/admin
// Staff can search, view, and filter appointments here
import React, { useState, useEffect, useRef } from "react";
import Badge from "../../components/ui/badge";
import dataService from "../../shared/services/dataService";
import authService from "../../shared/services/authService";
import emailjs from "emailjs-com";
import InactivityModal from "../../components/ui/InactivityModal";

const INACTIVITY_LIMIT = 55 * 60 * 1000; // 55 minutes
const MODAL_COUNTDOWN = 5 * 60; // 5 minutes in seconds

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

  // Inactivity modal state
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [modalCountdown, setModalCountdown] = useState(MODAL_COUNTDOWN);
  const inactivityTimer = useRef(null);
  const countdownTimer = useRef(null);

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

  // Inactivity detection logic
  useEffect(() => {
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer.current);
      setShowInactivityModal(false);
      setModalCountdown(MODAL_COUNTDOWN);
      inactivityTimer.current = setTimeout(() => {
        setShowInactivityModal(true);
      }, INACTIVITY_LIMIT);
    };

    // User activity events
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start timer on mount
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  // Modal countdown logic
  useEffect(() => {
    if (showInactivityModal) {
      countdownTimer.current = setInterval(() => {
        setModalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownTimer.current);
      setModalCountdown(MODAL_COUNTDOWN);
    }
    return () => clearInterval(countdownTimer.current);
  }, [showInactivityModal]);

  const handleStayLoggedIn = () => {
    setShowInactivityModal(false);
    setModalCountdown(MODAL_COUNTDOWN);
    clearInterval(countdownTimer.current);
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setShowInactivityModal(true);
    }, INACTIVITY_LIMIT);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/admin/login";
  };

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
        return "text-gray-700 bg-gray-200 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700";
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
      const matchesSearch = appt.patient_full_name
        ? appt.patient_full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : false;
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
            placeholder="Search by patient name..."
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
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDialog(false)}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full p-12 border-2 border-primary dark:border-blue-700 z-10 flex flex-col">
            <button
              className="absolute top-6 right-8 text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-blue-300 text-3xl"
              onClick={() => setShowDialog(false)}
              title="Close"
            >
              &times;
            </button>
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-primary/10 dark:bg-blue-900 text-primary dark:text-blue-300 rounded-full p-4">
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
              <h2 className="text-3xl font-bold text-primary dark:text-blue-300 text-center">
                Appointment Details
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-10 bg-primary/5 dark:bg-blue-950 rounded-2xl p-10 mb-10">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Contact
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {selectedAppointment.contact_number}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </div>
                <div className="font-semibold text-base text-primary dark:text-blue-300">
                  {selectedAppointment.appointment_type}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Service
                </div>
                <div className="font-semibold text-base text-gray-800 dark:text-gray-100">
                  {getServiceName(selectedAppointment.service_ref)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Preferred Date
                </div>
                <div className="font-semibold text-base text-primary dark:text-blue-300">
                  {selectedAppointment.preferred_date
                    ? new Date(
                        selectedAppointment.preferred_date
                      ).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                className="py-2 px-12 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition text-lg"
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
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowRescheduleModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 border-2 border-primary dark:border-blue-700 z-10 flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-primary dark:hover:text-blue-300 text-2xl"
              onClick={() => setShowRescheduleModal(false)}
              title="Close"
            >
              &times;
            </button>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary mb-1">
                Reschedule Appointment
              </h2>
            </div>
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-base text-primary">
                  Preferred Date
                </span>
                <span className="mt-1 text-lg font-bold text-primary">
                  {selectedAppointment.preferred_date
                    ? new Date(
                        selectedAppointment.preferred_date
                      ).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div className="mx-6 flex flex-col items-center">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M15 8l4 4-4 4" />
                </svg>
                <span className="text-xs text-gray-500 mt-1">Timeline</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-base text-primary">
                  New Date
                </span>
                <input
                  type="date"
                  className="mt-1 w-34 border-2 border-primary rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary bg-primary/5 text-primary font-bold"
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
            <div className="mb-6 grid grid-cols-2 gap-4 bg-primary/5 rounded-lg p-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Patient Name</div>
                <div
                  className="font-semibold text-base text-gray-800 truncate max-w-[180px]"
                  title={selectedAppointment.patient_full_name}
                  style={{ wordBreak: "break-all" }}
                >
                  {selectedAppointment.patient_full_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div
                  className="font-semibold text-base text-gray-800 truncate max-w-[180px]"
                  title={selectedAppointment.email_address}
                  style={{ wordBreak: "break-all" }}
                >
                  {selectedAppointment.email_address}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Contact</div>
                <div className="font-semibold text-base text-gray-800">
                  {selectedAppointment.contact_number}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Type</div>
                <div className="font-semibold text-base text-primary">
                  {selectedAppointment.appointment_type}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Service</div>
                <div className="font-semibold text-base text-gray-800">
                  {getServiceName(selectedAppointment.service_ref)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
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
              <div className="text-red-600 text-sm mb-2">{rescheduleError}</div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                className={`flex-1 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition ${
                  rescheduleLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={handleReschedule}
                disabled={rescheduleLoading}
              >
                {rescheduleLoading ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
              <button
                className="flex-1 py-2 rounded-lg font-semibold text-primary bg-white border border-primary hover:bg-primary/10 transition"
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
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-primary dark:border-blue-700 z-10 flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
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
            <h2 className="text-2xl font-bold text-primary mb-2 text-center">
              Appointment Rescheduled!
            </h2>
            <p className="text-gray-700 mb-6 text-center">
              The appointment for{" "}
              <span className="font-semibold">
                {selectedAppointment?.patient_full_name}
              </span>{" "}
              has been successfully rescheduled to{" "}
              <span className="font-semibold text-primary">
                {rescheduleDate}
              </span>
              .
            </p>
            <button
              className="py-2 px-8 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Inactivity Modal */}
      <InactivityModal
        show={showInactivityModal}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogout}
        timeLeft={modalCountdown}
      />
    </div>
  );
}

export default AppointmentPage;
