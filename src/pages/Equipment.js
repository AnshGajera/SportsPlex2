import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Clock, CheckCircle, XCircle, User, Calendar, Mail } from 'lucide-react';
import SearchBar from '../components/SearchBar';

// UserEquipmentCard Component
const UserEquipmentCard = ({ equipment, onRequest }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        height: 'fit-content'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Equipment Image */}
        <div style={{ 
          width: '100%', 
          height: '180px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {!imageError && equipment.image ? (
            <img
              src={equipment.image}
              alt={equipment.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Package size={48} color="#94a3b8" />
          )}
        </div>

        {/* Equipment Info */}
        <div>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: '#1e293b'
          }}>
            {equipment.name}
          </h3>
          
          <p style={{ 
            color: '#64748b', 
            fontSize: '0.875rem',
            margin: '0 0 12px 0',
            lineHeight: '1.5'
          }}>
            {equipment.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#1e40af'
            }}>
              {equipment.category}
            </div>
            
            <div style={{
              padding: '6px 12px',
              background: equipment.available > 0 
                ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: equipment.available > 0 ? '#166534' : '#dc2626'
            }}>
              {equipment.available > 0 ? `${equipment.available} Available` : 'Out of Stock'}
            </div>
          </div>

          {/* Request Button */}
          <button
            onClick={() => onRequest(equipment)}
            disabled={equipment.available === 0}
            style={{
              width: '100%',
              padding: '12px',
              background: equipment.available > 0 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: equipment.available > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: equipment.available > 0 ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (equipment.available > 0) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (equipment.available > 0) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {equipment.available > 0 ? 'Request Equipment' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

// UserRequestCard Component
const UserRequestCard = ({ request, onCancel }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#166534' };
      case 'pending': return { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#92400e' };
      case 'rejected': return { bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#dc2626' };
      default: return { bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', color: '#374151' };
    }
  };

  const statusStyle = getStatusColor(request.status);

  return (
    <div 
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700', 
            margin: '0 0 8px 0',
            color: '#1e293b'
          }}>
            {request.equipment?.name || request.equipmentName}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar size={14} color="#64748b" />
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Requested: {new Date(request.createdAt || request.date).toLocaleDateString()}
            </span>
          </div>

          {request.quantity && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Package size={14} color="#64748b" />
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Quantity: {request.quantity}
              </span>
            </div>
          )}

          {request.purpose && (
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>
              Purpose: {request.purpose}
            </p>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: statusStyle.bg,
          color: statusStyle.color,
          fontSize: '0.75rem',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          {getStatusIcon(request.status)}
          {request.status}
        </div>
      </div>

      {request.status.toLowerCase() === 'pending' && onCancel && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onCancel(request.id)}
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
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
};

const Equipment = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [equipment, setEquipment] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Sample equipment data - replace with API call
  const sampleEquipment = [
    {
      id: 1,
      name: 'Basketball',
      description: 'Official size basketball for indoor and outdoor play',
      category: 'Basketball',
      available: 5,
      total: 10,
      image: '/api/placeholder/200/200'
    },
    {
      id: 2,
      name: 'Tennis Racket',
      description: 'Professional tennis racket with grip tape',
      category: 'Tennis',
      available: 3,
      total: 8,
      image: '/api/placeholder/200/200'
    },
    {
      id: 3,
      name: 'Football',
      description: 'Official FIFA approved football',
      category: 'Football',
      available: 0,
      total: 6,
      image: '/api/placeholder/200/200'
    },
    {
      id: 4,
      name: 'Cricket Bat',
      description: 'Willow wood cricket bat, professional grade',
      category: 'Cricket',
      available: 2,
      total: 4,
      image: '/api/placeholder/200/200'
    }
  ];

  // Sample requests data - replace with API call
  const sampleRequests = [
    {
      id: 1,
      equipmentName: 'Basketball',
      quantity: 2,
      status: 'Approved',
      date: '2025-09-20',
      purpose: 'Basketball tournament practice'
    },
    {
      id: 2,
      equipmentName: 'Tennis Racket',
      quantity: 1,
      status: 'Pending',
      date: '2025-09-25',
      purpose: 'Personal practice session'
    }
  ];

  useEffect(() => {
    // Load equipment data - replace with actual API call
    setEquipment(sampleEquipment);
    setMyRequests(sampleRequests);
  }, []);

  // Filter equipment based on search and category
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle equipment request
  const handleRequestEquipment = (equipmentItem) => {
    // Replace with actual API call
    console.log('Requesting equipment:', equipmentItem);
    alert(`Request sent for ${equipmentItem.name}`);
  };

  // Handle request cancellation
  const handleCancelRequest = (requestId) => {
    // Replace with actual API call
    setMyRequests(prev => prev.filter(req => req.id !== requestId));
    alert('Request cancelled successfully');
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Equipment Management</h1>
        <p className="page-subtitle">
          {activeTab === 'browse' ? 'Browse and request equipment' : 'Manage inventory and approve requests'}
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
        <div className="tabs" style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
          {[
            { key: 'browse', label: 'Browse Equipment' },
            { key: 'requests', label: 'My Requests' }
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
          {filteredEquipment.length === 0 ? (
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
                {equipment.length === 0 ? 'No equipment available' : 'No equipment found'}
              </h3>
              <p style={{ 
                marginBottom: '24px',
                color: '#64748b'
              }}>
                {equipment.length === 0 
                  ? 'Equipment inventory is currently empty. Check back later or contact administrator.'
                  : 'Try adjusting your search criteria or category filter.'
                }
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              padding: '4px'
            }}>
              {filteredEquipment.map((equipmentItem) => (
                <UserEquipmentCard
                  key={equipmentItem.id}
                  equipment={equipmentItem}
                  onRequest={handleRequestEquipment}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {myRequests.length === 0 ? (
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
                No requests found
              </h3>
              <p style={{ 
                marginBottom: '24px',
                color: '#64748b'
              }}>
                You haven't made any equipment requests yet.
              </p>
              <button 
                onClick={() => setActiveTab('browse')}
                style={{
                  padding: '12px 24px',
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
                Browse Equipment
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              padding: '4px'
            }}>
              {myRequests.map((request) => (
                <UserRequestCard
                  key={request.id}
                  request={request}
                  onCancel={handleCancelRequest}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Equipment;