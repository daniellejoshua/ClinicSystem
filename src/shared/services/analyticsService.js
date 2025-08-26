import { ref, onValue, off } from "firebase/database";
import { database } from "../config/firebase";
import dataService from "./dataService";

class AnalyticsService {
  constructor() {
    this.listeners = new Map();
  }

  // Get real-time appointment analytics
  subscribeToAppointmentAnalytics(callback) {
    const appointmentsRef = ref(database, "appointments");
    const patientsRef = ref(database, "patients");

    const unsubscribe = onValue(appointmentsRef, async () => {
      try {
        const analytics = await this.calculateAppointmentAnalytics();
        callback(analytics);
      } catch (error) {
        console.error("Error calculating analytics:", error);
      }
    });

    this.listeners.set("appointments", unsubscribe);
    return () => {
      if (this.listeners.has("appointments")) {
        off(appointmentsRef, "value", this.listeners.get("appointments"));
        this.listeners.delete("appointments");
      }
    };
  }

  // Calculate appointment analytics from database
  async calculateAppointmentAnalytics() {
    try {
      const [appointments, patients] = await Promise.all([
        dataService.getAllData("appointments"),
        dataService.getAllData("patients"),
      ]);

      // Separate online vs walk-in appointments
      const onlineAppointments = appointments.filter(
        (apt) => apt.appointment_type === "online"
      );
      const walkinAppointments = appointments.filter(
        (apt) => apt.appointment_type === "walkin" || !apt.appointment_type
      );

      // Also check patients table for appointment types
      const onlinePatients = patients.filter(
        (p) => p.appointment_type === "online"
      );
      const walkinPatients = patients.filter(
        (p) => p.appointment_type === "walkin" || !p.appointment_type
      );

      // Generate time-based analytics
      const analytics = {
        "7days": this.generateWeeklyData(appointments, patients),
        "30days": this.generateMonthlyData(appointments, patients),
        "3months": this.generateQuarterlyData(appointments, patients),
        all: this.generateYearlyData(appointments, patients),
      };

      // Current totals
      const totals = {
        totalOnline: onlineAppointments.length + onlinePatients.length,
        totalWalkin: walkinAppointments.length + walkinPatients.length,
        totalAppointments: appointments.length + patients.length,
        waitingPatients: patients.filter((p) => p.status === "waiting").length,
      };

      return { analytics, totals };
    } catch (error) {
      console.error("Error calculating appointment analytics:", error);
      return this.getDefaultAnalytics();
    }
  }

  // Generate weekly data (last 7 days)
  generateWeeklyData(appointments, patients) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

      const dayAppointments = this.getAppointmentsForDate(
        appointments,
        patients,
        date
      );

      weekData.push({
        period: dayName,
        online: dayAppointments.online,
        walkin: dayAppointments.walkin,
      });
    }

    return weekData;
  }

  // Generate monthly data (last 4 weeks)
  generateMonthlyData(appointments, patients) {
    const weekData = [];

    for (let i = 3; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i + 1) * 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - i * 7);

      const weekAppointments = this.getAppointmentsForDateRange(
        appointments,
        patients,
        startDate,
        endDate
      );

      weekData.push({
        period: `Week ${4 - i}`,
        online: weekAppointments.online,
        walkin: weekAppointments.walkin,
      });
    }

    return weekData;
  }

  // Generate quarterly data (last 6 months)
  generateQuarterlyData(appointments, patients) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = months[date.getMonth()];

      const monthAppointments = this.getAppointmentsForMonth(
        appointments,
        patients,
        date
      );

      monthData.push({
        period: monthName,
        online: monthAppointments.online,
        walkin: monthAppointments.walkin,
      });
    }

    return monthData;
  }

  // Generate yearly data (last 6 quarters)
  generateYearlyData(appointments, patients) {
    const quarterData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i * 3);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;

      const quarterAppointments = this.getAppointmentsForQuarter(
        appointments,
        patients,
        year,
        quarter
      );

      quarterData.push({
        period: `Q${quarter} ${year}`,
        online: quarterAppointments.online,
        walkin: quarterAppointments.walkin,
      });
    }

    return quarterData;
  }

  // Helper functions for date filtering
  getAppointmentsForDate(appointments, patients, targetDate) {
    const dateStr = targetDate.toISOString().split("T")[0];

    const dayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.created_at).toISOString().split("T")[0];
      return aptDate === dateStr;
    });

    const dayPatients = patients.filter((patient) => {
      const patientDate = new Date(patient.created_at)
        .toISOString()
        .split("T")[0];
      return patientDate === dateStr;
    });

    return {
      online:
        dayAppointments.filter((apt) => apt.appointment_type === "online")
          .length +
        dayPatients.filter((p) => p.appointment_type === "online").length,
      walkin:
        dayAppointments.filter(
          (apt) => apt.appointment_type === "walkin" || !apt.appointment_type
        ).length +
        dayPatients.filter(
          (p) => p.appointment_type === "walkin" || !p.appointment_type
        ).length,
    };
  }

  getAppointmentsForDateRange(appointments, patients, startDate, endDate) {
    const rangeAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.created_at);
      return aptDate >= startDate && aptDate < endDate;
    });

    const rangePatients = patients.filter((patient) => {
      const patientDate = new Date(patient.created_at);
      return patientDate >= startDate && patientDate < endDate;
    });

    return {
      online:
        rangeAppointments.filter((apt) => apt.appointment_type === "online")
          .length +
        rangePatients.filter((p) => p.appointment_type === "online").length,
      walkin:
        rangeAppointments.filter(
          (apt) => apt.appointment_type === "walkin" || !apt.appointment_type
        ).length +
        rangePatients.filter(
          (p) => p.appointment_type === "walkin" || !p.appointment_type
        ).length,
    };
  }

  getAppointmentsForMonth(appointments, patients, targetDate) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const monthAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.created_at);
      return aptDate.getFullYear() === year && aptDate.getMonth() === month;
    });

    const monthPatients = patients.filter((patient) => {
      const patientDate = new Date(patient.created_at);
      return (
        patientDate.getFullYear() === year && patientDate.getMonth() === month
      );
    });

    return {
      online:
        monthAppointments.filter((apt) => apt.appointment_type === "online")
          .length +
        monthPatients.filter((p) => p.appointment_type === "online").length,
      walkin:
        monthAppointments.filter(
          (apt) => apt.appointment_type === "walkin" || !apt.appointment_type
        ).length +
        monthPatients.filter(
          (p) => p.appointment_type === "walkin" || !p.appointment_type
        ).length,
    };
  }

  getAppointmentsForQuarter(appointments, patients, year, quarter) {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 3;

    const quarterAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.created_at);
      return (
        aptDate.getFullYear() === year &&
        aptDate.getMonth() >= startMonth &&
        aptDate.getMonth() < endMonth
      );
    });

    const quarterPatients = patients.filter((patient) => {
      const patientDate = new Date(patient.created_at);
      return (
        patientDate.getFullYear() === year &&
        patientDate.getMonth() >= startMonth &&
        patientDate.getMonth() < endMonth
      );
    });

    return {
      online:
        quarterAppointments.filter((apt) => apt.appointment_type === "online")
          .length +
        quarterPatients.filter((p) => p.appointment_type === "online").length,
      walkin:
        quarterAppointments.filter(
          (apt) => apt.appointment_type === "walkin" || !apt.appointment_type
        ).length +
        quarterPatients.filter(
          (p) => p.appointment_type === "walkin" || !p.appointment_type
        ).length,
    };
  }

  // Default analytics for fallback
  getDefaultAnalytics() {
    return {
      analytics: {
        "7days": [
          { period: "Mon", online: 0, walkin: 0 },
          { period: "Tue", online: 0, walkin: 0 },
          { period: "Wed", online: 0, walkin: 0 },
          { period: "Thu", online: 0, walkin: 0 },
          { period: "Fri", online: 0, walkin: 0 },
          { period: "Sat", online: 0, walkin: 0 },
          { period: "Sun", online: 0, walkin: 0 },
        ],
        "30days": [
          { period: "Week 1", online: 0, walkin: 0 },
          { period: "Week 2", online: 0, walkin: 0 },
          { period: "Week 3", online: 0, walkin: 0 },
          { period: "Week 4", online: 0, walkin: 0 },
        ],
        "3months": [
          { period: "January", online: 0, walkin: 0 },
          { period: "February", online: 0, walkin: 0 },
          { period: "March", online: 0, walkin: 0 },
          { period: "April", online: 0, walkin: 0 },
          { period: "May", online: 0, walkin: 0 },
          { period: "June", online: 0, walkin: 0 },
        ],
        all: [
          { period: "Q1 2024", online: 0, walkin: 0 },
          { period: "Q2 2024", online: 0, walkin: 0 },
          { period: "Q3 2024", online: 0, walkin: 0 },
          { period: "Q4 2024", online: 0, walkin: 0 },
          { period: "Q1 2025", online: 0, walkin: 0 },
          { period: "Q2 2025", online: 0, walkin: 0 },
        ],
      },
      totals: {
        totalOnline: 0,
        totalWalkin: 0,
        totalAppointments: 0,
        waitingPatients: 0,
      },
    };
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
    });
    this.listeners.clear();
  }
}

export default new AnalyticsService();
