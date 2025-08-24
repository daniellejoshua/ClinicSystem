import { ref, set, get, push, remove, update } from "firebase/database";
import { database } from "../config/firebase";

class CustomDataService {
  // Basic CRUD operations
  async addDataWithAutoId(collection, data) {
    try {
      const collectionRef = ref(database, collection);
      const newRef = push(collectionRef);

      const dataWithMetadata = {
        ...data,
        created_at: new Date().toISOString(),
      };

      await set(newRef, dataWithMetadata);
      return { id: newRef.key, ...dataWithMetadata };
    } catch (error) {
      console.error(`Error adding data to ${collection}:`, error);
      throw error;
    }
  }

  async getAllData(collection) {
    try {
      const collectionRef = ref(database, collection);
      const snapshot = await get(collectionRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error getting data from ${collection}:`, error);
      throw error;
    }
  }

  async clearAllData() {
    try {
      const rootRef = ref(database);
      await remove(rootRef);
      return true;
    } catch (error) {
      console.error("Error clearing database:", error);
      throw error;
    }
  }

  // Create your exact database schema with YOUR CLINIC SERVICES
  async createSampleDataWithCustomSchema() {
    try {
      console.log("🏥 Creating custom clinic database schema...");

      // 1. Create YOUR SPECIFIC CLINIC SERVICES (11 services)
      const services = [
        {
          service_name: "Medical Checkup",
          description:
            "Comprehensive health assessment and routine medical examination for general health monitoring and preventive care.",
          duration_minutes: 30,
        },
        {
          service_name: "Consultation",
          description:
            "Professional medical consultation for health concerns, symptoms evaluation, and treatment recommendations.",
          duration_minutes: 25,
        },
        {
          service_name: "Maternal and Child Health",
          description:
            "Specialized healthcare services for mothers and children including prenatal care, child development monitoring, and family health guidance.",
          duration_minutes: 45,
        },
        {
          service_name: "Family Planning",
          description:
            "Comprehensive family planning services including contraceptive counseling, reproductive health education, and birth control methods.",
          duration_minutes: 30,
        },
        {
          service_name: "Immunization",
          description:
            "Complete vaccination services for all ages including routine immunizations, travel vaccines, and immunization schedules.",
          duration_minutes: 15,
        },
        {
          service_name: "Senior Citizen Care",
          description:
            "Specialized healthcare services for elderly patients including geriatric assessments, chronic disease management, and wellness programs.",
          duration_minutes: 40,
        },
        {
          service_name: "Wound Care",
          description:
            "Professional wound assessment, cleaning, dressing, and healing management for cuts, injuries, and surgical wounds.",
          duration_minutes: 20,
        },
        {
          service_name: "Follow-Up Visit",
          description:
            "Scheduled follow-up appointments for ongoing treatment monitoring, medication adjustments, and recovery progress evaluation.",
          duration_minutes: 20,
        },
        {
          service_name: "Mental Health",
          description:
            "Mental health consultation and support services including counseling, stress management, and psychological wellness care.",
          duration_minutes: 50,
        },
        {
          service_name: "Medical Certificate",
          description:
            "Issuance of medical certificates for employment, fitness to work, school requirements, and other official documentation needs.",
          duration_minutes: 10,
        },
        {
          service_name: "Other",
          description:
            "Other medical services and specialized care not covered in standard categories, customized to patient needs.",
          duration_minutes: 30,
        },
      ];

      const serviceIds = [];
      for (const service of services) {
        const result = await this.addDataWithAutoId("services", service);
        serviceIds.push(result.id);
      }
      console.log("✅ Services created:", serviceIds.length);

      // 2. Create STAFF (including admin)
      const staff = [
        {
          full_name: "Dr. Maria Santos",
          email: "admin@clinic.com",
          password: "AdminPass123!",
          role: "admin",
        },
        {
          full_name: "Dr. Juan Dela Cruz",
          email: "dr.juan@clinic.com",
          password: "DoctorPass123!",
          role: "doctor",
        },
        {
          full_name: "Dr. Ana Reyes",
          email: "dr.ana@clinic.com",
          password: "DoctorPass123!",
          role: "doctor",
        },
        {
          full_name: "Nurse Carlo Mendoza",
          email: "nurse.carlo@clinic.com",
          password: "NursePass123!",
          role: "nurse",
        },
        {
          full_name: "Nurse Elena Santos",
          email: "nurse.elena@clinic.com",
          password: "NursePass123!",
          role: "nurse",
        },
        {
          full_name: "Receptionist Mark Garcia",
          email: "reception@clinic.com",
          password: "ReceptionPass123!",
          role: "receptionist",
        },
      ];

      const staffIds = [];
      for (const member of staff) {
        const result = await this.addDataWithAutoId("staff", member);
        staffIds.push(result.id);
      }
      console.log("✅ Staff created:", staffIds.length);

      // 3. Create PATIENTS with service references
      const patients = [
        {
          full_name: "Juan Santos",
          email: "juan.santos@email.com",
          phone_number: "+63917123456",
          date_of_birth: "1985-03-15",
          address: "123 Rizal Street, Malabon City, Metro Manila",
          queue_number: 1,
          service_ref: `services/${serviceIds[0]}`, // Medical Checkup
          status: "waiting",
          priority_flag: "normal",
        },
        {
          full_name: "Maria Gonzales",
          email: "maria.gonzales@email.com",
          phone_number: "+63918234567",
          date_of_birth: "1990-07-22",
          address: "456 Del Pilar Street, Malabon City, Metro Manila",
          queue_number: 2,
          service_ref: `services/${serviceIds[2]}`, // Maternal and Child Health
          status: "waiting",
          priority_flag: "high",
        },
        {
          full_name: "Roberto Chen",
          email: "roberto.chen@email.com",
          phone_number: "+63919345678",
          date_of_birth: "1978-11-08",
          address: "789 Flores Street, Malabon City, Metro Manila",
          queue_number: 3,
          service_ref: `services/${serviceIds[4]}`, // Immunization
          status: "completed",
          priority_flag: "normal",
        },
        {
          full_name: "Elena Rodriguez",
          email: "elena.rodriguez@email.com",
          phone_number: "+63921456789",
          date_of_birth: "1955-12-03",
          address: "321 Bonifacio Avenue, Malabon City, Metro Manila",
          queue_number: 4,
          service_ref: `services/${serviceIds[5]}`, // Senior Citizen Care
          status: "scheduled",
          priority_flag: "normal",
        },
      ];

      const patientIds = [];
      for (const patient of patients) {
        const result = await this.addDataWithAutoId("patients", patient);
        patientIds.push(result.id);
      }
      console.log("✅ Patients created:", patientIds.length);

      // 4. Create APPOINTMENTS with references
      const appointments = [
        {
          patient_ref: `patients/${patientIds[0]}`,
          service_ref: `services/${serviceIds[0]}`, // Medical Checkup
          staff_ref: `staff/${staffIds[1]}`, // Dr. Juan
          appointment_date: "2025-08-25",
          appointment_time: "10:00 AM",
          status: "scheduled",
        },
        {
          patient_ref: `patients/${patientIds[1]}`,
          service_ref: `services/${serviceIds[2]}`, // Maternal and Child Health
          staff_ref: `staff/${staffIds[2]}`, // Dr. Ana
          appointment_date: "2025-08-25",
          appointment_time: "11:00 AM",
          status: "confirmed",
        },
        {
          patient_ref: `patients/${patientIds[2]}`,
          service_ref: `services/${serviceIds[4]}`, // Immunization
          staff_ref: `staff/${staffIds[3]}`, // Nurse Carlo
          appointment_date: "2025-08-24",
          appointment_time: "2:00 PM",
          status: "completed",
        },
        {
          patient_ref: `patients/${patientIds[3]}`,
          service_ref: `services/${serviceIds[5]}`, // Senior Citizen Care
          staff_ref: `staff/${staffIds[1]}`, // Dr. Juan
          appointment_date: "2025-08-26",
          appointment_time: "9:00 AM",
          status: "scheduled",
        },
      ];

      const appointmentIds = [];
      for (const appointment of appointments) {
        const result = await this.addDataWithAutoId(
          "appointments",
          appointment
        );
        appointmentIds.push(result.id);
      }
      console.log("✅ Appointments created:", appointmentIds.length);

      // 5. Create FILL_UP_FORMS
      const forms = [
        {
          patient_ref: `patients/${patientIds[0]}`,
          patient_full_name: "Juan Santos",
          patient_birthdate: "1985-03-15",
          patient_sex: "Male",
          reason_for_visit: "Annual medical checkup and health assessment",
          appointment_date: new Date().toISOString(),
          booked_by_name: "Juan Santos",
          relationship_to_patient: "Self",
          contact_number: "+63917123456",
          email_address: "juan.santos@email.com",
          present_checkbox: true,
        },
        {
          patient_ref: `patients/${patientIds[1]}`,
          patient_full_name: "Maria Gonzales",
          patient_birthdate: "1990-07-22",
          patient_sex: "Female",
          reason_for_visit: "Prenatal consultation and child health monitoring",
          appointment_date: new Date().toISOString(),
          booked_by_name: "Maria Gonzales",
          relationship_to_patient: "Self",
          contact_number: "+63918234567",
          email_address: "maria.gonzales@email.com",
          present_checkbox: true,
        },
      ];

      const formIds = [];
      for (const form of forms) {
        const result = await this.addDataWithAutoId("fill_up_forms", form);
        formIds.push(result.id);
      }
      console.log("✅ Fill-up forms created:", formIds.length);

      // 6. Create AUDIT_LOGS
      const auditLogs = [
        {
          user_ref: `staff/${staffIds[0]}`, // Admin
          action: "System setup - Created clinic database with 11 services",
          ip_address: "192.168.1.100",
          timestamp: new Date().toISOString(),
        },
        {
          user_ref: `patients/${patientIds[0]}`,
          action: "Patient registration - Scheduled medical checkup",
          ip_address: "192.168.1.101",
          timestamp: new Date().toISOString(),
        },
        {
          user_ref: `staff/${staffIds[1]}`, // Doctor
          action: "Appointment management - Confirmed patient consultation",
          ip_address: "192.168.1.102",
          timestamp: new Date().toISOString(),
        },
      ];

      const logIds = [];
      for (const log of auditLogs) {
        const result = await this.addDataWithAutoId("audit_logs", log);
        logIds.push(result.id);
      }
      console.log("✅ Audit logs created:", logIds.length);

      return {
        services: serviceIds,
        staff: staffIds,
        patients: patientIds,
        appointments: appointmentIds,
        forms: formIds,
        auditLogs: logIds,
        summary: {
          totalServices: serviceIds.length,
          totalStaff: staffIds.length,
          totalPatients: patientIds.length,
          totalAppointments: appointmentIds.length,
          totalForms: formIds.length,
          totalAuditLogs: logIds.length,
        },
      };
    } catch (error) {
      console.error("❌ Error creating sample data:", error);
      throw error;
    }
  }
}

export default new CustomDataService();
