import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import api from '../services/api';
import StudentHeadRequests from '../components/StudentHead/StudentHeadRequests';

const AdminStudentHeadRequests = () => {
  const [analyticsData, setAnalyticsData] = useState([
    {
      icon: Clock,
      count: 0,
      label: 'Pending Requests',
      color: '#f59e0b'
    },
    {
      icon: CheckCircle,
      count: 0,
      label: 'Approved Requests',
      color: '#10b981'
    },
    {
      icon: XCircle,
      count: 0,
      label: 'Rejected Requests',
      color: '#ef4444'
    },
    {
      icon: Users,
      count: 0,
      label: 'Total Student Heads',
      color: '#3b82f6'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        
        // Fetch student head requests
        const requestsResponse = await api.get('/admin/student-head-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const requests = requestsResponse.data;

        // Fetch all users to count student heads
        const usersResponse = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = usersResponse.data;

        // Calculate analytics
        const pendingCount = requests.filter(req => req.status === 'pending').length;
        const approvedCount = requests.filter(req => req.status === 'approved').length;
        const rejectedCount = requests.filter(req => req.status === 'rejected').length;
        const studentHeadsCount = users.filter(user => user.role === 'student_head').length;

        setAnalyticsData([
          {
            icon: Clock,
            count: pendingCount,
            label: 'Pending Requests',
            color: '#f59e0b'
          },
          {
            icon: CheckCircle,
            count: approvedCount,
            label: 'Approved Requests',
            color: '#10b981'
          },
          {
            icon: XCircle,
            count: rejectedCount,
            label: 'Rejected Requests',
            color: '#ef4444'
          },
          {
            icon: Users,
            count: studentHeadsCount,
            label: 'Total Student Heads',
            color: '#3b82f6'
          }
        ]);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '0 px'
      }}>
        <div>
          <h1 className="page-title">Student Head Requests Management</h1>
          <p className="page-subtitle">Review and manage student head position requests</p>
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
                cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
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
                  {loading ? '...' : stat.count}
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

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Main Content - Student Head Requests Component */}
      <div className="card" style={{
        padding: '0',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <UserCheck size={24} color="#3b82f6" />
            Request Management
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            color: '#64748b',
            fontSize: '14px'
          }}>
            Review pending applications, approve qualified candidates, and manage student head positions
          </p>
        </div>
        <div style={{ padding: '0' }}>
          <StudentHeadRequests />
        </div>
      </div>
    </div>
  );
};

export default AdminStudentHeadRequests;
