// This is the main dashboard for clinic staff and admins
// It shows stats, charts, and lets staff manage patients, queue, and appointments
import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaWalking,
  FaGlobe,
  FaPlus,
  FaUsers,
  FaCalendar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMoon,
  FaSun,
  FaTimes,
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import customDataService from "../../shared/services/customDataService";
import analyticsService from "../../shared/services/analyticsService";
import queueService from "../../shared/services/queueService";
import authService from "../../shared/services/authService";

// Chart colors for light and dark mode
const chartColors = {
  light: {
    online: "#159EEC",
    walkin: "#9BDBFF",
    background: "#ffffff",
    grid: "#e5e7eb",
    text: "#374151",
  },
  dark: {
    online: "#3B82F6",
    walkin: "#10B981",
    background: "#1f2937",
    grid: "#374151",
    text: "#f9fafb",
  },
};

const AdminDashboard = () => {
  // UI state for showing/hiding forms and dark mode
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");

  // Data state for dashboard info
  const [services, setServices] = useState([]); // List of clinic services
  const [patients, setPatients] = useState([]); // All patients
  const [queue, setQueue] = useState([]); // Queue for today
  const [todayQueue, setTodayQueue] = useState([]);
  const [staff, setStaff] = useState([]); // Staff members
  const [appointments, setAppointments] = useState([]); // Appointments
  const [auditLogs, setAuditLogs] = useState([]); // System logs
  const [isLoading, setIsLoading] = useState(false); // Loading spinner
  const [currentStaff, setCurrentStaff] = useState(null); // Logged-in staff

  // Analytics for charts and stats
  const [analyticsData, setAnalyticsData] = useState({
    analytics: {
      "7days": [],
      "30days": [],
      "3months": [],
      all: [],
    },
    totals: {
      totalOnline: 0,
      totalWalkin: 0,
      totalAppointments: 0,
      waitingPatients: 0,
    },
  });

  // Get current theme colors
  const currentColors = isDarkMode ? chartColors.dark : chartColors.light;

  // Get current chart data from real analytics (fallback to empty array)
  const chartData = analyticsData.analytics[selectedPeriod] || [];

  // Update your chart configuration to use dynamic colors
  const chartConfig = {
    online: {
      label: "Online",
      color: currentColors.online,
    },
    walkin: {
      label: "Walk-in",
      color: currentColors.walkin,
    },
  };

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    service_ref: "",
    priority_flag: "normal",
    appointment_type: "walkin", // New field for appointment type
  });

  useEffect(() => {
    loadDashboardData();
    setCurrentStaff(authService.getCurrentStaff());

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Real-time patients listener
    const unsubscribePatients = customDataService.subscribeToRealtimeData(
      "patients",
      (patientsData) => {
        setPatients(patientsData || []);
      }
    );

    // Real-time queue listener
    const today = new Date().toISOString().split("T")[0];
    const unsubscribeQueue = customDataService.subscribeToRealtimeData(
      `queue/${today}`,
      (queueData) => {
        setQueue(queueData || []);
      }
    );

    // Real-time analytics listener
    const unsubscribeAnalytics =
      analyticsService.subscribeToAppointmentAnalytics((analytics) => {
        setAnalyticsData(analytics);
      });

    // Real-time appointments listener
    const unsubscribeAppointments = customDataService.subscribeToRealtimeData(
      "appointments",
      (appointmentsData) => {
        setAppointments(appointmentsData || []);
      }
    );

    // Real-time audit logs listener
    const unsubscribeAuditLogs = customDataService.subscribeToRealtimeData(
      "audit_logs",
      (logsData) => {
        setAuditLogs(logsData || []);
      }
    );

    // Real-time today's queue listener
    const unsubscribeTodayQueue = queueService.subscribeToTodayQueue(
      (queue) => {
        setTodayQueue(queue || []);
      }
    );

    return () => {
      unsubscribePatients(); // Clean up patients listener
      unsubscribeAnalytics();
      unsubscribeAppointments(); // Clean up appointments listener
      unsubscribeAuditLogs(); // Clean up audit logs listener
      unsubscribeQueue(); // Clean up queue listener
      unsubscribeTodayQueue();
      analyticsService.cleanup();
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Get period label for display
  const getPeriodLabel = (period) => {
    const labels = {
      "7days": "Last 7 days",
      "30days": "Last 30 days",
      "3months": "Last 3 months",
      all: "All time",
    };
    return labels[period] || "Last 3 months";
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [servicesData, staffData, patientsData] = await Promise.all([
        customDataService.getAllData("services"),
        customDataService.getAllData("staff"),
        customDataService.getAllData("patients"),
      ]);

      setServices(servicesData);
      setStaff(staffData);
      setPatients(patientsData || []);

      console.log("Dashboard data loaded:", {
        services: servicesData.length,
        patients: patientsData.length,
        staff: staffData.length,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Use the queue service to add walk-in patient
      const result = await queueService.addWalkinToQueue({
        full_name: patientForm.full_name,
        email: patientForm.email,
        phone_number: patientForm.phone_number,
        service_ref: patientForm.service_ref || "General Consultation",
      });

      if (result.success) {
        // Log the activity
        if (currentStaff) {
          await customDataService.addDataWithAutoId("audit_logs", {
            user_ref: `staff/${currentStaff.id}`,
            staff_full_name: currentStaff.full_name,
            action: `Walk-in patient registered: ${patientForm.full_name} - Queue #${result.queueNumber}`,
            ip_address: "192.168.1.100",
            timestamp: new Date().toISOString(),
          });
        }

        // Create walk-in appointment in appointments collection
        const appointmentData = {
          patient_full_name: patientForm.full_name,
          email_address: patientForm.email,
          contact_number: patientForm.phone_number,
          service_ref: patientForm.service_ref || "General Consultation",
          appointment_type: "walk-in",
          status: "checkedin",
          checked_in: true,
          created_at: new Date().toISOString(),
          appointment_date: new Date().toISOString(),
          queue_number: result.queueNumber,
        };
        try {
          await import("../../shared/services/dataService").then((mod) =>
            mod.default.addDataWithAutoId("appointments", appointmentData)
          );
        } catch (err) {
          console.error("Error creating walk-in appointment:", err);
        }

        // Reset form and close modal
        setPatientForm({
          full_name: "",
          email: "",
          phone_number: "",
          date_of_birth: "",
          address: "",
          service_ref: "",
          priority_flag: "normal",
          appointment_type: "walkin",
        });
        setShowPatientForm(false);

        // Reload data
        loadDashboardData();

        alert(
          `✅ Walk-in patient registered successfully! Queue Number: ${result.queueNumber}`
        );
      } else {
        throw new Error(result.error || "Failed to register walk-in patient");
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("❌ Error registering patient: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate stats from real data and analytics totals
  // Count unique patients by email address
  // Only count records from the 'patients' collection
  // Patient card count matches PatientsManagement.jsx
  const totalPatients = patients.length;
  const onlineAppointments = appointments.filter(
    (a) => a.appointment_type === "online"
  ).length;
  const walkinAppointments = appointments.filter(
    (a) => a.appointment_type === "walk-in" || a.appointment_type === "walkin"
  ).length;
  const waitingPatients =
    analyticsData.totals.waitingPatients ||
    patients.filter((p) => p.status === "waiting").length;

  return (
    <div
      className={`flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen transition-colors duration-300 ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {currentStaff?.full_name || "User"} (
            {currentStaff?.role || "N/A"})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="mr-2"
          >
            {isDarkMode ? (
              <FaSun className="h-4 w-4" />
            ) : (
              <FaMoon className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={() => setShowPatientForm(true)}>
            <FaPlus className="mr-2 h-4 w-4" />
            Register New Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <FaUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Online Appointments
            </CardTitle>
            <FaGlobe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Walk-in Patients
            </CardTitle>
            <FaWalking className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walkinAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's In Queue
            </CardTitle>
            <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-2xl font-bold">{todayQueue.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Appointment Overview</CardTitle>
                <CardDescription>
                  Online vs Walk-in appointments -{" "}
                  {getPeriodLabel(selectedPeriod)}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                {[
                  { key: "7days", label: "Last 7 days" },
                  { key: "30days", label: "Last 30 days" },
                  { key: "3months", label: "Last 3 months" },
                  { key: "all", label: "All" },
                ].map((period) => (
                  <Button
                    key={period.key}
                    variant={
                      selectedPeriod === period.key ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSelectedPeriod(period.key)}
                    className={`text-xs px-3 py-1 h-8 ${
                      selectedPeriod === period.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={currentColors.grid}
                  opacity={0.3}
                />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    selectedPeriod === "7days"
                      ? value
                      : selectedPeriod === "30days"
                      ? value
                      : selectedPeriod === "3months"
                      ? value.slice(0, 3)
                      : value
                  }
                  tick={{ fill: currentColors.text, fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: currentColors.background,
                    border: `1px solid ${currentColors.grid}`,
                    borderRadius: "8px",
                    color: currentColors.text,
                  }}
                />
                <defs>
                  <linearGradient id="fillOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={currentColors.online}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={currentColors.online}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillWalkin" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={currentColors.walkin}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={currentColors.walkin}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="walkin"
                  type="natural"
                  fill="url(#fillWalkin)"
                  fillOpacity={0.4}
                  stroke={currentColors.walkin}
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="online"
                  type="natural"
                  fill="url(#fillOnline)"
                  fillOpacity={0.4}
                  stroke={currentColors.online}
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest staff actions and patient updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {auditLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity yet.
                </div>
              ) : (
                auditLogs
                  .slice(-8)
                  .reverse()
                  .map((log) => {
                    // Choose icon and color based on action type
                    let icon, badgeColor;
                    if (log.action.toLowerCase().includes("check-in")) {
                      icon = <FaCheckCircle className="text-green-500" />;
                      badgeColor =
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
                    } else if (
                      log.action.toLowerCase().includes("add") ||
                      log.action.toLowerCase().includes("register")
                    ) {
                      icon = <FaUser className="text-blue-500" />;
                      badgeColor =
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
                    } else if (log.action.toLowerCase().includes("update")) {
                      icon = <FaSave className="text-yellow-500" />;
                      badgeColor =
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
                    } else if (log.action.toLowerCase().includes("delete")) {
                      icon = <FaExclamationTriangle className="text-red-500" />;
                      badgeColor =
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
                    } else {
                      icon = <FaClipboardList className="text-gray-400" />;
                      badgeColor =
                        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
                    }
                    return (
                      <div
                        key={log.id}
                        className={`flex items-center gap-4 rounded-lg border bg-white dark:bg-neutral-900 shadow-lg p-4 hover:shadow-xl transition-all border-l-4 border-gray-200 dark:border-gray-700 ${
                          log.action.toLowerCase().includes("check-in")
                            ? "border-l-green-500"
                            : log.action.toLowerCase().includes("add") ||
                              log.action.toLowerCase().includes("register")
                            ? "border-l-blue-500"
                            : log.action.toLowerCase().includes("update")
                            ? "border-l-yellow-500"
                            : log.action.toLowerCase().includes("delete")
                            ? "border-l-red-500"
                            : "border-l-gray-400"
                        }`}
                      >
                        <div className="flex-shrink-0">{icon}</div>
                        <div className="flex flex-col flex-1">
                          <span className="inline-block font-semibold text-xs mb-1">
                            {log.action}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {(() => {
                              if (
                                log.user_ref &&
                                log.user_ref.startsWith("staff/")
                              ) {
                                const staffId = log.user_ref.split("/")[1];
                                const staffMember = staff.find(
                                  (s) => s.id === staffId
                                );
                                return staffMember &&
                                  staffMember.full_name.trim() !== ""
                                  ? `${staffMember.full_name} • `
                                  : "Unknown Staff • ";
                              }
                              return `${log.user_ref} • `;
                            })()}
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="ml-auto text-xs text-gray-400 dark:text-gray-200 text-right">
                          <span className="block">{log.ip_address}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>
            A list of recent patient registrations in your clinic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No patients registered yet. Click "Register New Patient" to add
                your first patient.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">
                        Queue #
                      </th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Phone</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients
                      .sort((a, b) => {
                        // Show pending online appointments first, then queue order
                        if (a.status === "pending" && b.status !== "pending")
                          return -1;
                        if (b.status === "pending" && a.status !== "pending")
                          return 1;
                        if (a.queue_number && b.queue_number)
                          return a.queue_number - b.queue_number;
                        return 0;
                      })
                      .slice(-15)
                      .map((patient) => {
                        // Find matching queue entry for more accurate status
                        const queueEntry = queue.find(
                          (q) =>
                            q.full_name === patient.full_name &&
                            q.appointment_type === patient.appointment_type &&
                            q.email === patient.email
                        );
                        const status = queueEntry
                          ? queueEntry.status
                          : patient.status;
                        const queueNumber = queueEntry
                          ? queueEntry.queue_number
                          : patient.queue_number;
                        return (
                          <tr
                            key={patient.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              {queueNumber || (
                                <span className="text-orange-600 text-sm font-medium">
                                  Pending Check-in
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {patient.full_name}
                            </td>
                            <td className="py-3 px-4">
                              {patient.phone_number}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {patient.appointment_type === "online" ? (
                                  <>
                                    <FaGlobe className="mr-1 h-3 w-3" /> Online
                                  </>
                                ) : (
                                  <>
                                    <FaWalking className="mr-1 h-3 w-3" />{" "}
                                    Walk-in
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {(() => {
                                if (patient.appointment_type === "online") {
                                  // Online: resolve service name from service_ref
                                  const serviceId =
                                    patient.service_ref?.split("/")[1];
                                  const service = services.find(
                                    (s) => s.id === serviceId
                                  );
                                  return (
                                    service?.service_name ||
                                    patient.service_ref ||
                                    "N/A"
                                  );
                                } else {
                                  // Walk-in: show service name directly
                                  return patient.service_ref?.includes(
                                    "services/"
                                  )
                                    ? (() => {
                                        const serviceId =
                                          patient.service_ref?.split("/")[1];
                                        const service = services.find(
                                          (s) => s.id === serviceId
                                        );
                                        return (
                                          service?.service_name ||
                                          patient.service_ref ||
                                          "N/A"
                                        );
                                      })()
                                    : patient.service_ref || "N/A";
                                }
                              })()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  status === "waiting"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-neutral-100"
                                    : status === "in-progress"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-neutral-100"
                                    : status === "pending"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-neutral-100"
                                    : status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-neutral-100"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {status === "pending"
                                  ? "Pending Check-in"
                                  : status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  patient.priority_flag === "high"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                    : "bg-gray-100 text-gray-800 dark:bg-neutral-900 dark:text-neutral-100"
                                }`}
                              >
                                {patient.priority_flag}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Registration Modal */}
      {showPatientForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPatientForm(false);
            }
          }}
        >
          {/* Enhanced Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Content */}
          <Card className="relative w-full max-w-lg mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-2xl border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FaWalking className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Register Walk-in Patient
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a new walk-in patient to the queue
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPatientForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <FaTimes className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="max-h-[70vh] overflow-y-auto">
              <form onSubmit={handlePatientSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <FaUsers className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-medium"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={patientForm.full_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter patient's full name"
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={patientForm.email}
                          onChange={handleInputChange}
                          required
                          placeholder="patient@example.com"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone_number"
                          className="text-sm font-medium"
                        >
                          Phone Number *
                        </Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          type="tel"
                          value={patientForm.phone_number}
                          onChange={handleInputChange}
                          required
                          placeholder="+63 9XX XXX XXXX"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="date_of_birth"
                        className="text-sm font-medium"
                      >
                        Date of Birth *
                      </Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={patientForm.date_of_birth}
                        onChange={handleInputChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Complete Address *
                      </Label>
                      <textarea
                        id="address"
                        name="address"
                        value={patientForm.address}
                        onChange={handleInputChange}
                        required
                        className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder="Enter complete address with barangay, city, province"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <FaClipboardList className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Appointment Information
                    </h3>
                  </div>

                  {/* Walk-in Only Badge */}
                  <div className="flex items-center space-x-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <FaWalking className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-secondary">
                        Walk-in Appointment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Patient will be added to the walk-in queue
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="service_ref"
                        className="text-sm font-medium"
                      >
                        Select Service *
                      </Label>
                      <select
                        id="service_ref"
                        name="service_ref"
                        value={patientForm.service_ref}
                        onChange={handleInputChange}
                        required
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Choose a service...</option>
                        {services.map((service) => (
                          <option
                            key={service.id}
                            value={`services/${service.id}`}
                          >
                            {service.service_name} ({service.duration_minutes}{" "}
                            mins)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="priority_flag"
                        className="text-sm font-medium"
                      >
                        Priority Level
                      </Label>
                      <select
                        id="priority_flag"
                        name="priority_flag"
                        value={patientForm.priority_flag}
                        onChange={handleInputChange}
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-11"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2 h-4 w-4" />
                        Register Patient
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPatientForm(false)}
                    className="px-6 h-11"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
