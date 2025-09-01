// This service manages the general patient queue and appointments
// It handles adding, updating, and checking in patients (online and walk-in)
//
// NOTE: di to parehas ng priorityQueueService wala n kasi q maisip na pangalan

// - queueService: handles basic queue and appointment management
// - priorityQueueService: adds extra logic to sort and manage the queue by priority (emergencies, walk-ins)

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

class QueueService {
  // Add walk-in patient directly to queue
  async addWalkinToQueue(patientData) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const queueNumber = await this.getNextQueueNumber(today);
      let walkinQueueId = queueNumber.toString().padStart(3, "0");

      // Emergency/high priority: assign E- prefix
      if (patientData.priority_flag === "high") {
        walkinQueueId = `E-${walkinQueueId}`;
      }

      let patientId = patientData.id;
      // Only create patient if no id is provided
      if (!patientId) {
        // Only add minimal patient info to 'patients', not queue info
        const patientRecord = {
          full_name: patientData.full_name,
          email: patientData.email,
          phone_number: patientData.phone_number,
          date_of_birth: patientData.date_of_birth || "",
          address: patientData.address || "",
          gender: patientData.gender || "",
          created_at: new Date().toISOString(),
        };
        const patientsRef = ref(database, "patients");
        const newPatientRef = push(patientsRef);
        await set(newPatientRef, patientRecord);
        patientId = newPatientRef.key;
      }

      // Create queue entry
      const queueEntry = {
        queue_number: walkinQueueId,
        patient_id: patientId,
        full_name: patientData.full_name,
        email: patientData.email,
        phone_number: patientData.phone_number,
        appointment_type: "walkin",
        status: "waiting",
        service_ref: patientData.service_ref,
        priority_flag: patientData.priority_flag || "normal",
        arrival_time: new Date().toISOString(),
        booking_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // Add to today's queue
      const todayQueueRef = ref(database, `queue/${today}`);
      let queueSnapshot = await get(todayQueueRef);
      let queueList = [];
      if (queueSnapshot.exists()) {
        queueList = Object.entries(queueSnapshot.val()).map(([key, value]) => ({
          id: key,
          ...value,
        }));
      }

      // If high priority, insert at the very front (above online)
      if (queueEntry.priority_flag === "high") {
        const newQueueRef = push(todayQueueRef);
        await set(newQueueRef, queueEntry);
        queueList.push({ id: newQueueRef.key, ...queueEntry });
        queueList.sort((a, b) => {
          // Emergency/high priority always first
          if (a.priority_flag === "high" && b.priority_flag !== "high")
            return -1;
          if (a.priority_flag !== "high" && b.priority_flag === "high")
            return 1;
          // Online next
          if (
            a.appointment_type === "online" &&
            b.appointment_type !== "online"
          )
            return -1;
          if (
            a.appointment_type !== "online" &&
            b.appointment_type === "online"
          )
            return 1;
          // Then walk-ins by arrival time
          return new Date(a.arrival_time) - new Date(b.arrival_time);
        });
        // Overwrite queue for today with sorted list
        const updates = {};
        queueList.forEach((item) => {
          updates[item.id] = { ...item };
        });
        await set(todayQueueRef, updates);
      } else {
        // Normal priority, just add to queue
        const newQueueRef = push(todayQueueRef);
        await set(newQueueRef, queueEntry);
      }

      return {
        success: true,
        queueNumber: walkinQueueId,
        patientId: patientId,
        message: `Walk-in registered! Your queue number is ${walkinQueueId}`,
      };
    } catch (error) {
      console.error("Error adding walk-in to queue:", error);
      return { success: false, error: error.message };
    }
  }
  // Mark online appointments as no_show if not checked in by end of day
  async markNoShowAppointments(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const appointmentsSnapshot = await get(this.appointmentsRef);

      if (!appointmentsSnapshot.exists()) return;

      const appointments = appointmentsSnapshot.val();
      for (const [key, appointment] of Object.entries(appointments)) {
        if (
          appointment.appointment_type === "online" &&
          appointment.status === "scheduled" &&
          !appointment.checked_in &&
          appointment.preferred_date === targetDate
        ) {
          // Mark as no_show
          const appointmentRef = ref(database, `appointments/${key}`);
          await update(appointmentRef, {
            status: "no_show",
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error marking no show appointments:", error);
    }
  }
  constructor() {
    this.queueRef = ref(database, "queue");
    this.appointmentsRef = ref(database, "appointments");
    this.listeners = new Map();
  }

  // Get next queue number (for both online and walk-in)
  async getNextQueueNumber(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const queueRef = ref(database, `queue/${targetDate}`);
      const snapshot = await get(queueRef);

      if (snapshot.exists()) {
        const queueData = snapshot.val();
        const queueNumbers = Object.values(queueData)
          .filter((item) => item.queue_number)
          .map((item) => {
            // Extract number from queue IDs like "O-001" or "001"
            const match = item.queue_number.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          });

        const maxNumber =
          queueNumbers.length > 0 ? Math.max(...queueNumbers) : 0;
        return maxNumber + 1;
      }

      return 1;
    } catch (error) {
      console.error("Error getting next queue number:", error);
      return 1;
    }
  }

  // Create online appointment (NO queue number yet)
  async createOnlineAppointment(appointmentData) {
    try {
      const appointmentEntry = {
        ...appointmentData,
        appointment_type: "online",
        status: "scheduled", // Not checked in yet
        booked_at: new Date().toISOString(), // Important for priority
        queue_number: null, // NO queue number until check-in
        checked_in: false,
        created_at: new Date().toISOString(),
      };

      const newRef = push(this.appointmentsRef);
      await set(newRef, appointmentEntry);

      return {
        success: true,
        appointmentId: newRef.key,
        message:
          "Appointment booked successfully. You will receive a queue number when you check in at the clinic.",
      };
    } catch (error) {
      console.error("Error creating online appointment:", error);
      return { success: false, error: error.message };
    }
  }

  // Check-in online patient (GET queue number with priority)
  async checkInOnlinePatient(patientInfo) {
    try {
      const today = new Date().toISOString().split("T")[0];
      // ...existing check-in logic...
    } catch (error) {
      console.error("Error checking in online patient:", error);
      return { success: false, error: error.message };
    }
  }

  // Get today's queue with proper priority sorting
  async getTodayQueue(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const todayQueueRef = ref(database, `queue/${targetDate}`);
      const snapshot = await get(todayQueueRef);

      if (!snapshot.exists()) {
        return [];
      }

      const queueData = snapshot.val();
      const queueArray = Object.entries(queueData).map(([key, value]) => ({
        id: key,
        ...value,
      }));

      // Sort by priority: Online patients first (by booking time), then walk-ins (by arrival time)
      return queueArray.sort((a, b) => {
        // Both online - sort by booking time (earlier booking = higher priority)
        if (
          a.appointment_type === "online" &&
          b.appointment_type === "online"
        ) {
          return new Date(a.booked_at) - new Date(b.booked_at);
        }

        // Online vs walk-in - online always first
        if (
          a.appointment_type === "online" &&
          b.appointment_type === "walkin"
        ) {
          return -1;
        }
        if (
          a.appointment_type === "walkin" &&
          b.appointment_type === "online"
        ) {
          return 1;
        }

        // Both walk-in - sort by arrival time
        return new Date(a.arrival_time) - new Date(b.arrival_time);
      });
    } catch (error) {
      console.error("Error getting today's queue:", error);
      return [];
    }
  }

  // Subscribe to real-time queue updates
  subscribeToTodayQueue(callback, date = null) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const todayQueueRef = ref(database, `queue/${targetDate}`);

    const unsubscribe = onValue(todayQueueRef, (snapshot) => {
      if (snapshot.exists()) {
        const queueData = snapshot.val();
        const queueArray = Object.entries(queueData).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        // Sort with priority logic
        const sortedQueue = queueArray.sort((a, b) => {
          // Both online - sort by booking time
          if (
            a.appointment_type === "online" &&
            b.appointment_type === "online"
          ) {
            return new Date(a.booked_at) - new Date(b.booked_at);
          }

          // Online vs walk-in - online first
          if (
            a.appointment_type === "online" &&
            b.appointment_type === "walkin"
          ) {
            return -1;
          }
          if (
            a.appointment_type === "walkin" &&
            b.appointment_type === "online"
          ) {
            return 1;
          }

          // Both walk-in - sort by arrival time
          return new Date(a.arrival_time) - new Date(b.arrival_time);
        });

        callback(sortedQueue);
      } else {
        callback([]);
      }
    });

    this.listeners.set(`queue_${targetDate}`, unsubscribe);
    return () => {
      if (this.listeners.has(`queue_${targetDate}`)) {
        off(todayQueueRef, "value", this.listeners.get(`queue_${targetDate}`));
        this.listeners.delete(`queue_${targetDate}`);
      }
    };
  }

  // Update queue status
  async updateQueueStatus(queueId, newStatus, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const queueItemRef = ref(database, `queue/${targetDate}/${queueId}`);

      await update(queueItemRef, {
        status: newStatus,
        updated_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating queue status:", error);
      return { success: false, error: error.message };
    }
  }

  // Find online appointment for check-in
  async findOnlineAppointment(searchCriteria) {
    try {
      const appointmentsSnapshot = await get(this.appointmentsRef);

      if (!appointmentsSnapshot.exists()) {
        return { success: false, error: "No appointments found" };
      }

      const appointments = appointmentsSnapshot.val();
      const appointmentsList = Object.entries(appointments).map(
        ([key, value]) => ({
          id: key,
          ...value,
        })
      );

      // Search by name, email, or phone
      const found = appointmentsList.filter(
        (appointment) =>
          appointment.appointment_type === "online" &&
          appointment.status === "scheduled" &&
          !appointment.checked_in &&
          (appointment.patient_full_name
            ?.toLowerCase()
            .includes(searchCriteria.toLowerCase()) ||
            appointment.email_address
              ?.toLowerCase()
              .includes(searchCriteria.toLowerCase()) ||
            appointment.contact_number?.includes(searchCriteria))
      );

      return { success: true, appointments: found };
    } catch (error) {
      console.error("Error finding online appointment:", error);
      return { success: false, error: error.message };
    }
  }

  // Get all online appointments for a specific date (from appointments collection)
  async getAllOnlineAppointments(date = null) {
    try {
      const appointmentsRef = ref(database, "appointments");
      const snapshot = await get(appointmentsRef);

      if (!snapshot.exists()) {
        return { success: true, appointments: [] };
      }

      const appointmentsData = snapshot.val();
      const appointments = Object.entries(appointmentsData).map(
        ([key, value]) => ({
          id: key,
          ...value,
        })
      );

      // Helper to get date string
      const getDateString = (d) => {
        if (!d) return "";
        return new Date(d).toISOString().split("T")[0];
      };
      const targetDate = date || new Date().toISOString().split("T")[0];

      // Filter for online appointments for the selected date
      const onlineAppointments = appointments.filter(
        (appointment) =>
          appointment.appointment_type === "online" &&
          getDateString(appointment.preferred_date) === targetDate
      );

      return { success: true, appointments: onlineAppointments };
    } catch (error) {
      console.error("Error getting all online appointments:", error);
      return { success: false, error: error.message };
    }
  }

  // Remove from queue
  async removeFromQueue(queueId, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const queueItemRef = ref(database, `queue/${targetDate}/${queueId}`);
      await remove(queueItemRef);
      return { success: true };
    } catch (error) {
      console.error("Error removing from queue:", error);
      return { success: false, error: error.message };
    }
  }

  // Get queue statistics
  async getQueueStats(date = null) {
    try {
      const queue = await this.getTodayQueue(date);

      const stats = {
        total: queue.length,
        waiting: queue.filter((q) => q.status === "waiting").length,
        inProgress: queue.filter((q) => q.status === "in-progress").length,
        completed: queue.filter((q) => q.status === "completed").length,
        online: queue.filter((q) => q.appointment_type === "online").length,
        walkin: queue.filter((q) => q.appointment_type === "walkin").length,
      };

      return { success: true, stats };
    } catch (error) {
      console.error("Error getting queue stats:", error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  async addToQueue(patientData) {
    // Convert old format to new walk-in format
    return await this.addWalkinToQueue({
      full_name: patientData.name,
      email: patientData.email,
      phone_number: patientData.phone,
      service_ref: patientData.service || "General Consultation",
    });
  }

  onQueueUpdate(callback) {
    return this.subscribeToTodayQueue(callback);
  }

  async getCurrentQueue() {
    return await this.getTodayQueue();
  }
}

export default new QueueService();
