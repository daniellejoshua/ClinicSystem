// Example: How to use reportService in AppointmentPage.jsx

import reportService from "../../shared/services/reportService";

// Example function for generating appointment reports
const generateAppointmentReport = () => {
  // Prepare filters object
  const filters = {};
  if (searchTerm) filters["Patient Name"] = searchTerm;
  if (filterStatus) filters["Status"] = filterStatus;
  if (filterService) filters["Service"] = filterService;
  if (filterType) filters["Type"] = filterType;

  // Prepare summary statistics
  const statusCounts = {};
  const typeCounts = {};
  filteredAppointments.forEach((appt) => {
    // Count by status
    statusCounts[appt.status] = (statusCounts[appt.status] || 0) + 1;
    // Count by type
    typeCounts[appt.appointment_type] =
      (typeCounts[appt.appointment_type] || 0) + 1;
  });

  const summary = {
    "Total Appointments": filteredAppointments.length,
    "Date Range":
      filteredAppointments.length > 0
        ? `${new Date(
            Math.min(
              ...filteredAppointments.map(
                (appt) => new Date(appt.appointment_date)
              )
            )
          ).toLocaleDateString()} - ${new Date(
            Math.max(
              ...filteredAppointments.map(
                (appt) => new Date(appt.appointment_date)
              )
            )
          ).toLocaleDateString()}`
        : "No data",
    "--- By Status ---": "",
    ...statusCounts,
    "--- By Type ---": "",
    ...typeCounts,
  };

  // Define columns for the report
  const columns = [
    { key: "patient_full_name", header: "Patient Name", width: 3 },
    { key: "email_address", header: "Email", width: 3 },
    { key: "contact_number", header: "Phone", width: 2 },
    { key: "appointment_type", header: "Type", width: 1 },
    { key: "service_name", header: "Service", width: 2 },
    { key: "status", header: "Status", width: 1 },
    { key: "appointment_date", header: "Date", width: 2, type: "datetime" },
  ];

  // Prepare data with resolved service names
  const reportData = filteredAppointments.map((appt) => ({
    ...appt,
    patient_full_name: appt.patient_full_name || "Unknown Patient",
    service_name: getServiceName(appt.service_ref), // Your existing function
  }));

  // Generate PDF
  reportService.generatePDF({
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

// Example function for printing appointment reports
const printAppointmentReport = () => {
  // Similar data preparation as above...

  reportService.generatePrint({
    title: "Appointments Report",
    data: reportData,
    columns,
    filters,
    summary,
  });
};

// In your JSX, add the report buttons:
/*
<div className="flex items-center gap-3">
  <Button
    onClick={printAppointmentReport}
    variant="outline"
    className="flex items-center gap-2"
  >
    <FileText className="h-4 w-4" />
    Print Report
  </Button>
  <Button
    onClick={generateAppointmentReport}
    className="flex items-center gap-2"
  >
    <Download className="h-4 w-4" />
    Download PDF
  </Button>
</div>
*/

export { generateAppointmentReport, printAppointmentReport };
