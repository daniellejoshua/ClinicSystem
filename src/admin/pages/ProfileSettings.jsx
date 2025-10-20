import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCheck, FaSpinner } from "react-icons/fa";
import dataService from "../../shared/services/dataService";
import emailjs from "emailjs-com";
import authService from "../../shared/services/authService";

const ProfileSettings = () => {
  const currentStaff = authService.getCurrentStaff();
  const [form, setForm] = useState({
    full_name: currentStaff?.full_name || "",
    email: currentStaff?.email || "",
    password: "",
    oldPassword: "",
    pin: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: edit, 2: pin, 3: success
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // Simulate sending PIN to email
  const sendPinToEmail = async () => {
    setIsLoading(true);
    try {
      const staff = await authService.staffLogin(
        currentStaff.email,
        form.oldPassword
      );
      if (!staff) {
        setError("Incorrect old password.");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }
      // Generate a random 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedPin(pin);
      // Send PIN via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        "template_ivtnhod",
        {
          to_email: form.email,
          to_name: form.full_name,
          pin,
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      );
      setShowPinModal(true);
    } catch (err) {
      setError("Failed to send PIN or incorrect old password. Try again.");
      setShowErrorModal(true);
    }
    setIsLoading(false);
  };

  // Simulate verifying PIN and updating profile
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
    // Enforce new password length if provided
    if (form.password && form.password.length < 8) {
      setError("New password must be at least 8 characters long.");
      setShowErrorModal(true);
      setIsLoading(false);
      return;
    }
    try {
      // Update profile in DB using correct staff ID path
      await dataService.updateData(`staff/${currentStaff.id}`, {
        full_name: form.full_name,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
      });
      setStep(3);
      setShowPinModal(false);
    } catch (err) {
      setError("Failed to update profile. Try again.");
      setShowErrorModal(true);
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
          Profile Settings
        </h2>
        <p className="text-blue-600 dark:text-gray-300 text-center mt-2">
          Update your profile information securely.
        </p>
      </div>
      <div className="border-b border-blue-200 mb-6" />
      <div className="border-b border-blue-200 dark:border-gray-700 mb-6" />
      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendPinToEmail();
          }}
          className="space-y-6"
        >
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
                readOnly
                required
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 dark:text-white shadow-sm cursor-not-allowed"
                placeholder="Email (cannot be changed)"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              Old Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-blue-400 dark:text-blue-300">
                <FaLock className="h-5 w-5" />
              </span>
              <input
                type="password"
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                required
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg bg-white dark:bg-gray-900 dark:text-white shadow-sm"
                placeholder="Enter your current password"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block font-semibold mb-2 text-blue-700 dark:text-gray-200">
              New Password
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
                minLength={8}
                className="w-full border border-blue-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg bg-white dark:bg-gray-900 dark:text-white shadow-sm"
                placeholder="New Password (min 8 characters)"
              />
            </div>
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
                Update Profile
              </span>
            )}
          </button>
        </form>
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
              Enter PIN
            </h2>
            <input
              type="text"
              name="pin"
              value={form.pin}
              onChange={handleChange}
              required
              className="w-full border border-blue-300 dark:border-gray-700 rounded-lg px-4 py-3 mb-4 bg-white dark:bg-gray-900 dark:text-white shadow-sm"
              placeholder="Enter 6-digit PIN sent to your email"
            />
            {error && (
              <div className="text-red-600 dark:text-red-400 text-center font-semibold mb-2">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin h-5 w-5 text-white" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaCheck className="h-5 w-5" />
                  Confirm & Update
                </span>
              )}
            </button>
          </form>
        </div>
      )}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-blue-300 rounded-full p-4 mb-4 mx-auto w-max">
            <FaCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-2">
            Profile Updated!
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Your profile has been successfully updated.
          </p>
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

export default ProfileSettings;
