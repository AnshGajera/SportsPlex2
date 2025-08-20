// import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
//   apiKey: "AIzaSyBIW6StrJ56ksw_WgeVTqHCzqI2Ze6PKGY",
//   authDomain: "charusat-sports-complex.firebaseapp.com",
//   projectId: "charusat-sports-complex",
//   storageBucket: "charusat-sports-complex.firebasestorage.app",
//   messagingSenderId: "414879294401",
//   appId: "1:414879294401:web:8f0bb6deeae194b91c8540"
// };

// const app = initializeApp(firebaseConfig);

// export default app;
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
 apiKey: "AIzaSyA97BOMAFFyCwMiLDckOHt_iiO72cbUoFo",
  authDomain: "sportsplex-27.firebaseapp.com",
  projectId: "sportsplex-27",
  storageBucket: "sportsplex-27.firebasestorage.app",
  messagingSenderId: "593148930080",
  appId: "1:593148930080:web:55ac0c4e84669addb53445",
  measurementId: "G-ZJ24J7M3JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and the Google provider for use in other files
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
