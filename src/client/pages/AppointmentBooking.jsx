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

const AppointmentBooking = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [errors, setErrors] = useState({});

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    // Patient Information
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",

    // Appointment Details
    service_ref: "",
    preferred_date: "",
    preferred_time: "",
    priority_flag: "normal",
    reason_for_visit: "",

    // Contact/Booking Information
    booked_by_name: "",
    relationship_to_patient: "Self",
    emergency_contact: "",

    // Additional Information
    medical_history: "",
    current_medications: "",
    allergies: "",
    previous_visits: "No",
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const servicesData = await customDataService.getAllData("services");
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
    if (!appointmentForm.full_name.trim())
      newErrors.full_name = "Full name is required";
    if (!appointmentForm.email.trim()) newErrors.email = "Email is required";
    if (!appointmentForm.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    if (!appointmentForm.date_of_birth)
      newErrors.date_of_birth = "Date of birth is required";
    if (!appointmentForm.address.trim())
      newErrors.address = "Address is required";
    if (!appointmentForm.service_ref)
      newErrors.service_ref = "Please select a service";
    if (!appointmentForm.preferred_date)
      newErrors.preferred_date = "Preferred date is required";
    if (!appointmentForm.preferred_time)
      newErrors.preferred_time = "Preferred time is required";
    if (!appointmentForm.reason_for_visit.trim())
      newErrors.reason_for_visit = "Reason for visit is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (appointmentForm.email && !emailRegex.test(appointmentForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (Philippine format)
    const phoneRegex = /^(\+63|0)?[9]\d{9}$/;
    if (
      appointmentForm.phone_number &&
      !phoneRegex.test(appointmentForm.phone_number.replace(/\s+/g, ""))
    ) {
      newErrors.phone_number = "Please enter a valid Philippine phone number";
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
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
        booked_by_name: prev.full_name,
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

      // Get next queue number
      const existingPatients = await customDataService.getAllData("patients");
      const queueNumber = existingPatients.length + 1;

      // Create patient record
      const patientData = {
        full_name: appointmentForm.full_name,
        email: appointmentForm.email,
        phone_number: appointmentForm.phone_number,
        date_of_birth: appointmentForm.date_of_birth,
        address: appointmentForm.address,
        queue_number: queueNumber,
        service_ref: appointmentForm.service_ref,
        status: "scheduled", // Different from walk-in patients
        priority_flag: appointmentForm.priority_flag,
        emergency_contact: appointmentForm.emergency_contact,
        medical_history: appointmentForm.medical_history,
        current_medications: appointmentForm.current_medications,
        allergies: appointmentForm.allergies,
        booking_type: "online", // Track how patient was registered
      };

      const patientResult = await customDataService.addDataWithAutoId(
        "patients",
        patientData
      );

      // Create appointment record
      const appointmentData = {
        patient_ref: `patients/${patientResult.id}`,
        service_ref: appointmentForm.service_ref,
        appointment_date: appointmentForm.preferred_date,
        appointment_time: appointmentForm.preferred_time,
        status: "scheduled",
        notes: appointmentForm.reason_for_visit,
        booking_type: "online",
        priority_flag: appointmentForm.priority_flag,
      };

      await customDataService.addDataWithAutoId(
        "appointments",
        appointmentData
      );

      // Create fill-up form record
      const formData = {
        patient_ref: `patients/${patientResult.id}`,
        patient_full_name: appointmentForm.full_name,
        patient_birthdate: appointmentForm.date_of_birth,
        patient_sex: "", // Can be added later
        reason_for_visit: appointmentForm.reason_for_visit,
        appointment_date: new Date().toISOString(),
        booked_by_name:
          appointmentForm.booked_by_name || appointmentForm.full_name,
        relationship_to_patient: appointmentForm.relationship_to_patient,
        contact_number: appointmentForm.phone_number,
        email_address: appointmentForm.email,
        present_checkbox: false, // Will be checked when patient arrives
        medical_history: appointmentForm.medical_history,
        current_medications: appointmentForm.current_medications,
        allergies: appointmentForm.allergies,
        booking_source: "online",
      };

      await customDataService.addDataWithAutoId("fill_up_forms", formData);

      // Create audit log
      await customDataService.addDataWithAutoId("audit_logs", {
        user_ref: `patients/${patientResult.id}`,
        action: `Online appointment booking - ${appointmentForm.full_name} scheduled for ${appointmentForm.preferred_date} ${appointmentForm.preferred_time}`,
        ip_address: "192.168.1.200",
        timestamp: new Date().toISOString(),
      });

      setSubmitStatus("success");

      // Reset form after successful submission
      setTimeout(() => {
        setAppointmentForm({
          full_name: "",
          email: "",
          phone_number: "",
          date_of_birth: "",
          address: "",
          service_ref: "",
          preferred_date: "",
          preferred_time: "",
          priority_flag: "normal",
          reason_for_visit: "",
          booked_by_name: "",
          relationship_to_patient: "Self",
          emergency_contact: "",
          medical_history: "",
          current_medications: "",
          allergies: "",
          previous_visits: "No",
        });
        setSubmitStatus(null);
      }, 3000);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Book an Appointment
            </h1>
            <p className="text-gray-600">
              Schedule your visit to Tonsuya Super Health Center
            </p>
          </div>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <FaCheckCircle className="text-green-600" />
                <span className="font-bold">
                  Appointment Booked Successfully!
                </span>
              </div>
              <p className="text-green-700 mt-2">
                Your appointment has been scheduled and will appear in the admin
                dashboard. You will receive a confirmation call soon.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <FaExclamationTriangle className="text-red-600" />
                <span className="font-bold">
                  Please check the form for errors
                </span>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser className="text-blue-500" />
                Patient Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={appointmentForm.full_name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.full_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter patient's full name"
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={appointmentForm.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={appointmentForm.phone_number}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone_number ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+63 9XX XXX XXXX"
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={appointmentForm.date_of_birth}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date_of_birth
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.date_of_birth && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.date_of_birth}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={appointmentForm.address}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter complete address"
                    rows="2"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendar className="text-green-500" />
                Appointment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Service *
                  </label>
                  <select
                    name="service_ref"
                    value={appointmentForm.service_ref}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.service_ref ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={`services/${service.id}`}>
                        {service.service_name} ({service.duration_minutes} mins)
                      </option>
                    ))}
                  </select>
                  {errors.service_ref && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.service_ref}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    value={appointmentForm.preferred_date}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.preferred_date
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.preferred_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.preferred_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preferred Time *
                  </label>
                  <select
                    name="preferred_time"
                    value={appointmentForm.preferred_time}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.preferred_time
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select time</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                  {errors.preferred_time && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.preferred_time}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    name="priority_flag"
                    value={appointmentForm.priority_flag}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Reason for Visit *
                  </label>
                  <textarea
                    name="reason_for_visit"
                    value={appointmentForm.reason_for_visit}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.reason_for_visit
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Please describe your health concern or reason for this visit"
                    rows="3"
                  />
                  {errors.reason_for_visit && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reason_for_visit}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Book Appointment
                  </>
                )}
              </button>

              <p className="text-sm text-gray-600 mt-3">
                After booking, you will receive a confirmation call within 24
                hours.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
