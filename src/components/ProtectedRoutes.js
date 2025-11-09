
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = null }) => {
  const { currentUser, loading } = useAuth();
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setVerified(auth.currentUser.emailVerified);
      } else {
        setVerified(false);
      }
    };
    checkEmailVerification();
  }, [currentUser]);

  if (loading || verified === null) return <div>Loading...</div>;
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (!verified) {
    return <Navigate to="/verifyEmail" replace />;
  }
  
  // Check role-based access
  if (adminOnly && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
