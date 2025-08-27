// This service handles authentication for staff and patients
// It provides functions to log in, log out, create admin accounts, and check user status
// The logic connects to Firebase Auth and the database to verify users
// Used by admin and client pages to manage secure access

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { ref, set, get, push } from "firebase/database";
import { auth, database } from "../config/firebase";
import customDataService from "./customDataService";

class AuthService {
  // Staff-based login (matching your database design)
  async staffLogin(email, password) {
    try {
      console.log("🔍 Attempting staff login for:", email);

      // Get all staff members from your custom database
      const allStaff = await customDataService.getAllData("staff");

      // Find staff member by email and password
      const staffMember = allStaff.find(
        (staff) => staff.email === email && staff.password === password
      );

      if (!staffMember) {
        throw new Error("Invalid email or password");
      }

      // Store staff session
      const staffData = {
        id: staffMember.id,
        full_name: staffMember.full_name,
        email: staffMember.email,
        role: staffMember.role,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("staffData", JSON.stringify(staffData));
      localStorage.setItem("isStaffLoggedIn", "true");
      localStorage.setItem("adminToken", "staff-" + staffMember.id); // For ProtectedRoute compatibility

      // Log the login activity
      await customDataService.addDataWithAutoId("audit_logs", {
        user_ref: `staff/${staffMember.id}`,
        action: `Staff login - ${staffMember.role}`,
        ip_address: this.getClientIP(),
        timestamp: new Date().toISOString(),
      });

      console.log("✅ Staff login successful:", staffData);
      return staffData;
    } catch (error) {
      console.error("❌ Staff login failed:", error);
      throw error;
    }
  }

  // Check if staff is logged in
  isAuthenticated() {
    return localStorage.getItem("isStaffLoggedIn") === "true";
  }

  // Get current staff data
  getCurrentStaff() {
    if (this.isAuthenticated()) {
      const staffData = localStorage.getItem("staffData");
      return staffData ? JSON.parse(staffData) : null;
    }
    return null;
  }

  // Check if current staff is admin
  isAdmin() {
    const staff = this.getCurrentStaff();
    return staff && staff.role === "admin";
  }

  // Logout staff
  async logout() {
    try {
      const staffData = this.getCurrentStaff();

      if (staffData) {
        // Log the logout activity
        await customDataService.addDataWithAutoId("audit_logs", {
          user_ref: `staff/${staffData.id}`,
          action: `Staff logout - ${staffData.role}`,
          ip_address: this.getClientIP(),
          timestamp: new Date().toISOString(),
        });
      }

      localStorage.removeItem("staffData");
      localStorage.removeItem("isStaffLoggedIn");
      localStorage.removeItem("adminToken");

      console.log("✅ Staff logout successful");
    } catch (error) {
      console.error("❌ Staff logout error:", error);
    }
  }

  // This function creates a new admin account in Firebase Auth and the database
  // Used by the clinic owner to set up the first admin user
  // Returns a promise that resolves when the account is created
  // Rejects with an error message if the account could not be created
  async createAdmin(email, password, adminData) {
    try {
      console.log("🔄 Creating admin staff member...");

      // Check if admin already exists
      const allStaff = await customDataService.getAllData("staff");
      const adminExists = allStaff.find((staff) => staff.email === email);

      if (adminExists) {
        console.log("ℹ️ Admin staff already exists");
        return adminExists;
      }

      // Create admin staff member
      const staffData = {
        full_name: adminData.name || "Super Admin",
        email: email,
        password: password,
        role: "admin",
      };

      const result = await customDataService.addDataWithAutoId(
        "staff",
        staffData
      );
      console.log("✅ Admin staff created:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating admin staff:", error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      await set(ref(database, "test/connection"), {
        message: "Firebase connection test successful!",
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get client IP (mock for demo)
  getClientIP() {
    return "192.168.1." + Math.floor(Math.random() * 255);
  }

  // Legacy methods for compatibility
  async adminLogin(email, password) {
    return this.staffLogin(email, password);
  }

  getCurrentUser() {
    return Promise.resolve(this.getCurrentStaff());
  }
}

export default new AuthService();
