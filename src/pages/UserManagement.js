import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Shield, UserCheck, UserX, Eye, Mail, Phone, Calendar, Book } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sendPromotionEmail, sendDemotionEmail } from '../services/emailService';
import StudentHeadRequests from '../components/StudentHead/StudentHeadRequests';

const UserManagement = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('admins');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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
      label: 'Student Heads',
      color: '#f59e0b'
    }
  ]);

  // Fetch users data from backend
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) {
        console.log('No current user found');
        return;
      }
      
      if (currentUser.role !== 'admin') {
        console.log('User is not admin, role:', currentUser.role);
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get('/admin/users');
        const usersData = response.data;
        setUsers(usersData);
        
        // Update analytics based on real data
        const totalUsers = usersData.length;
        const admins = usersData.filter(user => user.role === 'admin').length;
        const activeUsers = usersData.filter(user => user.isVerified).length;
        const studentHeads = usersData.filter(user => user.role === 'student_head').length;
        
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
            count: studentHeads,
            label: 'Student Heads',
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
  }, [currentUser]);

  // Promote student to student_head
  const promoteToStudentHead = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to promote ${userName} to Student Head?`)) {
      return;
    }
    
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      // Find the user to get their email
      const userToPromote = users.find(user => user._id === userId);
      if (!userToPromote) {
        alert('User not found!');
        return;
      }

      const response = await api.put(`/admin/users/${userId}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, role: 'student_head' } 
              : user
          )
        );
        
        // Update analytics
        setAnalyticsData(prevData => 
          prevData.map(stat => {
            if (stat.label === 'Student Heads') {
              return { ...stat, count: stat.count + 1 };
            }
            return stat;
          })
        );
        
        // Send email using EmailJS
        try {
          const emailResult = await sendPromotionEmail(userToPromote.email, userName);
          if (emailResult.success) {
            alert(`${userName} has been successfully promoted to Student Head! A congratulations email has been sent to ${userToPromote.email}.`);
          } else {
            alert(`${userName} has been successfully promoted to Student Head! However, the email notification could not be sent.`);
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
          alert(`${userName} has been successfully promoted to Student Head! However, the email notification could not be sent.`);
        }
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Failed to promote user. Please try again.');
    }
  };

  // Demote student_head to student
  const demoteToStudent = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to demote ${userName} from Student Head to Student?`)) {
      return;
    }
    
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      // Find the user to get their email
      const userToDemote = users.find(user => user._id === userId);
      if (!userToDemote) {
        alert('User not found!');
        return;
      }

      const response = await api.put(`/admin/users/${userId}/demote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, role: 'student' } 
              : user
          )
        );
        
        // Update analytics
        setAnalyticsData(prevData => 
          prevData.map(stat => {
            if (stat.label === 'Student Heads') {
              return { ...stat, count: stat.count - 1 };
            }
            return stat;
          })
        );
        
        // Send email using EmailJS
        try {
          const emailResult = await sendDemotionEmail(userToDemote.email, userName);
          if (emailResult.success) {
            alert(`${userName} has been successfully demoted to Student. A notification email has been sent to ${userToDemote.email}.`);
          } else {
            alert(`${userName} has been successfully demoted to Student. However, the email notification could not be sent.`);
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
          alert(`${userName} has been successfully demoted to Student. However, the email notification could not be sent.`);
        }
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Failed to demote user. Please try again.');
    }
  };

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Search in current filtered users and return ALL matching users
    const foundUsers = filteredUsers.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase()) ||
      user.rollNo?.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(foundUsers);
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
          <h1 className="page-title">User Management</h1>
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
            placeholder="Search user by name or email..."
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
          {/* Student Head Requests Tab Content */}
          {activeTab === 'studentHeadRequests' ? (
            <StudentHeadRequests />
          ) : (
            <>
              {/* Search Results Display */}
              {searchResults.length > 0 && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '16px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>
                    Search Results ({searchResults.length} found):
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '16px' 
                  }}>
                    {searchResults.map(user => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        onViewDetails={handleViewUser} 
                        onPromote={promoteToStudentHead} 
                        onDemote={demoteToStudent}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Search Results Message */}
              {searchTerm && searchResults.length === 0 && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '20px', 
                  background: '#fef2f2', 
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, color: '#dc2626', fontSize: '14px' }}>
                    No users found matching "{searchTerm}"
                  </p>
                </div>
              )}

              {/* Users Grid - Only show when not searching or no search results */}
              {!searchTerm && (
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
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                      gap: '16px' 
                    }}>
                      {filteredUsers.map(user => (
                        <UserCard 
                          key={user._id} 
                          user={user} 
                          onViewDetails={handleViewUser} 
                          onPromote={promoteToStudentHead} 
                          onDemote={demoteToStudent} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserModal 
          user={selectedUser} 
          onClose={handleCloseModal} 
          onPromote={promoteToStudentHead} 
          onDemote={demoteToStudent} 
        />
      )}
    </div>
  );
};

// UserCard Component - Compact Design
const UserCard = ({ user, onViewDetails, onPromote, onDemote }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'student_head': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'student_head': return 'Head';
      default: return 'Student';
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'default',
      height: 'fit-content',
      minHeight: '140px',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'none';
    }}>
      {/* Compact Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: '0 0 2px 0', 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#1f2937',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {user.firstName} {user.lastName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '500',
              color: getRoleColor(user.role),
              backgroundColor: `${getRoleColor(user.role)}15`
            }}>
              {getRoleLabel(user.role)}
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: user.isVerified ? '#10b981' : '#f59e0b'
            }}></div>
          </div>
        </div>
      </div>

      {/* Essential Info - Conditional display based on role */}
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', flex: '1' }}>
        {user.role === 'admin' ? (
          // Admin users - show only email
          user.email && (
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ✉️ {user.email}
            </div>
          )
        ) : (
          // Regular users - show full info with consistent spacing
          <>
            {user.department && (
              <div style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                📚 {user.department}
              </div>
            )}
            {user.college && (
              <div style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                🏫 {user.college}
              </div>
            )}
            {user.email && (
              <div style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ✉️ {user.email}
              </div>
            )}
            {user.rollNo && user.rollNo !== 'N/A' && (
              <div style={{ marginBottom: '4px' }}>🎓 {user.rollNo}</div>
            )}
            {/* Always show certificate line for consistent spacing */}
            <div style={{ marginBottom: '4px', minHeight: '16px' }}>
              {user.certificates && user.certificates.length > 0 ? (
                `📜 ${user.certificates.length} certificate(s)`
              ) : (
                '' // Empty space for users with no certificates
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '8px', display: 'flex', gap: '4px', height: '32px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(user);
          }}
          style={{
            flex: user.role === 'student' && onPromote ? '2' : '1',
            padding: '6px 12px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
          onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
        >
          <Eye size={12} />
          View
        </button>
        
        {user.role === 'student' && onPromote && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPromote(user._id, `${user.firstName} ${user.lastName}`);
            }}
            style={{
              flex: '1',
              padding: '6px 8px',
              background: '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
          >
            ↗ Promote
          </button>
        )}
        
        {user.role === 'student_head' && onDemote && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDemote(user._id, `${user.firstName} ${user.lastName}`);
            }}
            style={{
              flex: '1',
              padding: '6px 8px',
              background: '#f59e0b',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#d97706'}
            onMouseLeave={e => e.target.style.backgroundColor = '#f59e0b'}
          >
            ↙ Demote
          </button>
        )}
      </div>
    </div>
  );
};

// UserModal Component
const UserModal = ({ user, onClose, onPromote, onDemote }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            User Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* User Info */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
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
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: user.isVerified ? '#10b981' : '#f59e0b',
              title: user.isVerified ? 'Verified' : 'Not Verified'
            }}></div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#6b7280" />
              {user.email || 'N/A'}
            </p>
          </div>

          {user.phone && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Phone
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#6b7280" />
                {user.phone}
              </p>
            </div>
          )}

          {user.department && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Department
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Book size={16} color="#6b7280" />
                {user.department}
              </p>
            </div>
          )}

          {user.college && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                College
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937' }}>
                {user.college}
              </p>
            </div>
          )}

          {user.rollNo && user.rollNo !== 'N/A' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Roll Number
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937' }}>
                {user.rollNo}
              </p>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Member Since
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#6b7280" />
              {formatDate(user.createdAt)}
            </p>
          </div>

          {user.certificates && user.certificates.length > 0 && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Certificates
              </label>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#1f2937' }}>
                {user.certificates.length} certificate(s) uploaded
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={e => e.target.style.backgroundColor = '#f3f4f6'}
          >
            Close
          </button>
          
          {user.role === 'student' && onPromote && (
            <button
              onClick={() => {
                onPromote(user._id, `${user.firstName} ${user.lastName}`);
                onClose();
              }}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
              onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
            >
              Promote to Student Head
            </button>
          )}
          
          {user.role === 'student_head' && onDemote && (
            <button
              onClick={() => {
                onDemote(user._id, `${user.firstName} ${user.lastName}`);
                onClose();
              }}
              style={{
                padding: '8px 16px',
                background: '#f59e0b',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#d97706'}
              onMouseLeave={e => e.target.style.backgroundColor = '#f59e0b'}
            >
              Demote to Student
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
