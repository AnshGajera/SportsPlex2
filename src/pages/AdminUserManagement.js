import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Shield, UserCheck, UserX, Eye, Mail, Phone, Calendar, Book } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sendPromotionEmail, sendDemotionEmail } from '../services/emailService';

const AdminUserManagement = () => {
  const location = useLocation();
  const { currentUser } = useAuth(); // Add this to get current user
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
      // Debug localStorage and user info
      const storedUser = localStorage.getItem('userInfo');
      console.log('=== ADMIN USER MANAGEMENT DEBUG ===');
      console.log('Stored user in localStorage:', storedUser);
      console.log('Parsed stored user:', storedUser ? JSON.parse(storedUser) : null);
      console.log('Current user from context:', currentUser);
      
      // Check if user is logged in and is admin
      if (!currentUser) {
        console.log('No current user found');
        return;
      }
      
      console.log('Current user:', currentUser);
      console.log('User role:', currentUser.role);
      
      if (currentUser.role !== 'admin') {
        console.log('User is not admin, role:', currentUser.role);
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching users as admin...');
        const response = await api.get('/admin/users');
        const usersData = response.data;
        console.log('Users fetched successfully:', usersData.length);
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
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message);
        
        if (error.response?.status === 401) {
          console.log('Authentication failed - checking token...');
          const storedUser = localStorage.getItem('userInfo');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('Token in storage:', parsedUser.token);
          } else {
            console.log('No user data in localStorage');
          }
        }
        
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser]); // Add dependency on currentUser

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
                    <UserCard key={user._id} user={user} onViewDetails={handleViewUser} onPromote={promoteToStudentHead} onDemote={demoteToStudent} />
                  ))}
                </div>
              )}
            </div>
          )}
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
        <UserModal user={selectedUser} onClose={handleCloseModal} onPromote={promoteToStudentHead} onDemote={demoteToStudent} />
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
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '32px',
            minHeight: '32px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#2563eb';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#3b82f6';
          }}
        >
          <Eye size={12} />
          View Profile
        </button>
        
        {/* Promote button - only show for students */}
        {user.role === 'student' && onPromote ? (
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
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              height: '32px',
              minHeight: '32px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#10b981';
            }}
            title="Promote to Student Head"
          >
            ⬆️ Promote
          </button>
        ) : user.role === 'student_head' && onDemote ? (
          /* Demote button - only show for student_heads */
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDemote(user._id, `${user.firstName} ${user.lastName}`);
            }}
            style={{
              flex: '1',
              padding: '6px 8px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              height: '32px',
              minHeight: '32px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#dc2626';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#ef4444';
            }}
            title="Demote to Student"
          >
            ⬇️ Demote
          </button>
        ) : (
          // Empty placeholder to maintain consistent spacing
          <div style={{ flex: '1', minWidth: '0' }}></div>
        )}
      </div>
    </div>
  );
};

// Enhanced UserModal Component with Certificate Preview
const UserModal = ({ user, onClose, onPromote, onDemote }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreviewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const getPreviewUrl = (certificate) => {
    // Remove any leading slashes and ensure proper path construction
    const cleanPath = certificate.filePath.replace(/^\/+/, '');
    return `http://localhost:5000/${cleanPath}`;
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (fileName) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

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
        padding: '0',
        width: '90vw',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative'
      }}>
        {/* Header with tabs */}
        <div style={{ 
          borderBottom: '1px solid #e5e7eb',
          padding: '24px 32px 0 32px',
          position: 'sticky',
          top: 0,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          zIndex: 10
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
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ×
          </button>

          {/* User Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {user.firstName} {user.middleName} {user.lastName}
              </h2>
              
              {/* Promote/Demote Buttons */}
              {user.role === 'student' && onPromote && (
                <button
                  onClick={() => {
                    onPromote(user._id, `${user.firstName} ${user.lastName}`);
                    onClose(); // Close modal after promotion
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  ⬆️ Promote to Student Head
                </button>
              )}
              
              {/* Demote Button - only show for student_heads */}
              {user.role === 'student_head' && onDemote && (
                <button
                  onClick={() => {
                    onDemote(user._id, `${user.firstName} ${user.lastName}`);
                    onClose(); // Close modal after demotion
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  ⬇️ Demote to Student
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
              {user.certificates && user.certificates.length > 0 && (
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#7c3aed',
                  backgroundColor: '#f3e8ff'
                }}>
                  {user.certificates.length} Certificate(s)
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'profile' ? '#3b82f6' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'certificates' ? '#3b82f6' : 'transparent',
                color: activeTab === 'certificates' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'certificates' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Certificates ({user.certificates?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {activeTab === 'profile' ? (
            // Profile Tab Content
            <div>
              {user.role === 'admin' ? (
                // Admin Profile - Simple display with just name and email
                <div>
                  <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                    Administrator Information
                  </h3>
                  <div style={{
                    padding: '24px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '24px'
                    }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                        <div style={{ fontSize: '18px', color: '#1f2937', marginTop: '8px', fontWeight: '500' }}>
                          {user.firstName} {user.middleName || ''} {user.lastName || ''}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>{user.email}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                        <div style={{ marginTop: '8px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>
                            Administrator
                          </span>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Created</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular User Profile - Full display
                <div>
                  {/* Personal Information */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Personal Information
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                          {user.firstName} {user.middleName} {user.lastName}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>{user.email}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                          {user.phoneNumber && user.phoneNumber !== 'N/A' ? user.phoneNumber : 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px', textTransform: 'capitalize' }}>
                          {user.gender || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Academic Information
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>College</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                          {user.college && user.college !== 'N/A' ? user.college : 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                          {user.department && user.department !== 'N/A' ? user.department : 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll Number</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                          {user.rollNo && user.rollNo !== 'N/A' ? user.rollNo : 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Created</label>
                        <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                      Account Status
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '16px'
                    }}>
                      <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Verification Status</div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: user.isVerified ? '#059669' : '#d97706'
                        }}>
                          {user.isVerified ? 'Verified ✓' : 'Pending ⏳'}
                        </div>
                      </div>
                      <div style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Role</div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: user.role === 'admin' ? '#ef4444' : user.role === 'student_head' ? '#f59e0b' : '#3b82f6'
                        }}>
                          {user.role === 'admin' ? 'Administrator' : user.role === 'student_head' ? 'Student Head' : 'Student'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Certificates Tab Content
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Certificates & Documents
              </h3>
              {user.certificates && user.certificates.length > 0 ? (
                <div style={{ display: 'flex', gap: '16px', height: '500px' }}>
                  {/* Certificate List */}
                  <div style={{ 
                    flex: selectedCertificate ? '0 0 300px' : '1',
                    transition: 'flex 0.3s ease'
                  }}>
                    <div style={{ display: 'grid', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                      {user.certificates.map((certificate, index) => (
                        <div key={index} style={{
                          border: selectedCertificate === certificate ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          background: selectedCertificate === certificate ? '#eff6ff' : '#f9fafb',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handlePreviewCertificate(certificate)}
                        onMouseEnter={e => {
                          if (selectedCertificate !== certificate) {
                            e.currentTarget.style.background = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={e => {
                          if (selectedCertificate !== certificate) {
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                {certificate.title}
                              </h4>
                              {certificate.description && (
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
                                  {certificate.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewCertificate(certificate);
                              }}
                              style={{
                                padding: '4px 8px',
                                background: selectedCertificate === certificate ? '#3b82f6' : '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              {selectedCertificate === certificate ? 'Viewing' : 'Preview'}
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#6b7280' }}>
                            <span>📄 {certificate.originalName}</span>
                            <span>📊 {formatFileSize(certificate.size)}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                            📅 {new Date(certificate.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificate Preview */}
                  {selectedCertificate && (
                    <div style={{ 
                      flex: '1',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                            {selectedCertificate.title}
                          </h4>
                          {selectedCertificate.description && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                              {selectedCertificate.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedCertificate(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            marginLeft: '8px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ padding: '16px', height: '430px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isImageFile(selectedCertificate.originalName) ? (
                          <img
                            src={getPreviewUrl(selectedCertificate)}
                            alt={selectedCertificate.title}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : isPdfFile(selectedCertificate.originalName) ? (
                          <iframe
                            src={getPreviewUrl(selectedCertificate)}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: '4px'
                            }}
                            title={selectedCertificate.title}
                          />
                        ) : (
                          <div style={{
                            textAlign: 'center',
                            color: '#6b7280'
                          }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>�</div>
                            <p>Preview not available for this file type</p>
                            <a
                              href={getPreviewUrl(selectedCertificate)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#3b82f6',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              Open in new tab →
                            </a>
                          </div>
                        )}
                        <div style={{ display: 'none', textAlign: 'center', color: '#6b7280' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                          <p>Failed to load certificate</p>
                          <a
                            href={getPreviewUrl(selectedCertificate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Try opening in new tab →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Certificates Found</h4>
                  <p style={{ margin: 0 }}>This user hasn't uploaded any certificates yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
