import { ref, push } from "firebase/database";
import { database } from "../config/firebase";

// Authentication utilities
export const isStaffLoggedIn = () => {
  const isLoggedIn = localStorage.getItem("isStaffLoggedIn");
  const staffData = localStorage.getItem("staffData");
  const adminToken = localStorage.getItem("adminToken");

  return isLoggedIn === "true" && staffData && adminToken;
};

export const getStaffData = () => {
  const staffData = localStorage.getItem("staffData");
  return staffData ? JSON.parse(staffData) : null;
};

const logAudit = async (action, email, staffName = null, role = null) => {
  try {
    const auditRef = ref(database, "audit_logs");
    await push(auditRef, {
      action: action,
      email: email,
      staff_full_name: staffName || email,
      role: role || "Unknown",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging audit:", error);
  }
};

export const logout = async (reason = "Manual Logout") => {
  const staffData = getStaffData();

  // Log the logout action with specific reason
  if (staffData) {
    await logAudit(
      `Staff ${reason}`,
      staffData.email,
      staffData.full_name,
      staffData.role
    );
  }

  localStorage.removeItem("isStaffLoggedIn");
  localStorage.removeItem("staffData");
  localStorage.removeItem("adminToken");

  // Redirect to login page
  window.location.href = "/admin/login";
};

export const setupAutoLogout = () => {
  const checkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check if it's 12:00 AM (00:00)
    if (hours === 0 && minutes === 0) {
      if (isStaffLoggedIn()) {
        alert(
          "It's 12 AM. You will be automatically logged out for security reasons."
        );
        logout("Automatic Logout - 12 AM Reset");
      }
    }
  };

  // Check every minute
  const interval = setInterval(checkTime, 60000);

  // Return cleanup function
  return () => clearInterval(interval);
};

export const setupIdleLogout = (idleTimeMinutes = 30) => {
  let idleTimer;
  let lastActivity = Date.now();

  const resetTimer = () => {
    lastActivity = Date.now();
    clearTimeout(idleTimer);

    idleTimer = setTimeout(() => {
      if (isStaffLoggedIn()) {
        alert(
          `You have been idle for ${idleTimeMinutes} minutes. Logging out for security.`
        );
        logout(`Automatic Logout - ${idleTimeMinutes} Minute Inactivity`);
      }
    }, idleTimeMinutes * 60 * 1000);
  };

  // Events to track user activity
  const events = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  const addEventListeners = () => {
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });
  };

  const removeEventListeners = () => {
    events.forEach((event) => {
      document.removeEventListener(event, resetTimer, true);
    });
  };

  // Initialize
  addEventListeners();
  resetTimer();

  // Return cleanup function
  return () => {
    removeEventListeners();
    clearTimeout(idleTimer);
  };
};
