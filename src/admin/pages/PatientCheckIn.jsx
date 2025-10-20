// This page lets staff check in patients for their appointments
// Staff can search for appointments, see results, and check patients in
import React, { useState, useEffect, useRef } from "react";
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
import dataService from "../../shared/services/dataService";
import customDataService from "../../shared/services/customDataService";
import authService from "../../shared/services/authService";
import queueResetService from "../../shared/services/queueResetService";
import {
  AlertCircle,
  CheckCircle,
  Search,
  User,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

const PatientCheckIn = () => {
  const [servicesMap, setServicesMap] = useState({});
  // Fetch all services and build a map of id -> service_name
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await dataService.getAllData("services");
        // Map: serviceId -> service_name
        const map = {};
        services.forEach((service) => {
          map[service.id] = service.service_name;
        });
        setServicesMap(map);
      } catch (error) {
        console.error("Error loading services:", error);
      }
    };
    fetchServices();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [foundAppointments, setFoundAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState({
    today: [],
    missed: [],
  });
  const [filterStatus, setFilterStatus] = useState("today"); // 'today' or 'missed'
  const [showAll, setShowAll] = useState(false); // new state for show all appointments
  const getLocalDateString = () => {
    return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  };
  const [calendarDate, setCalendarDate] = useState(getLocalDateString());
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkInResult, setCheckInResult] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);

  // When a check-in happens, show the result for 5 seconds
  useEffect(() => {
    if (checkInResult) {
      const timer = setTimeout(() => {
        setCheckInResult(null);
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [checkInResult]);

  // When the page loads or calendarDate changes, get all online appointments for the selected date
  useEffect(() => {
    loadAllOnlineAppointments(calendarDate);
  }, [calendarDate]);

  // Set up periodic check for missed appointments (every hour)
  useEffect(() => {
    // Use the new queue reset service for automatic missed appointment handling
    // The service is already initialized when queueService is imported

    // Run manual check when component mounts (as backup)
    const runInitialCheck = async () => {
      try {
        const result = await queueService.checkForMissedAppointments();
        if (result.processedCount > 0) {
          setCheckInResult({
            success: true,
            message: result.message,
          });
        }
      } catch (error) {
        console.error("Error during initial missed appointments check:", error);
      }
    };

    runInitialCheck();

    // The automatic monitoring is already handled by queueResetService
    // No need for additional intervals here
  }, []); // Only run once when component mounts

  // When staff types in the search box, filter appointments after a short delay
  // If the box is empty, show all appointments
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        filterAppointments();
      } else {
        if (showAll) {
          // Show all appointments from all dates and statuses
          const allAppts = [
            ...(allAppointments.today || []),
            ...(allAppointments.missed || []),
            ...(allAppointments.expected || []),
          ];
          setFoundAppointments(allAppts);
        } else {
          setFoundAppointments(allAppointments[filterStatus] || []);
        }
        setCheckInResult(null);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, allAppointments, filterStatus, showAll]);

  // Get the current staff member when the page loads
  useEffect(() => {
    setCurrentStaff(authService.getCurrentStaff());
    // The missed appointments check is now handled by the queueResetService automatically
  }, []);

  // Function to manually trigger missed appointment check (simplified to use new service)
  const checkAndMarkMissedAppointments = async () => {
    try {
      const result = await queueService.checkForMissedAppointments();

      if (result.processedCount > 0) {
        setCheckInResult({
          success: true,
          message: result.message,
        });

        // Refresh the appointments list
        loadAllOnlineAppointments(calendarDate);
      }

      return result;
    } catch (error) {
      console.error("Error checking for missed appointments:", error);
      setCheckInResult({
        success: false,
        message: "Error checking for missed appointments",
      });
      return { processedCount: 0, error: error.message };
    }
  };

  // Load all online appointments for the selected date from the database
  const loadAllOnlineAppointments = async (date) => {
    setIsLoading(true);
    try {
      const result = await queueService.getAllOnlineAppointments(date);
      if (result.success) {
        const getDateString = (d) => {
          if (!d) return "";
          return new Date(d).toISOString().split("T")[0];
        };
        const todayAppointments = result.appointments.filter(
          (apt) =>
            getDateString(apt.preferred_date) === date &&
            apt.status !== "missed"
        );
        const missedAppointments = result.appointments.filter(
          (apt) => apt.status === "missed"
        );
        const expectedAppointments = result.appointments.filter(
          (apt) => apt.status !== "missed"
        );
        setAllAppointments({
          today: todayAppointments,
          missed: missedAppointments,
          expected: expectedAppointments,
        });
        setFoundAppointments(todayAppointments); // Show all by default
        setCheckInResult(null);
      } else {
        setAllAppointments({ today: [], missed: [] });
        setFoundAppointments([]);
        setCheckInResult({
          success: false,
          message: "No online appointments found",
        });
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      setCheckInResult({
        success: false,
        message: "Error loading appointments",
      });
      setAllAppointments({ today: [], missed: [] });
      setFoundAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    setIsSearching(true);
    try {
      let appointmentsToSearch = [];
      if (showAll) {
        // Search through all appointments regardless of status or date
        appointmentsToSearch = [
          ...(allAppointments.today || []),
          ...(allAppointments.missed || []),
          ...(allAppointments.expected || []),
        ];
      } else {
        appointmentsToSearch = allAppointments[filterStatus] || [];
      }

      const filtered = appointmentsToSearch.filter((appointment) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          appointment.patient_full_name?.toLowerCase().includes(searchLower) ||
          appointment.email_address?.toLowerCase().includes(searchLower) ||
          appointment.contact_number?.includes(searchTerm)
        );
      });
      setFoundAppointments(filtered);
      if (filtered.length === 0 && searchTerm.trim()) {
        setCheckInResult({
          success: false,
          message: `No appointments found matching "${searchTerm}"`,
        });
      } else {
        setCheckInResult(null);
      }
    } catch (error) {
      console.error("Error filtering appointments:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckIn = async (appointment) => {
    setIsCheckingIn(true);
    try {
      const result = await queueService.checkInOnlinePatient({
        patient_full_name: appointment.patient_full_name,
        email_address: appointment.email_address,
      });

      setCheckInResult(result);

      if (result.success) {
        // Log the check-in action
        await customDataService.addDataWithAutoId("audit_logs", {
          user_ref: `staff/${currentStaff.id}`,
          staff_full_name: currentStaff.full_name,
          action: `Checked in online appointment for: ${appointment.patient_full_name}`,
          ip_address: "192.168.1.100",
          timestamp: new Date().toISOString(),
        });

        setAllAppointments((prev) => ({
          ...prev,
          today: prev.today.filter((apt) => apt.id !== appointment.id),
        }));
        setFoundAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointment.id)
        );
        setSearchTerm("");
      }
    } catch (error) {
      setCheckInResult({
        success: false,
        message: "Error during check-in process",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mark appointment as missed
  const handleMarkMissed = async (appointment) => {
    try {
      // Only update appointment status, don't create or update queue items
      let appointmentId = appointment.id;
      if (appointment.appointment_id)
        appointmentId = appointment.appointment_id;
      if (appointment.appointment_ref)
        appointmentId = appointment.appointment_ref.split("/")[1];

      // Update appointment status directly
      const { ref, update } = await import("firebase/database");
      const { database } = await import("../../shared/config/firebase");
      const appointmentRef = ref(database, `appointments/${appointmentId}`);
      await update(appointmentRef, {
        status: "missed",
        updated_at: new Date().toISOString(),
      });

      // Log the action
      await customDataService.addDataWithAutoId("audit_logs", {
        user_ref: `staff/${currentStaff.id}`,
        staff_full_name: currentStaff.full_name,
        action: `Marked appointment as missed: ${appointment.patient_full_name}`,
        ip_address: "192.168.1.100",
        timestamp: new Date().toISOString(),
      });

      setCheckInResult({ success: true, message: "Marked as missed." });
      setAllAppointments((prev) => ({
        ...prev,
        today: prev.today.filter((apt) => apt.id !== appointment.id),
        missed: [...prev.missed, { ...appointment, status: "missed" }],
      }));
      setFoundAppointments((prev) =>
        prev.filter((apt) => apt.id !== appointment.id)
      );
    } catch (error) {
      setCheckInResult({ success: false, message: "Error marking as missed." });
    }
  };

  // Reschedule appointment (simple: set status to 'rescheduled')

  useEffect(() => {
    // Update foundAppointments when calendarDate or filterStatus changes
    const getDateString = (date) => {
      if (!date) return "";
      return new Date(date).toISOString().split("T")[0];
    };

    if (showAll) {
      // Show all appointments from all dates and statuses
      const allAppts = [
        ...(allAppointments.today || []),
        ...(allAppointments.missed || []),
        ...(allAppointments.expected || []),
      ];
      setFoundAppointments(allAppts);
    } else if (filterStatus === "today") {
      setFoundAppointments(
        (allAppointments.today || []).filter(
          (apt) =>
            getDateString(apt.preferred_date) === calendarDate &&
            apt.status !== "missed"
        )
      );
    } else if (filterStatus === "missed") {
      setFoundAppointments(
        (allAppointments.missed || []).filter(
          (apt) =>
            getDateString(apt.preferred_date) === calendarDate &&
            apt.status === "missed"
        )
      );
    }
  }, [calendarDate, allAppointments, filterStatus, showAll]);

  return (
    <div className="p-6 w-full max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Filter buttons and calendar date picker row - improved responsiveness */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 w-full">
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <Button
            variant={filterStatus === "today" ? "default" : "outline"}
            className={`rounded-full px-6 py-2 font-semibold ${
              filterStatus === "today"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-900 text-primary dark:text-blue-300 border"
            }`}
            onClick={() => {
              setFilterStatus("today");
              setCalendarDate(getLocalDateString());
            }}
          >
            Today's Appointments
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {
                (allAppointments.today || []).filter((apt) => {
                  const todayDate = new Date().toISOString().split("T")[0];
                  return (
                    apt.preferred_date === todayDate && apt.status !== "missed"
                  );
                }).length
              }
            </span>
          </Button>
          <Button
            variant={filterStatus === "missed" ? "default" : "outline"}
            className={`rounded-full px-6 py-2 font-semibold ${
              filterStatus === "missed"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border"
            }`}
            onClick={() => setFilterStatus("missed")}
          >
            Missed Appointments
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200">
              {
                (allAppointments.missed || []).filter(
                  (apt) =>
                    apt.preferred_date === calendarDate &&
                    apt.status === "missed"
                ).length
              }
            </span>
          </Button>
        </div>
        <div className="flex-1 flex items-center gap-2 justify-end w-full md:w-auto">
          <label
            htmlFor="calendarDate"
            className="font-semibold text-gray-700 dark:text-gray-200"
          >
            Select Date:
          </label>
          <input
            type="date"
            id="calendarDate"
            value={calendarDate}
            onChange={(e) => setCalendarDate(e.target.value)}
            className="rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full max-w-xs"
          />
        </div>
      </div>

      {/* Search input and manual check button */}
      <div className="mb-4 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md border rounded px-3 py-2 focus:outline-primary dark:focus:outline-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <Button
          variant="outline"
          onClick={filterAppointments}
          className="px-4 py-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          <Search className="h-4 w-4 mr-2" /> Search
        </Button>

        {/* Manual missed appointments check button - only for admin/staff */}
      </div>

      {/* Found Appointments */}
      {foundAppointments.length > 0 && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Appointments for {calendarDate} ({foundAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {foundAppointments.map((appointment) => {
                const todayDate = getLocalDateString();
                const isToday = appointment.preferred_date === todayDate;
                return (
                  <div
                    key={appointment.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 w-full"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                          {appointment.patient_full_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-4 w-4" />
                          {appointment.email_address}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="h-4 w-4" />
                          {appointment.contact_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Booked: {formatDate(appointment.booked_at)}
                        </span>
                        {appointment.service_ref && (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                            Service:{" "}
                            {(() => {
                              const ref = appointment.service_ref;
                              const id = ref?.split("/")[1];
                              return servicesMap[id] || ref;
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-2 min-w-fit">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full mb-2 md:mb-0">
                        Online Appointment
                      </span>
                      {isToday && appointment.status === "scheduled" && (
                        <>
                          <Button
                            onClick={() => handleCheckIn(appointment)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Check In
                          </Button>
                          <Button
                            onClick={() => handleMarkMissed(appointment)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Mark as Missed
                          </Button>
                        </>
                      )}
                      {appointment.status === "checked-in" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-semibold">
                          Checked In
                          {appointment.queue_number && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              Queue #: {appointment.queue_number}
                            </span>
                          )}
                        </span>
                      )}
                      {appointment.status === "missed" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-semibold">
                          Missed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {foundAppointments.length === 0 && !isLoading && (
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <CardContent className="py-8 text-center">
            <Search className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No appointments found for {calendarDate}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try selecting a different date or check the appointment details.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="py-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Check-in Instructions:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>
              • Search for online appointments using patient name, email, or
              phone
            </li>
            <li>
              • Online patients will receive priority queue numbers (O-001,
              O-002, etc.)
            </li>
            <li>
              • Priority is based on original booking time - earlier bookings
              get served first
            </li>
            <li>
              • Queue numbers are only assigned after check-in at the clinic
            </li>
            <li>
              <strong>Automatic Processing:</strong> Appointments are
              automatically marked as "missed" at 12:00 AM if patients haven't
              checked in by the end of their appointment day
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientCheckIn;
