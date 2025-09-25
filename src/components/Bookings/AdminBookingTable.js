import React, { useState, useEffect } from 'react';
import { useAdminBookings } from '../../hooks/useRealTimeBookings';
import api from '../../services/api';
import './AdminBookingTable.css';
import './AdminBookingTableEnhanced.css';

const AdminBookingTable = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'allocationDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  
  const [updating, setUpdating] = useState(null); // Track which booking is being updated
  const [notification, setNotification] = useState(null); // Success/error messages
  const [selectedBookings, setSelectedBookings] = useState([]); // Track selected bookings for bulk actions
  
  // Use the real-time booking hook
  const {
    bookings,
    pagination,
    loading,
    error,
    refresh
  } = useAdminBookings(filters, 45000); // Update every 45 seconds

  // Clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 when filtering
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusUpdate = async (bookingId, newStatus, returnData = {}) => {
    if (updating === bookingId) return; // Prevent double-clicks
    
    setUpdating(bookingId);
    try {
      const requestData = { status: newStatus, ...returnData };
      const response = await api.patch(`/equipment/allocations/${bookingId}`, requestData);

      if (response.status === 200) {
        showNotification(`Booking ${newStatus} successfully!`, 'success');
        refresh(); // Use the refresh function from the hook
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      showNotification(`Error updating booking: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleContactUser = (user) => {
    if (user && user.email) {
      window.location.href = `mailto:${user.email}?subject=Equipment Booking Inquiry`;
    } else {
      showNotification('User email not available', 'error');
    }
  };

  const handleExtendBooking = async (bookingId, days = 7) => {
    if (updating === bookingId) return;
    
    const extendDays = prompt(`Extend booking by how many days? (Default: ${days})`, days);
    if (!extendDays || isNaN(extendDays)) return;
    
    setUpdating(bookingId);
    try {
      const response = await api.patch(`/equipment/allocations/${bookingId}/extend`, {
        days: parseInt(extendDays)
      });

      if (response.status === 200) {
        showNotification(`Booking extended by ${extendDays} days!`, 'success');
        refresh();
      } else {
        throw new Error('Failed to extend booking');
      }
    } catch (err) {
      console.error('Error extending booking:', err);
      showNotification(`Error extending booking: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleReturnWithCondition = async (bookingId) => {
    if (updating === bookingId) return;
    
    const condition = prompt('Return condition (Good/Damaged/Lost):', 'Good');
    if (!condition) return;
    
    const notes = prompt('Return notes (optional):', '');
    
    await handleStatusUpdate(bookingId, 'returned', {
      returnCondition: condition,
      returnNotes: notes
    });
  };

  const handleMarkOverdue = async (bookingId) => {
    if (updating === bookingId) return;
    await handleStatusUpdate(bookingId, 'overdue');
  };

  const handleBulkAction = async (action, selectedBookings) => {
    if (!selectedBookings.length) {
      showNotification('Please select bookings to perform bulk action', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedBookings.length} bookings?`)) {
      return;
    }

    for (const bookingId of selectedBookings) {
      await handleStatusUpdate(bookingId, action);
    }
    
    setSelectedBookings([]); // Clear selection after bulk action
    showNotification(`Bulk action "${action}" completed for ${selectedBookings.length} bookings`);
  };

  // Selection functions
  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    const allBookingIds = bookings.map(booking => booking.id);
    setSelectedBookings(prev => 
      prev.length === allBookingIds.length ? [] : allBookingIds
    );
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'Equipment Name',
      'Student Name', 
      'Student Email',
      'Quantity',
      'Allocation Date',
      'Expected Return Date', 
      'Actual Return Date',
      'Status',
      'Days Used',
      'Notes'
    ];

    const csvData = bookings.map(booking => [
      booking.equipment?.name || 'N/A',
      booking.user?.name || 'N/A',
      booking.user?.email || 'N/A', 
      booking.quantity || 0,
      formatDate(booking.allocationDate),
      formatDate(booking.expectedReturnDate),
      booking.actualReturnDate ? formatDate(booking.actualReturnDate) : 'Not Returned',
      booking.status,
      booking.daysUsed || 0,
      booking.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `equipment-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Booking data exported successfully', 'success');
  };

  // Analytics calculations
  const analytics = {
    total: bookings.length,
    allocated: bookings.filter(b => b.status === 'allocated').length,
    returned: bookings.filter(b => b.status === 'returned').length,
    overdue: bookings.filter(b => b.status === 'overdue').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    totalEquipment: bookings.reduce((sum, b) => sum + (b.quantity || 0), 0),
    averageDays: bookings.length > 0 
      ? Math.round(bookings.reduce((sum, b) => sum + (b.daysUsed || 0), 0) / bookings.length)
      : 0
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (booking) => {
    const { status, isOverdue, urgencyLevel } = booking;
    
    if (isOverdue) {
      return <span className="status-badge overdue">OVERDUE</span>;
    }
    
    const statusColors = {
      allocated: urgencyLevel === 'high' ? 'warning' : 'success',
      returned: 'secondary',
      lost: 'danger'
    };
    
    return (
      <span className={`status-badge ${statusColors[status] || 'primary'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getUrgencyIndicator = (booking) => {
    if (booking.isOverdue) return '🔴';
    if (booking.urgencyLevel === 'high') return '🟡';
    if (booking.urgencyLevel === 'medium') return '🟠';
    return '🟢';
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-error">
        <p>Error loading bookings: {error}</p>
        <button onClick={refresh} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-booking-table">
      {/* Notification Banner */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      <div className="table-header">
        <div className="header-title">
          <h2>Equipment Bookings Management</h2>
          <span className="total-count">
            {pagination?.totalCount || 0} total booking{(pagination?.totalCount || 0) !== 1 ? 's' : ''}
          </span>
          {loading && <span className="loading-indicator">🔄 Loading...</span>}
        </div>
        
        <div className="header-actions">
          <button 
            className="action-btn export-btn"
            onClick={exportToCSV}
            disabled={bookings.length === 0}
            title="Export to CSV"
          >
            📊 Export
          </button>
          <button 
            className="action-btn refresh-btn"
            onClick={refresh}
            disabled={loading}
            title="Refresh Data"
          >
            🔄 Refresh
          </button>
        </div>
        
        {/* Analytics Dashboard */}
        <div className="analytics-dashboard">
          <div className="analytics-card">
            <span className="analytics-number">{analytics.total}</span>
            <span className="analytics-label">Total Bookings</span>
          </div>
          <div className="analytics-card allocated">
            <span className="analytics-number">{analytics.allocated}</span>
            <span className="analytics-label">Active</span>
          </div>
          <div className="analytics-card returned">
            <span className="analytics-number">{analytics.returned}</span>
            <span className="analytics-label">Returned</span>
          </div>
          <div className="analytics-card overdue">
            <span className="analytics-number">{analytics.overdue}</span>
            <span className="analytics-label">Overdue</span>
          </div>
          <div className="analytics-card">
            <span className="analytics-number">{analytics.totalEquipment}</span>
            <span className="analytics-label">Total Items</span>
          </div>
          <div className="analytics-card">
            <span className="analytics-number">{analytics.averageDays}</span>
            <span className="analytics-label">Avg Days</span>
          </div>
        </div>
        
        <div className="table-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              disabled={loading}
            >
              <option value="all">All</option>
              <option value="allocated">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search notes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              disabled={loading}
              maxLength={100}
            />
            {filters.search && (
              <button 
                className="clear-search"
                onClick={() => handleFilterChange('search', '')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={filters.sortBy} 
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="allocationDate">Allocation Date</option>
              <option value="expectedReturnDate">Return Date</option>
              <option value="equipment.name">Equipment Name</option>
              <option value="user.name">Student Name</option>
            </select>
            <button 
              className={`sort-order ${filters.sortOrder}`}
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="bulk-actions">
          <span className="selection-count">
            {selectedBookings.length} booking(s) selected
          </span>
          <div className="bulk-action-buttons">
            <button 
              className="bulk-btn bulk-return"
              onClick={() => handleBulkAction('returned', selectedBookings)}
            >
              ✅ Mark as Returned
            </button>
            <button 
              className="bulk-btn bulk-overdue"
              onClick={() => handleBulkAction('overdue', selectedBookings)}
            >
              ⚠️ Mark as Overdue
            </button>
            <button 
              className="bulk-btn bulk-clear"
              onClick={() => setSelectedBookings([])}
            >
              ❌ Clear Selection
            </button>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedBookings.length === bookings.length && bookings.length > 0}
                  onChange={handleSelectAll}
                  title="Select All"
                />
              </th>
              <th>Equipment</th>
              <th>Student</th>
              <th>Quantity</th>
              <th>Allocated</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Days Left</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className={booking.isOverdue ? 'overdue-row' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedBookings.includes(booking.id)}
                    onChange={() => handleSelectBooking(booking.id)}
                  />
                </td>
                <td className="equipment-cell">
                  <div className="equipment-info">
                    {booking.equipment.image && (
                      <img 
                        src={`http://localhost:5000${booking.equipment.image}`}
                        alt={booking.equipment.name}
                        className="equipment-thumb"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div>
                      <div className="equipment-name">{booking.equipment.name}</div>
                      <div className="equipment-category">{booking.equipment.category}</div>
                    </div>
                  </div>
                </td>
                
                <td className="student-cell">
                  <div className="student-info">
                    <div className="student-name">
                      {booking.user?.name || 'Unknown User'}
                    </div>
                    <div className="student-id">Email: {booking.user?.email || 'N/A'}</div>
                  </div>
                </td>
                
                <td className="quantity-cell">
                  <span className="quantity-badge">{booking.quantityAllocated}</span>
                </td>
                
                <td className="date-cell">
                  {formatDate(booking.allocationDate)}
                </td>
                
                <td className="date-cell">
                  {formatDate(booking.expectedReturnDate)}
                </td>
                
                <td className="status-cell">
                  {getStatusBadge(booking)}
                </td>
                
                <td className="days-cell">
                  <div className="days-info">
                    <span className="urgency-indicator">{getUrgencyIndicator(booking)}</span>
                    <span className={`days-text ${booking.isOverdue ? 'overdue' : ''}`}>
                      {booking.isOverdue 
                        ? `${Math.abs(booking.daysRemaining)} overdue`
                        : `${booking.daysRemaining} left`
                      }
                    </span>
                  </div>
                </td>
                
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-contact"
                      onClick={() => handleContactUser(booking.user)}
                      title="Contact Student"
                    >
                      📧
                    </button>
                    
                    {booking.status === 'allocated' && (
                      <>
                        <button 
                          className="btn-action btn-extend"
                          onClick={() => handleExtendBooking(booking.id)}
                          title="Extend Booking"
                          disabled={updating === booking.id}
                        >
                          {updating === booking.id ? '⏳' : '⏰'}
                        </button>
                        <button 
                          className="btn-action btn-return"
                          onClick={() => handleReturnWithCondition(booking.id)}
                          title="Return with Condition Notes"
                          disabled={updating === booking.id}
                        >
                          {updating === booking.id ? '⏳' : '✅'}
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'overdue' && (
                      <button 
                        className="btn-action btn-overdue"
                        onClick={() => handleMarkOverdue(booking.id)}
                        title="Update Overdue Status"
                        disabled={updating === booking.id}
                      >
                        {updating === booking.id ? '⏳' : '⚠️'}
                      </button>
                    )}
                    
                    <button 
                      className="btn-action btn-details"
                      title="View Details"
                      disabled={updating === booking.id}
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>⚠️ Error loading bookings: {error}</p>
          <button onClick={refresh} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && bookings.length === 0 && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <p>📦 No bookings found</p>
          {filters.search && (
            <button onClick={() => handleFilterChange('search', '')} className="clear-filters-btn">
              Clear search to see all bookings
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="table-pagination">
          <button 
            className="page-btn"
            disabled={!pagination.hasPrev || loading}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>
          
          <div className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          
          <button 
            className="page-btn"
            disabled={!pagination.hasNext || loading}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBookingTable;