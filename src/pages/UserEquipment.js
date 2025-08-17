import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const UserEquipment = () => {
  // Request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestEquipment, setRequestEquipment] = useState(null);
  const [requestDuration, setRequestDuration] = useState('');

  const handleRequestClick = (equipment) => {
    setRequestEquipment(equipment);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async () => {
    try {
      await api.post('/equipment/request', {
        equipmentId: requestEquipment._id,
        duration: requestDuration
      });
      setRequestModalOpen(false);
      setRequestEquipment(null);
      setRequestDuration('');
      alert('Request sent to admin!');
    } catch (error) {
      alert('Error sending request');
    }
  };

  // State
  const [equipmentList, setEquipmentList] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [analyticsData, setAnalyticsData] = useState([
    { icon: Package, count: 0, label: 'Total Equipment', color: '#3b82f6' },
    { icon: Clock, count: 0, label: 'Pending Requests', color: '#f59e0b' },
    { icon: CheckCircle, count: 0, label: 'Approved', color: '#10b981' },
    { icon: XCircle, count: 0, label: 'Rejected', color: '#ef4444' }
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

  const myRequests = []; // Placeholder if needed later

  // Fetch equipment list from backend
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get('/equipment');
        setEquipmentList(response.data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };
    fetchEquipment();
  }, []);

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
          {equipmentList.length === 0 ? (
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
                Equipment inventory is currently empty. Check back later or
                contact administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {equipmentList.map((equipment, index) => (
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
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      Quantity: {equipment.quantity}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      Condition: {equipment.condition}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      Location: {equipment.location}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      Description: {equipment.description}
                    </p>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '8px' }}
                      onClick={() => handleRequestClick(equipment)}
                    >
                      Request Equipment
                    </button>
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
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Request Equipment</h2>
            <p className="mb-2">
              Equipment: <b>{requestEquipment?.name}</b>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours or days)
            </label>
            <input
              type="text"
              value={requestDuration}
              onChange={(e) => setRequestDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              placeholder="Enter duration (e.g. 2 hours, 1 day)"
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg"
                onClick={() => setRequestModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleSubmitRequest}
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
                    <div>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}
                      >
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
                          backgroundColor:
                            request.status === 'Approved'
                              ? '#dcfce7'
                              : request.status === 'Pending'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            request.status === 'Approved'
                              ? '#166534'
                              : request.status === 'Pending'
                              ? '#92400e'
                              : '#dc2626'
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
    </div>
  );
};

export default UserEquipment;
