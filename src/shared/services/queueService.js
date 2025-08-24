import {
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  get,
} from "firebase/database";
import { database } from "../config/firebase";

class QueueService {
  // Add patient to queue
  async addToQueue(patientData) {
    try {
      const queueRef = ref(database, "queue");
      const newQueueRef = push(queueRef);

      const queueNumber = await this.generateQueueNumber();
      const estimatedWait = await this.calculateWaitTime();

      const queueEntry = {
        id: newQueueRef.key,
        patientId: patientData.patientId,
        patientName: patientData.name,
        patientEmail: patientData.email,
        queueNumber: queueNumber,
        status: "waiting",
        timestamp: Date.now(),
        estimatedWait: estimatedWait,
        createdAt: new Date().toISOString(),
      };

      await set(newQueueRef, queueEntry);
      return queueEntry;
    } catch (error) {
      throw new Error("Failed to add to queue: " + error.message);
    }
  }

  // Listen to all queue updates (for admin)
  onQueueUpdate(callback) {
    const queueRef = ref(database, "queue");
    return onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      const queueArray = data
        ? Object.values(data).sort((a, b) => a.timestamp - b.timestamp)
        : [];
      callback(queueArray);
    });
  }

  // Listen to specific patient's queue status (for client)
  onPatientQueueUpdate(patientId, callback) {
    const queueRef = ref(database, "queue");
    return onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patientQueue = Object.values(data).find(
          (item) => item.patientId === patientId && item.status !== "completed"
        );
        callback(patientQueue || null);
      } else {
        callback(null);
      }
    });
  }

  // Admin: Call next patient
  async callNextPatient() {
    try {
      const queueRef = ref(database, "queue");
      const snapshot = await get(queueRef);

      const data = snapshot.val();
      if (data) {
        const waitingPatients = Object.entries(data)
          .filter(([key, patient]) => patient.status === "waiting")
          .sort((a, b) => a[1].timestamp - b[1].timestamp);

        if (waitingPatients.length > 0) {
          const [patientKey, patientData] = waitingPatients[0];
          await update(ref(database, `queue/${patientKey}`), {
            status: "serving",
            calledAt: Date.now(),
          });
          return patientData;
        }
      }
      return null;
    } catch (error) {
      throw new Error("Failed to call next patient: " + error.message);
    }
  }

  // Admin: Complete patient service
  async completePatient(patientId) {
    try {
      const queueRef = ref(database, "queue");
      const snapshot = await get(queueRef);

      const data = snapshot.val();
      if (data) {
        const patientEntry = Object.entries(data).find(
          ([key, patient]) => patient.patientId === patientId
        );

        if (patientEntry) {
          const [patientKey] = patientEntry;
          await remove(ref(database, `queue/${patientKey}`));
        }
      }
    } catch (error) {
      throw new Error("Failed to complete patient: " + error.message);
    }
  }

  // Get current queue status
  async getCurrentQueue() {
    try {
      const queueRef = ref(database, "queue");
      const snapshot = await get(queueRef);
      const data = snapshot.val();

      if (data) {
        return Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
      }
      return [];
    } catch (error) {
      throw new Error("Failed to get queue: " + error.message);
    }
  }

  // Generate queue number
  async generateQueueNumber() {
    try {
      const today = new Date().toDateString();
      const counterRef = ref(
        database,
        `counters/${today.replace(/\s+/g, "-")}`
      );

      const snapshot = await get(counterRef);
      const currentCount = snapshot.val() || 0;
      const newCount = currentCount + 1;

      await set(counterRef, newCount);
      return newCount;
    } catch (error) {
      console.error("Error generating queue number:", error);
      return Date.now() % 1000; // Fallback
    }
  }

  // Calculate estimated wait time
  async calculateWaitTime() {
    try {
      const queueRef = ref(database, "queue");
      const snapshot = await get(queueRef);

      const data = snapshot.val();
      const waitingCount = data
        ? Object.values(data).filter((p) => p.status === "waiting").length
        : 0;

      // Assume 15 minutes per patient
      const estimatedMinutes = waitingCount * 15;
      return estimatedMinutes;
    } catch (error) {
      console.error("Error calculating wait time:", error);
      return 0; // Fallback
    }
  }

  // Remove patient from queue
  async removeFromQueue(patientId) {
    try {
      const queueRef = ref(database, "queue");
      const snapshot = await get(queueRef);

      const data = snapshot.val();
      if (data) {
        const patientEntry = Object.entries(data).find(
          ([key, patient]) => patient.patientId === patientId
        );

        if (patientEntry) {
          const [patientKey] = patientEntry;
          await remove(ref(database, `queue/${patientKey}`));
          return true;
        }
      }
      return false;
    } catch (error) {
      throw new Error("Failed to remove from queue: " + error.message);
    }
  }
}

export default new QueueService();
