import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFlag,
  FaClock,
  FaStethoscope,
  FaGlobe,
  FaWalking,
} from "react-icons/fa";
import customDataService from "../../shared/services/customDataService";

const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load all data with references
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      // Load all collections to resolve references
      const [patientsData, servicesData, staffData, appointmentsData] =
        await Promise.all([
          customDataService.getAllData("patients"),
          customDataService.getAllData("services"),
          customDataService.getAllData("staff"),
          customDataService.getAllData("appointments"),
        ]);

      setPatients(patientsData || []);
      setServices(servicesData || []);
      setStaff(staffData || []);
      setAppointments(appointmentsData || []);

      console.log("📊 Loaded Data:", {
        patients: patientsData?.length || 0,
        services: servicesData?.length || 0,
        staff: staffData?.length || 0,
        appointments: appointmentsData?.length || 0,
      });
    } catch (error) {
      console.error("❌ Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to resolve service reference
  const getServiceName = (serviceRef) => {
    if (!serviceRef || !services.length) return "Unknown Service";

    // Extract service ID from reference (e.g., "services/abc123" -> "abc123")
    const serviceId = serviceRef.split("/").pop();
    const service = services.find((s) => s.id === serviceId);
    return service ? service.service_name : "Unknown Service";
  };

  // Helper function to resolve staff reference
  const getStaffName = (staffRef) => {
    if (!staffRef || !staff.length) return "Unassigned";

    const staffId = staffRef.split("/").pop();
    const staffMember = staff.find((s) => s.id === staffId);
    return staffMember ? staffMember.full_name : "Unknown Staff";
  };

  // Helper function to get patient appointments
  const getPatientAppointments = (patientId) => {
    return appointments.filter(
      (apt) => apt.patient_ref && apt.patient_ref.includes(patientId)
    );
  };

  // Filter patients based on search and checked-in status
  // Show all walk-ins, but only include online appointments if checked in
  const filteredPatients = patients.filter((patient) => {
    const isWalkin = patient.appointment_type === "walkin";
    const isOnlineCheckedIn =
      patient.appointment_type === "online" &&
      (patient.checked_in ||
        ["checkedin", "checked-in"].includes(patient.status));
    const matchesSearch =
      patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone_number?.includes(searchTerm);
    return (isWalkin || isOnlineCheckedIn) && matchesSearch;
  });

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "text-blue-600 bg-blue-100";
      case "in-progress":
        return "text-orange-600 bg-orange-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Loading patients data...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-3xl text-primary" />
          <h1 className="text-3xl font-yeseva text-primary">
            Patients Management
          </h1>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <FaPlus />
          Add New Patient
        </button>
      </div>

      {/* Stats Card: Only Total Patients */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-worksans text-gray-600">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-primary">
                {filteredPatients.length}
              </p>
            </div>
            <FaUsers className="text-3xl text-primary opacity-20" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Patients Table - scrollable, sticky header, no queue column */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service (Referenced)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No patients found matching your search."
                      : "No patients found. Create some sample data first."}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const patientAppointments = getPatientAppointments(
                    patient.id
                  );
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {patient.full_name?.charAt(0) || "P"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.full_name || "Unknown Name"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <FaEnvelope className="w-3 h-3" />
                                {patient.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaPhone className="w-3 h-3" />
                                {patient.phone_number}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {patient.appointment_type === "online" ? (
                            <>
                              <FaGlobe className="mr-2 h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-600">
                                Online
                              </span>
                            </>
                          ) : (
                            <>
                              <FaWalking className="mr-2 h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-600">
                                Walk-in
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getServiceName(patient.service_ref)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Ref: {patient.service_ref || "No reference"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            patient.status
                          )}`}
                        >
                          {patient.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            patient.priority_flag
                          )}`}
                        >
                          <FaFlag className="w-2 h-2 mr-1" />
                          {patient.priority_flag || "normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {patientAppointments.length} appointment(s)
                        </div>
                        {patientAppointments.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Latest with:{" "}
                            {getStaffName(patientAppointments[0].staff_ref)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewPatientDetails(patient)}
                            className="text-primary hover:text-primary/80 p-1 rounded"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Edit Patient"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Delete Patient"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-yeseva text-primary">
                  Patient Details: {selectedPatient.full_name}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-worksans font-bold text-gray-800 mb-3">
                    Personal Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Full Name:</strong> {selectedPatient.full_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedPatient.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedPatient.phone_number}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {selectedPatient.date_of_birth}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedPatient.address}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-worksans font-bold text-gray-800 mb-3">
                    Queue Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Queue Number:</strong> #
                      {selectedPatient.queue_number}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedPatient.status
                        )}`}
                      >
                        {selectedPatient.status}
                      </span>
                    </p>
                    <p>
                      <strong>Priority:</strong>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          selectedPatient.priority_flag
                        )}`}
                      >
                        {selectedPatient.priority_flag}
                      </span>
                    </p>
                    <p>
                      <strong>Service:</strong>{" "}
                      {getServiceName(selectedPatient.service_ref)}
                    </p>
                    <p>
                      <strong>Service Reference:</strong>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                        {selectedPatient.service_ref}
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointments */}
              <div className="mb-6">
                <h3 className="text-lg font-worksans font-bold text-gray-800 mb-3">
                  Related Appointments
                </h3>
                {getPatientAppointments(selectedPatient.id).length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No appointments found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getPatientAppointments(selectedPatient.id).map(
                      (appointment, index) => (
                        <div
                          key={appointment.id}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p>
                                <strong>Appointment #{index + 1}</strong>
                              </p>
                              <p>
                                <strong>Date:</strong>{" "}
                                {new Date(
                                  appointment.appointment_date
                                ).toLocaleString()}
                              </p>
                              <p>
                                <strong>Status:</strong> {appointment.status}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Doctor:</strong>{" "}
                                {getStaffName(appointment.staff_ref)}
                              </p>
                              <p>
                                <strong>Service:</strong>{" "}
                                {getServiceName(appointment.service_ref)}
                              </p>
                              <p>
                                <strong>References:</strong>
                              </p>
                              <div className="text-xs bg-white p-2 rounded mt-1">
                                <p>
                                  Patient:{" "}
                                  <code>{appointment.patient_ref}</code>
                                </p>
                                <p>
                                  Staff: <code>{appointment.staff_ref}</code>
                                </p>
                                <p>
                                  Service:{" "}
                                  <code>{appointment.service_ref}</code>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Database References */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-worksans font-bold text-blue-800 mb-3">
                  🔗 Database References (How it works)
                </h3>
                <div className="text-sm text-blue-700">
                  <p className="mb-2">
                    This patient record demonstrates Firebase references:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <strong>Patient ID:</strong>{" "}
                      <code>{selectedPatient.id}</code>
                    </li>
                    <li>
                      <strong>Service Reference:</strong>{" "}
                      <code>{selectedPatient.service_ref}</code>
                    </li>
                    <li>
                      <strong>Related Appointments:</strong>{" "}
                      {getPatientAppointments(selectedPatient.id).length} found
                      by patient_ref
                    </li>
                    <li>
                      <strong>Created:</strong>{" "}
                      {new Date(selectedPatient.created_at).toLocaleString()}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;
