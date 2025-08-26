import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaStethoscope,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import authService from "../../shared/services/authService";
import DoctorImage from "../../assets/images/DoctorWithPatient.png";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Check for saved theme preference or default to light mode
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const staffData = await authService.staffLogin(
        formData.email,
        formData.password
      );

      if (staffData.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/admin");
      }
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "admin@clinic.com",
      password: "AdminPass123!",
      rememberMe: false,
    });
  };

  const handleBackToWebsite = () => {
    navigate("/");
  };

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
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
              <form onSubmit={handleSubmit} className="p-8 md:p-10">
                <div className="flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg">
                        <FaStethoscope className="w-7 h-7" />
                      </div>
                      <span className="text-2xl font-bold">ClinicSystem</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
                    <p className="text-muted-foreground text-lg">
                      Login to your admin account
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@clinic.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
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

                  {/* Remember Me */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </Label>
                  </div>

                  {/* Demo Login Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDemoLogin}
                    className="w-full"
                  >
                    Fill Demo Credentials
                  </Button>

                  {/* Login Button */}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>

                  {/* Divider */}
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" type="button" className="w-full">
                      <FaGoogle className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                    <Button variant="outline" type="button" className="w-full">
                      <FaFacebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                  </div>

                  {/* Back to Website */}
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={handleBackToWebsite}
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      ← Back to Website
                    </button>
                  </div>
                </div>
              </form>

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
                      ClinicSystem Admin
                    </h2>
                    <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-md">
                      Manage your clinic operations with our comprehensive
                      healthcare management system.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Credentials Info */}
          <div className="text-muted-foreground text-center text-sm">
            <div className="bg-card border rounded-lg p-4 shadow-sm">
              <p className="font-medium mb-2 text-foreground">
                Demo Credentials
              </p>
              <p className="text-xs">
                Email: admin@clinic.com • Password: AdminPass123!
              </p>
            </div>
          </div>

          {/* Footer */}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
