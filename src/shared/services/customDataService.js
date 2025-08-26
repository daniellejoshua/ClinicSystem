import { ref, set, get, push, remove, update } from "firebase/database";
import { database } from "../config/firebase";
import { getDatabase, ref as dbRef, onValue, off } from "firebase/database";

class CustomDataService {
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

  async createSampleDataWithCustomSchema() {
    try {
      console.log("🏥 Creating custom clinic services only...");
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
      return {
        services: serviceIds,
        summary: {
          totalServices: serviceIds.length,
          databaseCollections: ["services"],
        },
      };
    } catch (error) {
      console.error("❌ Error creating services:", error);
      throw error;
    }
  }

  subscribeToRealtimeData(collection, callback) {
    const db = getDatabase();
    const dbRef = ref(db, collection);

    const listener = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      // Convert object to array with id
      const arr = data
        ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
        : [];
      callback(arr);
    });

    // Return unsubscribe function
    return () => off(dbRef, "value", listener);
  }
}

export default new CustomDataService();
