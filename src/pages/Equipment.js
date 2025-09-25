import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Clock } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { ActiveBookingsCard, BookingTimelineView, EquipmentAvailabilityCard } from '../components/Bookings';
import NotificationCenter from '../components/Bookings/NotificationCenter';
import { useRealTimeBookings, RealTimeStatus, useBookingNotifications } from '../hooks/useRealTimeBookings';
import { AuthStatus } from '../hooks/useAuth';

const Equipment = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Use real-time booking hooks
  const {
    bookings: currentBookings,
    equipmentWithBookings,
    loading,
    error,
    lastUpdate,
    refresh
  } = useRealTimeBookings(30000); // Update every 30 seconds

  const {
    notifications,
    addNotification,
    removeNotification
  } = useBookingNotifications();

  // Show notification when data updates
  useEffect(() => {
    if (lastUpdate && !loading && !error) {
      addNotification('success', 'Equipment availability updated', 3000);
    }
  }, [lastUpdate, loading, error, addNotification]);

  // Show error notifications
  useEffect(() => {
    if (error) {
      if (error.includes('log in') || error.includes('Session expired')) {
        addNotification('warning', error, 8000);
      } else {
        addNotification('error', `Connection error: ${error}`, 8000);
      }
    }
  }, [error, addNotification]);

  const categories = [
    'All Categories',
    'Basketball',
    'Football',
    'Tennis',
    'Cricket',
    'Badminton',
    'Table Tennis',
    'Volleyball'
  ];

  const myRequests = [
    // Add sample requests here if needed
  ];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Notification Center */}
      <NotificationCenter 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h1 className="page-title">Equipment Management</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AuthStatus onLoginRequired={() => window.location.href = '/login'} />
            <RealTimeStatus 
              lastUpdate={lastUpdate}
              loading={loading}
              error={error}
              onRefresh={refresh}
            />
          </div>
        </div>
        <p className="page-subtitle">
          {activeTab === 'browse' ? 'Browse equipment with real-time availability' : 
           activeTab === 'bookings' ? 'View current equipment bookings' : 'Manage your equipment requests'}
        </p>
      </div>

      {/* Tabs and Controls Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '32px',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Equipment
          </button>
          <button 
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Clock size={16} style={{ marginRight: '6px' }} />
            Current Bookings
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            My Requests
          </button>
        </div>

        {activeTab === 'browse' && (
          <>
            <SearchBar
              placeholder="Search equipment by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                transform: 'translateY(-7px)',
                minWidth: '300px',
                maxWidth: '400px'
              }}
            />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '10px 16px',
                paddingRight: '35px',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                color: '#374151',
                minWidth: '150px',
                fontWeight: '400',
                height: '40px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                outline: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 10px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '14px',
                cursor: 'pointer',
                transform: 'translateY(-7px)'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {activeTab === 'browse' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#2c3e50' }}>
              Equipment Catalog with Live Availability
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '16px' }}>
              Browse equipment with real-time availability status, current bookings, and estimated availability times.
            </p>
            
            <div style={{ 
              background: '#fff3cd', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #ffeaa7',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#856404', fontSize: '0.9rem', fontWeight: '500' }}>
                🔄 Live Updates: Equipment availability is updated in real-time as bookings are made and returned
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }}></div>
              <span style={{ color: '#6c757d' }}>Loading equipment availability...</span>
            </div>
          ) : error && error.includes('log in') ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Authentication Required
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Please log in to view equipment availability and booking information.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
            </div>
          ) : equipmentWithBookings.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No equipment available
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Equipment inventory is currently empty. Check back later or contact administrator.
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gap: '24px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))'
            }}>
              {equipmentWithBookings
                .filter(equipment => 
                  selectedCategory === 'All Categories' || equipment.category === selectedCategory
                )
                .filter(equipment => 
                  searchTerm === '' || 
                  equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  equipment.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((equipment) => (
                  <EquipmentAvailabilityCard 
                    key={equipment._id} 
                    equipment={equipment}
                    onRequestEquipment={(equip) => {
                      // TODO: Implement request equipment functionality
                      alert(`Request functionality for ${equip.name} will be implemented soon!`);
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {myRequests.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No requests found
              </h3>
              <p style={{ marginBottom: '24px' }}>
                You haven't made any equipment requests yet.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('browse')}
              >
                Browse Equipment
              </button>
            </div>
          ) : (
            <div className="grid grid-1">
              {myRequests.map((request, index) => (
                <div key={index} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                        {request.equipment}
                      </h3>
                      <p style={{ color: '#64748b', marginBottom: '8px' }}>
                        Requested on: {request.date}
                      </p>
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: request.status === 'Approved' ? '#dcfce7' : 
                                         request.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                          color: request.status === 'Approved' ? '#166534' : 
                                 request.status === 'Pending' ? '#92400e' : '#dc2626'
                        }}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#2c3e50' }}>
              Current Equipment Bookings
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '16px' }}>
              View all currently active equipment bookings and availability status across the sports complex.
            </p>
            
            <div style={{ 
              background: '#e3f2fd', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #90caf9',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#1976d2', fontSize: '0.9rem', fontWeight: '500' }}>
                ℹ️ User privacy is protected - only initials are shown for allocated equipment
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }}></div>
              <span style={{ color: '#6c757d' }}>Loading current bookings...</span>
            </div>
          ) : error && error.includes('log in') ? (
            <div className="empty-state">
              <Clock size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Authentication Required
              </h3>
              <p style={{ marginBottom: '24px' }}>
                Please log in to view current equipment bookings.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
            </div>
          ) : currentBookings.length === 0 ? (
            <div className="empty-state">
              <Clock size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No active bookings
              </h3>
              <p style={{ marginBottom: '24px' }}>
                There are currently no active equipment bookings in the system.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('browse')}
              >
                Browse Available Equipment
              </button>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'grid', 
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                marginBottom: '32px'
              }}>
                {currentBookings.map((booking, index) => (
                  <ActiveBookingsCard 
                    key={`${booking.equipmentId}-${index}`} 
                    booking={booking} 
                    isAdmin={false} 
                  />
                ))}
              </div>
              
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px', color: '#2c3e50' }}>
                  Booking Timeline Overview
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '16px' }}>
                  Visual representation of equipment booking patterns and availability.
                </p>
                <BookingTimelineView isAdmin={false} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Add CSS animation for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default Equipment;