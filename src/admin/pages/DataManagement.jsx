import React, { useState } from "react";
import {
  FaPlus,
  FaDatabase,
  FaUser,
  FaCalendar,
  FaFileAlt,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import dataService from "../../shared/services/dataService";
import customDataService from "../../shared/services/customDataService";
import authService from "../../shared/services/authService";
import { ref, remove } from "firebase/database";
import { database } from "../../shared/config/firebase";

const DataManagement = () => {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      // First create the auth account
      const adminUser = await authService.createAdmin(
        "admin@clinic.com",
        "AdminPass123!",
        {
          name: "Super Admin",
          role: "admin",
          department: "Administration",
        }
      );

      setResult("✅ Admin account created successfully! You can now login.");
    } catch (error) {
      if (error.message.includes("already-in-use")) {
        setResult("ℹ️ Admin account already exists. You can use it to login.");
      } else {
        setResult(`❌ Error creating admin: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    try {
      const result = await customDataService.createSampleDataWithCustomSchema();

      setResult(`✅ Custom Database Schema Created Successfully!
      
📊 Your Custom Clinic Database Structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔹 patients (Collection) - ${result.collections.patients} records
   └── Patient info, queue management, service references
   
🔹 staff (Collection) - ${result.collections.staff} records  
   └── Admin, doctors, nurses with roles and credentials
   
🔹 services (Collection) - ${result.collections.services} records
   └── Available clinic services with duration
   
🔹 appointments (Collection) - ${result.collections.appointments} records
   └── Linked patient, service, and staff references
   
🔹 audit_logs (Collection) - ${result.collections.audit_logs} records
   └── Activity tracking with user references
   
🔹 fill_up_forms (Collection) - ${result.collections.fill_up_forms} records
   └── Patient intake forms with detailed info

🔑 Admin Login Credentials:
📧 Email: ${result.admin_credentials.email}
🔒 Password: ${result.admin_credentials.password}

🎯 Your database now follows your exact schema design!
✅ All references properly linked between collections
🔗 Ready for your clinic management system!`);
    } catch (error) {
      setResult(`❌ Error creating custom sample data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      await dataService.setData("test/connection", {
        message: "Connection test successful!",
        timestamp: new Date().toISOString(),
      });
      setResult("✅ Firebase connection test successful!");
    } catch (error) {
      setResult(`❌ Firebase connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEntireDatabase = async () => {
    if (
      !window.confirm(
        "⚠️ Are you ABSOLUTELY sure you want to delete ALL data from your Firebase database? This action CANNOT be undone!"
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        "🔥 This will permanently delete EVERYTHING in your database. Type 'DELETE' in the next prompt to confirm."
      )
    ) {
      return;
    }

    const confirmText = prompt(
      "Type 'DELETE' to confirm you want to permanently delete all database data:"
    );
    if (confirmText !== "DELETE") {
      setResult("❌ Database reset cancelled - confirmation text didn't match");
      return;
    }

    setIsLoading(true);
    setResult("🔄 Clearing database...");

    try {
      // First ensure user is authenticated
      const user = await authService.getCurrentUser();
      if (!user) {
        setResult(
          "❌ Must be authenticated to clear database. Please login first."
        );
        return;
      }

      // Clear the entire database by removing the root reference
      const rootRef = ref(database);
      await remove(rootRef);
      setResult("✅ Database completely cleared! All data has been deleted.");
    } catch (error) {
      console.error("Error clearing database:", error);
      if (error.code === "PERMISSION_DENIED") {
        setResult(`❌ Permission denied. Please update Firebase rules temporarily:
        
🔧 Steps to fix:
1. Go to: https://console.firebase.google.com/project/clinicsystem-a7c34/database/clinicsystem-a7c34-default-rtdb/rules
2. Set rules to: {"rules": {".read": true, ".write": true}}
3. Click "Publish"
4. Try clearing again
5. Change rules back to secure settings after

Or use the Firebase Console link below to manually delete data.`);
      } else {
        setResult(`❌ Error clearing database: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearSpecificCollections = async () => {
    if (
      !window.confirm("Are you sure you want to delete specific collections?")
    ) {
      return;
    }

    setIsLoading(true);
    setResult("🔄 Clearing specific collections...");

    try {
      // First ensure user is authenticated
      const user = await authService.getCurrentUser();
      if (!user) {
        setResult(
          "❌ Must be authenticated to clear database. Please login first."
        );
        return;
      }

      // List of collections to clear
      const collections = [
        "appointments",
        "audit_logs",
        "fill_up_forms",
        "patients",
        "services",
        "staff",
        "queue",
        "medical_records",
        "clinic",
      ];

      // Clear each collection
      for (const collection of collections) {
        const collectionRef = ref(database, collection);
        await remove(collectionRef);
      }

      setResult(
        `✅ Successfully cleared ${
          collections.length
        } collections: ${collections.join(", ")}`
      );
    } catch (error) {
      console.error("Error clearing collections:", error);
      if (error.code === "PERMISSION_DENIED") {
        setResult(`❌ Permission denied. Please update Firebase rules temporarily:
        
🔧 Steps to fix:
1. Go to: https://console.firebase.google.com/project/clinicsystem-a7c34/database/clinicsystem-a7c34-default-rtdb/rules
2. Set rules to: {"rules": {".read": true, ".write": true}}
3. Click "Publish"
4. Try clearing again
5. Change rules back to secure settings after

Or use the Firebase Console link below to manually delete data.`);
      } else {
        setResult(`❌ Error clearing collections: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick staff creation for testing
  const handleCreateTestStaff = async () => {
    setIsLoading(true);
    try {
      // Create a simple staff member that can login
      const staffData = {
        full_name: "Test Admin",
        email: "admin@clinic.com",
        password: "admin123",
        role: "admin",
      };

      await customDataService.addDataWithAutoId("staff", staffData);
      setResult(
        "✅ Test admin staff created! Login with admin@clinic.com / admin123"
      );
    } catch (error) {
      setResult("❌ Error creating staff: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-yeseva text-primary mb-6 flex items-center gap-3">
            <FaDatabase />
            Custom Database Management
          </h1>

          {/* Auth Status */}
          <div
            className={`p-4 rounded-lg mb-6 ${
              isAuthenticated
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <p className="font-worksans">
              Auth Status:{" "}
              {isAuthenticated ? "✅ Authenticated" : "⚠️ Not Authenticated"}
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-gray-600 mt-2">
                Some operations may require authentication.
                <a
                  href="/firebase-test"
                  className="text-primary hover:underline ml-1"
                >
                  Login here
                </a>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleCreateTestStaff}
              disabled={isLoading}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FaUser className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans font-bold">
                1. Create Test Staff
              </div>
              <div className="text-xs opacity-75">
                admin@clinic.com / admin123
              </div>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FaDatabase className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">2. Test Connection</div>
            </button>

            <button
              onClick={handleCreateSampleData}
              disabled={isLoading}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <FaPlus className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">
                3. Create Custom Schema
              </div>
            </button>

            <a
              href="/admin/login"
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              <FaUser className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">4. Login to Admin</div>
            </a>
          </div>

          {/* Quick Staff Creation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <FaUser />
              Staff Account Setup
            </h2>
            <p className="text-yellow-700 mb-4">
              Quickly create a test staff account for login and role testing.
            </p>
            <button
              onClick={handleCreateTestStaff}
              disabled={isLoading}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
            >
              {isLoading ? "Creating..." : "👷‍♂️ Create Test Staff"}
            </button>
          </div>

          {/* Database Reset Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <FaExclamationTriangle />
              🚨 DANGER ZONE - Database Reset
            </h2>
            <p className="text-red-700 mb-4">
              These actions will permanently delete data from your Firebase
              database. <strong>This cannot be undone!</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clear Specific Collections */}
              <div className="bg-white rounded-lg border-2 border-orange-200 p-4">
                <h3 className="text-lg font-bold text-orange-600 mb-2 flex items-center gap-2">
                  <FaTrash />
                  Clear Clinic Collections
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Delete only clinic-related data (appointments, patients,
                  staff, etc.) while preserving other data.
                </p>
                <button
                  onClick={clearSpecificCollections}
                  disabled={isLoading}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
                >
                  {isLoading ? "Clearing..." : "Clear Clinic Data"}
                </button>
              </div>

              {/* Clear Entire Database */}
              <div className="bg-white rounded-lg border-2 border-red-200 p-4">
                <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                  <FaDatabase />
                  Clear Everything
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Delete EVERYTHING from your Firebase database. This will
                  remove all data from all collections.
                </p>
                <button
                  onClick={clearEntireDatabase}
                  disabled={isLoading}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                >
                  {isLoading ? "Clearing..." : "🔥 DELETE EVERYTHING"}
                </button>
              </div>
            </div>

            {/* Firebase Console Link */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-bold text-blue-800 mb-2">
                🌐 Manual Database Management:
              </p>
              <a
                href="https://console.firebase.google.com/project/clinicsystem-a7c34/database/clinicsystem-a7c34-default-rtdb/data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 text-sm"
              >
                🔗 Open Firebase Console
              </a>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
              <h3 className="font-worksans font-bold mb-2">Results:</h3>
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-worksans font-bold text-blue-800 mb-2">
              📋 Quick Setup Steps:
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>
                <strong>🔴 FIRST:</strong> Click "Create Admin First!" to set up
                admin@clinic.com account
              </li>
              <li>Click "Test Connection" to verify Firebase is working</li>
              <li>Click "Create Sample Data" to populate your database</li>
              <li>
                <strong>Now you can login at</strong>{" "}
                <a href="/admin/login" className="underline font-bold">
                  /admin/login
                </a>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-sm font-bold text-blue-800">
                🔑 Admin Login Credentials:
              </p>
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> admin@clinic.com
                <br />
                <strong>Password:</strong> AdminPass123!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
