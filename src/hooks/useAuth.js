import { useState, useEffect } from 'react';

// Custom hook to check authentication status
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout,
    isAdmin: user?.role === 'admin'
  };
};

// Component to display authentication status
export const AuthStatus = ({ onLoginRequired }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '20px',
        fontSize: '0.85rem'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ffc107',
          animation: 'pulse 2s infinite'
        }} />
        <span>Checking auth...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#f8d7da',
        borderRadius: '20px',
        fontSize: '0.85rem',
        border: '1px solid #f5c2c7'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#dc3545'
        }} />
        <span style={{ color: '#721c24', fontWeight: '500' }}>
          Not logged in
        </span>
        {onLoginRequired && (
          <button
            onClick={onLoginRequired}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginLeft: '4px',
              textDecoration: 'underline'
            }}
          >
            Login
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#d4edda',
      borderRadius: '20px',
      fontSize: '0.85rem',
      border: '1px solid #c3e6cb'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#28a745'
      }} />
      <span style={{ color: '#155724', fontWeight: '500' }}>
        {user?.firstName || 'User'} ({user?.role || 'user'})
      </span>
    </div>
  );
};