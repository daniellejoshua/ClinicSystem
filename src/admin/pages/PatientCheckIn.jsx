// This page lets staff check in patients for their appointments
// Staff can search for appointments, see results, and check patients in
import React, { useState, useEffect } from "react";
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
import authService from "../../shared/services/authService";
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
  // State for search box, found appointments, all appointments, and loading
  const [searchTerm, setSearchTerm] = useState("");
  const [foundAppointments, setFoundAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // All appointments loaded from database
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Show spinner while loading
  const [checkInResult, setCheckInResult] = useState(null); // Result of check-in action
  const [isCheckingIn, setIsCheckingIn] = useState(false); // Spinner for check-in
  const [currentStaff, setCurrentStaff] = useState(null); // Current staff member

  // When a check-in happens, show the result for 5 seconds
  useEffect(() => {
    if (checkInResult) {
      const timer = setTimeout(() => {
        setCheckInResult(null);
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [checkInResult]);

  // When the page loads, get all online appointments from the database
  useEffect(() => {
    loadAllOnlineAppointments();
  }, []);

  // When staff types in the search box, filter appointments after a short delay
  // If the box is empty, show all appointments
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        filterAppointments();
      } else {
        setFoundAppointments(allAppointments);
        setCheckInResult(null);
      }
    }, 300); // 300ms debounce for fast response

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allAppointments]);

  // Get the current staff member when the page loads
  useEffect(() => {
    setCurrentStaff(authService.getCurrentStaff());
  }, []);

  // Load all online appointments from the database
  const loadAllOnlineAppointments = async () => {
    setIsLoading(true);
    try {
      const result = await queueService.getAllOnlineAppointments();
      if (result.success) {
        setAllAppointments(result.appointments);
        setFoundAppointments(result.appointments); // Show all by default
        setCheckInResult(null);
      } else {
        setAllAppointments([]);
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
      setAllAppointments([]);
      setFoundAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    setIsSearching(true);
    try {
      const filtered = allAppointments.filter((appointment) => {
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
          action: `Checked in online appointment for: ${appointment.patient_full_name}`,
          ip_address: "192.168.1.100",
          timestamp: new Date().toISOString(),
        });

        // Remove the checked-in appointment from both lists
        setAllAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointment.id)
        );
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Patient Check-in
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Search and check-in online appointments
        </div>
      </div>

      {/* Search Section */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Search className="h-5 w-5" />
            Search Online Appointments
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isLoading
              ? "Loading online appointments..."
              : searchTerm
              ? `Filtering ${allAppointments.length} appointments...`
              : `Showing all ${allAppointments.length} online appointments`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="search"
              className="text-gray-700 dark:text-gray-300"
            >
              Search Term
            </Label>
            <Input
              id="search"
              type="text"
              placeholder={
                isLoading
                  ? "Loading appointments..."
                  : "Filter by patient name, email, or phone... (leave empty to show all)"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
              className="mt-1 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {isLoading && (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                <span className="animate-spin">⚡</span>
                Loading appointments...
              </p>
            )}
            {isSearching && !isLoading && (
              <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                <span className="animate-spin">🔍</span>
                Filtering...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {checkInResult && (
        <div
          className={`p-4 rounded-lg border ${
            checkInResult.success
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {checkInResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`font-medium ${
                checkInResult.success
                  ? "text-green-800 dark:text-green-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {checkInResult.message}
            </span>
          </div>
          {checkInResult.success && checkInResult.queueNumber && (
            <div className="mt-2 text-lg font-bold text-green-700 dark:text-green-300">
              Queue Number: {checkInResult.queueNumber}
            </div>
          )}
        </div>
      )}

      {/* Found Appointments */}
      {foundAppointments.length > 0 && (
        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Found Appointments ({foundAppointments.length})
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Select an appointment to check in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {foundAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {appointment.patient_full_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span>{appointment.email_address}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.contact_number}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Booked: {formatDate(appointment.booked_at)}</span>
                      </div>

                      {appointment.service_ref && (
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Service: {appointment.service_ref}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        Online Appointment
                      </span>

                      <Button
                        onClick={() => handleCheckIn(appointment)}
                        disabled={isCheckingIn}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isCheckingIn ? "Checking In..." : "Check In"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchTerm &&
        foundAppointments.length === 0 &&
        !isSearching &&
        !checkInResult && (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No appointments found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching with a different name, email, or phone number.
              </p>
            </CardContent>
          </Card>
        )}

      {/* No Appointments Available */}
      {!searchTerm &&
        foundAppointments.length === 0 &&
        !isLoading &&
        !checkInResult && (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="py-8 text-center">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No online appointments available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are currently no online appointments waiting to be checked
                in.
              </p>
            </CardContent>
          </Card>
        )}

      {/* Instructions */}
      <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="py-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
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
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientCheckIn;
