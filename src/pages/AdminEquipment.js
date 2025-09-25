
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, Package, Clock, CheckCircle, XCircle, Plus, Users, AlertTriangle, BarChart3 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import AddEquipmentModal from '../components/Modals/AddEquipmentModal';
import { AdminBookingTable, BookingTimelineView } from '../components/Bookings';
import AdminBookingDebug from '../components/Bookings/AdminBookingDebug';
import NotificationCenter from '../components/Bookings/NotificationCenter';
import { RealTimeStatus, useBookingNotifications } from '../hooks/useRealTimeBookings';
import api from '../services/api';

// Timer card for each allocation
function AllocationCard({ allocation }) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!allocation.expectedReturnDate) {
      setTimeLeft('Unknown');
      return;
    }
    const endTime = new Date(allocation.expectedReturnDate);
    const updateTimer = () => {
      const now = new Date();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [allocation.expectedReturnDate]);
  const isOverdue = timeLeft === 'Expired';
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
            {allocation.equipment?.name}
          </h3>
          <p style={{ color: '#64748b', marginBottom: '4px' }}>
            Allocated to: {allocation.allocatedTo?.firstName} {allocation.allocatedTo?.lastName}
          </p>
          <p style={{ color: '#64748b', marginBottom: '4px' }}>
            Email: {allocation.allocatedTo?.email}
          </p>
          <p style={{ color: '#64748b', marginBottom: '4px' }}>
            Quantity: {allocation.quantityAllocated}
          </p>
          <p style={{ color: '#64748b', marginBottom: '4px' }}>
            Allocated on: {new Date(allocation.allocationDate).toLocaleDateString()}
          </p>
          <p style={{ color: isOverdue ? '#dc2626' : '#64748b', marginBottom: '8px', fontWeight: isOverdue ? '600' : 'normal' }}>
            Time left: {timeLeft}
            {isOverdue && ' (OVERDUE)'}
          </p>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: isOverdue ? '#fee2e2' : '#dbeafe',
              color: isOverdue ? '#dc2626' : '#1e40af',
              marginBottom: '8px'
            }}
          >
            {isOverdue ? 'Overdue' : 'Active'}
          </span>
        </div>
        {allocation.equipment?.image && (
          <img 
            src={`http://localhost:5000${allocation.equipment.image}`} 
            alt={allocation.equipment.name} 
            style={{ 
              width: '120px', 
              height: '90px', 
              borderRadius: '8px', 
              marginLeft: '16px', 
              objectFit: 'cover' 
            }} 
          />
        )}
      </div>
    </div>
  );
}


const AdminEquipment = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([
    {
      icon: Package,
      count: 0,
      label: 'Total Equipment',
      color: '#3b82f6'
    },
    {
      icon: Clock,
      count: 0,
      label: 'Pending Requests',
      color: '#f59e0b'
    },
    {
      icon: Users,
      count: 0,
      label: 'Active Allocations',
      color: '#10b981'
    },
    {
      icon: AlertTriangle,
      count: 0,
      label: 'Overdue Returns',
      color: '#ef4444'
    }
  ]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);

  // Add notification system
  const {
    notifications,
    addNotification,
    removeNotification
  } = useBookingNotifications();

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

  // Fetch functions
  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipmentList(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/equipment/requests');
  setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get('/equipment/allocations');
      setAllocations(response.data);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsResponse = await api.get('/equipment/requests/analytics');
      const analytics = analyticsResponse.data;
      
      setAnalyticsData([
        {
          icon: Package,
          count: analytics.totalEquipment || 0,
          label: 'Total Equipment',
          color: '#3b82f6'
        },
        {
          icon: Clock,
          count: analytics.pending || 0,
          label: 'Pending Requests',
          color: '#f59e0b'
        },
        {
          icon: Users,
          count: analytics.totalAllocated || 0,
          label: 'Active Allocations',
          color: '#10b981'
        },
        {
          icon: AlertTriangle,
          count: analytics.overdueAllocations || 0,
          label: 'Overdue Returns',
          color: '#ef4444'
        }
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // useEffect hooks
  useEffect(() => {
    fetchEquipment();
    fetchRequests();
    fetchAllocations();
    fetchAnalytics();
  }, []);

  // Check URL parameters to set initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (['requests', 'allocations', 'returns'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleAddEquipment = (equipmentData) => {
    // ...existing code...
    const submitEquipment = async () => {
      try {
        const formData = new FormData();
        Object.entries(equipmentData).forEach(([key, value]) => {
          if (key === 'image' && value) {
            formData.append(key, value);
          } else if (key !== 'imagePreview') {
            formData.append(key, value);
          }
        });
        await api.post('/equipment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Refresh data
        fetchEquipment();
        fetchAnalytics();
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('Error adding equipment:', error);
      }
    };
    submitEquipment();
  };


  // Edit equipment logic
  const handleEditClick = (equipment) => {
    setEditEquipment(equipment);
    setEditModalOpen(true);
  };

  // Delete equipment logic
  const handleDeleteEquipment = (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      const deleteEquipment = async () => {
        try {
          await api.delete(`/equipment/${equipmentId}`);
          const response = await api.get('/equipment');
          setEquipmentList(response.data);
        } catch (error) {
          console.error('Error deleting equipment:', error);
        }
      };
      deleteEquipment();
    }
  };

  const handleEditEquipment = (equipmentData) => {
    const submitEdit = async () => {
      try {
        const formData = new FormData();
        Object.entries(equipmentData).forEach(([key, value]) => {
          if (key === 'image' && value && typeof value !== 'string') {
            formData.append(key, value);
          } else if (key !== 'imagePreview') {
            formData.append(key, value);
          }
        });
        await api.put(`/equipment/${editEquipment._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Refresh data
        fetchEquipment();
        fetchAnalytics();
        setEditModalOpen(false);
        setEditEquipment(null);
      } catch (error) {
        console.error('Error editing equipment:', error);
      }
    };
    submitEdit();
  };

  // Request management functions
  const handleApproveRequest = async (requestId, expectedReturnDate) => {
    try {
      await api.put(`/equipment/requests/${requestId}`, {
        status: 'approved',
        expectedReturnDate,
        adminNotes: 'Request approved'
      });
      
      // Refresh data
      fetchRequests();
      fetchAnalytics();
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      await api.put(`/equipment/requests/${requestId}`, {
        status: 'rejected',
        adminNotes: reason || 'Request rejected'
      });
      
      // Refresh data
      fetchRequests();
      fetchAnalytics();
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleAllocateEquipment = async (requestId, expectedReturnDate) => {
    try {
      await api.post(`/equipment/allocate/${requestId}`, {
        expectedReturnDate
      });
      
      // Refresh data
      fetchRequests();
      fetchAllocations();
      fetchEquipment();
      fetchAnalytics();
      alert('Equipment allocated successfully!');
    } catch (error) {
      console.error('Error allocating equipment:', error);
      alert('Error allocating equipment: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleReturnEquipment = async (allocationId, returnCondition, returnNotes) => {
    try {
      await api.post(`/equipment/return/${allocationId}`, {
        returnCondition,
        returnNotes
      });
      
      // Refresh data
      fetchAllocations();
      fetchEquipment();
      fetchAnalytics();
      alert('Equipment returned successfully!');
    } catch (error) {
      console.error('Error returning equipment:', error);
      alert('Error returning equipment: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  // Migration function for legacy data
  const handleDataMigration = async () => {
    try {
      const response = await api.post('/equipment/migrate');
      alert(response.data.message);
      // Refresh data after migration
      fetchEquipment();
      fetchAnalytics();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Notification Center */}
      <NotificationCenter 
        notifications={notifications} 
        onRemove={removeNotification} 
      />

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '16px'
      }}>
        <div>
          <h1 className="page-title">Equipment Management - Admin</h1>
          <p className="page-subtitle">
            {activeTab === 'browse' ? 'Browse and manage equipment inventory' : 'Manage inventory and approve requests'}
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <button 
            className="btn btn-secondary"
            onClick={handleDataMigration}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)',
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#6b7280';
            }}
          >
            Migrate Data
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
              minWidth: 'fit-content'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
            }}
          >
            <Plus size={18} />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="stats-grid" style={{ marginBottom: '16px' }}>
        {analyticsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={index} 
              className="stat-card" 
              style={{
                background: '#fff',
                boxShadow: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 2px 16px #e5e7eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: `${stat.color}15`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent size={18} color={stat.color} />
              </div>
              <div className="stat-content">
                <h3 style={{ 
                  color: stat.color, 
                  margin: 0, 
                  fontSize: '1.25rem', 
                  fontWeight: '700' 
                }}>
                  {stat.count}
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#64748b', 
                  fontSize: '0.75rem',
                  fontWeight: '500' 
                }}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '16px',
        gap: '20px',
        flexWrap: 'nowrap'
      }}>
        {/* Tabs on the left */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Manage Inventory
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Equipment Requests
          </button>
          <button 
            className={`tab ${activeTab === 'allocations' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocations')}
          >
            Active Allocations
          </button>
          <button 
            className={`tab ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            Manage Returns
          </button>
          <button 
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <BarChart3 size={16} style={{ marginRight: '6px' }} />
            Booking Analytics
          </button>
        </div>

        {/* Search bar positioned right after tabs */}
        <div style={{ 
          minWidth: '280px', 
          maxWidth: '350px',
          flexShrink: 0,
          transform: 'translateY(-7px)'
        }}>
          <SearchBar
            placeholder="Search the equipment "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category dropdown */}
        <div style={{ flexShrink: 0 }}>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              transform: 'translateY(-7px)',
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
              cursor: 'pointer'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === 'browse' && (
        <div>
          {equipmentList.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No equipment in inventory
              </h3>
              <p style={{ marginBottom: '12px' }}>
                Equipment inventory is currently empty. Add new equipment to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {equipmentList.map((equipment, index) => (
                <div key={index} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>{equipment.name}</h3>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>Category: {equipment.category}</p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      Quantity: {equipment.quantity} | Available: {equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity} | Allocated: {equipment.allocatedQuantity || 0}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>Condition: {equipment.condition}</p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>Location: {equipment.location}</p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>Description: {equipment.description}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button className="btn btn-secondary" onClick={() => handleEditClick(equipment)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteEquipment(equipment._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  {equipment.image && (
                    <img src={`http://localhost:5000${equipment.image}`} alt={equipment.name} style={{ width: '220px', height: '180px', borderRadius: '12px', marginLeft: '32px', objectFit: 'cover', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No equipment requests
              </h3>
              <p style={{ marginBottom: '12px' }}>
                There are no equipment requests to review at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {requests.map((request, index) => (
                <div key={index} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                        {request.equipment?.name}
                      </h3>
                      <p style={{ color: '#64748b', marginBottom: '4px' }}>
                        Requested by: {request.requester?.firstName} {request.requester?.lastName}
                      </p>
                      <p style={{ color: '#64748b', marginBottom: '4px' }}>
                        Email: {request.requester?.email}
                      </p>
                      <p style={{ color: '#64748b', marginBottom: '4px' }}>
                        Quantity: {request.quantityRequested}
                      </p>
                      <p style={{ color: '#64748b', marginBottom: '4px' }}>
                        Duration: {request.duration?.hours || 0} hours {request.duration?.minutes || 0} min
                      </p>
                      {request.purpose && (
                        <p style={{ color: '#64748b', marginBottom: '4px' }}>
                          Purpose: {request.purpose}
                        </p>
                      )}
                      <p style={{ color: '#64748b', marginBottom: '8px' }}>
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor:
                              request.status === 'approved'
                                ? '#dcfce7'
                                : request.status === 'allocated'
                                ? '#dbeafe'
                                : request.status === 'pending'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              request.status === 'approved'
                                ? '#166534'
                                : request.status === 'allocated'
                                ? '#1e40af'
                                : request.status === 'pending'
                                ? '#92400e'
                                : '#dc2626'
                          }}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      {request.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button 
                            className="btn btn-secondary"
                            style={{ backgroundColor: '#10b981', color: 'white' }}
                            onClick={() => {
                              handleApproveRequest(request._id);
                            }}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (optional):');
                              handleRejectRequest(request._id, reason);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Allocation step removed. Approval means allocation. */}

                      {request.adminNotes && (
                        <p style={{ color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                          Admin Notes: {request.adminNotes}
                        </p>
                      )}
                    </div>
                    {request.equipment?.image && (
                      <img 
                        src={`http://localhost:5000${request.equipment.image}`} 
                        alt={request.equipment.name} 
                        style={{ 
                          width: '120px', 
                          height: '90px', 
                          borderRadius: '8px', 
                          marginLeft: '16px', 
                          objectFit: 'cover' 
                        }} 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Allocations Tab */}
      {activeTab === 'allocations' && (
        <div>
          {allocations.filter(a => a.status === 'allocated').length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No active allocations
              </h3>
              <p style={{ marginBottom: '12px' }}>
                There are no equipment allocations currently active.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {allocations.filter(a => a.status === 'allocated').map((allocation, index) => (
                <AllocationCard key={index} allocation={allocation} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage Returns Tab */}
      {activeTab === 'returns' && (
        <div>
          {allocations.filter(a => a.status === 'allocated').length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No equipment to return
              </h3>
              <p style={{ marginBottom: '12px' }}>
                There are no equipment allocations waiting for return.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {allocations.filter(a => a.status === 'allocated').map((allocation, index) => {
                const isOverdue = new Date() > new Date(allocation.expectedReturnDate);
                return (
                  <div key={index} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                          {allocation.equipment?.name}
                        </h3>
                        <p style={{ color: '#64748b', marginBottom: '4px' }}>
                          Allocated to: {allocation.allocatedTo?.firstName} {allocation.allocatedTo?.lastName}
                        </p>
                        <p style={{ color: '#64748b', marginBottom: '4px' }}>
                          Quantity: {allocation.quantityAllocated}
                        </p>
                        <p style={{ color: '#64748b', marginBottom: '4px' }}>
                          Allocated on: {new Date(allocation.allocationDate).toLocaleDateString()}
                        </p>
                        <p style={{ 
                          color: isOverdue ? '#dc2626' : '#64748b', 
                          marginBottom: '8px',
                          fontWeight: isOverdue ? '600' : 'normal'
                        }}>
                          Expected return: {new Date(allocation.expectedReturnDate).toLocaleDateString()}
                          {isOverdue && ' (OVERDUE)'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              const condition = prompt('Enter return condition (excellent/good/fair/poor/damaged):');
                              if (condition) {
                                const notes = prompt('Enter return notes (optional):') || '';
                                handleReturnEquipment(allocation._id, condition, notes);
                              }
                            }}
                          >
                            Mark as Returned
                          </button>
                        </div>
                      </div>
                      {allocation.equipment?.image && (
                        <img 
                          src={`http://localhost:5000${allocation.equipment.image}`} 
                          alt={allocation.equipment.name} 
                          style={{ 
                            width: '120px', 
                            height: '90px', 
                            borderRadius: '8px', 
                            marginLeft: '16px', 
                            objectFit: 'cover' 
                          }} 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Analytics Tab */}
      {activeTab === 'bookings' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#2c3e50' }}>
              Equipment Booking Analytics
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>
              Comprehensive view of all equipment bookings, user activity, and booking patterns.
            </p>
          </div>
          
          {/* Debug Component - Remove after fixing */}
          <AdminBookingDebug />
          
          {/* Admin Booking Table */}
          <AdminBookingTable />
          
          {/* Booking Timeline Section */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: '#2c3e50' }}>
              Equipment Booking Timeline
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '16px' }}>
              Visual timeline showing booking patterns and utilization across all equipment.
            </p>
            <BookingTimelineView isAdmin={true} />
          </div>
        </div>
      )}
      
      {/* Add Equipment Modal */}
      <AddEquipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEquipment}
      />
      {/* Edit Equipment Modal (reuse AddEquipmentModal) */}
      {editModalOpen && (
        <AddEquipmentModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditEquipment(null); }}
          onSubmit={handleEditEquipment}
          initialData={editEquipment}
        />
      )}
    </div>
  );
};

export default AdminEquipment;
