import emailjs from "emailjs-com";
import dataService from "./dataService";

class AppointmentReminderService {
  constructor() {
    // Initialize EmailJS with your user ID
    emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);
  }

  // Send reminder email to patient
  async sendAppointmentReminder(appointmentData) {
    try {
      const patientEmail =
        appointmentData.patientEmail || appointmentData.email_address;
      const patientName =
        appointmentData.patientName || appointmentData.patient_full_name;

      if (!patientEmail) {
        console.log(
          `⚠️ Skipping reminder for appointment ${appointmentData.id} - no email address`
        );
        return { success: false, reason: "No email address" };
      }

      const templateParams = {
        to_email: patientEmail,
        to_name: patientName,
        patient_name: patientName,
        appointment_date: this.formatDate(
          appointmentData.appointmentDate || appointmentData.preferred_date
        ),
        appointment_time:
          appointmentData.appointmentTime ||
          appointmentData.preferred_time ||
          "To be confirmed",
        service_name: appointmentData.serviceName || "General Consultation",
        clinic_name: "Tonsuya Super Health Center",
        clinic_phone: "(237) 681-812-255",
        clinic_email: "tonsuyasuperhealthcenter499@gmail.com",
        clinic_address: "Ortega St, Malabon, 1470 Metro Manila",
        message:
          "We look forward to seeing you! If you need to reschedule, please call us at the number above.",
      };

      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        "template_5l3g62k",
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      );

      console.log(
        `✅ Reminder sent to ${patientEmail} for appointment ${appointmentData.id}`
      );
      return { success: true, messageId: result.text };
    } catch (error) {
      console.error(
        `❌ Failed to send reminder for appointment ${appointmentData.id}:`,
        error
      );
      return { success: false, error: error.message };
    }
  }

  // Check for appointments that need reminders (1 day before)
  async checkAndSendReminders() {
    try {
      const appointments = await dataService.getAllData("appointments");

      if (!appointments || Object.keys(appointments).length === 0) {
        return 0;
      }

      const appointmentArray = Object.entries(appointments).map(
        ([id, data]) => ({ id, ...data })
      );

      // Calculate tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Find appointments for tomorrow that haven't received reminders
      const appointmentsForTomorrow = appointmentArray.filter((appointment) => {
        const appointmentDate = new Date(
          appointment.preferred_date || appointment.appointmentDate
        );
        appointmentDate.setHours(0, 0, 0, 0);

        return (
          appointmentDate.getTime() === tomorrow.getTime() &&
          !appointment.reminderSent
        );
      });

      if (appointmentsForTomorrow.length === 0) {
        return 0;
      }

      console.log(
        `📧 Sending ${appointmentsForTomorrow.length} appointment reminders for tomorrow...`
      );

      let sentCount = 0;
      for (const appointment of appointmentsForTomorrow) {
        const result = await this.sendAppointmentReminder(appointment);

        if (result.success) {
          // Mark reminder as sent in the database
          await dataService.updateData(`appointments/${appointment.id}`, {
            reminderSent: true,
            reminderSentDate: new Date().toISOString(),
          });
          sentCount++;
        }
      }

      if (sentCount > 0) {
        console.log(`Successfully sent ${sentCount} appointment reminders`);
      }
      return sentCount;
    } catch (error) {
      console.error("Error in automatic reminder check:", error);
      return 0;
    }
  }

  // Schedule automatic reminder check (call this on app startup)
  startAutomaticReminders() {
    console.log("Starting automatic appointment reminder...");

    // Check immediately on startup
    this.checkAndSendReminders();

    // Check every hour (600000 milliseconds)
    const intervalId = setInterval(() => {
      this.checkAndSendReminders();
    }, 60 * 60 * 1000);

    console.log(
      "Reminder system will check every hour for appointments 24 hours in advance"
    );
    return intervalId;
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export const appointmentReminderService = new AppointmentReminderService();
