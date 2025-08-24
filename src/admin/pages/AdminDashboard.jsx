import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaCalendarAlt,
  FaUserMd,
  FaClipboardList,
  FaPlus,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import customDataService from "../../shared/services/customDataService";
import authService from "../../shared/services/authService";

const AdminDashboard = () => {
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    service_ref: "",
    priority_flag: "normal",
  });

  useEffect(() => {
    loadDashboardData();
    setCurrentStaff(authService.getCurrentStaff());
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [servicesData, patientsData, staffData] = await Promise.all([
        customDataService.getAllData("services"),
        customDataService.getAllData("patients"),
        customDataService.getAllData("staff"),
      ]);

      setServices(servicesData);
      setPatients(patientsData);
      setStaff(staffData);
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

      // Get next queue number
      const queueNumber = patients.length + 1;

      // Create patient with queue number
      const patientData = {
        ...patientForm,
        queue_number: queueNumber,
        status: "waiting",
      };

      await customDataService.addDataWithAutoId("patients", patientData);

      // Log the activity
      if (currentStaff) {
        await customDataService.addDataWithAutoId("audit_logs", {
          user_ref: `staff/${currentStaff.id}`,
          action: `Patient registered: ${patientForm.full_name}`,
          ip_address: "192.168.1.100",
          timestamp: new Date().toISOString(),
        });
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
      });
      setShowPatientForm(false);

      // Reload data
      loadDashboardData();

      alert("✅ Patient registered successfully!");
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clinic Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {currentStaff?.full_name || "User"} (
            {currentStaff?.role || "N/A"})
          </p>
        </div>

        <button
          onClick={() => setShowPatientForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> Register New Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <FaUsers className="text-blue-500 text-2xl" />
            <div>
              <h3 className="text-2xl font-bold">{patients.length}</h3>
              <p className="text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <FaUserMd className="text-green-500 text-2xl" />
            <div>
              <h3 className="text-2xl font-bold">{staff.length}</h3>
              <p className="text-gray-600">Staff Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <FaClipboardList className="text-purple-500 text-2xl" />
            <div>
              <h3 className="text-2xl font-bold">{services.length}</h3>
              <p className="text-gray-600">Services</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <FaCalendarAlt className="text-orange-500 text-2xl" />
            <div>
              <h3 className="text-2xl font-bold">
                {patients.filter((p) => p.status === "waiting").length}
              </h3>
              <p className="text-gray-600">In Queue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Patients</h2>

        {patients.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No patients registered yet. Click "Register New Patient" to add your
            first patient.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Queue #</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Phone</th>
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {patients
                  .slice(-10)
                  .reverse()
                  .map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{patient.queue_number}</td>
                      <td className="py-2">{patient.full_name}</td>
                      <td className="py-2">{patient.phone_number}</td>
                      <td className="py-2">
                        {patient.service_ref?.split("/")[1] || "N/A"}
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            patient.status === "waiting"
                              ? "bg-yellow-100 text-yellow-800"
                              : patient.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            patient.priority_flag === "high"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {patient.priority_flag}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Registration Modal */}
      {showPatientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Register New Patient</h2>
              <button
                onClick={() => setShowPatientForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={patientForm.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={patientForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={patientForm.phone_number}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={patientForm.date_of_birth}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={patientForm.address}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter complete address"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Service *
                </label>
                <select
                  name="service_ref"
                  value={patientForm.service_ref}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={`services/${service.id}`}>
                      {service.service_name} ({service.duration_minutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  name="priority_flag"
                  value={patientForm.priority_flag}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaSave />
                  {isLoading ? "Registering..." : "Register Patient"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPatientForm(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
