import React, { useState, useEffect } from "react";
import {
  FaDatabase,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlay,
  FaUsers,
  FaCalendar,
  FaFileAlt,
  FaCog,
  FaDownload,
  FaUpload,
} from "react-icons/fa";
import dataService from "../../shared/services/dataService";

const DataManagementPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTab, setSelectedTab] = useState("create");
  const [viewData, setViewData] = useState(null);
  const [formData, setFormData] = useState({
    path: "",
    id: "",
    data: "",
  });

  const addResult = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setResults((prev) => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // ===========================================
  // SAMPLE DATA CREATION FUNCTIONS
  // ===========================================

  const createAllSampleData = async () => {
    setIsLoading(true);
    try {
      const result = await dataService.createAllSampleData();

      addResult(
        `✅ All sample data created successfully!
    - Services: ${result.services.length}
    - Staff: ${result.staff.length}
    - Patients: ${result.patients.length}
    - Appointments: ${result.appointments.length}
    - Audit Logs: ${result.auditLogs.length}
    - Forms: ${result.forms.length}`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create sample data: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createSampleServices = async () => {
    setIsLoading(true);
    try {
      const serviceIds = await dataService.createSampleServices();
      addResult(
        `✅ Sample services created successfully! (${serviceIds.length} services)`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create services: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createSampleStaff = async () => {
    setIsLoading(true);
    try {
      const staffIds = await dataService.createSampleStaff();
      addResult(
        `✅ Sample staff created successfully! (${staffIds.length} staff members)`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create staff: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createSamplePatients = async () => {
    setIsLoading(true);
    try {
      // Need services first for references
      const services = await dataService.getAllData("services");
      if (services.length === 0) {
        addResult("⚠️ Creating services first...", "info");
        await dataService.createSampleServices();
      }

      const serviceIds =
        services.length > 0
          ? services.map((s) => s.id)
          : await dataService.createSampleServices();
      const patientIds = await dataService.createSamplePatients(serviceIds);
      addResult(
        `✅ Sample patients created successfully! (${patientIds.length} patients)`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create patients: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createSampleAppointments = async () => {
    setIsLoading(true);
    try {
      // Need patients, services, and staff first
      const [patients, services, staff] = await Promise.all([
        dataService.getAllData("patients"),
        dataService.getAllData("services"),
        dataService.getAllData("staff"),
      ]);

      if (
        patients.length === 0 ||
        services.length === 0 ||
        staff.length === 0
      ) {
        addResult(
          "⚠️ Missing required data. Creating dependencies first...",
          "info"
        );
        return;
      }

      const appointmentIds = await dataService.createSampleAppointments(
        patients.map((p) => p.id),
        services.map((s) => s.id),
        staff.map((s) => s.id)
      );
      addResult(
        `✅ Sample appointments created successfully! (${appointmentIds.length} appointments)`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create appointments: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createSampleAuditLogs = async () => {
    setIsLoading(true);
    try {
      const [staff, patients] = await Promise.all([
        dataService.getAllData("staff"),
        dataService.getAllData("patients"),
      ]);

      if (staff.length === 0 || patients.length === 0) {
        addResult(
          "⚠️ Missing required data. Create staff and patients first.",
          "info"
        );
        return;
      }

      const logIds = await dataService.createSampleAuditLogs(
        staff.map((s) => s.id),
        patients.map((p) => p.id)
      );
      addResult(
        `✅ Sample audit logs created successfully! (${logIds.length} logs)`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create audit logs: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createSampleForms = async () => {
    setIsLoading(true);
    try {
      const patients = await dataService.getAllData("patients");

      if (patients.length === 0) {
        addResult("⚠️ Missing required data. Create patients first.", "info");
        return;
      }

      const formIds = await dataService.createSampleFillUpForms(
        patients.map((p) => p.id)
      );
      addResult(
        `✅ Sample fill-up forms created successfully! (${formIds.length} forms)`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create forms: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  // ===========================================
  // DATA VIEWING FUNCTIONS
  // ===========================================

  const viewAllServices = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllData("services");
      setViewData({ type: "services", data });
      addResult(`✅ Retrieved ${data.length} services`, "success");
    } catch (error) {
      addResult(`❌ Failed to get services: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const viewAllStaff = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllData("staff");
      setViewData({ type: "staff", data });
      addResult(`✅ Retrieved ${data.length} staff members`, "success");
    } catch (error) {
      addResult(`❌ Failed to get staff: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const viewAllPatients = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllData("patients");
      setViewData({ type: "patients", data });
      addResult(`✅ Retrieved ${data.length} patients`, "success");
    } catch (error) {
      addResult(`❌ Failed to get patients: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const viewAllAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllData("appointments");
      setViewData({ type: "appointments", data });
      addResult(`✅ Retrieved ${data.length} appointments`, "success");
    } catch (error) {
      addResult(`❌ Failed to get appointments: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const viewAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllData("audit_logs");
      setViewData({ type: "audit_logs", data });
      addResult(`✅ Retrieved ${data.length} audit logs`, "success");
    } catch (error) {
      addResult(`❌ Failed to get audit logs: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const viewFillUpForms = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAllData("fill_up_forms");
      setViewData({ type: "fill_up_forms", data });
      addResult(`✅ Retrieved ${data.length} fill-up forms`, "success");
    } catch (error) {
      addResult(`❌ Failed to get fill-up forms: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  // ===========================================
  // CUSTOM DATA OPERATIONS
  // ===========================================

  const createCustomData = async () => {
    if (!formData.path || !formData.data) {
      addResult("❌ Please fill in path and data", "error");
      return;
    }

    setIsLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(formData.data);
      } catch (e) {
        throw new Error("Invalid JSON format in data field");
      }

      let result;
      if (formData.id) {
        result = await dataService.addDataWithId(
          formData.path,
          formData.id,
          parsedData
        );
      } else {
        result = await dataService.addDataWithAutoId(formData.path, parsedData);
      }

      addResult(
        `✅ Data created at ${formData.path}${
          formData.id ? "/" + formData.id : ""
        }`,
        "success"
      );
    } catch (error) {
      addResult(`❌ Failed to create data: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const readCustomData = async () => {
    if (!formData.path) {
      addResult("❌ Please fill in path", "error");
      return;
    }

    setIsLoading(true);
    try {
      const data = await dataService.getData(formData.path);
      if (data) {
        setViewData({ type: "custom", data, path: formData.path });
        addResult(`✅ Data retrieved from ${formData.path}`, "success");
      } else {
        addResult(`ℹ️ No data found at ${formData.path}`, "info");
      }
    } catch (error) {
      addResult(`❌ Failed to read data: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  const testDataService = async () => {
    setIsLoading(true);
    try {
      await dataService.testDataOperations();
      addResult("✅ Data service test completed successfully!", "success");
    } catch (error) {
      addResult(`❌ Data service test failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const clearAllData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear ALL data? This cannot be undone!"
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await dataService.clearAllData();
      setViewData(null);
      addResult("🗑️ All data cleared successfully!", "success");
    } catch (error) {
      addResult(`❌ Failed to clear data: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createAdminAccount = async () => {
    setIsLoading(true);
    try {
      const authService = (await import("../../shared/services/authService"))
        .default;

      await authService.createAdminStaff();
      addResult(
        "✅ Admin staff created! Email: admin@clinic.com, Password: AdminPass123!",
        "success"
      );
    } catch (error) {
      if (error.message.includes("already exists")) {
        addResult(
          "ℹ️ Admin staff already exists. You can use it to login.",
          "info"
        );
      } else {
        addResult(`❌ Failed to create admin staff: ${error.message}`, "error");
      }
    }
    setIsLoading(false);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "📝";
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      case "info":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FaDatabase className="text-3xl text-primary" />
            <h1 className="text-3xl font-yeseva text-primary">
              Firebase Data Management
            </h1>
          </div>
          <p className="text-gray-600 font-worksans">
            Create, read, update, and delete data in your Firebase Realtime
            Database
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: "create", label: "Create Sample Data", icon: FaPlus },
              { id: "view", label: "View Data", icon: FaEye },
              { id: "custom", label: "Custom Operations", icon: FaEdit },
              { id: "tools", label: "Tools", icon: FaCog },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="border-t pt-4">
            {/* Create Sample Data Tab */}
            {selectedTab === "create" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={createAllSampleData}
                  disabled={isLoading}
                  className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2 col-span-full"
                >
                  <FaDatabase className="w-6 h-6" />
                  <span className="font-medium">🚀 Create ALL Sample Data</span>
                  <span className="text-xs opacity-75">
                    Services, Staff, Patients, Appointments, Audit Logs & Forms
                  </span>
                </button>

                <button
                  onClick={createSampleServices}
                  disabled={isLoading}
                  className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaCog className="w-6 h-6" />
                  <span className="font-medium">Services</span>
                  <span className="text-xs opacity-75">
                    General, Pediatric, Vaccination, Lab, Emergency
                  </span>
                </button>

                <button
                  onClick={createSampleStaff}
                  disabled={isLoading}
                  className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaUsers className="w-6 h-6" />
                  <span className="font-medium">Staff</span>
                  <span className="text-xs opacity-75">
                    Admin, Doctor, Nurse, Receptionist
                  </span>
                </button>

                <button
                  onClick={createSamplePatients}
                  disabled={isLoading}
                  className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaUsers className="w-6 h-6" />
                  <span className="font-medium">Patients</span>
                  <span className="text-xs opacity-75">
                    Juan Santos, Maria Gonzales, Roberto Chen
                  </span>
                </button>

                <button
                  onClick={createSampleAppointments}
                  disabled={isLoading}
                  className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaCalendar className="w-6 h-6" />
                  <span className="font-medium">Appointments</span>
                  <span className="text-xs opacity-75">
                    Scheduled, Confirmed, Completed
                  </span>
                </button>

                <button
                  onClick={createSampleAuditLogs}
                  disabled={isLoading}
                  className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaFileAlt className="w-6 h-6" />
                  <span className="font-medium">Audit Logs</span>
                  <span className="text-xs opacity-75">
                    User actions and system events
                  </span>
                </button>

                <button
                  onClick={createSampleForms}
                  disabled={isLoading}
                  className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaFileAlt className="w-6 h-6" />
                  <span className="font-medium">Fill-up Forms</span>
                  <span className="text-xs opacity-75">
                    Patient registration forms
                  </span>
                </button>
              </div>
            )}

            {/* View Data Tab */}
            {selectedTab === "view" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={viewAllServices}
                  disabled={isLoading}
                  className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaCog className="w-6 h-6" />
                  <span className="font-medium">View Services</span>
                </button>

                <button
                  onClick={viewAllStaff}
                  disabled={isLoading}
                  className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaUsers className="w-6 h-6" />
                  <span className="font-medium">View Staff</span>
                </button>

                <button
                  onClick={viewAllPatients}
                  disabled={isLoading}
                  className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaUsers className="w-6 h-6" />
                  <span className="font-medium">View Patients</span>
                </button>

                <button
                  onClick={viewAllAppointments}
                  disabled={isLoading}
                  className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaCalendar className="w-6 h-6" />
                  <span className="font-medium">View Appointments</span>
                </button>

                <button
                  onClick={viewAuditLogs}
                  disabled={isLoading}
                  className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaFileAlt className="w-6 h-6" />
                  <span className="font-medium">View Audit Logs</span>
                </button>

                <button
                  onClick={viewFillUpForms}
                  disabled={isLoading}
                  className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaFileAlt className="w-6 h-6" />
                  <span className="font-medium">View Fill-up Forms</span>
                </button>
              </div>
            )}

            {/* Custom Operations Tab */}
            {selectedTab === "custom" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Database Path
                    </label>
                    <input
                      type="text"
                      value={formData.path}
                      onChange={(e) =>
                        setFormData({ ...formData, path: e.target.value })
                      }
                      placeholder="e.g., patients or appointments/abc123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID (Optional for Create)
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      placeholder="Leave empty for auto-generated ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data (JSON Format)
                  </label>
                  <textarea
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                    placeholder='{"name": "John Doe", "email": "john@example.com", "age": 30}'
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={createCustomData}
                    disabled={isLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    Create Data
                  </button>
                  <button
                    onClick={readCustomData}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Read Data
                  </button>
                </div>
              </div>
            )}

            {/* Tools Tab */}
            {selectedTab === "tools" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={testDataService}
                  disabled={isLoading}
                  className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaPlay className="w-6 h-6" />
                  <span className="font-medium">Test Data Service</span>
                  <span className="text-xs opacity-75">
                    Run CRUD operation tests
                  </span>
                </button>

                <button
                  onClick={clearAllData}
                  disabled={isLoading}
                  className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaTrash className="w-6 h-6" />
                  <span className="font-medium">Clear All Data</span>
                  <span className="text-xs opacity-75">
                    ⚠️ This cannot be undone!
                  </span>
                </button>

                <button
                  onClick={clearResults}
                  disabled={isLoading}
                  className="bg-gray-500 text-white p-4 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
                >
                  <FaDownload className="w-6 h-6" />
                  <span className="font-medium">Clear Results</span>
                  <span className="text-xs opacity-75">
                    Clear the results log
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Data View Section */}
        {viewData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-yeseva text-primary mb-4">
              Data View: {viewData.type.replace("_", " ").toUpperCase()}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(viewData.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-yeseva text-primary">Results</h3>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No operations performed yet. Use the buttons above to start!
              </p>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-3 ${getResultColor(result.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {getResultIcon(result.type)}
                    </span>
                    <div className="flex-1">
                      <p className="font-worksans text-sm">{result.message}</p>
                      <p className="text-xs text-gray-500">
                        {result.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;
