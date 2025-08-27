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

      // Find the appointment
      const appointmentsSnapshot = await get(this.appointmentsRef);
      let foundAppointment = null;
      let appointmentKey = null;

      if (appointmentsSnapshot.exists()) {
        const appointments = appointmentsSnapshot.val();

        for (const [key, appointment] of Object.entries(appointments)) {
          if (
            appointment.patient_full_name === patientInfo.patient_full_name &&
            appointment.email_address === patientInfo.email_address &&
            appointment.appointment_type === "online" &&
            appointment.status === "scheduled" &&
            !appointment.checked_in
          ) {
            foundAppointment = appointment;
            appointmentKey = key;
            break;
          }
        }
      }

      if (!foundAppointment) {
        return {
          success: false,
          error: "Online appointment not found or already checked in",
        };
      }

      // Get next queue number with priority positioning
      const queueNumber = await this.getNextQueueNumber(today);
      const priorityQueueId = `O-${queueNumber.toString().padStart(3, "0")}`;

      // Add to active queue with priority
      const queueEntry = {
        queue_number: priorityQueueId,
        appointment_id: appointmentKey,
        patient_name: foundAppointment.patient_full_name,
        email: foundAppointment.email_address,
        phone: foundAppointment.contact_number,
        appointment_type: "online",
        status: "waiting",
        service_requested: foundAppointment.service_ref,
        booked_at: foundAppointment.booked_at, // For priority sorting
        arrival_time: new Date().toISOString(),
        checked_in_at: new Date().toISOString(),
        priority: "online", // Higher priority than walk-ins
        created_at: new Date().toISOString(),
      };

      // Add to today's queue
      const todayQueueRef = ref(database, `queue/${today}`);
      const newQueueRef = push(todayQueueRef);
      await set(newQueueRef, queueEntry);

      // Update appointment status
      const appointmentRef = ref(database, `appointments/${appointmentKey}`);
      await update(appointmentRef, {
        status: "checked-in",
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        queue_number: priorityQueueId,
      });

      return {
        success: true,
        queueNumber: priorityQueueId,
        message: `Successfully checked in! Your priority queue number is ${priorityQueueId}`,
      };
    } catch (error) {
      console.error("Error checking in online patient:", error);
      return { success: false, error: error.message };
    }
  }

  // Add walk-in patient directly to queue
  async addWalkinToQueue(patientData) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const queueNumber = await this.getNextQueueNumber(today);
      const walkinQueueId = queueNumber.toString().padStart(3, "0");

      const queueEntry = {
        queue_number: walkinQueueId,
        patient_name: patientData.full_name,
        email: patientData.email,
        phone: patientData.phone_number,
        appointment_type: "walkin",
        status: "waiting",
        service_requested: patientData.service_ref,
        arrival_time: new Date().toISOString(),
        priority: "normal", // Normal priority
        created_at: new Date().toISOString(),
      };

      // Add to today's queue
      const todayQueueRef = ref(database, `queue/${today}`);
      const newQueueRef = push(todayQueueRef);
      await set(newQueueRef, queueEntry);

      return {
        success: true,
        queueNumber: walkinQueueId,
        message: `Walk-in registered! Your queue number is ${walkinQueueId}`,
      };
    } catch (error) {
      console.error("Error adding walk-in to queue:", error);
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
}

export default new QueueService();
