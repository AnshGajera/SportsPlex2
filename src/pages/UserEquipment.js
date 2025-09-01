import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, Calendar, Users, Camera, AlertTriangle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const UserEquipment = () => {
  // Request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestEquipment, setRequestEquipment] = useState(null);
  const [requestDuration, setRequestDuration] = useState('');
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  const handleRequestClick = (equipment) => {
    setRequestEquipment(equipment);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    try {
      if (!requestDuration.trim()) {
        alert('Please enter duration');
        return;
      }
      
      await api.post('/equipment/request', {
        equipmentId: requestEquipment._id,
        duration: requestDuration,
        quantityRequested: requestQuantity,
        purpose: requestPurpose
      });
      
      setRequestModalOpen(false);
      setRequestEquipment(null);
      setRequestDuration('');
      setRequestPurpose('');
      setRequestQuantity(1);
      alert('Request sent to admin successfully!');
      
      // Refresh data
      fetchEquipment();
      fetchMyRequests();
      fetchAnalytics();
    } catch (error) {
      console.error('Error sending request:', error);
      const errorMessage = error.response?.data?.error || 'Error sending request';
      alert(errorMessage);
    }
  };

  // State
  const [equipmentList, setEquipmentList] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myAllocations, setMyAllocations] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [analyticsData, setAnalyticsData] = useState([
    { icon: Package, count: 0, label: 'Available Equipment', color: '#3b82f6' },
    { icon: Clock, count: 0, label: 'Pending Requests', color: '#f59e0b' },
    { icon: CheckCircle, count: 0, label: 'Approved Requests', color: '#10b981' },
    { icon: AlertTriangle, count: 0, label: 'Current Allocations', color: '#8b5cf6' }
  ]);

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

  const fetchMyRequests = async () => {
    try {
      const response = await api.get('/equipment/requests/my');
      setMyRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchMyAllocations = async () => {
    try {
      const response = await api.get('/equipment/allocations/my');
      setMyAllocations(response.data);
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const userRequests = await api.get('/equipment/requests/my');
      const userAllocations = await api.get('/equipment/allocations/my');
      const equipmentResponse = await api.get('/equipment');
      
      const requests = userRequests.data;
      const allocations = userAllocations.data;
      const equipment = equipmentResponse.data;
      
      setAnalyticsData([
        { icon: Package, count: equipment.length, label: 'Total Equipment', color: '#3b82f6' },
        { icon: Clock, count: requests.filter(r => r.status === 'pending').length, label: 'Pending Requests', color: '#f59e0b' },
        { icon: CheckCircle, count: requests.filter(r => r.status === 'approved').length, label: 'Approved', color: '#10b981' },
        { icon: XCircle, count: allocations.length, label: 'Current Allocations', color: '#8b5cf6' }
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // useEffect hooks
  useEffect(() => {
    fetchEquipment();
    fetchMyRequests();
    fetchMyAllocations();
    fetchAnalytics();
  }, []);

  // Filter equipment based on search and category
  const filteredEquipment = equipmentList.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || equipment.category === selectedCategory;
    
    // Handle legacy equipment that doesn't have availableQuantity field
    const availableQty = equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity;
    const hasAvailableStock = availableQty > 0;
    
    return matchesSearch && matchesCategory && hasAvailableStock;
  });

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '16px'
      }}>
        <div>
          <h1 className="page-title">Sports Equipment</h1>
          <p className="page-subtitle">
            {activeTab === 'browse'
              ? 'Browse and request sports equipment'
              : activeTab === 'requests'
              ? 'Track your equipment requests'
              : 'View your current allocations'}
          </p>
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

      {/* Tabs + Search/Filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          marginBottom: '16px',
          gap: '20px',
          flexWrap: 'nowrap'
        }}
      >
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Equipment
          </button>
          <button
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            My Requests
          </button>
          <button
            className={`tab ${activeTab === 'allocations' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocations')}
          >
            My Allocations
          </button>
        </div>

        {activeTab === 'browse' && (
          <>
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
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 10px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '14px',
                cursor: 'pointer',
                transform: 'translateY(-7px)'
              }}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Browse Section */}
      {activeTab === 'browse' && (
        <div>
          {filteredEquipment.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                No equipment available
              </h3>
              <p style={{ marginBottom: '12px' }}>
                {equipmentList.length === 0 
                  ? 'Equipment inventory is currently empty. Check back later or contact administrator.'
                  : 'No equipment matches your search criteria or all matching equipment is currently unavailable.'
                }
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {filteredEquipment.map((equipment, index) => (
                <EquipmentCard
                  key={equipment._id || index}
                  equipment={equipment}
                  onRequest={handleRequestClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Equipment Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Request Equipment</h2>
            <p className="mb-4">
              Equipment: <b>{requestEquipment?.name}</b>
            </p>
            <p className="mb-4 text-sm text-gray-600">
              Available: {requestEquipment?.availableQuantity !== undefined ? requestEquipment?.availableQuantity : requestEquipment?.quantity || 0} units
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed
                </label>
                <input
                  type="number"
                  min="1"
                  max={requestEquipment?.availableQuantity !== undefined ? requestEquipment?.availableQuantity : requestEquipment?.quantity || 1}
                  value={requestQuantity}
                  onChange={(e) => {
                    const maxQty = requestEquipment?.availableQuantity !== undefined ? requestEquipment?.availableQuantity : requestEquipment?.quantity || 1;
                    setRequestQuantity(Math.max(1, Math.min(
                      parseInt(e.target.value) || 1, 
                      maxQty
                    )));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return By (Date & Time) *</label>
                <input
                  type="datetime-local"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose (Optional)
                </label>
                <textarea
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 resize-none"
                  placeholder="Describe the purpose for requesting this equipment"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => {
                  setRequestModalOpen(false);
                  setRequestPurpose('');
                  setRequestQuantity(1);
                  setExpectedReturnDate(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSubmitRequest}
                disabled={!expectedReturnDate}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Requests Section */}
      {activeTab === 'requests' && (
        <div>
          {myRequests.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                No requests found
              </h3>
              <p style={{ marginBottom: '12px' }}>
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}
                      >
                        {request.equipment?.name}
                      </h3>
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
                      {request.adminNotes && (
                        <p style={{ color: '#64748b', marginBottom: '8px' }}>
                          Admin Notes: {request.adminNotes}
                        </p>
                      )}
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
                              : request.status === 'returned'
                              ? '#f3e8ff'
                              : request.status === 'pending'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            request.status === 'approved'
                              ? '#166534'
                              : request.status === 'allocated'
                              ? '#1e40af'
                              : request.status === 'returned'
                              ? '#7c3aed'
                              : request.status === 'pending'
                              ? '#92400e'
                              : '#dc2626'
                        }}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    {request.equipment?.image && (
                      <img
                        src={`http://localhost:5000${request.equipment.image}`}
                        alt={request.equipment.name}
                        style={{
                          width: '80px',
                          height: '60px',
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

      {/* My Allocations Section - Add new tab */}
      {activeTab === 'allocations' && (
        <div>
          {myAllocations.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-state-icon" />
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                No current allocations
              </h3>
              <p style={{ marginBottom: '12px' }}>
                You don't have any equipment currently allocated to you.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {myAllocations.map((allocation, index) => {
                const isOverdue = new Date() > new Date(allocation.expectedReturnDate);
                return (
                  <div key={index} className="card">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            marginBottom: '8px'
                          }}
                        >
                          {allocation.equipment?.name}
                        </h3>
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
                          Return by: {new Date(allocation.expectedReturnDate).toLocaleString()}
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
                            color: isOverdue ? '#dc2626' : '#1e40af'
                          }}
                        >
                          {isOverdue ? 'Overdue' : 'Allocated'}
                        </span>
                      </div>
                      {allocation.equipment?.image && (
                        <img
                          src={`http://localhost:5000${allocation.equipment.image}`}
                          alt={allocation.equipment.name}
                          style={{
                            width: '80px',
                            height: '60px',
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
    </div>
  );
};

// EquipmentCard component with modern design
const EquipmentCard = ({ equipment, onRequest }) => {
  const handleImageError = (e) => {
    console.log('Equipment image failed to load:', e.target.src);
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const imageUrl = equipment.image ? `http://localhost:5000${equipment.image}` : null;
  const availableQty = equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity;
  const isAvailable = availableQty > 0;

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
            isAvailable 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {isAvailable ? `${availableQty} Available` : 'Not Available'}
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
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/20 via-blue-200/20 to-purple-200/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-700"></div>
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
            {equipment.description || 'High-quality sports equipment available for use.'}
          </p>
        </div>
        
        {/* Stats and Info */}
        <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Package size={14} className="mr-1.5 text-purple-500" />
              <span className="font-medium text-gray-700">{availableQty}</span>
              <span className="ml-1">/{equipment.quantity}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle size={14} className="mr-1.5 text-green-500" />
              <span className="font-medium text-gray-700">{equipment.condition || 'Good'}</span>
            </div>
          </div>
        </div>
        
        {/* Request Button */}
        <button
          onClick={() => onRequest(equipment)}
          disabled={!isAvailable}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
            isAvailable
              ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Request Equipment' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default UserEquipment;
