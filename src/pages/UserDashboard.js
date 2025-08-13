import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Trophy, Bell, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [canRequestStudentHead, setCanRequestStudentHead] = useState(false);
  const [hasRequestedStudentHead, setHasRequestedStudentHead] = useState(false);
  
  console.log('Current user data:', currentUser); // Add logging to debug
  const firstName = currentUser?.firstName || '';
  const lastName = currentUser?.lastName || '';
  const userName = currentUser ? `${firstName} ${lastName}`.trim() || 'User' : 'User';

  // Check if user can request student head role
  useEffect(() => {
    const checkStudentHeadEligibility = async () => {
      if (!currentUser || currentUser.role !== 'student') {
        return;
      }

      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const response = await api.get('/student-head-requests/can-request', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCanRequestStudentHead(response.data.canRequest);
        
        // Check if user has any request
        const requestResponse = await api.get('/student-head-requests/my-request', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHasRequestedStudentHead(!!requestResponse.data.request);
      } catch (error) {
        console.error('Error checking student head eligibility:', error);
      }
    };

    checkStudentHeadEligibility();
  }, [currentUser]);
  
  const stats = [
    { 
      icon: Package, 
      count: 0, 
      label: 'Active Requests',
      color: '#3b82f6'
    },
    { 
      icon: Users, 
      count: 0, 
      label: 'Joined Clubs',
      color: '#10b981'
    },
    { 
      icon: Trophy, 
      count: 0, 
      label: 'Live Matches',
      color: '#f59e0b'
    },
    { 
      icon: Bell, 
      count: 0, 
      label: 'New Announcements',
      color: '#8b5cf6'
    }
  ];

  const baseQuickActions = [
    {
      icon: Package,
      title: 'Request Equipment',
      description: 'Browse and request equipment',
      link: '/user/equipment',
      color: '#b5d2f8ff' // Light Blue
    },
    {
      icon: Users,
      title: 'Join Clubs',
      description: 'Explore and join sports clubs',
      link: '/user/clubs',
      color: '#b1f5cbff' // Light Green
    },
    {
      icon: Trophy,
      title: 'Live Scores',
      description: 'View ongoing match scores',
      link: '/user/matches',
      color: '#fef9c3' // Light Yellow
    },
    {
      icon: Bell,
      title: 'Announcements',
      description: 'Stay updated with latest news',
      link: '/user/announcements',
      color: '#fcdcfbff' // Light Pink
    }
  ];

  // Add Student Head request action for eligible students
  const quickActions = [...baseQuickActions];
  if (currentUser?.role === 'student' && (canRequestStudentHead || hasRequestedStudentHead)) {
    quickActions.push({
      icon: Crown,
      title: hasRequestedStudentHead ? 'View Request Status' : 'Request Student Head',
      description: hasRequestedStudentHead ? 'Check your application status' : 'Apply for Student Head position',
      link: '/user/student-head-request',
      color: '#fbbf24' // Gold
    });
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Welcome, {userName}</h1>
        <p className="page-subtitle">Manage your sports activities and stay updated</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            index === 0 ? (
              <div key={index} className="stat-card" style={{
                background: '#fff',
                boxShadow: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 3px 16px #e5e7eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div>
                  <IconComponent size={24} color={stat.color} />
                </div>
                <div className="stat-content">
                  <h3 style={{ color: stat.color, margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{stat.count}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '500' }}>{stat.label}</p>
                </div>
              </div>
            ) : (
              <div key={index} className="stat-card" style={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                borderRadius: '12px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 3px 16px #e5e7eb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div 
                  className="stat-icon" 
                  style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                >
                  <IconComponent size={20} />
                </div>
                <div className="stat-content">
                  <h3 style={{ color: stat.color, fontSize: '1.25rem', fontWeight: '700' }}>{stat.count}</h3>
                  <p style={{ fontSize: '0.75rem', fontWeight: '500' }}>{stat.label}</p>
                </div>
              </div>
            )
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#1e293b' }}>
          Quick Actions
        </h2>
        <div className="grid grid-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            // Use the card's color for gradient and shadow
            const cardColor = action.color || '#f3f4f6';
            
            const cardContent = (
              <div className="card" style={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: '100%',
                background: `linear-gradient(135deg, #fff 0%, ${cardColor} 100%)`,
                boxShadow: `0 2px 12px ${cardColor}55`,
                border: 'none',
                borderRadius: '14px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                e.currentTarget.style.boxShadow = `0 4px 24px ${cardColor}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 2px 12px ${cardColor}55`;
              }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent size={32} color="#222" />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  marginBottom: '10px',
                  color: '#111',
                }}>
                  {action.title}
                </h3>
                <p style={{
                  color: '#444',
                  fontSize: '1rem',
                  margin: 0,
                  fontWeight: 400,
                }}>
                  {action.description}
                </p>
              </div>
            );

            return (
              <Link key={index} to={action.link} style={{ textDecoration: 'none' }}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activities and Live Matches */}
      <div className="grid grid-2">
        <div className="card" style={{
          transition: 'transform 0.2s, box-shadow 0.2s',
          borderRadius: '14px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 4px 24px #e5e7eb';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
              Recent Activities
            </h3>
            <span style={{ 
              backgroundColor: '#dbeafe', 
              color: '#2563eb', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              0
            </span>
          </div>
          <div className="empty-state">
            <Package size={48} className="empty-state-icon" />
            <p>No recent activities</p>
            <Link to="/user/equipment" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Request Equipment
            </Link>
          </div>
        </div>

        <div className="card" style={{
          transition: 'transform 0.2s, box-shadow 0.2s',
          borderRadius: '14px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 4px 24px #e5e7eb';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
              Live Matches
            </h3>
            <span style={{ 
              backgroundColor: '#fef3c7', 
              color: '#92400e', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              0
            </span>
          </div>
          <div className="empty-state">
            <Trophy size={48} className="empty-state-icon" />
            <p>No live matches</p>
            <Link to="/user/matches" className="btn btn-primary" style={{ marginTop: '16px' }}>
              View All Matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;