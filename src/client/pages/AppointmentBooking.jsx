// This page lets patients book appointments online
// The form collects patient info, contact, service, and preferred date
// Patients go through steps to fill out all required details
// When submitted, the appointment is saved and the patient gets a confirmation
// The UI shows progress, errors, and feedback to help patients book easily

import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import {
  FaCalendar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import customDataService from "../../shared/services/customDataService";
import dataService from "../../shared/services/dataService";
import queueService from "../../shared/services/queueService";
import { appointmentReminderService } from "../../shared/services/appointmentReminderService";
import AppointmentHeader from "../../assets/images/AppointmentHeader.png";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Example data
const chartData = [
  { name: "General", value: 40 },
  { name: "Pediatrics", value: 30 },
  { name: "Dental", value: 20 },
  { name: "OB-GYN", value: 10 },
];

const AppointmentBooking = () => {
  // PIN confirmation dialog state
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [generatedPin, setGeneratedPin] = useState("");
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const nextStep = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setErrors({}); // Clear errors when moving to next step
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({}); // Clear errors when moving to previous step
    }
  };

  // Optional: direct step navigation (for progress bar)
  const goToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
      setErrors({}); // Clear errors when jumping to a previous step
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // For service_ref, always set as 'services/{id}' or 'General Consultation'
    if (name === "service_ref") {
      setAppointmentForm((prev) => ({
        ...prev,
        service_ref: value ? value : "General Consultation",
      }));
    } else {
      setAppointmentForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Appointment form state aligned with fill_up_forms structure
  const [appointmentForm, setAppointmentForm] = useState({
    // Patient Information
    patient_first_name: "",
    patient_middle_name: "",
    patient_last_name: "",
    patient_birthdate: "",
    patient_sex: "",

    // Contact Information
    contact_number: "",
    email_address: "",

    // Booking Information
    booked_by_name: "",
    relationship_to_patient: "Self",

    // Appointment Details
    service_ref: "",
    preferred_date: "",
    additional_notes: "",

    // Medical Information
    current_medications: "",

    // Additional fields
    present_checkbox: false,
    booking_source: "online",
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const servicesData = await customDataService.getAllData("services");
      console.log("Loaded services:", servicesData); // Debug log
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!appointmentForm.patient_first_name.trim())
      newErrors.patient_first_name = "First name is required";
    if (!appointmentForm.patient_last_name.trim())
      newErrors.patient_last_name = "Last name is required";
    if (!appointmentForm.patient_birthdate)
      newErrors.patient_birthdate = "Date of birth is required";
    if (!appointmentForm.patient_sex)
      newErrors.patient_sex = "Gender is required";
    if (!appointmentForm.contact_number.trim())
      newErrors.contact_number = "Phone number is required";
    if (!appointmentForm.email_address.trim())
      newErrors.email_address = "Email is required";
    if (!appointmentForm.booked_by_name.trim())
      newErrors.booked_by_name = "Booked by name is required";
    if (!appointmentForm.relationship_to_patient)
      newErrors.relationship_to_patient = "Relationship is required";
    if (!appointmentForm.service_ref)
      newErrors.service_ref = "Please select a service";
    if (!appointmentForm.preferred_date)
      newErrors.preferred_date = "Date is required";

    // Date of birth validation (not today or in the future)
    if (appointmentForm.patient_birthdate) {
      const birthDate = new Date(appointmentForm.patient_birthdate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (birthDate >= today) {
        newErrors.patient_birthdate =
          "Date of birth cannot be today or in the future";
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      appointmentForm.email_address &&
      !emailRegex.test(appointmentForm.email_address)
    ) {
      newErrors.email_address = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
    if (
      appointmentForm.contact_number &&
      !phoneRegex.test(appointmentForm.contact_number.replace(/\s+/g, ""))
    ) {
      newErrors.contact_number = "Please enter a valid phone number";
    }

    // Date validation (not today or in the past)
    if (appointmentForm.preferred_date) {
      const selectedDate = new Date(appointmentForm.preferred_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate <= today) {
        newErrors.preferred_date = "Please select a future date (not today)";
      }
      // No Sundays allowed
      if (selectedDate.getDay() === 0) {
        newErrors.preferred_date = "No Sundays allowed for appointments";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Patient Information
        if (!appointmentForm.patient_first_name.trim())
          newErrors.patient_first_name = "First name is required";
        if (!appointmentForm.patient_last_name.trim())
          newErrors.patient_last_name = "Last name is required";
        if (!appointmentForm.patient_birthdate)
          newErrors.patient_birthdate = "Date of birth is required";
        if (!appointmentForm.patient_sex)
          newErrors.patient_sex = "Gender is required";

        // Date of birth validation (not today or in the future)
        if (appointmentForm.patient_birthdate) {
          const birthDate = new Date(appointmentForm.patient_birthdate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (birthDate >= today) {
            newErrors.patient_birthdate =
              "Date of birth cannot be today or in the future";
          }
        }
        break;

      case 2: // Contact Information
        if (!appointmentForm.contact_number.trim())
          newErrors.contact_number = "Phone number is required";
        if (!appointmentForm.email_address.trim())
          newErrors.email_address = "Email is required";

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (
          appointmentForm.email_address &&
          !emailRegex.test(appointmentForm.email_address)
        ) {
          newErrors.email_address = "Please enter a valid email address";
        }

        // Phone validation
        const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
        if (
          appointmentForm.contact_number &&
          !phoneRegex.test(appointmentForm.contact_number.replace(/\s+/g, ""))
        ) {
          newErrors.contact_number = "Please enter a valid phone number";
        }
        break;

      case 3: // Booking Information
        if (!appointmentForm.booked_by_name.trim())
          newErrors.booked_by_name = "Booked by name is required";
        if (!appointmentForm.relationship_to_patient)
          newErrors.relationship_to_patient = "Relationship is required";
        break;

      case 4: // Appointment Details
        if (!appointmentForm.service_ref)
          newErrors.service_ref = "Please select a service";
        if (!appointmentForm.preferred_date)
          newErrors.preferred_date = "Date is required";

        // Date validation (not today or in the past)
        if (appointmentForm.preferred_date) {
          const selectedDate = new Date(appointmentForm.preferred_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate <= today) {
            newErrors.preferred_date =
              "Please select a future date (not today)";
          }
          // No Sundays allowed
          if (selectedDate.getDay() === 0) {
            newErrors.preferred_date = "No Sundays allowed for appointments";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Main submit handler for booking appointment with PIN confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setSubmitStatus(null);
    try {
      const fullName =
        `${appointmentForm.patient_first_name} ${appointmentForm.patient_middle_name} ${appointmentForm.patient_last_name}`.trim();

      // Find service name from selected service_ref
      let serviceName = "";
      if (appointmentForm.service_ref) {
        const foundService = services.find(
          (s) => `services/${s.id}` === appointmentForm.service_ref
        );
        serviceName = foundService
          ? foundService.service_name
          : "General Consultation";
      }

      // Prepare all info for later DB push (after PIN confirmation)
      // Deduplication: fetch all patients and check for match
      const allPatients = await customDataService.getAllData("patients");
      const normalize = (str) => (str ? str.trim().toLowerCase() : "");
      const existingPatient = allPatients.find(
        (p) =>
          normalize(p.full_name) === normalize(fullName) &&
          normalize(p.email) === normalize(appointmentForm.email_address) &&
          normalize(p.phone_number) ===
            normalize(appointmentForm.contact_number) &&
          normalize(p.date_of_birth) ===
            normalize(appointmentForm.patient_birthdate) &&
          normalize(p.patient_sex || p.sex) ===
            normalize(appointmentForm.patient_sex)
      );

      // Store all info for later DB push (after PIN confirmation)
      window._pendingAppointment = {
        fullName,
        appointmentForm: { ...appointmentForm },
        serviceName,
        existingPatient,
      };

      // Generate 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedPin(pin);
      window._pendingAppointment.pin = pin;

      // Send PIN via EmailJS
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        "template_ivtnhod",
        {
          to_name: fullName,
          appointment_date: appointmentForm.preferred_date,
          appointment_time: appointmentForm.preferred_time,
          pin: pin,
          to_email: appointmentForm.email_address,
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      );
      setShowPinDialog(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
      setSubmitStatus("error");
      setIsLoading(false);
    }
  };

  // Handle PIN entry and confirmation
  const handlePinConfirm = () => {
    if (enteredPin === generatedPin && window._pendingAppointment) {
      setSubmitStatus("success");
      setShowPinDialog(false);
      setPinError("");
      // Push to DB only after PIN confirmation
      const {
        fullName,
        appointmentForm: form,
        existingPatient,
        pin,
      } = window._pendingAppointment;

      // Use the selected service_ref or fallback to 'General Consultation'
      const serviceRef = form.service_ref || "General Consultation";
      console.log("[DEBUG] serviceRef being saved:", serviceRef);

      // Create or update patient record
      let patientIdPromise;
      if (existingPatient) {
        patientIdPromise = Promise.resolve(existingPatient.id);
      } else {
        patientIdPromise = customDataService
          .addDataWithAutoId("patients", {
            full_name: fullName,
            email: form.email_address,
            phone_number: form.contact_number,
            date_of_birth: form.patient_birthdate,
            sex: form.patient_sex,
            address: "",
            service_ref: serviceRef,
            status: "pending",
            priority_flag: "normal",
            appointment_type: "online",
            preferred_date: form.preferred_date,
            current_medications: form.current_medications,
            booking_source: "online",
            created_at: new Date().toISOString(),
          })
          .then((newPatient) => newPatient.id);
      }

      patientIdPromise.then((patientId) => {
        // Prepare appointment data
        const appointmentData = {
          patient_ref: `patients/${patientId}`,
          patient_full_name: fullName,
          patient_first_name: form.patient_first_name,
          patient_middle_name: form.patient_middle_name,
          patient_last_name: form.patient_last_name,
          patient_birthdate: form.patient_birthdate,
          patient_sex: form.patient_sex,
          contact_number: form.contact_number,
          email_address: form.email_address,
          booked_by_name: form.booked_by_name,
          relationship_to_patient: form.relationship_to_patient,
          service_ref: serviceRef,
          preferred_date: form.preferred_date,
          additional_notes: form.additional_notes || "No additional notes",
          current_medications: form.current_medications,
          present_checkbox: form.present_checkbox,
          booking_source: "online",
          appointment_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        queueService
          .createOnlineAppointment(appointmentData)
          .then(async (result) => {
            if (result.success) {
              // Update patient record with appointment and PIN
              dataService.updateData(`patients/${patientId}`, {
                appointment_id: result.appointmentId,
                pin_code: pin,
                preferred_date: form.preferred_date,
                current_medications: form.current_medications,
                service_ref: serviceRef,
                status: "pending",
                booking_source: "online",
                updated_at: new Date().toISOString(),
              });

              // Also create fill-up form record for admin reference
              const formData = {
                appointment_id: result.appointmentId,
                patient_ref: `patients/${patientId}`,
                patient_full_name: fullName,
                patient_birthdate: form.patient_birthdate,
                patient_sex: form.patient_sex,
                appointment_date: new Date().toISOString(),
                booked_by_name: form.booked_by_name,
                relationship_to_patient: form.relationship_to_patient,
                contact_number: form.contact_number,
                email_address: form.email_address,
                present_checkbox: form.present_checkbox,
                current_medications: form.current_medications,
                booking_source: "online",
                created_at: new Date().toISOString(),
                pin_code: pin,
              };
              customDataService.addDataWithAutoId("fill_up_forms", formData);
            }
            // Clean up pending data
            window._pendingAppointment = null;
          });
      });

      // Reset form after successful submission and re-enable button
      setTimeout(() => {
        setAppointmentForm({
          patient_first_name: "",
          patient_middle_name: "",
          patient_last_name: "",
          patient_birthdate: "",
          patient_sex: "",
          contact_number: "",
          email_address: "",
          booked_by_name: "",
          relationship_to_patient: "Self",
          service_ref: "",
          preferred_date: "",
          additional_notes: "",
          current_medications: "",
          present_checkbox: false,
          booking_source: "online",
        });
        setCurrentStep(1);
        setSubmitStatus(null);
        setIsLoading(false);
        setErrors({});
        setEnteredPin("");
        setGeneratedPin("");
      }, 3000);
    } else {
      setPinError("Incorrect PIN. Please check your email and try again.");
    }
  };

  // Get minimum date (tomorrow) for appointment booking
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Get maximum date for date of birth (yesterday)
  const getMaxBirthDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image and Overlay */}
      <section className="relative bg-primary h-[250px] flex items-center justify-center">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${AppointmentHeader})`,
          }}
        />
        <div className="absolute inset-0 bg-white/50" />

        {/* Content */}
        <div className="relative z-10 text-left px-4 max-w-6xl mx-auto w-full text-primary">
          <nav className="text-sm mb-4 font-worksans">
            <span className="opacity-75">Home</span>
            <span className="mx-2">/</span>
            <span>Appointment</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold font-yeseva mb-4 text-primary">
            Book an Appointment
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Form Progress Indicators */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-primary mb-4 font-yeseva text-center">
              Appointment Form - Step {currentStep} of {totalSteps}
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  onClick={() => goToStep(step)}
                  className={`text-center p-3 rounded-lg cursor-pointer transition-all ${
                    step === currentStep
                      ? "bg-primary text-white"
                      : step < currentStep
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold ${
                      step === currentStep
                        ? "bg-white text-primary"
                        : step < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  <p className="text-xs font-semibold font-worksans">
                    {step === 1 && "Patient Info"}
                    {step === 2 && "Contact Info"}
                    {step === 3 && "Booking Info"}
                    {step === 4 && "Appointment"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-xl p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary mb-2 font-yeseva">
                  Book an Appointment
                </h2>
                <p className="text-gray-600 font-worksans">
                  Please fill out the form below to schedule your appointment
                  with our medical team.
                </p>
              </div>

              {/* PIN Confirmation Dialog */}
              {showPinDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                    <h2 className="text-xl font-bold text-primary mb-4 font-yeseva text-center">
                      Enter Your 6-Digit PIN
                    </h2>
                    <p className="text-gray-700 mb-4 text-center font-worksans">
                      We've sent a 6-digit PIN to your email address. Please
                      enter it below to confirm your appointment.
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredPin}
                      onChange={(e) =>
                        setEnteredPin(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="w-full bg-primary text-white border-0 rounded px-4 py-3 mb-2 text-center text-lg font-bold font-worksans focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Enter 6-digit PIN"
                    />
                    {pinError && (
                      <p className="text-red-500 text-sm mb-2 text-center font-worksans">
                        {pinError}
                      </p>
                    )}
                    <button
                      onClick={handlePinConfirm}
                      className="bg-accent text-primary py-2 px-6 rounded font-semibold hover:bg-accent/90 transition-colors w-full font-worksans"
                    >
                      Confirm PIN
                    </button>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {submitStatus === "success" && !showPinDialog && (
                <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg shadow flex flex-col items-center">
                  <FaCheckCircle className="text-green-600 text-3xl mb-2" />
                  <h3 className="font-bold text-green-800 text-xl mb-2 font-yeseva">
                    Appointment Booked Successfully!
                  </h3>
                  <div className="text-sm text-green-700 space-y-2 text-center font-worksans">
                    <p>✅ Your online appointment has been confirmed.</p>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <FaExclamationTriangle className="text-red-600" />
                    <span className="font-bold font-worksans">
                      Please check the form for errors
                    </span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Patient Information */}
                {currentStep === 1 && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-6 font-yeseva">
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="patient_first_name"
                          value={appointmentForm.patient_first_name}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                          className={`w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.patient_first_name
                              ? "ring-2 ring-red-500"
                              : ""
                          }`}
                        />
                        {errors.patient_first_name && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.patient_first_name}
                          </p>
                        )}
                      </div>
                      {/* Middle Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Middle Name
                        </label>
                        <input
                          type="text"
                          name="patient_middle_name"
                          value={appointmentForm.patient_middle_name}
                          onChange={handleInputChange}
                          placeholder="Enter middle name"
                          className="w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans"
                        />
                      </div>
                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="patient_last_name"
                          value={appointmentForm.patient_last_name}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          className={`w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.patient_last_name
                              ? "ring-2 ring-red-500"
                              : ""
                          }`}
                        />
                        {errors.patient_last_name && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.patient_last_name}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="patient_birthdate"
                          value={appointmentForm.patient_birthdate}
                          onChange={handleInputChange}
                          max={getMaxBirthDate()}
                          className={`w-full bg-primary text-white border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.patient_birthdate
                              ? "ring-2 ring-red-500"
                              : ""
                          }`}
                        />
                        {errors.patient_birthdate && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.patient_birthdate}
                          </p>
                        )}
                      </div>
                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Gender *
                        </label>
                        <select
                          name="patient_sex"
                          value={appointmentForm.patient_sex}
                          onChange={handleInputChange}
                          className={`w-full bg-primary text-white border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.patient_sex ? "ring-2 ring-red-500" : ""
                          }`}
                        >
                          {appointmentForm.patient_sex === "" && (
                            <option value="">Select Gender</option>
                          )}
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        {errors.patient_sex && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.patient_sex}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Information */}
                {currentStep === 2 && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-6 font-yeseva">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email_address"
                          value={appointmentForm.email_address}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className={`w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.email_address ? "ring-2 ring-red-500" : ""
                          }`}
                        />
                        {errors.email_address && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.email_address}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Contact Number *
                        </label>
                        <input
                          type="tel"
                          name="contact_number"
                          value={appointmentForm.contact_number}
                          onChange={handleInputChange}
                          placeholder="Enter your contact number"
                          className={`w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.contact_number ? "ring-2 ring-red-500" : ""
                          }`}
                        />
                        {errors.contact_number && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.contact_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Booking Information */}
                {currentStep === 3 && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-6 font-yeseva">
                      Booking Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {/* Booked By Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Booked By (Name) *
                        </label>
                        <input
                          type="text"
                          name="booked_by_name"
                          value={appointmentForm.booked_by_name}
                          onChange={handleInputChange}
                          placeholder="Enter the name of the person booking"
                          className={`w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.booked_by_name ? "ring-2 ring-red-500" : ""
                          }`}
                        />
                        {errors.booked_by_name && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.booked_by_name}
                          </p>
                        )}
                      </div>

                      {/* Relationship */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Relationship to Patient *
                        </label>
                        <select
                          name="relationship_to_patient"
                          value={appointmentForm.relationship_to_patient}
                          onChange={handleInputChange}
                          className={`w-full bg-primary text-white border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.relationship_to_patient
                              ? "ring-2 ring-red-500"
                              : ""
                          }`}
                        >
                          <option value="Self">Self</option>
                          <option value="Parent">Parent</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                        {errors.relationship_to_patient && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.relationship_to_patient}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Appointment Details */}
                {currentStep === 4 && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-6 font-yeseva">
                      Appointment Details
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {/* Service */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Department/Service *
                        </label>
                        <select
                          name="service_ref"
                          value={appointmentForm.service_ref}
                          onChange={handleInputChange}
                          className={`w-full bg-primary text-white border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.service_ref ? "ring-2 ring-red-500" : ""
                          }`}
                        >
                          <option value="">Select Department/Service</option>
                          {services
                            .filter(
                              (service) => service.service_name !== "Other"
                            )
                            .map((service) => (
                              <option
                                key={service.id}
                                value={`services/${service.id}`}
                              >
                                {service.service_name}
                              </option>
                            ))}
                        </select>
                        {errors.service_ref && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.service_ref}
                          </p>
                        )}
                      </div>

                      {/* Appointment Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Preferred Date *
                        </label>
                        <input
                          type="date"
                          name="preferred_date"
                          value={appointmentForm.preferred_date}
                          onChange={handleInputChange}
                          min={getMinDate()}
                          className={`w-full bg-primary text-white border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.preferred_date ? "ring-2 ring-red-500" : ""
                          }`}
                        />
                        {errors.preferred_date && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.preferred_date}
                          </p>
                        )}
                      </div>

                      {/* Additional Notes (Optional) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          name="additional_notes"
                          value={appointmentForm.additional_notes || ""}
                          onChange={handleInputChange}
                          placeholder="Please provide any additional information or specific concerns"
                          rows="3"
                          className="w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans"
                        />
                      </div>

                      {/* Present Checkbox */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="present_checkbox"
                          checked={appointmentForm.present_checkbox}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-accent bg-gray-100 border-gray-300 rounded focus:ring-accent focus:ring-2"
                        />
                        <label className="text-sm text-gray-700 font-worksans">
                          I confirm that I will be present for this appointment
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-500 text-white py-2 px-6 rounded font-semibold hover:bg-gray-600 transition-colors font-worksans"
                    >
                      Previous
                    </button>
                  )}

                  <div className="ml-auto">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-accent text-primary py-2 px-6 rounded font-semibold hover:bg-accent/90 transition-colors font-worksans"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading || submitStatus === "success"}
                        className="bg-accent text-primary py-3 px-6 rounded font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-worksans transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            SUBMITTING...
                          </>
                        ) : (
                          "BOOK APPOINTMENT"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clinic Hours Card */}
            <div className="bg-white rounded-lg shadow-xl p-5 h-fit flex flex-col items-center">
              <h3 className="text-xl font-bold text-primary mb-2 font-yeseva">
                Clinic Hours
              </h3>
              <div className="text-lg font-worksans text-gray-700 mb-2">
                <span className="font-semibold">Monday to Saturday</span>
                <br />
                <span className="text-primary font-bold">
                  8:00 AM – 8:00 PM
                </span>
              </div>
              <div className="text-sm text-gray-500 font-worksans">
                Sunday: <span className="font-bold text-red-500">Closed</span>
              </div>
            </div>

            {/* Important Notice Card */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow p-4 flex items-start gap-3">
              <FaExclamationTriangle className="text-yellow-500 text-2xl mt-1" />
              <div>
                <h4 className="font-bold text-yellow-700 mb-1 font-yeseva">
                  Important Notice
                </h4>
                <ul className="list-disc ml-5 text-yellow-800 text-sm font-worksans">
                  <li>Please bring a valid ID on your appointment day.</li>
                </ul>
              </div>
            </div>

            {/* ...existing code... */}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-gray-50 py-16 ">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-yeseva">
              Find Our Location
            </h2>
            <p className="text-gray-600 font-worksans max-w-2xl mx-auto">
              We're conveniently located to serve you better. Visit us at our
              clinic for quality healthcare services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-4 font-yeseva">
                Contact Information
              </h3>
              <div className="space-y-4 font-worksans">
                <div className="flex items-start gap-3">
                  <div className="text-accent mt-1">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Address</h4>
                    <p className="text-gray-600">
                      Tonsuya Super Health Center
                      <br />
                      Malabon City, Philippines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-accent mt-1">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <p className="text-gray-600">(237) 681-812-255</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-accent mt-1">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <p className="text-gray-600">
                      tonsuyasuperhealthcenter499@gmail.com
                    </p>
                    <p className="text-gray-600"></p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-accent mt-1">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Hours</h4>
                    <p className="text-gray-600">
                      Mon - Sat: 8:00 AM - 8:00 PM
                    </p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.8743235996417!2d120.95604987594159!3d14.663072775542435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b44f1fc47e0d%3A0x7046080a1d2df264!2sTonsuya%20Super%20Health%20Center%20(Malabon)!5e0!3m2!1sen!2sph!4v1756046763702!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Tonsuya Super Health Center Location"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default AppointmentBooking;
