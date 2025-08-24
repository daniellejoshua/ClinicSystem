import React, { useState } from "react";
import {
  FaPlus,
  FaDatabase,
  FaUser,
  FaCalendar,
  FaFileAlt,
} from "react-icons/fa";
import dataService from "../../shared/services/dataService";
import authService from "../../shared/services/authService";

const DataManagement = () => {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleCreateAdmin = async () => {
    setIsLoading(true);
    try {
      // First create the auth account
      const adminUser = await authService.createAdmin(
        "admin@clinic.com",
        "AdminPass123!",
        {
          name: "Super Admin",
          role: "admin",
          department: "Administration",
        }
      );

      setResult("✅ Admin account created successfully! You can now login.");
    } catch (error) {
      if (error.message.includes("already-in-use")) {
        setResult("ℹ️ Admin account already exists. You can use it to login.");
      } else {
        setResult(`❌ Error creating admin: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    try {
      // 1. Create Services that match your clinic's actual services
      const generalService = await dataService.addDataWithAutoId("services", {
        service_name: "General Consultation",
        description:
          "Complete health checkup, diagnosis, and treatment consultation with our experienced doctors",
        duration_minutes: 30,
      });

      const pediatricService = await dataService.addDataWithAutoId("services", {
        service_name: "Pediatric Care",
        description:
          "Specialized medical care for infants, children, and adolescents",
        duration_minutes: 45,
      });

      const vaccineService = await dataService.addDataWithAutoId("services", {
        service_name: "Vaccination Services",
        description: "Immunization and vaccination programs for all age groups",
        duration_minutes: 15,
      });

      const labService = await dataService.addDataWithAutoId("services", {
        service_name: "Laboratory Services",
        description:
          "Complete blood tests, urinalysis, and diagnostic laboratory services",
        duration_minutes: 20,
      });

      const emergencyService = await dataService.addDataWithAutoId("services", {
        service_name: "Emergency Care",
        description:
          "24/7 emergency medical services for urgent health conditions",
        duration_minutes: 60,
      });

      // 2. Create Staff (doctors and nurses) - NO PASSWORDS
      const drSantos = await dataService.addDataWithAutoId("staff", {
        full_name: "Dr. Maria Elena Santos",
        email: "dr.santos@tonsuyaclinic.com",
        role: "doctor",
        specialization: "General Medicine",
        license_number: "MD-2019-001234",
        created_at: new Date().toISOString(),
      });

      const drChen = await dataService.addDataWithAutoId("staff", {
        full_name: "Dr. Roberto Chen",
        email: "dr.chen@tonsuyaclinic.com",
        role: "doctor",
        specialization: "Pediatrics",
        license_number: "MD-2020-005678",
        created_at: new Date().toISOString(),
      });

      const nurseReyes = await dataService.addDataWithAutoId("staff", {
        full_name: "Nurse Angela Reyes",
        email: "nurse.reyes@tonsuyaclinic.com",
        role: "nurse",
        specialization: "General Nursing",
        license_number: "RN-2021-009876",
        created_at: new Date().toISOString(),
      });

      const nurseTorres = await dataService.addDataWithAutoId("staff", {
        full_name: "Nurse Michael Torres",
        email: "nurse.torres@tonsuyaclinic.com",
        role: "nurse",
        specialization: "Emergency Care",
        license_number: "RN-2022-001122",
        created_at: new Date().toISOString(),
      });

      // 3. Create realistic Patients with proper Filipino context
      const patient1 = await dataService.addDataWithAutoId("patients", {
        full_name: "Juan Carlos Dela Cruz",
        email: "juan.delacruz@gmail.com",
        phone_number: "+63 917 123 4567",
        date_of_birth: "1985-03-15",
        address:
          "Unit 12B Tower 1, Sunrise Village, Malabon City, Metro Manila",
        queue_number: 1,
        service_ref: `services/${generalService.id}`,
        status: "waiting",
        priority_flag: "normal",
        created_at: new Date().toISOString(),
      });

      const patient2 = await dataService.addDataWithAutoId("patients", {
        full_name: "Maria Cristina Santos",
        email: "maria.santos@yahoo.com",
        phone_number: "+63 928 567 8901",
        date_of_birth: "1992-07-22",
        address: "456 Rizal Street, Barangay San Agustin, Malabon City",
        queue_number: 2,
        service_ref: `services/${vaccineService.id}`,
        status: "waiting",
        priority_flag: "high",
        created_at: new Date().toISOString(),
      });

      const patient3 = await dataService.addDataWithAutoId("patients", {
        full_name: "Baby Sofia Reyes",
        email: "reyes.family@hotmail.com",
        phone_number: "+63 935 234 5678",
        date_of_birth: "2023-12-10",
        address: "789 Bonifacio Avenue, Tonsuya, Malabon City",
        queue_number: 3,
        service_ref: `services/${pediatricService.id}`,
        status: "in-progress",
        priority_flag: "high",
        created_at: new Date().toISOString(),
      });

      const patient4 = await dataService.addDataWithAutoId("patients", {
        full_name: "Eduardo Mendoza Jr.",
        email: "ed.mendoza@gmail.com",
        phone_number: "+63 912 345 6789",
        date_of_birth: "1978-11-05",
        address: "321 Flores Street, Barangay Flores, Malabon City",
        queue_number: 4,
        service_ref: `services/${labService.id}`,
        status: "completed",
        priority_flag: "normal",
        created_at: new Date().toISOString(),
      });

      // 4. Create Appointments with proper scheduling
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointment1 = await dataService.addDataWithAutoId("appointments", {
        patient_ref: `patients/${patient1.id}`,
        service_ref: `services/${generalService.id}`,
        staff_ref: `staff/${drSantos.id}`,
        appointment_date: today.toISOString(),
        status: "scheduled",
        notes: "Annual health checkup and blood pressure monitoring",
        created_at: new Date().toISOString(),
      });

      const appointment2 = await dataService.addDataWithAutoId("appointments", {
        patient_ref: `patients/${patient2.id}`,
        service_ref: `services/${vaccineService.id}`,
        staff_ref: `staff/${nurseReyes.id}`,
        appointment_date: today.toISOString(),
        status: "scheduled",
        notes: "COVID-19 booster vaccination",
        created_at: new Date().toISOString(),
      });

      const appointment3 = await dataService.addDataWithAutoId("appointments", {
        patient_ref: `patients/${patient3.id}`,
        service_ref: `services/${pediatricService.id}`,
        staff_ref: `staff/${drChen.id}`,
        appointment_date: today.toISOString(),
        status: "in-progress",
        notes: "8-month wellness checkup and vaccination",
        created_at: new Date().toISOString(),
      });

      // 5. Create Fill-up Forms with realistic data
      const fillupForm1 = await dataService.addDataWithAutoId("fill_up_forms", {
        patient_ref: `patients/${patient1.id}`,
        patient_full_name: "Juan Carlos Dela Cruz",
        patient_birthdate: "1985-03-15",
        patient_sex: "Male",
        reason_for_visit:
          "Annual physical examination and blood pressure check",
        appointment_date: today.toISOString(),
        booked_by_name: "Juan Carlos Dela Cruz",
        relationship_to_patient: "Self",
        contact_number: "+63 917 123 4567",
        email_address: "juan.delacruz@gmail.com",
        terms_conditions_boolean: true,
        medical_history: "Hypertension (controlled with medication)",
        current_medications: "Amlodipine 5mg daily",
        allergies: "None known",
        emergency_contact_name: "Ana Dela Cruz",
        emergency_contact_phone: "+63 918 765 4321",
        created_at: new Date().toISOString(),
      });

      const fillupForm2 = await dataService.addDataWithAutoId("fill_up_forms", {
        patient_ref: `patients/${patient3.id}`,
        patient_full_name: "Baby Sofia Reyes",
        patient_birthdate: "2023-12-10",
        patient_sex: "Female",
        reason_for_visit: "8-month wellness checkup and routine vaccinations",
        appointment_date: today.toISOString(),
        booked_by_name: "Carmen Reyes",
        relationship_to_patient: "Mother",
        contact_number: "+63 935 234 5678",
        email_address: "reyes.family@hotmail.com",
        terms_conditions_boolean: true,
        medical_history: "Born full-term, normal delivery, no complications",
        current_medications: "Vitamin D drops",
        allergies: "None known",
        emergency_contact_name: "Roberto Reyes",
        emergency_contact_phone: "+63 936 345 6789",
        created_at: new Date().toISOString(),
      });

      // 6. Create Queue Management entries
      const queueEntry1 = await dataService.addDataWithAutoId("queue", {
        patient_ref: `patients/${patient1.id}`,
        queue_number: 1,
        service_ref: `services/${generalService.id}`,
        staff_ref: `staff/${drSantos.id}`,
        status: "waiting",
        priority_flag: "normal",
        estimated_wait_time: "15-20 minutes",
        joined_at: new Date().toISOString(),
        called_at: null,
        completed_at: null,
      });

      const queueEntry2 = await dataService.addDataWithAutoId("queue", {
        patient_ref: `patients/${patient2.id}`,
        queue_number: 2,
        service_ref: `services/${vaccineService.id}`,
        staff_ref: `staff/${nurseReyes.id}`,
        status: "waiting",
        priority_flag: "high",
        estimated_wait_time: "5-10 minutes",
        joined_at: new Date().toISOString(),
        called_at: null,
        completed_at: null,
      });

      // 7. Create Audit Logs for activity tracking
      const auditLog1 = await dataService.addDataWithAutoId("audit_logs", {
        user_ref: `patients/${patient1.id}`,
        action: "patient_registered",
        ip_address: "192.168.1.100",
        user_agent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: new Date().toISOString(),
        details: "Patient registered for general consultation",
      });

      const auditLog2 = await dataService.addDataWithAutoId("audit_logs", {
        user_ref: `staff/${drSantos.id}`,
        action: "appointment_created",
        ip_address: "192.168.1.200",
        user_agent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        timestamp: new Date().toISOString(),
        details: "Appointment scheduled for Juan Carlos Dela Cruz",
      });

      const auditLog3 = await dataService.addDataWithAutoId("audit_logs", {
        user_ref: `patients/${patient3.id}`,
        action: "queue_joined",
        ip_address: "192.168.1.150",
        user_agent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        timestamp: new Date().toISOString(),
        details: "Patient added to queue for pediatric consultation",
      });

      // 8. Update Clinic Settings with real clinic info
      await dataService.setData("clinic/settings", {
        name: "Tonsuya Super Health Center",
        full_address:
          "MX75+6CH, Ortega Street, Tonsuya, Malabon, 1470 Metro Manila, Philippines",
        phone: "(02) 8281-2255",
        mobile: "+63 917 681 8122",
        email: "info@tonsuyaclinic.com",
        website: "www.tonsuyaclinic.com",
        operating_hours: {
          monday: "08:00 AM - 08:00 PM",
          tuesday: "08:00 AM - 08:00 PM",
          wednesday: "08:00 AM - 08:00 PM",
          thursday: "08:00 AM - 08:00 PM",
          friday: "08:00 AM - 08:00 PM",
          saturday: "08:00 AM - 06:00 PM",
          sunday: "Emergency Only",
        },
        services_offered: [
          "General Consultation",
          "Pediatric Care",
          "Vaccination Services",
          "Laboratory Services",
          "Emergency Care",
          "Health Certificates",
          "Minor Surgery",
          "Family Planning",
        ],
        emergency_hotline: "+63 917 681 8122",
        social_media: {
          facebook: "TonsuyaSuperHealthCenter",
          instagram: "@tonsuyaclinic",
        },
        updated_at: new Date().toISOString(),
      });

      setResult(`✅ Complete realistic sample data created successfully!
      
📊 Created Data for Tonsuya Super Health Center:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 5 Services (General, Pediatric, Vaccination, Lab, Emergency)
👨‍⚕️ 4 Staff members (2 Doctors, 2 Nurses) - NO PASSWORDS
🏥 4 Patients with Filipino names and addresses  
📅 3 Appointments scheduled for today
📋 2 Fill-up forms with medical history
⏰ 2 Queue entries with wait times
📝 3 Audit log entries for tracking
🏢 Updated clinic settings with real info

🔗 All references properly linked between collections!
🇵🇭 Data reflects real Filipino clinic context!`);
    } catch (error) {
      setResult(`❌ Error creating sample data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      await dataService.setData("test/connection", {
        message: "Connection test successful!",
        timestamp: new Date().toISOString(),
      });
      setResult("✅ Firebase connection test successful!");
    } catch (error) {
      setResult(`❌ Firebase connection failed: ${error.message}`);
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
            Firebase Data Management
          </h1>

          {/* Auth Status */}
          <div
            className={`p-4 rounded-lg mb-6 ${
              isAuthenticated
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <p className="font-worksans">
              Auth Status:{" "}
              {isAuthenticated ? "✅ Authenticated" : "⚠️ Not Authenticated"}
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-gray-600 mt-2">
                Some operations may require authentication.
                <a
                  href="/firebase-test"
                  className="text-primary hover:underline ml-1"
                >
                  Login here
                </a>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleCreateAdmin}
              disabled={isLoading}
              className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <FaUser className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans font-bold">
                1. Create Admin First!
              </div>
              <div className="text-xs opacity-75">Required for login</div>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <FaDatabase className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">2. Test Connection</div>
            </button>

            <button
              onClick={handleCreateSampleData}
              disabled={isLoading}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <FaPlus className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">3. Create Sample Data</div>
            </button>

            <a
              href="/admin/login"
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              <FaUser className="mx-auto mb-2 text-xl" />
              <div className="text-sm font-worksans">4. Login to Admin</div>
            </a>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
              <h3 className="font-worksans font-bold mb-2">Results:</h3>
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-worksans font-bold text-blue-800 mb-2">
              📋 Quick Setup Steps:
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>
                <strong>🔴 FIRST:</strong> Click "Create Admin First!" to set up
                admin@clinic.com account
              </li>
              <li>Click "Test Connection" to verify Firebase is working</li>
              <li>Click "Create Sample Data" to populate your database</li>
              <li>
                <strong>Now you can login at</strong>{" "}
                <a href="/admin/login" className="underline font-bold">
                  /admin/login
                </a>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-sm font-bold text-blue-800">
                🔑 Admin Login Credentials:
              </p>
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> admin@clinic.com
                <br />
                <strong>Password:</strong> AdminPass123!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
