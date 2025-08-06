// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendEmailVerification } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional, only if you need it)
export const analytics = getAnalytics(app);

// Email verification functions
export const sendVerificationEmail = async (user, actionCodeSettings = null) => {
  try {
    if (!user) {
      throw new Error('No user provided');
    }

    // Default action code settings
    const defaultSettings = {
      url: window.location.origin + '/verifyEmail',
      handleCodeInApp: false,
    };

    const settings = actionCodeSettings || defaultSettings;
    
    await sendEmailVerification(user, settings);
    console.log('Verification email sent successfully to:', user.email);
    return { success: true, message: 'Verification email sent successfully' };
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    
    // Handle specific Firebase errors
    let errorMessage = 'Failed to send verification email';
    switch (error.code) {
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait before trying again.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Your account has been disabled. Contact support.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'User not found. Please log in again.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Resend verification email function
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'No authenticated user found. Please log in again.' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified.' };
    }

    const result = await sendVerificationEmail(user);
    return result;
    
  } catch (error) {
    console.error('Error in resendVerificationEmail:', error);
    return { success: false, error: 'Failed to resend verification email' };
  }
};

// Check if user email is verified
export const checkEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    // Reload user to get latest verification status
    await user.reload();
    const refreshedUser = auth.currentUser;
    
    return { 
      success: true, 
      isVerified: refreshedUser.emailVerified,
      user: refreshedUser 
    };
    
  } catch (error) {
    console.error('Error checking email verification:', error);
    return { success: false, error: 'Failed to check verification status' };
  }
};

export default app;
