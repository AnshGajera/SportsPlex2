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
   * Fetch complete profile data for the current user
   */
  const fetchCompleteProfile = async (userId) => {
    try {
      console.log('Fetching complete profile data for user:', userId);
      const { data } = await api.get('/profile');
      console.log('Complete profile data fetched:', data);
      
      // Update currentUser with complete data
      setCurrentUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      console.log('Updated currentUser with complete profile data');
      return data;
    } catch (error) {
      console.error('Failed to fetch complete profile:', error);
      // Keep existing user data if fetch fails
      return null;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const storedUser = localStorage.getItem('userInfo');
      console.log('Loaded from localStorage:', storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        // Fetch complete profile data if user has incomplete data (missing lastName)
        if (parsedUser && (!parsedUser.lastName || !parsedUser.firstName)) {
          console.log('User data incomplete, fetching complete profile...');
          await fetchCompleteProfile(parsedUser._id);
        }
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
    fetchCompleteProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
