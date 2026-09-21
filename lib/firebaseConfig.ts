// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, deleteApp  } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDy5tjrybB2sj-0W4Tt5B-AclMbT4-WUnU",
  authDomain: "appointment-client-app.firebaseapp.com",
  projectId: "appointment-client-app",
  storageBucket: "appointment-client-app.firebasestorage.app",
  messagingSenderId: "572332999044",
  appId: "1:572332999044:web:1a622d9e17cc58001a1dd1",
  measurementId: "G-3WWJS4176H"
};

let app;

if (getApps().length > 0) {
    app = getApp();
    if (app.options.projectId !== firebaseConfig.projectId) {
      deleteApp(app); // Delete previous Firebase instance if it's from another project
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = initializeApp(firebaseConfig);
  }
// Initialize Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;