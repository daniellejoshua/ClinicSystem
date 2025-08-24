import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaUser,
  FaShieldAlt,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import authService from "../../shared/services/authService";

const FirebaseTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        addTestResult(`User signed in: ${currentUser.email}`, "success");
      } else {
        addTestResult("User signed out", "info");
      }
    });

    return () => unsubscribe();
  }, []);

  const addTestResult = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await authService.testConnection();
      if (result.success) {
        addTestResult("✅ Firebase connection successful!", "success");
      } else {
        addTestResult(
          `❌ Firebase connection failed: ${result.error}`,
          "error"
        );
      }
    } catch (error) {
      addTestResult(`❌ Connection test failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createTestAdmin = async () => {
    setIsLoading(true);
    try {
      await authService.createAdmin("admin@clinic.com", "AdminPass123!", {
        name: "Test Admin",
        department: "Administration",
      });
      addTestResult("✅ Test admin created successfully!", "success");
    } catch (error) {
      addTestResult(`❌ Admin creation failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const createTestClient = async () => {
    setIsLoading(true);
    try {
      await authService.clientRegister(
        "patient@example.com",
        "PatientPass123!",
        {
          name: "John Doe",
          phone: "+63912345678",
        }
      );
      addTestResult("✅ Test client created successfully!", "success");
    } catch (error) {
      addTestResult(`❌ Client creation failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const testAdminLogin = async () => {
    setIsLoading(true);
    try {
      await authService.adminLogin("admin@clinic.com", "AdminPass123!");
      addTestResult("✅ Admin login successful!", "success");
    } catch (error) {
      addTestResult(`❌ Admin login failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const testClientLogin = async () => {
    setIsLoading(true);
    try {
      await authService.clientLogin("patient@example.com", "PatientPass123!");
      addTestResult("✅ Client login successful!", "success");
    } catch (error) {
      addTestResult(`❌ Client login failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const testLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      addTestResult("✅ Logout successful!", "success");
    } catch (error) {
      addTestResult(`❌ Logout failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const runCustomTest = async (type) => {
    if (!formData.email || !formData.password) {
      addTestResult("❌ Please fill in email and password", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (type === "admin-login") {
        await authService.adminLogin(formData.email, formData.password);
        addTestResult(
          `✅ Admin login successful for ${formData.email}`,
          "success"
        );
      } else if (type === "client-login") {
        await authService.clientLogin(formData.email, formData.password);
        addTestResult(
          `✅ Client login successful for ${formData.email}`,
          "success"
        );
      } else if (type === "create-admin") {
        await authService.createAdmin(formData.email, formData.password, {
          name: formData.name || "New Admin",
        });
        addTestResult(`✅ Admin created for ${formData.email}`, "success");
      } else if (type === "create-client") {
        await authService.clientRegister(formData.email, formData.password, {
          name: formData.name || "New Client",
        });
        addTestResult(`✅ Client created for ${formData.email}`, "success");
      }
    } catch (error) {
      addTestResult(`❌ ${type} failed: ${error.message}`, "error");
    }
    setIsLoading(false);
  };

  const getResultIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheck className="text-green-500" />;
      case "error":
        return <FaTimes className="text-red-500" />;
      default:
        return <FaPlay className="text-blue-500" />;
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50";
      case "error":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-yeseva text-primary mb-2">
            🔥 Firebase Authentication Test Center
          </h1>
          <p className="text-gray-600 font-worksans mb-4">
            Test Firebase authentication functions for your clinic system
          </p>

          {/* Current User Status */}
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <FaUser className="text-green-600" />
                <span className="font-worksans font-medium text-green-800">
                  Signed in as: {user.email}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Tests */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-yeseva text-primary mb-4">
              Quick Tests
            </h2>

            <div className="space-y-3">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Test Firebase Connection
              </button>

              <button
                onClick={createTestAdmin}
                disabled={isLoading}
                className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                Create Test Admin (admin@clinic.com)
              </button>

              <button
                onClick={createTestClient}
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Create Test Client (patient@example.com)
              </button>

              <button
                onClick={testAdminLogin}
                disabled={isLoading}
                className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                Test Admin Login
              </button>

              <button
                onClick={testClientLogin}
                disabled={isLoading}
                className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                Test Client Login
              </button>

              <button
                onClick={testLogout}
                disabled={isLoading}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Test Logout
              </button>
            </div>
          </div>

          {/* Custom Tests */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-yeseva text-primary mb-4">
              Custom Tests
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-worksans font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="test@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-worksans font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="password123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-worksans font-medium text-gray-700 mb-1">
                  Name (for registration)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runCustomTest("create-admin")}
                  disabled={isLoading}
                  className="bg-purple-500 text-white py-2 px-3 rounded text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  Create Admin
                </button>
                <button
                  onClick={() => runCustomTest("create-client")}
                  disabled={isLoading}
                  className="bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  Create Client
                </button>
                <button
                  onClick={() => runCustomTest("admin-login")}
                  disabled={isLoading}
                  className="bg-indigo-500 text-white py-2 px-3 rounded text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  Admin Login
                </button>
                <button
                  onClick={() => runCustomTest("client-login")}
                  disabled={isLoading}
                  className="bg-teal-500 text-white py-2 px-3 rounded text-sm hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  Client Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-yeseva text-primary">Test Results</h2>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No tests run yet. Click a button above to start testing!
              </p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-3 ${getResultColor(result.type)}`}
                >
                  <div className="flex items-start gap-2">
                    {getResultIcon(result.type)}
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

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-yeseva text-yellow-800 mb-3">
            📋 Testing Instructions
          </h3>
          <div className="space-y-2 text-sm font-worksans text-yellow-700">
            <p>
              <strong>1. Test Connection:</strong> First, test if Firebase is
              properly connected.
            </p>
            <p>
              <strong>2. Create Test Accounts:</strong> Create admin and client
              test accounts.
            </p>
            <p>
              <strong>3. Test Login:</strong> Try logging in with the created
              accounts.
            </p>
            <p>
              <strong>4. Test Custom:</strong> Use the custom form to test with
              your own credentials.
            </p>
            <p>
              <strong>5. Check Console:</strong> Open browser DevTools → Console
              for detailed logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTestPage;
