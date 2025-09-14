import React, { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheck,
  FaSpinner,
  FaShieldAlt,
} from "react-icons/fa";
import dataService from "../../shared/services/dataService";
import authService from "../../shared/services/authService";
import emailjs from "emailjs-com";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../../shared/config/firebase";
import { ref, push } from "firebase/database";

const AddStaff = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    pin: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: form, 2: pin verification, 3: success
  const [showPinModal, setShowPinModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Auto-reset form after successful staff addition
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setStep(1);
        setMessage("");
        setError("");
        setForm({
          full_name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "admin",
          pin: "",
        });
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Send PIN to admin's email for verification
  const sendPinToEmail = async (e) => {
    if (e) {
      e.preventDefault();
    }
    console.log("sendPinToEmail called");
    setIsLoading(true);
    setError("");

    try {
      // Validate form before sending PIN
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      if (form.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // Check if email already exists
      const allStaff = await dataService.getAllData("staff");
      const emailExists = allStaff.find((staff) => staff.email === form.email);
      if (emailExists) {
        setError("Email already exists. Please use a different email.");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // Generate a random 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedPin(pin);
      console.log("Generated PIN:", pin);

      // Get current admin info
      const currentAdmin = authService.getCurrentStaff();
      console.log("Current admin:", currentAdmin);

      // Send PIN via EmailJS to the admin (not the new staff)
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        "template_ivtnhod",
        {
          to_email: currentAdmin.email,
          to_name: currentAdmin.full_name,
          pin,
          message: `PIN verification to add new staff: ${form.full_name} (${form.email})`,
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      );

      console.log("PIN sent successfully, showing modal");
      setStep(2);
      setShowPinModal(true);
    } catch (err) {
      console.error("Error sending PIN:", err);
      setError("Failed to send PIN. Please try again.");
      setShowErrorModal(true);
    }
    setIsLoading(false);
  };

  // Verify PIN and add staff to database
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check PIN
    if (form.pin !== generatedPin) {
      setError("Invalid PIN. Please check your email and try again.");
      setShowErrorModal(true);
      setIsLoading(false);
      return;
    }

    try {
      // Add staff to both Firebase Auth and database after PIN verification
      const { confirmPassword, pin, ...staffData } = form;

      // Create Firebase Auth account and database record
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        staffData.password
      );
      const user = userCredential.user;

      // Add staff to database with Firebase UID
      const staffRef = ref(database, "staff");
      const newStaffRef = await push(staffRef, {
        email: staffData.email,
        full_name: staffData.full_name,
        role: staffData.role,
        created_at: new Date().toISOString(),
        uid: user.uid,
      });

      // Log the action
      const currentAdmin = authService.getCurrentStaff();
      await dataService.addDataWithAutoId("audit_logs", {
        user_ref: `staff/${currentAdmin.id}`,
        staff_full_name: currentAdmin.full_name,
        action: `Added new ${staffData.role}: ${staffData.full_name} (${staffData.email})`,
        ip_address: "192.168.1.100",
        timestamp: new Date().toISOString(),
      });

      setMessage(`✅ Staff added successfully! ID: ${newStaffRef.key}`);
      setStep(3);
      setShowPinModal(false);

      // Reset form
      setForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
        pin: "",
      });
    } catch (error) {
      setError("❌ Error adding staff: " + error.message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-8 mb-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-blue-200 dark:border-gray-800 relative">
      {/* Admin Only Badge */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
          <FaShieldAlt className="h-4 w-4" />
          Admin Only
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-gray-800 p-4 rounded-full mb-2 shadow">
          <FaUser className="h-10 w-10 text-blue-600 dark:text-blue-300" />
        </div>
        <h2 className="text-3xl font-bold text-blue-800 dark:text-white text-center">
          Add New Staff
        </h2>
        <p className="text-blue-600 dark:text-gray-300 text-center mt-2">
          Register a new staff member for your clinic system.
        </p>
      </div>
      <div className="border-b border-blue-200 mb-6" />
      <div className="border-b border-blue-200 dark:border-gray-700 mb-6" />

      {/* Step 1: Staff Details Form */}
      {step === 1 && (
        <form onSubmit={sendPinToEmail} className="space-y-6">
          <div className="relative">
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              Full Name
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-blue-400 dark:text-blue-300">
                <FaUser className="h-5 w-5" />
              </span>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg bg-white dark:bg-gray-900 dark:text-white shadow-sm"
                placeholder="Full Name"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-blue-400 dark:text-blue-300">
                <FaEnvelope className="h-5 w-5" />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg bg-white dark:bg-gray-900 dark:text-white shadow-sm"
                placeholder="Email"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-blue-400 dark:text-blue-300">
                <FaLock className="h-5 w-5" />
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg bg-white dark:bg-gray-900 dark:text-white shadow-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-blue-400 dark:text-blue-300">
                <FaLock className="h-5 w-5" />
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg bg-white dark:bg-gray-900 dark:text-white shadow-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-blue-300 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-blue-700 dark:text-gray-300 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 dark:from-gray-700 dark:to-gray-900 text-white py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin h-5 w-5 text-white" />
                Sending PIN...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaCheck className="h-5 w-5" />
                Send Verification PIN
              </span>
            )}
          </button>
        </form>
      )}

      {/* Success Message */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-full p-4 mb-4 mx-auto w-max">
            <FaCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
            Staff Added Successfully!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowPinModal(false)}
          />
          <form
            onSubmit={handleVerifyPin}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-500 dark:border-gray-700 z-10 flex flex-col items-center"
          >
            <h2 className="text-xl font-bold text-blue-700 dark:text-white mb-4">
              Enter PIN to Confirm
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm">
              A 6-digit PIN has been sent to your email for security
              verification.
            </p>
            <input
              type="text"
              name="pin"
              value={form.pin}
              onChange={handleChange}
              required
              maxLength={6}
              className="w-full border border-blue-300 dark:border-gray-700 rounded-lg px-4 py-3 mb-4 bg-white dark:bg-gray-900 dark:text-white shadow-sm text-center text-lg font-mono"
              placeholder="Enter 6-digit PIN"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin h-5 w-5 text-white" />
                  Adding Staff...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaCheck className="h-5 w-5" />
                  Confirm & Add Staff
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPinModal(false)}
              className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowErrorModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-red-500 dark:border-red-700 z-10 flex flex-col items-center">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">
              Error
            </h2>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
              {error}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-lg shadow-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStaff;
