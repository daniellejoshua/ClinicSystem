import React, { useState, useEffect } from "react";
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
import queueService from "../../shared/services/queueService";
import AppointmentHeader from "../../assets/images/AppointmentHeader.png";
const AppointmentBooking = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Appointment form state aligned with fill_up_forms structure
  const [appointmentForm, setAppointmentForm] = useState({
    // Patient Information
    patient_full_name: "",
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
    medical_history: "",
    current_medications: "",
    allergies: "",

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
    if (!appointmentForm.patient_full_name.trim())
      newErrors.patient_full_name = "Name is required";
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

    // Date validation (not in the past)
    if (appointmentForm.preferred_date) {
      const selectedDate = new Date(appointmentForm.preferred_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.preferred_date = "Please select a future date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Patient Information
        if (!appointmentForm.patient_full_name.trim())
          newErrors.patient_full_name = "Name is required";
        if (!appointmentForm.patient_birthdate)
          newErrors.patient_birthdate = "Date of birth is required";
        if (!appointmentForm.patient_sex)
          newErrors.patient_sex = "Gender is required";
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

        // Date validation (not in the past)
        if (appointmentForm.preferred_date) {
          const selectedDate = new Date(appointmentForm.preferred_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            newErrors.preferred_date = "Please select a future date";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const goToStep = (step) => {
    // Allow going back to previous steps or staying on current step
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setAppointmentForm((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Auto-fill booked_by_name if relationship is "Self"
    if (name === "relationship_to_patient" && value === "Self") {
      setAppointmentForm((prev) => ({
        ...prev,
        booked_by_name: prev.patient_full_name,
      }));
    }

    // Auto-fill booked_by_name when patient name changes and relationship is "Self"
    if (
      name === "patient_full_name" &&
      appointmentForm.relationship_to_patient === "Self"
    ) {
      setAppointmentForm((prev) => ({
        ...prev,
        booked_by_name: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    try {
      setIsLoading(true);
      setSubmitStatus(null);

      // Create online appointment using the new queue service
      // This will NOT assign a queue number until check-in
      const appointmentData = {
        patient_full_name: appointmentForm.patient_full_name,
        patient_birthdate: appointmentForm.patient_birthdate,
        patient_sex: appointmentForm.patient_sex,
        contact_number: appointmentForm.contact_number,
        email_address: appointmentForm.email_address,
        booked_by_name: appointmentForm.booked_by_name,
        relationship_to_patient: appointmentForm.relationship_to_patient,
        service_ref: appointmentForm.service_ref,
        preferred_date: appointmentForm.preferred_date,
        additional_notes:
          appointmentForm.additional_notes || "No additional notes",
        medical_history: appointmentForm.medical_history,
        current_medications: appointmentForm.current_medications,
        allergies: appointmentForm.allergies,
        present_checkbox: appointmentForm.present_checkbox,
        booking_source: "online",
        appointment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const result = await queueService.createOnlineAppointment(
        appointmentData
      );

      if (result.success) {
        setSubmitStatus("success");

        // Create patient record in patients collection for patient management
        const patientData = {
          full_name: appointmentForm.patient_full_name,
          email: appointmentForm.email_address,
          phone_number: appointmentForm.contact_number,
          date_of_birth: appointmentForm.patient_birthdate,
          address: "", // Not collected in online form, can be updated later
          service_ref: appointmentForm.service_ref,
          status: "pending", // Pending until checked in
          priority_flag: "normal",
          appointment_type: "online",
          preferred_date: appointmentForm.preferred_date,
          medical_history: appointmentForm.medical_history,
          current_medications: appointmentForm.current_medications,
          allergies: appointmentForm.allergies,
          booking_source: "online",
          appointment_id: result.appointmentId,
          created_at: new Date().toISOString(),
        };

        // Add to patients collection
        await customDataService.addDataWithAutoId("patients", patientData);

        // Also create fill-up form record for admin reference
        const formData = {
          appointment_id: result.appointmentId,
          patient_full_name: appointmentForm.patient_full_name,
          patient_birthdate: appointmentForm.patient_birthdate,
          patient_sex: appointmentForm.patient_sex,
          appointment_date: new Date().toISOString(),
          booked_by_name: appointmentForm.booked_by_name,
          relationship_to_patient: appointmentForm.relationship_to_patient,
          contact_number: appointmentForm.contact_number,
          email_address: appointmentForm.email_address,
          present_checkbox: appointmentForm.present_checkbox,
          medical_history: appointmentForm.medical_history,
          current_medications: appointmentForm.current_medications,
          allergies: appointmentForm.allergies,
          booking_source: "online",
          created_at: new Date().toISOString(),
        };

        await customDataService.addDataWithAutoId("fill_up_forms", formData);

        // Reset form after successful submission
        setTimeout(() => {
          setAppointmentForm({
            patient_full_name: "",
            patient_birthdate: "",
            patient_sex: "",
            contact_number: "",
            email_address: "",
            booked_by_name: "",
            relationship_to_patient: "Self",
            service_ref: "",
            preferred_date: "",
            additional_notes: "",
            medical_history: "",
            current_medications: "",
            allergies: "",
            present_checkbox: false,
            booking_source: "online",
          });
          setSubmitStatus(null);
        }, 3000);
      } else {
        throw new Error(result.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setSubmitStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
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

              {/* Status Messages */}
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="font-bold font-worksans">
                      Appointment Booked Successfully!
                    </span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>✅ Your online appointment has been confirmed</p>
                    <p>🏥 Please check in at the clinic when you arrive</p>
                    <p>
                      ⭐ You'll receive a priority queue number upon check-in
                    </p>
                    <p>📧 A confirmation has been sent to your email</p>
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
                    <div className="grid grid-cols-1 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 font-worksans">
                          Patient Full Name *
                        </label>
                        <input
                          type="text"
                          name="patient_full_name"
                          value={appointmentForm.patient_full_name}
                          onChange={handleInputChange}
                          placeholder="Enter patient's full name"
                          className={`w-full bg-primary text-white placeholder-blue-200 border-0 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent font-worksans ${
                            errors.patient_full_name
                              ? "ring-2 ring-red-500"
                              : ""
                          }`}
                        />
                        {errors.patient_full_name && (
                          <p className="text-red-500 text-sm mt-1 font-worksans">
                            {errors.patient_full_name}
                          </p>
                        )}
                      </div>

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
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
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
                          <option value="Other">Other</option>
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
                          {services.map((service) => (
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
                        disabled={isLoading}
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
            {/* Schedule Hours */}
            <div className="bg-white rounded-lg shadow-xl p-5 h-fit">
              <h3 className="text-2xl font-bold text-primary mb-8 font-yeseva">
                Schedule Hours
              </h3>
              <div className="space-y-6 text-base font-worksans mb-8">
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="font-semibold text-lg">Monday</span>
                  <span className="text-primary font-bold text-lg">
                    09:00 AM - 07:00 PM
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="font-semibold text-lg">Tuesday</span>
                  <span className="text-primary font-bold text-lg">
                    09:00 AM - 07:00 PM
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="font-semibold text-lg">Wednesday</span>
                  <span className="text-primary font-bold text-lg">
                    09:00 AM - 07:00 PM
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="font-semibold text-lg">Thursday</span>
                  <span className="text-primary font-bold text-lg">
                    09:00 AM - 07:00 PM
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="font-semibold text-lg">Friday</span>
                  <span className="text-primary font-bold text-lg">
                    09:00 AM - 07:00 PM
                  </span>
                </div>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <span className="font-semibold text-lg">Saturday</span>
                  <span className="text-primary font-bold text-lg">
                    09:00 AM - 07:00 PM
                  </span>
                </div>
              </div>
            </div>
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
                    <p className="text-gray-600">(237) 666-331-894</p>
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
                    <p className="text-gray-600">info@clinicsystem.com</p>
                    <p className="text-gray-600">
                      appointments@clinicsystem.com
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
                      Mon - Sat: 9:00 AM - 7:00 PM
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
