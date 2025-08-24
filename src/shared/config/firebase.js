import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2iihhjW-yOA5TchHEGWTjOUgMsdnIFsQ",
  authDomain: "clinicsystem-a7c34.firebaseapp.com",
  databaseURL: "https://clinicsystem-a7c34-default-rtdb.firebaseio.com/",
  projectId: "clinicsystem-a7c34",
  storageBucket: "clinicsystem-a7c34.firebasestorage.app",
  messagingSenderId: "320715779291",
  appId: "1:320715779291:web:1c5757f8508d7a0267b0fe",
  measurementId: "G-4M5SKS5DCP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;
