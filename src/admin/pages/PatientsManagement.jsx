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
  const [patientFilter, setPatientFilter] = useState("all");

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
    let service = services.find((s) => s.id === serviceId);
    if (service) return service.service_name;

    // Fallback: try to match by service name (in case serviceRef is a name)
    service = services.find((s) => s.service_name === serviceRef);
    if (service) return service.service_name;

    // Fallback: try to match by partial name (case-insensitive)
    service = services.find(
      (s) => s.service_name.toLowerCase() === serviceRef.toLowerCase()
    );
    if (service) return service.service_name;

    return "Unknown Service";
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

  // Filtering logic: filter by patient status and search
  const filteredPatients = patients.filter((patient) => {
    // Search filter
    const matchesSearch =
      patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone_number?.includes(searchTerm);

    // Status filter
    if (patientFilter !== "all") {
      return matchesSearch && patient.status === patientFilter;
    }
    return matchesSearch;
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

      {/* Filter Dropdown */}
      <div className="flex items-center gap-4 mb-4">
        <label className="font-medium text-gray-700">Filter by Status:</label>
        <select
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="checked-in">Checked-in</option>
          <option value="completed">Completed</option>
          <option value="waiting">Waiting</option>
          <option value="in-progress">In Progress</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
                    colSpan="6"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-2 border-primary rounded-2xl shadow-2xl max-w-2xl w-full m-4 max-h-[90%] overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8 border-b pb-4">
                <h2 className="text-2xl font-yeseva text-primary">
                  Patient Details: {selectedPatient.full_name}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              {/* Patient Information */}

              <div className="flex flex-col items-center mb-8">
                <div className="bg-white rounded-2xl border-2 border-primary shadow-lg p-8 w-full max-w-md">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2">
                      {selectedPatient.full_name?.charAt(0) || "P"}
                    </div>
                    <h3 className="text-xl font-yeseva text-primary font-bold mb-1">
                      {selectedPatient.full_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      Patient ID: {selectedPatient.id}
                    </span>
                  </div>
                  <div className="space-y-3 text-base text-gray-700">
                    <div className="flex items-center gap-2">
                      <FaFlag
                        className={getPriorityColor(
                          selectedPatient.priority_flag
                        )}
                      />
                      <span>
                        <strong>Priority:</strong>{" "}
                        {selectedPatient.priority_flag || "normal"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-primary" />
                      <span>
                        <strong>Email:</strong>{" "}
                        {selectedPatient.email || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-primary" />
                      <span>
                        <strong>Phone:</strong>{" "}
                        {selectedPatient.phone_number || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-primary" />
                      <span>
                        <strong>Date of Birth:</strong>{" "}
                        {selectedPatient.date_of_birth || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-primary" />
                      <span>
                        <strong>Sex:</strong>{" "}
                        {selectedPatient.sex || (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Appointments - Improved Design, Only Relevant Data */}
              <div className="mb-8">
                <h3 className="text-lg font-yeseva font-bold text-primary mb-4 tracking-wide">
                  Related Appointments
                </h3>
                {getPatientAppointments(selectedPatient.id).length === 0 ? (
                  <p className="text-gray-400 text-base italic">
                    No appointments found.
                  </p>
                ) : (
                  getPatientAppointments(selectedPatient.id).map(
                    (appointment, index) => (
                      <div
                        key={appointment.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-12 items-center shadow-sm hover:shadow-md transition"
                      >
                        {/* Left: Info */}
                        <div className="col-span-10 flex flex-col gap-2 justify-center">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 bg-primary text-white rounded px-3 py-1 text-xs font-bold font-yeseva">
                              <FaStethoscope className="inline mr-1" />
                              Appointment #{index + 1}
                            </span>
                            <span className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700">
                              <FaCalendar className="inline" />
                              {appointment.appointment_date
                                ? new Date(
                                    appointment.appointment_date
                                  ).toLocaleString()
                                : "N/A"}
                            </span>
                            {appointment.appointment_type === "online" &&
                              appointment.preferred_date && (
                                <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
                                  <FaCalendar className="inline" />
                                  Preferred:{" "}
                                  {new Date(
                                    appointment.preferred_date
                                  ).toLocaleDateString()}
                                </span>
                              )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-2 text-xs text-gray-700">
                              <FaClock className="text-primary" />
                              <strong>Status:</strong>
                              <span
                                className={`px-2 py-0.5 rounded font-semibold ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 text-xs text-gray-700">
                              <FaUser className="text-primary" />
                              <strong>Type:</strong>
                              {appointment.appointment_type === "online"
                                ? "Online"
                                : "Walk-in"}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-gray-700">
                              <FaStethoscope className="text-primary" />
                              <strong>Service:</strong>
                              {getServiceName(appointment.service_ref)}
                            </span>
                          </div>
                        </div>
                        {/* Divider */}
                        <div className="col-span-1 flex justify-center">
                          <div className="w-0.5 h-12 bg-gray-200" />
                        </div>
                        {/* Right: Priority */}
                        <div className="col-span-1 flex flex-col items-center justify-center">
                          <span
                            className={`inline-flex items-center px-3 py-0.5 rounded text-xs font-semibold ${getPriorityColor(
                              appointment.priority_flag
                            )}`}
                          >
                            <FaFlag className="mr-1" />
                            {appointment.priority_flag || "normal"}
                          </span>
                          <span className="text-xs text-gray-400">
                            Priority
                          </span>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;
