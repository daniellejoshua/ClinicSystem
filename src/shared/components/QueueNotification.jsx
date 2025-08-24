import React, { useState } from "react";
import {
  FaPlus,
  FaDatabase,
  FaUser,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import customDataService from "../../shared/services/customDataService"; // Use custom service
import authService from "../../shared/services/authService";
import { ref, remove } from "firebase/database";
import { database } from "../../shared/config/firebase";

const DataManagement = () => {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    setResult("🔄 Creating admin account...");

    try {
      await authService.createAdmin("admin@clinic.com", "AdminPass123!", {
        name: "Super Admin",
        role: "admin",
        department: "Administration",
      });

      setResult(
        "✅ Admin account created successfully! You can now login with:\n📧 Email: admin@clinic.com\n🔑 Password: AdminPass123!"
      );
    } catch (error) {
      if (error.message.includes("already-in-use")) {
        setResult(
          "ℹ️ Admin account already exists. You can use it to login with:\n📧 Email: admin@clinic.com\n🔑 Password: AdminPass123!"
        );
      } else {
        setResult(`❌ Error creating admin: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    setResult("🔄 Creating your custom database schema...");

    try {
      const result = await customDataService.createSampleDataWithCustomSchema();

      setResult(`✅ Custom Database Schema Created Successfully!

📊 Your Database Structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏥 PATIENTS Collection
   - Full patient information with queue management
   - Service references and priority flags

👨‍⚕️ STAFF Collection
   - Admin, doctors, nurses, and receptionists
   - Role-based access with login credentials

🩺 SERVICES Collection
   - General consultation, pediatric care, vaccination, lab, emergency
   - Service duration and descriptions

📅 APPOINTMENTS Collection
   - Links patients, staff, and services
   - Appointment scheduling and status tracking

📋 FILL_UP_FORMS Collection
   - Patient intake forms and medical information
   - Registration details and contact info

📜 AUDIT_LOGS Collection
   - System activity tracking
   - User actions and timestamps

🎉 Ready to use! Login with admin@clinic.com / AdminPass123!`);
    } catch (error) {
      setResult(`❌ Error creating custom sample data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult("🔄 Testing Firebase connection...");

    try {
      await authService.testConnection();
      setResult(
        "✅ Firebase connection test successful! Your database is ready to use."
      );
    } catch (error) {
      setResult(`❌ Firebase connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEntireDatabase = async () => {
    if (
      !window.confirm(
        "⚠️ Are you ABSOLUTELY sure you want to delete ALL data? This CANNOT be undone!"
      )
    )
      return;

    const confirmText = prompt("Type 'DELETE' to confirm:");
    if (confirmText !== "DELETE") {
      setResult("❌ Database reset cancelled");
      return;
    }

    setIsLoading(true);
    setResult("🔄 Clearing entire database...");

    try {
      await customDataService.clearAllData();
      setResult("✅ Database completely cleared! All data has been deleted.");
    } catch (error) {
      if (error.code === "PERMISSION_DENIED") {
        setResult(
          `❌ Permission denied. Update Firebase rules temporarily:

🔧 Quick Fix:
1. Go to: https://console.firebase.google.com/project/clinicsystem-a7c34/database/clinicsystem-a7c34-default-rtdb/rules
2. Set rules to: {"rules": {".read": true, ".write": true}}
3. Click "Publish"
4. Try again
5. Change rules back after clearing`
        );
      } else {
        setResult(`❌ Error clearing database: ${error.message}`);
      }
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
            Custom Clinic Database Setup
          </h1>

          {/* Quick Setup Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleCreateAdmin}
              disabled={isLoading}
              className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <FaUser className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans font-bold">
                1. Create Admin
              </div>
              <div className="text-xs opacity-75">Required first step</div>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FaDatabase className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">2. Test Connection</div>
              <div className="text-xs opacity-75">Verify Firebase</div>
            </button>

            <button
              onClick={handleCreateSampleData}
              disabled={isLoading}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <FaPlus className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">3. Create Database</div>
              <div className="text-xs opacity-75">Your custom schema</div>
            </button>

            <a
              href="/admin/login"
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              <FaUser className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">4. Login to Admin</div>
              <div className="text-xs opacity-75">Start using system</div>
            </a>
          </div>

          {/* Database Reset Section */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <FaExclamationTriangle />
              🚨 DANGER ZONE - Database Reset
            </h2>
            <p className="text-red-700 mb-4">
              This will permanently delete ALL data from your Firebase database.{" "}
              <strong>This cannot be undone!</strong>
            </p>

            <button
              onClick={clearEntireDatabase}
              disabled={isLoading}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? "Clearing..." : "🔥 DELETE EVERYTHING"}
            </button>

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

          {/* Quick Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-worksans font-bold text-blue-800 mb-2">
              🚀 Quick Start:
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>
                <strong>Create Admin</strong> - Sets up admin@clinic.com account
              </li>
              <li>
                <strong>Test Connection</strong> - Verifies Firebase is working
              </li>
              <li>
                <strong>Create Database</strong> - Builds your custom clinic
                schema
              </li>
              <li>
                <strong>Login to Admin</strong> - Start managing your clinic!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
