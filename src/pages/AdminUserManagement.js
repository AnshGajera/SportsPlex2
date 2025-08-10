import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Shield, UserCheck, UserX, Eye, Mail, Phone, Calendar, Book } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const AdminUserManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('admins');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([
    {
      icon: Users,
      count: 0,
      label: 'Total Users',
      color: '#3b82f6'
    },
    {
      icon: Shield,
      count: 0,
      label: 'Administrators',
      color: '#ef4444'
    },
    {
      icon: UserCheck,
      count: 0,
      label: 'Active Users',
      color: '#10b981'
    },
    {
      icon: UserX,
      count: 0,
      label: 'Inactive Users',
      color: '#f59e0b'
    }
  ]);

  // Fetch users data from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/users');
        const usersData = response.data;
        setUsers(usersData);
        
        // Update analytics based on real data
        const totalUsers = usersData.length;
        const admins = usersData.filter(user => user.role === 'admin').length;
        const activeUsers = usersData.filter(user => user.isVerified).length;
        const inactiveUsers = totalUsers - activeUsers;
        
        setAnalyticsData([
          {
            icon: Users,
            count: totalUsers,
            label: 'Total Users',
            color: '#3b82f6'
          },
          {
            icon: Shield,
            count: admins,
            label: 'Administrators',
            color: '#ef4444'
          },
          {
            icon: UserCheck,
            count: activeUsers,
            label: 'Active Users',
            color: '#10b981'
          },
          {
            icon: UserX,
            count: inactiveUsers,
            label: 'Inactive Users',
            color: '#f59e0b'
          }
        ]);
        
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filter users based on active tab
  useEffect(() => {
    let filtered = [];
    switch (activeTab) {
      case 'admins':
        filtered = users.filter(user => user.role === 'admin');
        break;
      case 'students':
        filtered = users.filter(user => user.role === 'student');
        break;
      case 'studentHeads':
        filtered = users.filter(user => user.role === 'student_head');
        break;
      default:
        filtered = users;
    }
    setFilteredUsers(filtered);
  }, [users, activeTab]);

  // Mock student data (remove this)
  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com' }
  ];

  // TODO: Fetch analytics data from backend
  // useEffect(() => {
  //   const fetchAnalytics = async () => {
  //     try {
  //       const response = await api.get('/admin/users/analytics');
  //       setAnalyticsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching user analytics:', error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResult(null);
      return;
    }
    
    // Search in current filtered users
    const foundUser = filteredUsers.find(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.rollNo?.toLowerCase().includes(value.toLowerCase())
    );
    
    if (foundUser) {
      setSearchResult(foundUser);
    } else {
      setSearchResult(null);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Check URL parameters to set initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'student-head-requests') {
      setActiveTab('studentHeadRequests');
    }
  }, [location.search]);

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '16px'
      }}>
        <div>
          <h1 className="page-title">User Management - Admin</h1>
          <p className="page-subtitle">Manage user roles and permissions across the system</p>
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
            className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            Admins
          </button>
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`tab ${activeTab === 'studentHeads' ? 'active' : ''}`}
            onClick={() => setActiveTab('studentHeads')}
          >
            Student Heads
          </button>
          <button
            className={`tab ${activeTab === 'studentHeadRequests' ? 'active' : ''}`}
            onClick={() => setActiveTab('studentHeadRequests')}
          >
            Student Head Requests
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
            placeholder="Search student by name or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading users...</div>
        </div>
      ) : (
        <>
          {/* Search Result Display */}
          {searchResult && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Search Result:</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px' 
              }}>
                <UserCard user={searchResult} onViewDetails={handleViewUser} />
              </div>
            </div>
          )}

          {/* Users Grid */}
          <div style={{ marginTop: '20px' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <Users size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>No users found</h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  {activeTab === 'admins' && 'No administrators found in the system.'}
                  {activeTab === 'students' && 'No students found in the system.'}
                  {activeTab === 'studentHeads' && 'No student heads found in the system.'}
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '20px' 
              }}>
                {filteredUsers.map(user => (
                  <UserCard key={user._id} user={user} onViewDetails={handleViewUser} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'studentHeadRequests' && (
        <div>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>Student Head Requests</h3>
          <div style={{ padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
            <p style={{ color: '#6b7280', textAlign: 'center' }}>
              Student head request management functionality will be implemented here.
            </p>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserModal user={selectedUser} onClose={handleCloseModal} />
      )}
    </div>
  );
};

// UserCard Component
const UserCard = ({ user, onViewDetails }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'student_head': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'student_head': return 'Student Head';
      default: return 'Student';
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'none';
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 4px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {user.firstName} {user.lastName}
          </h3>
          <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: getRoleColor(user.role),
            backgroundColor: `${getRoleColor(user.role)}15`
          }}>
            {getRoleLabel(user.role)}
          </span>
        </div>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: user.isVerified ? '#10b981' : '#f59e0b'
        }}></div>
      </div>

      {/* User Info */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Mail size={16} color="#6b7280" style={{ marginRight: '8px' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{user.email}</span>
        </div>
        {user.phoneNumber && user.phoneNumber !== 'N/A' && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Phone size={16} color="#6b7280" style={{ marginRight: '8px' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>{user.phoneNumber}</span>
          </div>
        )}
        {user.college && user.college !== 'N/A' && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Book size={16} color="#6b7280" style={{ marginRight: '8px' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>{user.college}</span>
          </div>
        )}
        {user.rollNo && user.rollNo !== 'N/A' && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '24px' }}>
              Roll: {user.rollNo}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewDetails(user)}
        style={{
          width: '100%',
          padding: '8px 16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          color: '#475569',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#e2e8f0';
          e.currentTarget.style.color = '#334155';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#f8fafc';
          e.currentTarget.style.color = '#475569';
        }}
      >
        <Eye size={16} />
        View Details
      </button>
    </div>
  );
};

// UserModal Component
const UserModal = ({ user, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        minWidth: '500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            background: 'none', 
            border: 'none', 
            fontSize: 24, 
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px'
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            {user.firstName} {user.middleName} {user.lastName}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: user.role === 'admin' ? '#ef4444' : user.role === 'student_head' ? '#f59e0b' : '#3b82f6',
              backgroundColor: user.role === 'admin' ? '#fef2f2' : user.role === 'student_head' ? '#fefbf2' : '#eff6ff'
            }}>
              {user.role === 'admin' ? 'Administrator' : user.role === 'student_head' ? 'Student Head' : 'Student'}
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: user.isVerified ? '#059669' : '#d97706',
              backgroundColor: user.isVerified ? '#d1fae5' : '#fef3c7'
            }}>
              {user.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        {/* User Details Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
              Contact Information
            </h4>
            <div style={{ space: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Email</label>
                <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>{user.email}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Phone</label>
                <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                  {user.phoneNumber && user.phoneNumber !== 'N/A' ? user.phoneNumber : 'Not provided'}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
              Academic Information
            </h4>
            <div style={{ space: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>College</label>
                <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                  {user.college && user.college !== 'N/A' ? user.college : 'Not provided'}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Department</label>
                <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                  {user.department && user.department !== 'N/A' ? user.department : 'Not provided'}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Roll Number</label>
                <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                  {user.rollNo && user.rollNo !== 'N/A' ? user.rollNo : 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
            Account Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Gender</label>
              <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px', textTransform: 'capitalize' }}>
                {user.gender || 'Not specified'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Created Date</label>
              <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
