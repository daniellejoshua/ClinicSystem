import { auth, database } from "../config/firebase";
import { ref, get } from "firebase/database";
import dataService from "./dataService";

class AuthService {
  // Create Admin Account with proper database entry
  async createAdmin(email, password, adminData) {
    try {
      // First create the Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Then add admin record to database with the user's UID
      await set(ref(database, `admins/${user.uid}`), {
        email: email,
        role: "admin",
        createdAt: new Date().toISOString(),
        permissions: ["all"],
        ...adminData,
      });

      console.log("✅ Admin account created with UID:", user.uid);
      return user;
    } catch (error) {
      console.error("❌ Admin creation failed:", error);
      throw new Error(error.message);
    }
  }

  // Admin Login
  async adminLogin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user is admin in database
      const adminRef = ref(database, `admins/${user.uid}`);
      const adminSnapshot = await get(adminRef);

      if (!adminSnapshot.exists()) {
        await signOut(auth);
        throw new Error("Access denied. Admin privileges required.");
      }

      const adminData = adminSnapshot.val();

      // Store admin token and data
      localStorage.setItem("adminToken", await user.getIdToken());
      localStorage.setItem(
        "adminData",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          ...adminData,
        })
      );

      return {
        user,
        adminData: adminData,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Client Registration (for patients)
  async clientRegister(email, password, clientData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Add client as patient in database
      await set(ref(database, `patients/${user.uid}`), {
        full_name: clientData.name,
        email: email,
        phone_number: clientData.phone || "",
        date_of_birth: clientData.dateOfBirth || "",
        address: clientData.address || "",
        created_at: new Date().toISOString(),
        status: "active",
      });

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Client Login
  async clientLogin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get patient data
      const patientRef = ref(database, `patients/${user.uid}`);
      const patientSnapshot = await get(patientRef);

      if (!patientSnapshot.exists()) {
        throw new Error("Patient account not found.");
      }

      const patientData = patientSnapshot.val();

      // Store client token and data
      localStorage.setItem("clientToken", await user.getIdToken());
      localStorage.setItem(
        "clientData",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          ...patientData,
        })
      );

      return {
        user,
        patientData: patientData,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Staff-based login (no Firebase Auth needed)
  async staffLogin(email, password) {
    try {
      console.log("🔍 Attempting staff login for:", email);

      // Get all staff members
      const allStaff = await dataService.getAllData("staff");

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

      // Log the login activity
      await dataService.addDataWithAutoId("audit_logs", {
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

  // Check if user is logged in staff
  isStaffLoggedIn() {
    return localStorage.getItem("isStaffLoggedIn") === "true";
  }

  // Get current staff data
  getCurrentStaff() {
    if (this.isStaffLoggedIn()) {
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
  async staffLogout() {
    try {
      const staffData = this.getCurrentStaff();

      if (staffData) {
        // Log the logout activity
        await dataService.addDataWithAutoId("audit_logs", {
          user_ref: `staff/${staffData.id}`,
          action: `Staff logout - ${staffData.role}`,
          ip_address: this.getClientIP(),
          timestamp: new Date().toISOString(),
        });
      }

      localStorage.removeItem("staffData");
      localStorage.removeItem("isStaffLoggedIn");

      console.log("✅ Staff logout successful");
    } catch (error) {
      console.error("❌ Staff logout error:", error);
    }
  }

  // Get client IP (mock for now)
  getClientIP() {
    return "192.168.1." + Math.floor(Math.random() * 255);
  }

  // Create initial admin staff member
  async createAdminStaff() {
    try {
      // Check if admin already exists
      const allStaff = await dataService.getAllData("staff");
      const adminExists = allStaff.find(
        (staff) => staff.email === "admin@clinic.com"
      );

      if (adminExists) {
        console.log("ℹ️ Admin staff already exists");
        return adminExists;
      }

      // Create admin staff
      const adminData = {
        full_name: "Dr. Maria Santos",
        email: "admin@clinic.com",
        password: "AdminPass123!",
        role: "admin",
      };

      const result = await dataService.addDataWithAutoId("staff", adminData);
      console.log("✅ Admin staff created:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating admin staff:", error);
      throw error;
    }
  }

  // Test connection (simplified)
  async testConnection() {
    try {
      await dataService.setData("test/connection", {
        message: "Connection test successful!",
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
