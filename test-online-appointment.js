// Test script to add a sample online appointment
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push, set } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyDZaZJQKnInKN0A5eO6cH9U6I2LHfUdZCE",
  authDomain: "clinicsystem-2eeb3.firebaseapp.com",
  databaseURL:
    "https://clinicsystem-2eeb3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clinicsystem-2eeb3",
  storageBucket: "clinicsystem-2eeb3.appspot.com",
  messagingSenderId: "1016409264926",
  appId: "1:1016409264926:web:d5d25f0bb68b7c2d5db4a1",
  measurementId: "G-LVX1BDTXV3",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function addTestOnlineAppointment() {
  try {
    const formData = {
      patient_full_name: "Test Patient Online",
      patient_birthdate: "1990-05-15",
      patient_sex: "Male",
      contact_number: "+63917123456",
      email_address: "test@online.com",
      booked_by_name: "Test Patient Online",
      relationship_to_patient: "Self",
      service_ref: "General Consultation",
      preferred_date: "2025-08-27",
      additional_notes: "Test online appointment",
      medical_history: "None",
      current_medications: "None",
      allergies: "None",
      present_checkbox: false,
      booking_source: "online",
      created_at: new Date().toISOString(),
    };

    const formsRef = ref(database, "fill_up_forms");
    const newFormRef = push(formsRef);
    await set(newFormRef, formData);

    console.log("✅ Test online appointment created successfully!");
    console.log("Form ID:", newFormRef.key);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test appointment:", error);
    process.exit(1);
  }
}

addTestOnlineAppointment();
