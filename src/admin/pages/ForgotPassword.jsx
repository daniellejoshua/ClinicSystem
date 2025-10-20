import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FaEye,
  FaEyeSlash,
  FaStethoscope,
  FaMoon,
  FaSun,
  FaArrowLeft,
  FaEnvelope,
  FaKey,
} from "react-icons/fa";
import { auth, database } from "../../shared/config/firebase";
import { updatePassword } from "firebase/auth";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import emailjs from "emailjs-com";
import DoctorImage from "../../assets/images/DoctorWithPatient.png";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: PIN, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    pin: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [pinExpiry, setPinExpiry] = useState(null);
  const [staffData, setStaffData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Forgot Password - Tonsuya Super Health Center";
  }, []);

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Generate 6-digit PIN
  const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send PIN via email
  const sendPinEmail = async (email, pin, fullName) => {
    try {
      console.log("Attempting to send email with EmailJS");
      console.log("Service ID:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
      console.log("Template ID: template_ivtnhod");
      console.log("User ID:", import.meta.env.VITE_EMAILJS_USER_ID);

      const templateParams = {
        to_email: email,
        to_name: fullName,
        pin: pin, // This matches {{pin}} in your template
      };

      console.log("Template params:", templateParams);

      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        "template_ivtnhod", // Using your template ID directly
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      );

      console.log("EmailJS result:", result);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  // Step 1: Verify email and send PIN
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Checking email:", formData.email.trim().toLowerCase());

      // Check if email exists in staff database
      const staffRef = ref(database, "staff");
      const staffSnapshot = await get(staffRef);

      console.log("Staff snapshot exists:", staffSnapshot.exists());

      if (!staffSnapshot.exists()) {
        setError("No staff data found in database.");
        setIsLoading(false);
        return;
      }

      // Get all staff data and search manually for more debugging
      const staffData = staffSnapshot.val();
      console.log("Staff data:", staffData);

      const staffList = Object.entries(staffData).map(([id, staff]) => ({
        id,
        ...staff,
      }));

      console.log("Staff list:", staffList);

      const matchedStaff = staffList.find(
        (staff) =>
          staff.email &&
          staff.email.trim().toLowerCase() ===
            formData.email.trim().toLowerCase()
      );

      console.log("Matched staff:", matchedStaff);

      if (!matchedStaff) {
        setError("Email not found in our staff records.");
        setIsLoading(false);
        return;
      }

      // Set staff data
      setStaffData(matchedStaff);

      // Generate and send PIN
      const pin = generatePin();
      setGeneratedPin(pin);
      setPinExpiry(Date.now() + 10 * 60 * 1000); // PIN expires in 10 minutes

      console.log("Generated PIN:", pin);
      console.log("Sending email to:", formData.email);

      const emailSent = await sendPinEmail(
        formData.email,
        pin,
        matchedStaff.full_name
      );

      if (emailSent) {
        setSuccess(`A 6-digit PIN has been sent to ${formData.email}`);
        setStep(2);
      } else {
        setError("Failed to send PIN. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleEmailSubmit:", error);
      setError(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify PIN
  const handlePinSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Check if PIN has expired
    if (pinExpiry && Date.now() > pinExpiry) {
      setError("PIN has expired. Please request a new one.");
      setStep(1);
      return;
    }

    if (formData.pin !== generatedPin) {
      setError("Invalid PIN. Please check your email and try again.");
      return;
    }

    setSuccess("PIN verified successfully!");
    setStep(3);
  };

  // Step 3: Reset password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // Note: For a complete implementation, you would need to:
      // 1. Sign in the user temporarily with their current password
      // 2. Update their password using Firebase Auth updatePassword
      // 3. Or use Firebase's built-in password reset functionality

      // For now, we'll show success and redirect to login
      setSuccess(
        "Password reset request submitted. Please contact your administrator to complete the password reset."
      );

      setTimeout(() => {
        navigate("/admin/login");
      }, 3000);
    } catch (error) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg mb-4">
                <FaEnvelope className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
              <p className="text-muted-foreground text-lg">
                Enter your email address to receive a reset PIN
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@clinic.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending PIN..." : "Send Reset PIN"}
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg mb-4">
                <FaKey className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Enter PIN</h1>
              <p className="text-muted-foreground text-lg">
                Enter the 6-digit PIN sent to your email
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="pin">6-Digit PIN</Label>
                <Input
                  id="pin"
                  name="pin"
                  type="text"
                  placeholder="123456"
                  value={formData.pin}
                  onChange={handleInputChange}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Verify PIN
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Back to Email
              </Button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg mb-4">
                <FaKey className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-muted-foreground text-lg">
                Enter your new password
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(2)}
              >
                Back to PIN
              </Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  // Hide error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center p-6 md:p-10",
        "bg-gradient-to-br",
        isDarkMode
          ? "from-gray-900 via-gray-800 to-blue-400"
          : "from-primary/10 via-accent/5 to-secondary/10"
      )}
    >
      <div className="w-full max-w-sm md:max-w-6xl">
        <div className={cn("flex flex-col gap-6")}>
          {/* Dark Mode Toggle */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
            >
              {isDarkMode ? (
                <FaSun className="h-4 w-4" />
              ) : (
                <FaMoon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Card className="overflow-hidden p-0 shadow-2xl">
            <CardContent className="grid p-0 md:grid-cols-2">
              {/* Form Section */}
              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg">
                      <FaStethoscope className="w-7 h-7" />
                    </div>
                    <span className="text-2xl font-bold">ClinicSystem</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className={cn(
                      "p-3 text-sm rounded-md mb-6",
                      error
                        ? "text-destructive bg-destructive/10 border border-destructive/20"
                        : "text-green-700 bg-green-100 border border-green-300",
                      isDarkMode && error
                        ? "dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                        : isDarkMode
                        ? "dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                        : ""
                    )}
                  >
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div
                    className={cn(
                      "p-3 text-sm rounded-md mb-6",
                      error
                        ? "text-destructive bg-destructive/10 border border-destructive/20"
                        : "text-green-700 bg-green-100 border border-green-300",
                      isDarkMode && error
                        ? "dark:bg-red-900/30 dark:text-red-400 dark:border-red-700"
                        : isDarkMode
                        ? "dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
                        : ""
                    )}
                  >
                    {success}
                  </div>
                )}

                {/* Step Content */}
                {renderStep()}

                {/* Back to Login */}
                <div className="text-center text-sm mt-6">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary"
                  >
                    <FaArrowLeft className="w-3 h-3" />
                    Back to Login
                  </Link>
                </div>
              </div>

              {/* Medical Image Section */}
              <div className="relative hidden md:block bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <img
                  src={DoctorImage}
                  alt="Doctor with patient"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />

                {/* Overlay Content */}
                <div className="absolute inset-0 flex items-end justify-center p-8">
                  <div className="text-center text-white">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                        <FaStethoscope className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                      Secure Password Reset
                    </h2>
                    <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-md">
                      Follow our secure process to reset your password and
                      regain access to your account.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
