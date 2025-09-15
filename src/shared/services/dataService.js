import {
  ref,
  set,
  get,
  push,
  remove,
  update,
  onValue,
  off,
} from "firebase/database";
import { database } from "../config/firebase";

class DataService {
  // Create data with auto-generated ID
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

  // Create data with specific ID
  async setData(path, data) {
    try {
      const dataRef = ref(database, path);
      const dataWithMetadata = {
        ...data,
        created_at: data.created_at || new Date().toISOString(),
      };

      await set(dataRef, dataWithMetadata);
      return dataWithMetadata;
    } catch (error) {
      console.error(`Error setting data at ${path}:`, error);
      throw error;
    }
  }

  // Get all data from a collection
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

  // Get single data by path
  async getData(path) {
    try {
      const dataRef = ref(database, path);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error(`Error getting data from ${path}:`, error);
      throw error;
    }
  }

  // Update data
  async updateData(path, updates) {
    try {
      const dataRef = ref(database, path);
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await update(dataRef, updatesWithTimestamp);
      return updatesWithTimestamp;
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      throw error;
    }
  }

  // Delete data
  async deleteData(path) {
    try {
      const dataRef = ref(database, path);
      await remove(dataRef);
      return true;
    } catch (error) {
      console.error(`Error deleting data at ${path}:`, error);
      throw error;
    }
  }

  // Sample data creation methods matching your exact schema

  async createSampleServices() {
    const services = [
      {
        service_name: "General Consultation",
        description:
          "Comprehensive health check-up and consultation with our general practitioners",
        duration_minutes: 30,
      },
      {
        service_name: "Pediatric Care",
        description:
          "Specialized medical care for infants, children, and adolescents",
        duration_minutes: 45,
      },
      {
        service_name: "Vaccination Services",
        description:
          "Complete vaccination programs for all ages including travel vaccines",
        duration_minutes: 15,
      },
      {
        service_name: "Laboratory Services",
        description:
          "Complete blood tests, urinalysis, and diagnostic laboratory services",
        duration_minutes: 20,
      },
      {
        service_name: "Emergency Care",
        description:
          "24/7 emergency medical services for urgent health conditions",
        duration_minutes: 60,
      },
    ];

    const serviceIds = [];
    for (const service of services) {
      const result = await this.addDataWithAutoId("services", service);
      serviceIds.push(result.id);
    }
    return serviceIds;
  }

  async createSampleStaff() {
    // WARNING: This creates sample staff accounts. Only use for development/testing.
    // For production, staff accounts should be created manually through the admin interface.
    console.warn(
      "⚠️ Creating sample staff accounts. This should only be used for development/testing!"
    );

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
        full_name: "Nurse Ana Reyes",
        email: "nurse.ana@clinic.com",
        password: "NursePass123!",
        role: "nurse",
      },
      {
        full_name: "Receptionist Carlo Mendoza",
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
    return staffIds;
  }

  async createSamplePatients(serviceIds) {
    const patients = [
      {
        full_name: "Juan Santos",
        email: "juan.santos@email.com",
        phone_number: "+63917123456",
        date_of_birth: "1985-03-15",
        address: "123 Rizal Street, Malabon City, Metro Manila",
        queue_number: 1,
        service_ref: `services/${serviceIds[0]}`, // General Consultation
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
        service_ref: `services/${serviceIds[1]}`, // Pediatric Care
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
        service_ref: `services/${serviceIds[2]}`, // Vaccination
        status: "completed",
        priority_flag: "normal",
      },
    ];

    const patientIds = [];
    for (const patient of patients) {
      const result = await this.addDataWithAutoId("patients", patient);
      patientIds.push(result.id);
    }
    return patientIds;
  }

  async createSampleAppointments(patientIds, serviceIds, staffIds) {
    const appointments = [
      {
        patient_ref: `patients/${patientIds[0]}`,
        service_ref: `services/${serviceIds[0]}`,
        staff_ref: `staff/${staffIds[1]}`, // Dr. Juan
        appointment_date: "2025-08-25",
        appointment_time: "10:00 AM",
        status: "scheduled",
      },
      {
        patient_ref: `patients/${patientIds[1]}`,
        service_ref: `services/${serviceIds[1]}`,
        staff_ref: `staff/${staffIds[1]}`, // Dr. Juan
        appointment_date: "2025-08-25",
        appointment_time: "11:00 AM",
        status: "confirmed",
      },
      {
        patient_ref: `patients/${patientIds[2]}`,
        service_ref: `services/${serviceIds[2]}`,
        staff_ref: `staff/${staffIds[2]}`, // Nurse Ana
        appointment_date: "2025-08-24",
        appointment_time: "2:00 PM",
        status: "completed",
      },
    ];

    const appointmentIds = [];
    for (const appointment of appointments) {
      const result = await this.addDataWithAutoId("appointments", appointment);
      appointmentIds.push(result.id);
    }
    return appointmentIds;
  }

  async createSampleAuditLogs(staffIds, patientIds) {
    const auditLogs = [
      {
        user_ref: `staff/${staffIds[0]}`, // Admin
        action: "Created patient record",
        ip_address: "192.168.1.100",
        timestamp: new Date().toISOString(),
      },
      {
        user_ref: `patients/${patientIds[0]}`,
        action: "Joined queue for consultation",
        ip_address: "192.168.1.101",
        timestamp: new Date().toISOString(),
      },
      {
        user_ref: `staff/${staffIds[1]}`, // Doctor
        action: "Updated appointment status",
        ip_address: "192.168.1.102",
        timestamp: new Date().toISOString(),
      },
    ];

    const logIds = [];
    for (const log of auditLogs) {
      const result = await this.addDataWithAutoId("audit_logs", log);
      logIds.push(result.id);
    }
    return logIds;
  }

  async createSampleFillUpForms(patientIds) {
    const forms = [
      {
        patient_ref: `patients/${patientIds[0]}`,
        patient_full_name: "Juan Santos",
        patient_birthdate: "1985-03-15",
        patient_sex: "Male",
        reason_for_visit: "Regular check-up and health consultation",
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
        reason_for_visit: "Pediatric consultation for child",
        appointment_date: new Date().toISOString(),
        booked_by_name: "Maria Gonzales",
        relationship_to_patient: "Mother",
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
    return formIds;
  }

  // Create all sample data matching your exact database design
  // WARNING: This function creates sample data including staff accounts.
  // This should ONLY be called manually from the Data Management page for development/testing.
  // NEVER call this automatically on app startup in production.
  async createAllSampleData() {
    try {
      console.warn(
        "⚠️ CREATING SAMPLE DATA - This should only be used for development/testing!"
      );
      console.log("🏥 Creating clinic sample data...");

      // Create services first (needed for references)
      const serviceIds = await this.createSampleServices();
      console.log("✅ Services created:", serviceIds.length);

      // Create staff (including admin) - WARNING: Creates test accounts
      const staffIds = await this.createSampleStaff();
      console.log("✅ Staff created:", staffIds.length);

      // Create patients with service references
      const patientIds = await this.createSamplePatients(serviceIds);
      console.log("✅ Patients created:", patientIds.length);

      // Create appointments with all references
      const appointmentIds = await this.createSampleAppointments(
        patientIds,
        serviceIds,
        staffIds
      );
      console.log("✅ Appointments created:", appointmentIds.length);

      // Create audit logs
      const auditLogIds = await this.createSampleAuditLogs(
        staffIds,
        patientIds
      );
      console.log("✅ Audit logs created:", auditLogIds.length);

      // Create fill-up forms
      const formIds = await this.createSampleFillUpForms(patientIds);
      console.log("✅ Fill-up forms created:", formIds.length);

      return {
        services: serviceIds,
        staff: staffIds,
        patients: patientIds,
        appointments: appointmentIds,
        auditLogs: auditLogIds,
        forms: formIds,
      };
    } catch (error) {
      console.error("❌ Error creating sample data:", error);
      throw error;
    }
  }
}

export default new DataService();
