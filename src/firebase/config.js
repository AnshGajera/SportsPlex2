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
import { getAuth, GoogleAuthProvider, sendEmailVerification, reload } from "firebase/auth";

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

// Email verification functions with improved rate limiting
export const sendVerificationEmail = async (user) => {
  try {
    // Check if we've recently sent an email
    const lastSent = localStorage.getItem('lastVerificationEmail');
    const now = Date.now();
    
    // Wait at least 2 minutes between sends
    if (lastSent && (now - parseInt(lastSent)) < 120000) {
      const waitTime = Math.ceil((120000 - (now - parseInt(lastSent))) / 1000);
      return { 
        success: false, 
        error: `Please wait ${waitTime} seconds before requesting another verification email.` 
      };
    }

    await sendEmailVerification(user, {
      // Add action code settings
      url: window.location.origin + '/verifyEmail',
      handleCodeInApp: false
    });
    
    // Store timestamp
    localStorage.setItem('lastVerificationEmail', now.toString());
    
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    let errorMessage = error.message;
    
    // Handle specific Firebase errors
    if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many email requests. Please wait 10-15 minutes before trying again. You can also check your spam folder for previous emails.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled. Please contact support.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found. Please try logging in again.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // Check if we've recently sent an email
    const lastSent = localStorage.getItem('lastVerificationEmail');
    const now = Date.now();
    
    // Wait at least 5 minutes between resends
    if (lastSent && (now - parseInt(lastSent)) < 300000) {
      const waitTime = Math.ceil((300000 - (now - parseInt(lastSent))) / 1000);
      return { 
        success: false, 
        error: `Please wait ${Math.ceil(waitTime / 60)} minutes before requesting another verification email.` 
      };
    }

    await sendEmailVerification(user, {
      // Add action code settings
      url: window.location.origin + '/verifyEmail',
      handleCodeInApp: false
    });
    
    // Store timestamp
    localStorage.setItem('lastVerificationEmail', now.toString());
    
    return { success: true };
  } catch (error) {
    console.error('Error resending verification email:', error);
    let errorMessage = error.message;
    
    if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many email requests. Please wait 10-15 minutes before trying again. Check your spam folder for previous emails.';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await reload(user);
      return { 
        success: true, 
        isVerified: user.emailVerified,
        user: user 
      };
    } else {
      return { success: false, error: 'No authenticated user found' };
    }
  } catch (error) {
    console.error('Error checking email verification:', error);
    return { success: false, error: error.message };
  }
};

export default app;
