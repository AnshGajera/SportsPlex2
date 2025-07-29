import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Handles Google Sign-In with Firebase and calls your backend.
   */
  const googleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;

      // Send user info to your backend
      const { data } = await api.post('/auth/google', {
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'N/A',
        lastName: user.displayName?.split(' ').slice(-1)[0] || 'N/A',
        firebaseUid: user.uid,
      });

      // Set backend user
      setCurrentUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error("Google Sign-In Failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs the user out from both Firebase and local app state.
   */
  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setCurrentUser(null);
    localStorage.removeItem('userInfo');
    setLoading(false);
  };

  /**
   * On initial mount, check for existing session in localStorage.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const storedUser = localStorage.getItem('userInfo');
      console.log('Loaded from localStorage:', storedUser);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    setCurrentUser,
    googleSignIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
