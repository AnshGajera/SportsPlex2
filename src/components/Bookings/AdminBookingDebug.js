import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminBookingDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAdminAccess = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      console.log('Testing with token:', token ? token.substring(0, 20) + '...' : 'No token');

      // Test basic admin route
      const adminTestResponse = await api.get('/equipment/admin-test');

      console.log('Admin test response:', adminTestResponse.status);
      
      if (adminTestResponse.status === 200) {
        const adminTestData = adminTestResponse.data;
        console.log('Admin test data:', adminTestData);
        
        // Test admin bookings endpoint
        const bookingsResponse = await api.get('/equipment/bookings/admin');

        console.log('Bookings response:', bookingsResponse.status);
        
        let bookingsData = null;
        if (bookingsResponse.status === 200) {
          bookingsData = bookingsResponse.data;
          console.log('Bookings data:', bookingsData);
        } else {
          console.error('Bookings error:', bookingsResponse);
        }

        setDebugInfo({
          adminTest: {
            status: adminTestResponse.status,
            data: adminTestData
          },
          bookings: {
            status: bookingsResponse.status,
            data: bookingsData,
            error: !bookingsResponse.ok ? await bookingsResponse.text() : null
          },
          token: token ? 'Present' : 'Missing'
        });
      } else {
        const errorText = await adminTestResponse.text();
        setDebugInfo({
          error: `Admin test failed: ${adminTestResponse.status} - ${errorText}`,
          token: token ? 'Present' : 'Missing'
        });
      }
    } catch (error) {
      console.error('Debug test error:', error);
      setDebugInfo({
        error: error.message,
        token: localStorage.getItem('authToken') ? 'Present' : 'Missing'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAdminAccess();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px', 
      margin: '20px 0',
      fontFamily: 'monospace'
    }}>
      <h3>Admin Access Debug Information</h3>
      
      <button 
        onClick={testAdminAccess} 
        disabled={loading}
        style={{ 
          padding: '8px 16px', 
          marginBottom: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Admin Access'}
      </button>

      {debugInfo && (
        <pre style={{ 
          backgroundColor: 'white', 
          padding: '12px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default AdminBookingDebug;