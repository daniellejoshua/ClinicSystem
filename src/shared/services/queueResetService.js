// Service to handle automatic queue reset at midnight and mark missed appointments
// This service runs automatically to check for appointments that should be marked as missed

import { ref, get, update } from "firebase/database";
import { database } from "../config/firebase";
import authService from "./authService";
import customDataService from "./customDataService";

class QueueResetService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.lastProcessedDate = null;
  }

  // Start the automatic queue reset monitoring
  startAutoResetMonitoring() {
    if (this.isRunning) {
      console.log("Queue reset monitoring already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting automatic queue reset monitoring...");

    // Check immediately on start
    this.checkAndProcessMissedAppointments();

    // Set up interval to check every minute for date changes
    this.intervalId = setInterval(() => {
      this.checkForDateChange();
    }, 60000); // Check every minute

    // Also set up interval to check for missed appointments every hour
    this.hourlyIntervalId = setInterval(() => {
      this.checkAndProcessMissedAppointments();
    }, 3600000); // Check every hour
  }

  // Stop the automatic monitoring
  stopAutoResetMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.hourlyIntervalId) {
      clearInterval(this.hourlyIntervalId);
      this.hourlyIntervalId = null;
    }
    this.isRunning = false;
    console.log("Stopped automatic queue reset monitoring");
  }

  // Check if the date has changed (day transition at midnight)
  checkForDateChange() {
    const currentDate = new Date().toISOString().split("T")[0];

    if (this.lastProcessedDate && this.lastProcessedDate !== currentDate) {
      console.log(
        `Date changed from ${this.lastProcessedDate} to ${currentDate}. Processing missed appointments...`
      );
      this.checkAndProcessMissedAppointments();
    }

    this.lastProcessedDate = currentDate;
  }

  // Main function to check and mark appointments as missed
  async checkAndProcessMissedAppointments() {
    try {
      const today = new Date().toISOString().split("T")[0];
      console.log(`Checking for missed appointments on ${today}...`);

      // First, mark all past queue entries as completed
      await this.markAllPastQueueEntriesAsCompleted(today);

      // Get all appointments from the database
      const appointmentsRef = ref(database, "appointments");
      const appointmentsSnapshot = await get(appointmentsRef);

      if (!appointmentsSnapshot.exists()) {
        console.log("No appointments found in database");
        return { processedCount: 0, message: "No appointments found" };
      }

      const appointments = appointmentsSnapshot.val();
      const appointmentsList = Object.entries(appointments).map(
        ([key, value]) => ({
          id: key,
          ...value,
        })
      );

      let missedCount = 0;
      const currentStaffData = authService.getCurrentStaff();

      // Process each appointment
      for (const appointment of appointmentsList) {
        const shouldMarkAsMissed = await this.shouldMarkAppointmentAsMissed(
          appointment,
          today
        );

        if (shouldMarkAsMissed) {
          try {
            await this.markAppointmentAsMissed(appointment, currentStaffData);
            missedCount++;
            console.log(
              `Marked appointment ${appointment.id} as missed for patient: ${appointment.patient_full_name}`
            );
          } catch (error) {
            console.error(
              `Error marking appointment ${appointment.id} as missed:`,
              error
            );
          }
        }
      }

      const result = {
        processedCount: missedCount,
        message:
          missedCount > 0
            ? `Successfully marked ${missedCount} appointment(s) as missed and completed all past queue entries`
            : "No appointments needed to be marked as missed, but completed all past queue entries",
      };

      console.log(result.message);
      return result;
    } catch (error) {
      console.error("Error in checkAndProcessMissedAppointments:", error);
      return {
        processedCount: 0,
        error: error.message,
        message: "Error processing missed appointments",
      };
    }
  }

  // Mark all past queue entries as completed
  async markAllPastQueueEntriesAsCompleted(currentDate) {
    try {
      console.log(
        `Marking all past queue entries as completed (before ${currentDate})...`
      );

      // Get all queue data
      const queueRef = ref(database, "queue");
      const queueSnapshot = await get(queueRef);

      if (!queueSnapshot.exists()) {
        console.log("No queue data found");
        return { updatedCount: 0 };
      }

      const queueData = queueSnapshot.val();
      let updatedCount = 0;
      const staffData = authService.getCurrentStaff() || {
        id: "system",
        full_name: "System Auto-Process",
      };

      // Process each date's queue entries
      for (const [date, dayQueue] of Object.entries(queueData)) {
        // Only process dates before today
        if (date < currentDate && dayQueue && typeof dayQueue === "object") {
          // Process each queue entry for this date
          for (const [queueId, queueItem] of Object.entries(dayQueue)) {
            // Skip if already completed
            if (queueItem.status !== "completed") {
              try {
                // Update queue entry status
                const queueEntryRef = ref(database, `queue/${date}/${queueId}`);
                await update(queueEntryRef, {
                  status: "completed",
                  updated_at: new Date().toISOString(),
                  completed_by_system: true,
                  completion_reason: "Auto-completed: Queue reset at midnight",
                });

                // Update corresponding appointment if it exists
                if (queueItem.appointment_id) {
                  const appointmentRef = ref(
                    database,
                    `appointments/${queueItem.appointment_id}`
                  );
                  await update(appointmentRef, {
                    status: "completed",
                    updated_at: new Date().toISOString(),
                  });
                }

                updatedCount++;
                console.log(
                  `Completed queue entry ${queueId} from ${date} for patient: ${
                    queueItem.full_name || "Unknown"
                  }`
                );
              } catch (error) {
                console.error(
                  `Error updating queue entry ${queueId} from ${date}:`,
                  error
                );
              }
            }
          }
        }
      }

      // Log the bulk completion action
      if (updatedCount > 0) {
        await customDataService.addDataWithAutoId("audit_logs", {
          user_ref: `staff/${staffData.id}`,
          staff_full_name: staffData.full_name,
          action: `Auto-completed ${updatedCount} past queue entries during system reset`,
          ip_address: "System-Generated",
          timestamp: new Date().toISOString(),
          reason: "Automatic queue reset at midnight",
          affected_count: updatedCount,
        });
      }

      console.log(
        `Successfully marked ${updatedCount} past queue entries as completed`
      );
      return { updatedCount };
    } catch (error) {
      console.error("Error marking past queue entries as completed:", error);
      return { updatedCount: 0, error: error.message };
    }
  }

  // Determine if an appointment should be marked as missed
  async shouldMarkAppointmentAsMissed(appointment, currentDate) {
    // Only process online appointments
    if (appointment.appointment_type !== "online") {
      return false;
    }

    // Skip if already marked as missed, completed, cancelled, or checked in
    if (
      ["missed", "completed", "cancelled", "checked-in"].includes(
        appointment.status
      )
    ) {
      return false;
    }

    // Skip if the patient has already checked in
    if (appointment.checked_in === true) {
      return false;
    }

    // Get the appointment date
    const appointmentDate =
      appointment.preferred_date || appointment.appointment_date;
    if (!appointmentDate) {
      return false;
    }

    // Convert appointment date to YYYY-MM-DD format for comparison
    const appointmentDateString = new Date(appointmentDate)
      .toISOString()
      .split("T")[0];

    // Mark as missed if appointment date is before today and still scheduled
    if (
      appointmentDateString < currentDate &&
      appointment.status === "scheduled"
    ) {
      return true;
    }

    return false;
  }

  // Mark a specific appointment as missed
  async markAppointmentAsMissed(appointment, staffData = null) {
    try {
      const appointmentRef = ref(database, `appointments/${appointment.id}`);

      // Update appointment status
      const updateData = {
        status: "missed",
        updated_at: new Date().toISOString(),
        missed_reason: "Auto-marked: Day reset without check-in",
        missed_by_system: true,
        missed_timestamp: new Date().toISOString(),
      };

      await update(appointmentRef, updateData);

      // Log the action to audit logs
      const staffInfo = staffData || {
        id: "system",
        full_name: "System Auto-Process",
      };

      await customDataService.addDataWithAutoId("audit_logs", {
        user_ref: `staff/${staffInfo.id}`,
        staff_full_name: staffInfo.full_name,
        action: `Auto-marked appointment as missed (day reset): ${
          appointment.patient_full_name
        } - Date: ${
          appointment.preferred_date || appointment.appointment_date
        }`,
        ip_address: "System-Generated",
        timestamp: new Date().toISOString(),
        appointment_id: appointment.id,
        reason: "Automatic processing - day reset without check-in",
      });

      return { success: true };
    } catch (error) {
      console.error("Error marking appointment as missed:", error);
      throw error;
    }
  }

  // Manual function to mark missed appointments for a specific date
  async markMissedAppointmentsForDate(targetDate) {
    try {
      console.log(
        `Manually processing missed appointments for date: ${targetDate}`
      );

      const appointmentsRef = ref(database, "appointments");
      const appointmentsSnapshot = await get(appointmentsRef);

      if (!appointmentsSnapshot.exists()) {
        return { processedCount: 0, message: "No appointments found" };
      }

      const appointments = appointmentsSnapshot.val();
      const appointmentsList = Object.entries(appointments).map(
        ([key, value]) => ({
          id: key,
          ...value,
        })
      );

      let missedCount = 0;
      const currentStaffData = authService.getCurrentStaff();

      // Filter appointments for the target date that should be marked as missed
      for (const appointment of appointmentsList) {
        const appointmentDate =
          appointment.preferred_date || appointment.appointment_date;
        if (!appointmentDate) continue;

        const appointmentDateString = new Date(appointmentDate)
          .toISOString()
          .split("T")[0];

        if (
          appointmentDateString === targetDate &&
          appointment.appointment_type === "online" &&
          appointment.status === "scheduled" &&
          !appointment.checked_in
        ) {
          try {
            await this.markAppointmentAsMissed(appointment, currentStaffData);
            missedCount++;
          } catch (error) {
            console.error(
              `Error marking appointment ${appointment.id} as missed:`,
              error
            );
          }
        }
      }

      return {
        processedCount: missedCount,
        message: `Manually marked ${missedCount} appointment(s) as missed for ${targetDate}`,
      };
    } catch (error) {
      console.error("Error in markMissedAppointmentsForDate:", error);
      return {
        processedCount: 0,
        error: error.message,
        message: "Error processing missed appointments for date",
      };
    }
  }

  // Get statistics about missed appointments
  async getMissedAppointmentStats(dateRange = 7) {
    try {
      const appointmentsRef = ref(database, "appointments");
      const appointmentsSnapshot = await get(appointmentsRef);

      if (!appointmentsSnapshot.exists()) {
        return { totalMissed: 0, recentMissed: 0, autoMissed: 0 };
      }

      const appointments = appointmentsSnapshot.val();
      const appointmentsList = Object.entries(appointments).map(
        ([key, value]) => ({
          id: key,
          ...value,
        })
      );

      const now = new Date();
      const rangeStart = new Date(
        now.getTime() - dateRange * 24 * 60 * 60 * 1000
      );

      const stats = {
        totalMissed: 0,
        recentMissed: 0,
        autoMissed: 0,
        manualMissed: 0,
      };

      appointmentsList.forEach((appointment) => {
        if (appointment.status === "missed") {
          stats.totalMissed++;

          const missedDate = new Date(
            appointment.missed_timestamp || appointment.updated_at
          );
          if (missedDate >= rangeStart) {
            stats.recentMissed++;
          }

          if (appointment.missed_by_system) {
            stats.autoMissed++;
          } else {
            stats.manualMissed++;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting missed appointment stats:", error);
      return {
        totalMissed: 0,
        recentMissed: 0,
        autoMissed: 0,
        manualMissed: 0,
      };
    }
  }

  // Initialize the service (call this when the app starts)
  initialize() {
    console.log("Initializing Queue Reset Service...");
    this.lastProcessedDate = new Date().toISOString().split("T")[0];
    this.startAutoResetMonitoring();
  }

  // Cleanup when service is no longer needed
  cleanup() {
    this.stopAutoResetMonitoring();
  }
}

export default new QueueResetService();
