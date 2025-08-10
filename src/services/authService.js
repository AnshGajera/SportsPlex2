import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from '../firebase/firebase'; // Correct path to your firebase config
import api from '../services/api'; // Import the api service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  /**
   * Handles Google Sign-In.
   * It signs the user in with a Firebase popup, then sends the user's
   * information to your backend to get a JWT and user profile.
   */
  const googleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      // Send Firebase user info to your backend
      const { data } = await api.post('/auth/google', {
        email: user.email,
        firstName: user.displayName.split(' ')[0],
        lastName: user.displayName.split(' ').slice(-1)[0],
        firebaseUid: user.uid,
      });

      // Set user state with data from YOUR backend
      setCurrentUser(data);
      // Store user info in localStorage for session persistence
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error("Google Sign-In Failed", error);
      // You can add user-facing error handling here
    } finally {
        setLoading(false);
    }
  };

  /**
   * Logs the user out from Firebase and clears local state.
   */
  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem('userInfo');
    setLoading(false);
  };

  // This effect runs on initial load to check if a user is already logged in
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setCurrentUser(userInfo);
    }
    setLoading(false);

    // The onAuthStateChanged listener is great for session management with Firebase,
    // but we will rely on our own backend's token stored in localStorage
    // for consistency across the app.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If Firebase session ends, clear our local state too
        setCurrentUser(null);
        localStorage.removeItem('userInfo');
      }
    });
    return () => unsubscribe();
  }, []);
const registerWithEmailPassword = async (email, password, firstName, lastName) => {
  try {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);

    // Send data to backend to create profile
    const { data } = await api.post('/auth/register', {
      email: userCredential.user.email,
      firstName,
      lastName,
      firebaseUid: userCredential.user.uid,
    });

    setCurrentUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};

  const value = {
    currentUser,
    loading,
    googleSignIn,
    logout,
    registerWithEmailPassword,
    // You can add your manual register/login functions here and export them
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
