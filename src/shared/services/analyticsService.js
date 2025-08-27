import { ref, onValue, off, get } from "firebase/database";
import { database } from "../config/firebase";
import customDataService from "./customDataService";

class AnalyticsService {
  constructor() {
    this.listeners = new Map();
  }

  // This function subscribes to real-time updates for appointments and today's queue
  // Step by step:
  // 1. Set up listeners for changes in the appointments and queue data in Firebase
  // 2. When data changes, call calculateAppointmentAnalytics to process the latest stats
  // 3. Pass the analytics results to the callback so the dashboard can update
  // 4. Returns a cleanup function to remove listeners when no longer needed
  // Get real-time appointment analytics
  subscribeToAppointmentAnalytics(callback) {
    const appointmentsRef = ref(database, "appointments");
    const today = new Date().toISOString().split("T")[0];
    const queueRef = ref(database, `queue/${today}`);

    // Subscribe to both appointments and today's queue
    const appointmentsUnsubscribe = onValue(appointmentsRef, async () => {
      try {
        const analytics = await this.calculateAppointmentAnalytics();
        callback(analytics);
      } catch (error) {
        console.error("Error calculating analytics:", error);
        callback(this.getDefaultAnalytics());
      }
    });

    const queueUnsubscribe = onValue(queueRef, async () => {
      try {
        const analytics = await this.calculateAppointmentAnalytics();
        callback(analytics);
      } catch (error) {
        console.error("Error calculating analytics:", error);
        callback(this.getDefaultAnalytics());
      }
    });

    this.listeners.set("appointments", appointmentsUnsubscribe);
    this.listeners.set("queue", queueUnsubscribe);

    return () => {
      if (this.listeners.has("appointments")) {
        off(appointmentsRef, "value", this.listeners.get("appointments"));
        this.listeners.delete("appointments");
      }
      if (this.listeners.has("queue")) {
        off(queueRef, "value", this.listeners.get("queue"));
        this.listeners.delete("queue");
      }
    };
  }

  // This function calculates analytics for appointments
  // Step by step:
  // 1. Get all appointments and patients from the database
  // 2. Get today's queue data to count waiting patients
  // 3. Organize queue data into an array for easy processing
  // 4. Separate online and walk-in appointments
  // 5. Find walk-in patients from both appointments and patients collections
  // 6. Also count queue data for today's statistics
  // 7. Combine all walk-ins for chart analytics
  // 8. Generate time-based analytics using merged data
  // 9. Calculate current totals including both appointments, patients, and current queue
  // 10. Return the analytics and totals for use in the dashboard
  // Calculate appointment analytics from database
  async calculateAppointmentAnalytics() {
    try {
      // Get all appointments and all patients
      const appointments = await customDataService.getAllData("appointments");
      const patients = await customDataService.getAllData("patients");

      // Get current queue data to count waiting patients
      const today = new Date().toISOString().split("T")[0];
      const queueRef = ref(database, `queue/${today}`);
      const queueSnapshot = await get(queueRef);

      let queueArray = [];
      if (queueSnapshot.exists()) {
        const todayQueue = queueSnapshot.val();
        queueArray = Object.values(todayQueue);
      }

      // Merge walk-in patients from both appointments and patients collections
      const onlineAppointments = appointments.filter(
        (apt) => apt.appointment_type === "online"
      );
      const walkinAppointments = appointments.filter(
        (apt) => apt.appointment_type === "walkin"
      );
      const walkinPatients = (patients || []).filter(
        (p) => p.appointment_type === "walkin"
      );

      // Also count queue data for today's statistics
      const onlineInQueue = queueArray.filter(
        (q) => q.appointment_type === "online"
      );
      const walkinInQueue = queueArray.filter(
        (q) => q.appointment_type === "walkin"
      );

      // Combine all walk-ins for chart analytics
      const allWalkins = [...walkinAppointments, ...walkinPatients];
      const allAppointmentsForChart = [...appointments, ...walkinPatients];

      // Generate time-based analytics using merged data
      const analytics = {
        "7days": this.generateWeeklyData(allAppointmentsForChart),
        "30days": this.generateMonthlyData(allAppointmentsForChart),
        "3months": this.generateQuarterlyData(allAppointmentsForChart),
        all: this.generateYearlyData(allAppointmentsForChart),
      };

      // Current totals including both appointments, patients, and current queue
      const totals = {
        totalOnline: onlineAppointments.length + onlineInQueue.length,
        totalWalkin: allWalkins.length + walkinInQueue.length,
        totalAppointments: allAppointmentsForChart.length + queueArray.length,
        waitingPatients: queueArray.filter((q) => q.status === "waiting")
          .length,
      };

      return { analytics, totals };
    } catch (error) {
      console.error("Error calculating appointment analytics:", error);
      return this.getDefaultAnalytics();
    }
  }

  // Generate weekly data (last 7 days)
  generateWeeklyData(appointments) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

      const dayAppointments = this.getAppointmentsForDate(appointments, date);

      weekData.push({
        period: dayName,
        online: dayAppointments.online,
        walkin: dayAppointments.walkin,
      });
    }

    return weekData;
  }

  // Generate monthly data (last 4 weeks)
  generateMonthlyData(appointments) {
    const weekData = [];

    for (let i = 3; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i + 1) * 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - i * 7);

      const weekAppointments = this.getAppointmentsForDateRange(
        appointments,
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
  generateQuarterlyData(appointments) {
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
  generateYearlyData(appointments) {
    const quarterData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i * 3);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;

      const quarterAppointments = this.getAppointmentsForQuarter(
        appointments,
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
  getAppointmentsForDate(appointments, targetDate) {
    const dateStr = targetDate.toISOString().split("T")[0];

    const dayAppointments = appointments.filter((apt) => {
      const aptDate = apt.created_at
        ? new Date(apt.created_at).toISOString().split("T")[0]
        : apt.booked_at
        ? new Date(apt.booked_at).toISOString().split("T")[0]
        : null;
      return aptDate === dateStr;
    });

    return {
      online: dayAppointments.filter((apt) => apt.appointment_type === "online")
        .length,
      walkin: dayAppointments.filter((apt) => apt.appointment_type === "walkin")
        .length,
    };
  }

  getAppointmentsForDateRange(appointments, startDate, endDate) {
    const rangeAppointments = appointments.filter((apt) => {
      const aptDate = apt.created_at
        ? new Date(apt.created_at)
        : apt.booked_at
        ? new Date(apt.booked_at)
        : null;
      return aptDate && aptDate >= startDate && aptDate < endDate;
    });

    return {
      online: rangeAppointments.filter(
        (apt) => apt.appointment_type === "online"
      ).length,
      walkin: rangeAppointments.filter(
        (apt) => apt.appointment_type === "walkin"
      ).length,
    };
  }

  getAppointmentsForMonth(appointments, targetDate) {
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const monthAppointments = appointments.filter((apt) => {
      const aptDate = apt.created_at
        ? new Date(apt.created_at)
        : apt.booked_at
        ? new Date(apt.booked_at)
        : null;
      return (
        aptDate &&
        aptDate.getFullYear() === year &&
        aptDate.getMonth() === month
      );
    });

    return {
      online: monthAppointments.filter(
        (apt) => apt.appointment_type === "online"
      ).length,
      walkin: monthAppointments.filter(
        (apt) => apt.appointment_type === "walkin"
      ).length,
    };
  }

  getAppointmentsForQuarter(appointments, year, quarter) {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 3;

    const quarterAppointments = appointments.filter((apt) => {
      const aptDate = apt.created_at
        ? new Date(apt.created_at)
        : apt.booked_at
        ? new Date(apt.booked_at)
        : null;
      return (
        aptDate &&
        aptDate.getFullYear() === year &&
        aptDate.getMonth() >= startMonth &&
        aptDate.getMonth() < endMonth
      );
    });

    return {
      online: quarterAppointments.filter(
        (apt) => apt.appointment_type === "online"
      ).length,
      walkin: quarterAppointments.filter(
        (apt) => apt.appointment_type === "walkin"
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
