import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Shield, UserCheck, UserX } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const AdminUserManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('admins');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
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

  // Mock student data
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
    // Search in students
    const foundStudent = students.find(student =>
      student.name.toLowerCase().includes(value.toLowerCase()) ||
      student.email.toLowerCase().includes(value.toLowerCase())
    );
    if (foundStudent) {
      setActiveTab('students');
      setSearchResult(foundStudent);
    } else {
      setSearchResult(null);
    }
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

      {activeTab === 'admins' && (
        <div>
          {/* Admin content will go here */}
        </div>
      )}

      {activeTab === 'students' && (
        <div>
          {/* Show search result if available */}
          {searchResult && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div><strong>Name:</strong> {searchResult.name}</div>
              <div><strong>Email:</strong> {searchResult.email}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'studentHeads' && (
        <div>
          {/* Student Heads content will go here */}
        </div>
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
    </div>
  );
};

export default AdminUserManagement;
