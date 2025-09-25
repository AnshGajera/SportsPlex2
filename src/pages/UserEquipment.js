import React, { useState, useEffect } from 'react';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const UserEquipment = () => {
  // Request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestEquipment, setRequestEquipment] = useState(null);
  const [requestStartDate, setRequestStartDate] = useState(dayjs()); // Default to current date/time
  const [expectedReturnDate, setExpectedReturnDate] = useState(null);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestQuantity, setRequestQuantity] = useState(1);
  
  // Equipment availability state
  const [equipmentAllocations, setEquipmentAllocations] = useState({});
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  const handleRequestClick = async (equipment) => {
    setRequestEquipment(equipment);
    setRequestModalOpen(true);
    
    // Fetch allocation data to show blocked times in calendar
    await fetchEquipmentAllocations(equipment._id);
  };

  const fetchEquipmentAllocations = async (equipmentId) => {
    try {
      setLoadingAllocations(true);
      const response = await api.get(`/equipment/availability/${equipmentId}`);
      
      setEquipmentAllocations(prev => ({
        ...prev,
        [equipmentId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching equipment allocations:', error);
    } finally {
      setLoadingAllocations(false);
    }
  };

  // Function to check if a date/time is blocked for selected equipment
  const isDateTimeBlocked = (dateTime, equipmentId) => {
    const allocations = equipmentAllocations[equipmentId];
    if (!allocations || !allocations.currentAllocations) return false;

    const selectedDate = dayjs(dateTime);
    
    return allocations.currentAllocations.some(allocation => {
      const allocationStart = dayjs(allocation.allocationDate);
      const allocationEnd = dayjs(allocation.expectedReturnDate);
      
      return selectedDate.isBetween(allocationStart, allocationEnd, null, '[]');
    });
  };

  // Function to check if a date range overlaps with existing allocations
  const isDateRangeBlocked = (startDate, endDate, equipmentId) => {
    const allocations = equipmentAllocations[equipmentId];
    if (!allocations || !allocations.currentAllocations) return false;

    const requestStart = dayjs(startDate);
    const requestEnd = dayjs(endDate);
    
    return allocations.currentAllocations.some(allocation => {
      const allocationStart = dayjs(allocation.allocationDate);
      const allocationEnd = dayjs(allocation.expectedReturnDate);
      
      // Check if ranges overlap
      return requestStart.isBefore(allocationEnd) && requestEnd.isAfter(allocationStart);
    });
  };

  // Function to get availability percentage for equipment
  const getAvailabilityInfo = (equipmentId) => {
    const allocations = equipmentAllocations[equipmentId];
    if (!allocations) return null;

    const { totalQuantity, availableQuantity, allocatedQuantity } = allocations.availabilityStats;
    const availabilityPercentage = totalQuantity > 0 ? Math.round((availableQuantity / totalQuantity) * 100) : 0;
    
    return {
      availableQuantity,
      totalQuantity,
      allocatedQuantity,
      availabilityPercentage,
      isFullyBooked: availableQuantity === 0
    };
  };

  const handleSubmitRequest = async () => {
    try {
      if (!requestStartDate) {
        alert('Please select a start date and time');
        return;
      }
      if (!expectedReturnDate) {
        alert('Please select a return date and time');
        return;
      }
      if (requestStartDate.isAfter(dayjs(expectedReturnDate))) {
        alert('Start date cannot be after return date');
        return;
      }
      if (requestStartDate.isBefore(dayjs())) {
        alert('Start date cannot be in the past');
        return;
      }
      
      // Check for date range conflicts
      if (requestEquipment && isDateRangeBlocked(requestStartDate, expectedReturnDate, requestEquipment._id)) {
        alert('The selected date range conflicts with existing bookings. Please choose different dates.');
        return;
      }
      
      await api.post('/equipment/request', {
        equipmentId: requestEquipment._id,
        requestStartDate: requestStartDate.format(),
        expectedReturnDate: dayjs(expectedReturnDate).format(),
        quantityRequested: requestQuantity,
        purpose: requestPurpose
      });
      setRequestModalOpen(false);
      setRequestEquipment(null);
      setRequestPurpose('');
      setRequestQuantity(1);
      setRequestStartDate(dayjs());
      setExpectedReturnDate(null);
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
    { icon: Package, count: 0, label: 'Total Equipment', color: '#3b82f6' },
    { icon: Clock, count: 0, label: 'Pending Requests', color: '#f59e0b' },
    { icon: CheckCircle, count: 0, label: 'Approved', color: '#10b981' },
    { icon: XCircle, count: 0, label: 'Current Allocations', color: '#8b5cf6' }
  ]);

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

  // Load allocations for all equipment when equipment list changes
  useEffect(() => {
    if (equipmentList.length > 0) {
      equipmentList.forEach(equipment => {
        fetchEquipmentAllocations(equipment._id);
      });
    }
  }, [equipmentList]);

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
      <div style={{ marginBottom: '16px' }}>
        <h1 className="page-title">Equipment Management</h1>
        <p className="page-subtitle">
          {activeTab === 'browse'
            ? 'Browse and request equipment'
            : 'Track your equipment requests'}
        </p>
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
          gap: '20px',
          marginBottom: '16px',
          flexWrap: 'nowrap',
          flexShrink: 0
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
            <div className="grid grid-1">
              {filteredEquipment.map((equipment, index) => (
                <div
                  key={index}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
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
                      {equipment.name}
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      Category: {equipment.category}
                    </p>
                    {(() => {
                      const availabilityInfo = getAvailabilityInfo(equipment._id);
                      return (
                        <>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            marginBottom: '8px' 
                          }}>
                            <p style={{ color: '#64748b' }}>
                              Available: {equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity} / {equipment.quantity}
                            </p>
                            {availabilityInfo && (
                              <div style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                backgroundColor: availabilityInfo.isFullyBooked ? '#fee2e2' : availabilityInfo.availabilityPercentage > 50 ? '#dcfce7' : '#fef3c7',
                                color: availabilityInfo.isFullyBooked ? '#dc2626' : availabilityInfo.availabilityPercentage > 50 ? '#16a34a' : '#d97706'
                              }}>
                                {availabilityInfo.isFullyBooked ? 'Fully Booked' : `${availabilityInfo.availabilityPercentage}% Available`}
                              </div>
                            )}
                          </div>
                          <p style={{ color: '#64748b', marginBottom: '8px' }}>
                            Condition: {equipment.condition}
                          </p>
                          <p style={{ color: '#64748b', marginBottom: '8px' }}>
                            Location: {equipment.location}
                          </p>
                          <p style={{ color: '#64748b', marginBottom: '8px' }}>
                            Description: {equipment.description}
                          </p>
                          {availabilityInfo && availabilityInfo.allocatedQuantity > 0 && (
                            <div style={{ 
                              backgroundColor: '#f1f5f9', 
                              padding: '8px', 
                              borderRadius: '6px', 
                              marginBottom: '8px',
                              fontSize: '14px'
                            }}>
                              <p style={{ color: '#475569', margin: '0', fontWeight: '500' }}>
                                📅 Currently Allocated: {availabilityInfo.allocatedQuantity} units
                              </p>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleRequestClick(equipment)}
                              disabled={(equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity) === 0}
                            >
                              {(equipment.availableQuantity !== undefined ? equipment.availableQuantity : equipment.quantity) === 0 ? 'Not Available' : 'Request Equipment'}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {equipment.image && (
                    <img
                      src={`http://localhost:5000${equipment.image}`}
                      alt={equipment.name}
                      style={{
                        width: '180px',
                        height: '140px',
                        borderRadius: '12px',
                        marginLeft: '32px',
                        objectFit: 'cover',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Request Equipment Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Request Equipment</h2>
            <div className="mb-6">
              <p className="mb-4">
                Equipment: <b>{requestEquipment?.name}</b>
              </p>
              
              {/* Availability Overview */}
              {(() => {
                const availabilityInfo = requestEquipment ? getAvailabilityInfo(requestEquipment._id) : null;
                const allocations = requestEquipment ? equipmentAllocations[requestEquipment._id] : null;
                
                return (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Availability Status</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {availabilityInfo?.totalQuantity || requestEquipment?.quantity || 0}
                          </div>
                          <div className="text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {availabilityInfo?.availableQuantity || requestEquipment?.availableQuantity || requestEquipment?.quantity || 0}
                          </div>
                          <div className="text-gray-600">Available</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {availabilityInfo?.allocatedQuantity || 0}
                          </div>
                          <div className="text-gray-600">Booked</div>
                        </div>
                      </div>
                    </div>

                    {/* Current Allocations Alert */}
                    {allocations?.currentAllocations && allocations.currentAllocations.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                        <h5 className="font-medium text-sm text-yellow-800 mb-2">
                          📋 Currently Booked ({allocations.currentAllocations.length} bookings)
                        </h5>
                        <div className="space-y-1 text-xs text-yellow-700">
                          {allocations.currentAllocations.slice(0, 2).map((allocation, index) => (
                            <div key={index}>
                              • {allocation.quantityAllocated} units booked until {new Date(allocation.expectedReturnDate).toLocaleDateString()}
                            </div>
                          ))}
                          {allocations.currentAllocations.length > 2 && (
                            <div className="text-yellow-600">
                              + {allocations.currentAllocations.length - 2} more bookings...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Request From (Date & Time) *</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={requestStartDate}
                    onChange={(newValue) => {
                      setRequestStartDate(newValue);
                      // If return date is before new start date, clear it
                      if (expectedReturnDate && newValue && dayjs(expectedReturnDate).isBefore(newValue)) {
                        setExpectedReturnDate(null);
                      }
                    }}
                    shouldDisableDate={(date) => {
                      // Disable past dates
                      if (date.isBefore(dayjs(), 'day')) return true;
                      
                      // Check if equipment is fully booked on this date
                      if (requestEquipment && equipmentAllocations[requestEquipment._id]) {
                        const availabilityInfo = getAvailabilityInfo(requestEquipment._id);
                        return availabilityInfo && availabilityInfo.isFullyBooked && isDateTimeBlocked(date, requestEquipment._id);
                      }
                      
                      return false;
                    }}
                    shouldDisableTime={(value, view) => {
                      if (!requestEquipment) return false;
                      
                      // Check if this specific time is blocked
                      return isDateTimeBlocked(value, requestEquipment._id);
                    }}
                    minDateTime={dayjs()}
                    renderInput={(params) => <input {...params} />}
                  />
                </LocalizationProvider>
                
                {/* Current Date/Time Button */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setRequestStartDate(dayjs())}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    📅 Set to Current Date & Time
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return By (Date & Time) *</label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Return Date & Time"
                    value={expectedReturnDate ? dayjs(expectedReturnDate) : null}
                    onChange={newValue => setExpectedReturnDate(newValue)}
                    shouldDisableDate={(date) => {
                      // Disable dates before start date
                      if (requestStartDate && date.isBefore(requestStartDate, 'day')) return true;
                      
                      // Disable past dates
                      if (date.isBefore(dayjs(), 'day')) return true;
                      
                      // Check if equipment is fully booked on this date
                      if (requestEquipment && equipmentAllocations[requestEquipment._id]) {
                        const availabilityInfo = getAvailabilityInfo(requestEquipment._id);
                        return availabilityInfo && availabilityInfo.isFullyBooked && isDateTimeBlocked(date, requestEquipment._id);
                      }
                      
                      return false;
                    }}
                    shouldDisableTime={(value, view) => {
                      if (!requestEquipment) return false;
                      
                      // Disable times before start time on same day
                      if (requestStartDate && value.isSame(requestStartDate, 'day') && value.isBefore(requestStartDate)) {
                        return true;
                      }
                      
                      // Check if this specific time is blocked
                      return isDateTimeBlocked(value, requestEquipment._id);
                    }}
                    minDateTime={requestStartDate || dayjs()}
                    renderInput={(params) => <input {...params} />}
                  />
                </LocalizationProvider>
                
                {/* Show blocked time information */}
                {requestEquipment && equipmentAllocations[requestEquipment._id] && (
                  <div className="mt-2">
                    {(() => {
                      const allocations = equipmentAllocations[requestEquipment._id];
                      const currentAllocations = allocations.currentAllocations || [];
                      
                      if (currentAllocations.length > 0) {
                        return (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-red-600 mb-1">⚠️ Blocked Time Slots:</p>
                            {currentAllocations.slice(0, 3).map((allocation, index) => (
                              <div key={index} className="text-xs">
                                • {dayjs(allocation.allocationDate).format('MMM DD, YYYY HH:mm')} - 
                                  {dayjs(allocation.expectedReturnDate).format('MMM DD, YYYY HH:mm')} 
                                  ({allocation.quantityAllocated} units)
                              </div>
                            ))}
                            {currentAllocations.length > 3 && (
                              <div className="text-xs text-gray-500">
                                + {currentAllocations.length - 3} more bookings
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="text-sm text-green-600">
                          ✅ All time slots available
                        </div>
                      );
                    })()}
                  </div>
                )}
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
                  setRequestStartDate(dayjs());
                  setExpectedReturnDate(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSubmitRequest}
                disabled={!requestStartDate || !expectedReturnDate}
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

export default UserEquipment;
