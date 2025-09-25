
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
    <div 
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: isOverdue ? '2px solid #ef4444' : '1px solid #e2e8f0',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Equipment Image */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {allocation.equipment?.image ? (
            <img 
              src={`http://localhost:5000${allocation.equipment.image}`} 
              alt={allocation.equipment.name}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          ) : (
            <Package size={32} color="#94a3b8" />
          )}
        </div>

        {/* Allocation Details */}
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700', 
            marginBottom: '8px',
            color: '#1e293b'
          }}>
            {allocation.equipment?.name}
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <User size={14} color="#64748b" />
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {allocation.allocatedTo?.firstName} {allocation.allocatedTo?.lastName}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Mail size={14} color="#64748b" />
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                {allocation.allocatedTo?.email}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Package size={14} color="#64748b" />
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Quantity: {allocation.quantityAllocated}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Calendar size={14} color="#64748b" />
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Allocated: {new Date(allocation.allocationDate).toLocaleDateString()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Clock size={14} color={isOverdue ? '#dc2626' : '#64748b'} />
              <span style={{ 
                color: isOverdue ? '#dc2626' : '#64748b',
                fontSize: '0.875rem',
                fontWeight: isOverdue ? '600' : 'normal'
              }}>
                Time left: {timeLeft}
                {isOverdue && ' (OVERDUE)'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: isOverdue 
              ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
              : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            color: isOverdue ? '#dc2626' : '#1e40af'
          }}>
            {isOverdue ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
            {isOverdue ? 'Overdue' : 'Active'}
          </div>
        </div>
      </div>
    </div>
  );
}

// AdminEquipmentCard component with modern design similar to UserEquipment
const AdminEquipmentCard = ({ equipment, onEdit, onDelete }) => {
  const handleImageError = (e) => {
    console.log('Equipment image failed to load:', e.target.src);
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const imageUrl = equipment.image ? `http://localhost:5000${equipment.image}` : null;
  const availableQty = equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity;
  const allocatedQty = equipment.allocatedQuantity || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer group">
      {/* Header Section with Title */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
              {equipment.name}
            </h3>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
              {equipment.category}
            </span>
          </div>
          
          {/* Availability Status */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            availableQty > 0 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {availableQty > 0 ? `${availableQty} Available` : 'Fully Allocated'}
          </div>
        </div>
      </div>

      {/* Equipment Image Section */}
      <div className="px-4 pt-2">
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-purple-200 transition-all duration-300 shadow-inner">
          {/* Dynamic Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, #8b5cf6 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, #10b981 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px, 80px 80px, 40px 40px'
            }}></div>
          </div>
          
          {/* Main Content Container */}
          <div className="relative h-full flex items-center justify-center p-4">
            {equipment.image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={`${equipment.name}`}
                      onError={handleImageError}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-all duration-700 ease-out"
                      style={{ 
                        filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 10px rgba(139, 92, 246, 0.1))',
                        maxWidth: '200px',
                        maxHeight: '200px'
                      }}
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/20 via-blue-200/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                  </div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 right-6 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse delay-300"></div>
                <div className="absolute top-1/3 right-4 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-pulse delay-700"></div>
              </div>
            ) : (
              /* Enhanced Premium Fallback Design */
              <div className="text-center relative w-full">
                {/* Main Equipment Icon */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden group-hover:scale-105 transition-all duration-500 border border-white/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out"></div>
                      <Package size={32} className="text-white relative z-10" />
                      <div className="absolute inset-2 rounded-xl bg-white/10 backdrop-blur-sm"></div>
                    </div>
                    <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl border-2 border-purple-300/30 group-hover:border-purple-400/50 group-hover:rotate-180 transition-all duration-1000 ease-out"></div>
                    <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-400/20 to-blue-600/20 animate-pulse blur-sm"></div>
                  </div>
                </div>
                
                {/* Modern Typography */}
                <div className="space-y-2 px-2">
                  <h4 className="text-lg font-bold text-gray-800 leading-tight truncate group-hover:text-purple-700 transition-colors">
                    {equipment.name}
                  </h4>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Sports Equipment</span>
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Modern corner accents */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-50 via-blue-50/50 to-transparent rounded-bl-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-50 via-purple-50/50 to-transparent rounded-tr-3xl opacity-60"></div>
        </div>
      </div>
      
      {/* Equipment Info and Actions */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-600 leading-relaxed mb-2 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {equipment.description || 'High-quality sports equipment for administrative management.'}
          </p>
        </div>
        
        {/* Equipment Details */}
        <div className="space-y-2 mb-3 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Quantity:</span>
            <span className="font-semibold text-gray-800">{equipment.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Available:</span>
            <span className="font-semibold text-green-600">{availableQty}</span>
          </div>
          <div className="flex justify-between">
            <span>Allocated:</span>
            <span className="font-semibold text-blue-600">{allocatedQty}</span>
          </div>
          <div className="flex justify-between">
            <span>Condition:</span>
            <span className="font-semibold text-gray-800">{equipment.condition || 'Good'}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span className="font-semibold text-gray-800">{equipment.location || 'N/A'}</span>
          </div>
        </div>
        
        {/* Admin Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(equipment)}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Edit Equipment
          </button>
          <button
            onClick={() => onDelete(equipment._id)}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium text-sm transition-all duration-200 hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};


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
    'Volleyball',
    'Swimming',
    'Athletics',
    'Fitness',
    'Other'
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
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 2px 16px #e5e7eb';
              }}
              onMouseLeave={(e) => {
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
                  justifyContent: 'center'
                }}
              >
                <IconComponent size={18} color={stat.color} />
              </div>
              <div className="stat-content">
                <h3
                  style={{
                    color: stat.color,
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700'
                  }}
                >
                  {stat.count}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
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
        <div className="tabs" style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
          {[
            { key: 'browse', label: 'Manage Inventory' },
            { key: 'requests', label: 'Equipment Requests' },
            { key: 'allocations', label: 'Active Allocations' },
            { key: 'returns', label: 'Manage Returns' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 24px',
                border: activeTab === tab.key ? '2px solid #0066cc' : '2px solid transparent',
                borderRadius: '8px',
                background: activeTab === tab.key 
                  ? 'linear-gradient(135deg, #0066cc 0%, #004c99 100%)' 
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                color: activeTab === tab.key ? '#fff' : '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === tab.key 
                  ? '0 4px 12px rgba(0, 102, 204, 0.3)' 
                  : '0 2px 6px rgba(0, 0, 0, 0.06)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
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
            placeholder="Search equipment..."
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

      {/* Browse Equipment Section */}
      {activeTab === 'browse' && (
        <div>
          {equipmentList.filter(equipment => {
            const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All Categories' || equipment.category === selectedCategory;
            return matchesSearch && matchesCategory;
          }).length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No equipment found
              </h3>
              <p style={{ marginBottom: '12px' }}>
                {equipmentList.length === 0 
                  ? 'Equipment inventory is currently empty. Add new equipment to get started.'
                  : 'No equipment matches your search criteria. Try adjusting your search or filters.'
                }
              </p>
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
                  cursor: 'pointer'
                }}
              >
                <Plus size={18} />
                Add Equipment
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {equipmentList
                .filter(equipment => {
                  const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = selectedCategory === 'All Categories' || equipment.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .map((equipment, index) => (
                  <AdminEquipmentCard
                    key={equipment._id || index}
                    equipment={equipment}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteEquipment}
                  />
                ))
              }
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <Package size={64} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#374151' 
              }}>
                No equipment requests
              </h3>
              <p style={{ 
                marginBottom: '12px',
                color: '#64748b'
              }}>
                There are no equipment requests to review at the moment.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px',
              padding: '4px'
            }}>
              {requests.map((request, index) => (
                <div 
                  key={index} 
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Equipment Image */}
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {request.equipment?.image ? (
                        <img 
                          src={`http://localhost:5000${request.equipment.image}`} 
                          alt={request.equipment.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                      ) : (
                        <Package size={32} color="#94a3b8" />
                      )}
                    </div>

                    {/* Request Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '700', 
                        marginBottom: '8px',
                        color: '#1e293b'
                      }}>
                        {request.equipment?.name}
                      </h3>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <User size={14} color="#64748b" />
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            {request.requester?.firstName} {request.requester?.lastName}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Mail size={14} color="#64748b" />
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            {request.requester?.email}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Package size={14} color="#64748b" />
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            Quantity: {request.quantityRequested}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Clock size={14} color="#64748b" />
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            {request.duration?.hours || 0}h {request.duration?.minutes || 0}m
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Calendar size={14} color="#64748b" />
                          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {request.purpose && (
                        <p style={{ 
                          color: '#64748b', 
                          fontSize: '0.875rem', 
                          marginBottom: '12px',
                          fontStyle: 'italic'
                        }}>
                          Purpose: {request.purpose}
                        </p>
                      )}

                      {/* Status Badge */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        marginBottom: '12px',
                        background: request.status === 'approved' ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                          : request.status === 'allocated' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                          : request.status === 'pending' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                          : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        color: request.status === 'approved' ? '#166534'
                          : request.status === 'allocated' ? '#1e40af'
                          : request.status === 'pending' ? '#92400e'
                          : '#dc2626'
                      }}>
                        {request.status === 'approved' && <CheckCircle size={12} />}
                        {request.status === 'pending' && <Clock size={12} />}
                        {request.status === 'rejected' && <XCircle size={12} />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </div>

                      {/* Action Buttons */}
                      {request.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleApproveRequest(request._id)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (optional):');
                              handleRejectRequest(request._id, reason);
                            }}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {request.adminNotes && (
                        <p style={{ 
                          color: '#64748b', 
                          marginTop: '12px', 
                          fontSize: '0.875rem',
                          fontStyle: 'italic',
                          padding: '8px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          borderLeft: '3px solid #3b82f6'
                        }}>
                          Admin Notes: {request.adminNotes}
                        </p>
                      )}
                    </div>
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
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <Users size={64} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#374151' 
              }}>
                No active allocations
              </h3>
              <p style={{ 
                marginBottom: '12px',
                color: '#64748b'
              }}>
                There are no equipment allocations currently active.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px',
              padding: '4px'
            }}>
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
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <Package size={64} color="#94a3b8" style={{ marginBottom: '16px' }} />
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#374151' 
              }}>
                No equipment to return
              </h3>
              <p style={{ 
                marginBottom: '12px',
                color: '#64748b'
              }}>
                There are no equipment allocations waiting for return.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px',
              padding: '4px'
            }}>
              {allocations.filter(a => a.status === 'allocated').map((allocation, index) => {
                const isOverdue = new Date() > new Date(allocation.expectedReturnDate);
                return (
                  <div 
                    key={index} 
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                      border: isOverdue ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {/* Equipment Image */}
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {allocation.equipment?.image ? (
                          <img 
                            src={`http://localhost:5000${allocation.equipment.image}`} 
                            alt={allocation.equipment.name}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }} 
                          />
                        ) : (
                          <Package size={32} color="#94a3b8" />
                        )}
                      </div>

                      {/* Allocation Details */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '700', 
                          marginBottom: '8px',
                          color: '#1e293b'
                        }}>
                          {allocation.equipment?.name}
                        </h3>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <User size={14} color="#64748b" />
                            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                              {allocation.allocatedTo?.firstName} {allocation.allocatedTo?.lastName}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Package size={14} color="#64748b" />
                            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                              Quantity: {allocation.quantityAllocated}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Calendar size={14} color="#64748b" />
                            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                              Allocated: {new Date(allocation.allocationDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <AlertTriangle size={14} color={isOverdue ? '#dc2626' : '#64748b'} />
                            <span style={{ 
                              color: isOverdue ? '#dc2626' : '#64748b',
                              fontSize: '0.875rem',
                              fontWeight: isOverdue ? '600' : 'normal'
                            }}>
                              Due: {new Date(allocation.expectedReturnDate).toLocaleDateString()}
                              {isOverdue && ' (OVERDUE)'}
                            </span>
                          </div>
                        </div>

                        {/* Overdue Badge */}
                        {isOverdue && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginBottom: '12px',
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            color: '#dc2626'
                          }}>
                            <AlertTriangle size={12} />
                            OVERDUE
                          </div>
                        )}

                        {/* Return Button */}
                        <button 
                          onClick={() => {
                            const condition = prompt('Enter return condition (excellent/good/fair/poor/damaged):');
                            if (condition) {
                              const notes = prompt('Enter return notes (optional):') || '';
                              handleReturnEquipment(allocation._id, condition, notes);
                            }
                          }}
                          style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                          }}
                        >
                          Mark as Returned
                        </button>
                      </div>
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
