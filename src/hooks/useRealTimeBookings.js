import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Custom hook for real-time booking updates
export const useRealTimeBookings = (refreshInterval = 30000) => {
  const [bookings, setBookings] = useState([]);
  const [equipmentWithBookings, setEquipmentWithBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchBookingData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Don't throw an error, just set empty data and stop polling
        setBookings([]);
        setEquipmentWithBookings([]);
        setError('Please log in to view booking data');
        return;
      }

      // Fetch public bookings and equipment with bookings in parallel
      const [bookingsResponse, equipmentResponse] = await Promise.all([
        api.get('/equipment/bookings/public'),
        api.get('/equipment/with-bookings')
      ]);

      // Handle authentication errors
      if (bookingsResponse.status === 401 || equipmentResponse.status === 401) {
        localStorage.removeItem('authToken'); // Clear invalid token
        setError('Session expired. Please log in again.');
        setBookings([]);
        setEquipmentWithBookings([]);
        return;
      }

      if (bookingsResponse.status !== 200 || equipmentResponse.status !== 200) {
        throw new Error(`Server error: ${bookingsResponse.status} / ${equipmentResponse.status}`);
      }

      const bookingsData = bookingsResponse.data;
      const equipmentData = equipmentResponse.data;

      setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
      setEquipmentWithBookings(Array.isArray(equipmentData.equipment) ? equipmentData.equipment : []);
      setLastUpdate(new Date());
      setError(null);

    } catch (err) {
      console.error('Error fetching booking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  // Set up real-time updates
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (refreshInterval > 0 && token) {
      const interval = setInterval(() => {
        // Check if token still exists before polling
        const currentToken = localStorage.getItem('authToken');
        if (currentToken) {
          fetchBookingData();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchBookingData, refreshInterval]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  return {
    bookings,
    equipmentWithBookings,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

// Custom hook for admin booking data
export const useAdminBookings = (filters = {}, refreshInterval = 45000) => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [lastFilters, setLastFilters] = useState(null);

  const fetchAdminBookings = useCallback(async (forceRefresh = false) => {
    try {
      // Prevent duplicate requests unless forced
      if (loading && !forceRefresh) return;
      
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setBookings([]);
        setPagination({ currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false });
        setError('Please log in to view admin booking data');
        return;
      }

      // Check if filters changed to determine if we should reset pagination
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastFilters);
      if (filtersChanged && !filters.page) {
        filters.page = 1; // Reset to page 1 when filters change
      }

      const queryParams = new URLSearchParams({
        status: filters.status || 'all',
        page: filters.page || 1,
        limit: filters.limit || 10,
        search: filters.search || '',
        sortBy: filters.sortBy || 'allocationDate',
        sortOrder: filters.sortOrder || 'desc'
      });

      console.log('Fetching admin bookings with filters:', filters);
      
      const response = await api.get(`/equipment/bookings/admin?${queryParams}`);

      console.log('Admin bookings response:', response.status, response.data);

      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        setError('Session expired. Please log in again.');
        setBookings([]);
        setPagination({ currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false });
        return;
      }

      // Handle authorization errors (not admin)
      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        setBookings([]);
        setPagination({ currentPage: 1, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false });
        return;
      }

      if (response.status !== 200) {
        console.error('Admin booking fetch error:', response);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = response.data;
      console.log('Admin bookings data received:', data);
      
      setBookings(data.bookings || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalCount: data.total || 0,
        hasNext: data.hasMore || false,
        hasPrev: data.currentPage > 1
      });
      setLastUpdate(new Date());
      setError(null);
      setLastFilters(filters);

    } catch (err) {
      console.error('Error fetching admin booking data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch booking data');
    } finally {
      setLoading(false);
    }
  }, [filters, lastFilters, loading]);

  // Debounced fetch for search input
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchAdminBookings();
    }, filters.search ? 500 : 0); // 500ms debounce for search, immediate for other changes

    return () => clearTimeout(debounceTimer);
  }, [fetchAdminBookings]);

  // Set up real-time updates
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token || !refreshInterval) return;

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        fetchAdminBookings();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchAdminBookings, refreshInterval]);

  const refresh = useCallback(() => {
    fetchAdminBookings(true);
  }, [fetchAdminBookings]);

  return {
    bookings,
    pagination,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

// Real-time status indicator component
export const RealTimeStatus = ({ lastUpdate, loading, error, onRefresh }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now - lastUpdate) / 1000);
      
      if (diff < 60) {
        setTimeAgo(`${diff}s ago`);
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const getStatusColor = () => {
    if (error) return '#dc3545';
    if (loading) return '#ffc107';
    return '#28a745';
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (loading) return 'Updating...';
    return 'Live';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '20px',
      fontSize: '0.85rem',
      border: `1px solid ${getStatusColor()}20`
    }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          animation: loading ? 'pulse 2s infinite' : 'none'
        }}
      />
      <span style={{ fontWeight: '500', color: getStatusColor() }}>
        {getStatusText()}
      </span>
      {lastUpdate && !loading && (
        <span style={{ color: '#6c757d' }}>
          • Updated {timeAgo}
        </span>
      )}
      <button
        onClick={onRefresh}
        style={{
          background: 'none',
          border: 'none',
          color: '#007bff',
          cursor: 'pointer',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          marginLeft: '4px'
        }}
        title="Refresh now"
      >
        🔄
      </button>
    </div>
  );
};

// Hook for booking notifications
export const useBookingNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 5000) => {
    const id = Date.now();
    const notification = {
      id,
      type, // 'success', 'warning', 'error', 'info'
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
};