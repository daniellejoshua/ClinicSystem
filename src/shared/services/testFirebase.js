import { auth, database } from "../config/firebase";
import { ref, set } from "firebase/database";

export const testFirebaseConnection = async () => {
  try {
    // Test database write
    await set(ref(database, "test"), {
      message: "Firebase connected successfully!",
      timestamp: new Date().toISOString(),
    });

    console.log("✅ Firebase connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    return false;
  }
};
