import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCheck, FaSpinner } from "react-icons/fa";
import dataService from "../../shared/services/dataService";
import authService from "../../shared/services/authService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../../shared/config/firebase";
import { ref, push } from "firebase/database";
import InactivityModal from "../../components/ui/InactivityModal";

const INACTIVITY_LIMIT = 55 * 60 * 1000; // 55 minutes
const MODAL_COUNTDOWN = 5 * 60; // 5 minutes in seconds

const AddStaff = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Inactivity modal state
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [modalCountdown, setModalCountdown] = useState(MODAL_COUNTDOWN);
  const inactivityTimer = useRef(null);
  const countdownTimer = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Inactivity detection logic
  useEffect(() => {
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer.current);
      setShowInactivityModal(false);
      setModalCountdown(MODAL_COUNTDOWN);
      inactivityTimer.current = setTimeout(() => {
        setShowInactivityModal(true);
      }, INACTIVITY_LIMIT);
    };

    // User activity events
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start timer on mount
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  // Modal countdown logic
  useEffect(() => {
    if (showInactivityModal) {
      countdownTimer.current = setInterval(() => {
        setModalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownTimer.current);
      setModalCountdown(MODAL_COUNTDOWN);
    }
    return () => clearInterval(countdownTimer.current);
  }, [showInactivityModal]);

  const handleStayLoggedIn = () => {
    setShowInactivityModal(false);
    setModalCountdown(MODAL_COUNTDOWN);
    clearInterval(countdownTimer.current);
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setShowInactivityModal(true);
    }, INACTIVITY_LIMIT);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/admin/login";
  };

  const registerStaff = async (staffData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        staffData.email,
        staffData.password
      );
      const user = userCredential.user;

      const staffRef = ref(database, "staff");
      await push(staffRef, {
        email: staffData.email,
        full_name: staffData.full_name,
        role: staffData.role,
        created_at: new Date().toISOString(),
        uid: user.uid,
      });

      alert("Staff registered successfully!");
    } catch (error) {
      alert("Error registering staff: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const { confirmPassword, ...staffData } = form;
      const result = await dataService.addDataWithAutoId("staff", staffData);
      setMessage(`✅ Staff added! ID: ${result.id}`);
      registerStaff(staffData);
      setForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
      });
    } catch (error) {
      setError("❌ Error adding staff: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mt-8 mb-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-blue-200 dark:border-gray-800 relative">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-blue-100 dark:bg-gray-800 p-4 rounded-full mb-2 shadow">
          <FaUser className="h-10 w-10 text-blue-600 dark:text-blue-300" />
        </div>
        <h2 className="text-3xl font-bold text-blue-800 dark:text-white text-center">
          Add New Admin
        </h2>
        <p className="text-blue-600 dark:text-gray-300 text-center mt-2">
          Register a new admin staff member for your clinic system.
        </p>
      </div>
      <div className="border-b border-blue-200 mb-6" />
      <div className="border-b border-blue-200 dark:border-gray-700 mb-6" />
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <input
            type="text"
            name="role"
            value={form.role}
            disabled
            className="w-full border border-blue-300 dark:border-gray-700 rounded-lg px-4 py-3 bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-gray-300 font-bold text-lg cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 dark:from-gray-700 dark:to-gray-900 text-white py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin h-5 w-5 text-white" />
              Adding...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FaCheck className="h-5 w-5" />
              Add Admin
            </span>
          )}
        </button>
        {error && (
          <div className="mt-4 text-center text-red-600 dark:text-red-400 font-semibold">
            {error}
          </div>
        )}
        {message && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
              onClick={() => setMessage("")}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-500 dark:border-gray-700 z-10 flex flex-col items-center">
              <div className="bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-300 rounded-full p-4 mb-4">
                <FaCheck className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-2 text-center">
                Staff Added!
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
                The new admin staff has been successfully registered.
                <br />
                Staff ID:{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-300">
                  {message.replace(/[^\d]/g, "")}
                </span>
              </p>
              <button
                className="py-2 px-8 rounded-lg font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 transition"
                onClick={() => setMessage("")}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Inactivity Modal */}
        <InactivityModal
          show={showInactivityModal}
          onStayLoggedIn={handleStayLoggedIn}
          onLogout={handleLogout}
          timeLeft={modalCountdown}
        />
      </form>
    </div>
  );
};

export default AddStaff;
