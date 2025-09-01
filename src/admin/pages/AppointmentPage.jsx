// This page shows all appointments for staff/admin
// Staff can search, view, and filter appointments here
import React, { useState, useEffect } from "react";
import Badge from "../../components/ui/badge";
import dataService from "../../shared/services/dataService";
import emailjs from "emailjs-com";

function AppointmentPage() {
  const [services, setServices] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const [appointmentsData, servicesData] = await Promise.all([
          dataService.getAllData("appointments"),
          dataService.getAllData("services"),
        ]);
        setAppointments(appointmentsData);
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

  // Helper for status color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
        return "bg-red-100 text-red-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "checked-in":
        return "bg-purple-100 text-purple-700";
      case "scheduled":
        return "bg-yellow-100 text-yellow-700";
      case "missed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter((appt) =>
      appt.patient_full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.appointment_date - b.appointment_date
        : b.appointment_date - a.appointment_date
    );

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
    <div className="p-6 w-full max-w-screen-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">Appointments</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 w-64 focus:outline-primary"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-primary-dark"
            onClick={() => setSearchTerm(searchTerm)}
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by date:</span>
          <button
            className={`px-3 py-1 rounded border ${
              sortOrder === "asc"
                ? "bg-primary text-white"
                : "bg-white text-primary"
            }`}
            onClick={() => setSortOrder("asc")}
          >
            Oldest
          </button>
          <button
            className={`px-3 py-1 rounded border ${
              sortOrder === "desc"
                ? "bg-primary text-white"
                : "bg-white text-primary"
            }`}
            onClick={() => setSortOrder("desc")}
          >
            Newest
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="min-w-full bg-white">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2">Patient Name</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-semibold">
                      {appt.patient_full_name}
                    </td>
                    <td className="px-4 py-2">{appt.appointment_type}</td>
                    <td className="px-4 py-2">
                      {getServiceName(appt.service_ref)}
                    </td>
                    <td className="px-4 py-2">
                      {appt.appointment_date
                        ? new Date(appt.appointment_date).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="text-primary underline font-medium hover:text-primary-dark"
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setShowDialog(true);
                        }}
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

      {/* Appointment Details Dialog */}
      {showDialog && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop filter */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setShowDialog(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setShowDialog(false)}
              title="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-primary mb-4">
              Appointment Details
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Patient Name
                </span>
                <span className="font-semibold text-base text-gray-800">
                  {selectedAppointment.patient_full_name}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Email</span>
                <span className="font-semibold text-base text-gray-800">
                  {selectedAppointment.email_address}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Contact
                </span>
                <span className="font-semibold text-base text-gray-800">
                  {selectedAppointment.contact_number}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Type</span>
                <span className="font-semibold text-base text-gray-800">
                  {selectedAppointment.appointment_type}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Service
                </span>
                <span className="font-semibold text-base text-gray-800">
                  {getServiceName(selectedAppointment.service_ref)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Date</span>
                <span className="font-semibold text-base text-gray-800">
                  {selectedAppointment.appointment_date
                    ? new Date(
                        selectedAppointment.appointment_date
                      ).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Status</span>
                <Badge
                  variant={
                    selectedAppointment.status === "completed"
                      ? "secondary"
                      : selectedAppointment.status === "no-show"
                      ? "destructive"
                      : selectedAppointment.status === "confirmed"
                      ? "default"
                      : selectedAppointment.status === "checked-in"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {selectedAppointment.status}
                </Badge>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">
                  Checked In
                </span>
                <span className="font-semibold text-base text-gray-800">
                  {selectedAppointment.checked_in ? "Yes" : "No"}
                </span>
              </div>
              {selectedAppointment.additional_notes && (
                <div className="col-span-2">
                  <span className="block text-xs text-gray-500 mb-1">
                    Additional Notes
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.additional_notes}
                  </span>
                </div>
              )}
              {selectedAppointment.booked_by_name && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Booked By
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.booked_by_name}
                  </span>
                </div>
              )}
              {selectedAppointment.booking_source && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Booking Source
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.booking_source}
                  </span>
                </div>
              )}
              {selectedAppointment.checked_in_at && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Checked In At
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {new Date(
                      selectedAppointment.checked_in_at
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              {selectedAppointment.patient_birthdate && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Birthdate
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.patient_birthdate}
                  </span>
                </div>
              )}
              {selectedAppointment.patient_sex && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Sex</span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.patient_sex}
                  </span>
                </div>
              )}
              {selectedAppointment.preferred_date && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Preferred Date
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.preferred_date}
                  </span>
                </div>
              )}
              {selectedAppointment.present_checkbox !== undefined && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Present
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.present_checkbox ? "Yes" : "No"}
                  </span>
                </div>
              )}
              {selectedAppointment.queue_number && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Queue Number
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.queue_number}
                  </span>
                </div>
              )}
              {selectedAppointment.relation_to_patient && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">
                    Relation to Patient
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.relation_to_patient}
                  </span>
                </div>
              )}
              {selectedAppointment.current_medications && (
                <div className="col-span-2">
                  <span className="block text-xs text-gray-500 mb-1">
                    Current Medications
                  </span>
                  <span className="font-semibold text-base text-gray-800">
                    {selectedAppointment.current_medications}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentPage;
