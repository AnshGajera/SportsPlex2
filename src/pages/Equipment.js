import React, { useState } from 'react';
import { Search, Filter, Package } from 'lucide-react';

const Equipment = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

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
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Equipment Management</h1>
        <p className="page-subtitle">
          {activeTab === 'browse' ? 'Browse and request equipment' : 'Manage inventory and approve requests'}
        </p>
      </div>

      <div className="tabs">
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
        <div>
<<<<<<< HEAD
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '32px',
            flexWrap: 'wrap'
          }}>
            <div className="search-bar">
              <Search size={20} className="search-icon" />
=======
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'nowrap', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f7fafc',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: 'none',
              padding: '8px 20px',
              width: '420px',
              minWidth: '220px',
              position: 'relative'
            }}>
              <Search size={24} color="#9ca3af" style={{ marginRight: '12px', flexShrink: 0 }} />
>>>>>>> f0e00accaa838fe3d084eb54df2a35fc129ac6e7
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
<<<<<<< HEAD
=======
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#9ca3af',
                  fontSize: '1.15rem',
                  width: '100%',
                  fontWeight: 500,
                  paddingLeft: 0
                }}
>>>>>>> f0e00accaa838fe3d084eb54df2a35fc129ac6e7
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
<<<<<<< HEAD
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                minWidth: '200px'
=======
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                backgroundColor: 'white',
                color: '#64748b',
                minWidth: '120px',
                fontWeight: 500,
                height: '40px',
                boxShadow: 'none'
>>>>>>> f0e00accaa838fe3d084eb54df2a35fc129ac6e7
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
<<<<<<< HEAD

=======
>>>>>>> f0e00accaa838fe3d084eb54df2a35fc129ac6e7
          <div className="empty-state">
            <Package size={64} className="empty-state-icon" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              No equipment available
            </h3>
            <p style={{ marginBottom: '24px' }}>
              Equipment inventory is currently empty. Check back later or contact administrator.
            </p>
          </div>
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
    </div>
  );
};

export default Equipment;