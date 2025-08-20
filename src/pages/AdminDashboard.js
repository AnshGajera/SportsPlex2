import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  CheckCircle, 
  Calendar, 
  Users, 
  MessageSquare, 
  BarChart3,
  Trophy,
  AlertTriangle,
  Plus,
  UserCheck
} from 'lucide-react';

const AdminPanel = () => {
  const stats = [
    { 
      icon: AlertTriangle, 
      count: 0, 
      label: 'Pending Requests',
      color: '#f59e0b'
    },
    { 
      icon: Calendar, 
      count: 0, 
      label: 'Live Matches',
      color: '#10b981'
    },
    { 
      icon: Users, 
      count: 0, 
      label: 'Active Clubs',
      color: '#3b82f6'
    },
    { 
      icon: MessageSquare, 
      count: 0, 
      label: 'Announcements',
      color: '#8b5cf6'
    }
  ];

  const adminActions = [
    {
      
      icon: Package,
      title: 'Manage Inventory',
      description: 'Track and update equipment stock',
      link: '/admin/equipment',
      color: '#b5d2f8ff' // Light Blue
    },
    {
      icon: CheckCircle,
      title: 'Approve Requests',
      description: 'Review and approve equipment requests',
      link: '/admin/equipment?tab=requests',
      color: '#fef9c3' // Light Yellow
    },
    {
      icon: Calendar,
      title: 'Schedule Matches',
      description: 'Create and manage match schedules',
      link: '/admin/matches',
      color: '#b1f5cbff' // Light Green
    },
    {
      icon: Trophy,
      title: 'Manage Clubs',
      description: 'Oversee club operations and members',
      link: '/admin/clubs',
      color: '#fcd3fbff' // Light pink
    },
    {
      icon: MessageSquare,
      title: 'Post Announcements',
      description: 'Share important updates and news',
      link: '/admin/announcements',
      color: '#ffdedeff' // Light Red
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View system usage and statistics',
      link: '/admin/analytics',
      color: '#a7fffeff' // Light Teal
    },
    {
      icon: UserCheck,
      title: 'Student Head Requests',
      description: 'Review and manage student head applications',
      link: '/admin/student-head-requests',
      color: '#e2dcffff' // Soft Lavender
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage user roles and permissions',
      link: '/admin/user-management',
      color: '#f5c1deff' // Light Green
    }
  ];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Admin Control Panel</h1>
        <p className="page-subtitle">Manage system operations and oversee all activities</p>
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
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'transform 0.2s, box-shadow 0.2s',
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
                <div>
                  <IconComponent size={32} color={stat.color} />
                </div>
                <div className="stat-content">
                  <h3 style={{ color: stat.color, margin: 0 }}>{stat.count}</h3>
                  <p style={{ margin: 0 }}>{stat.label}</p>
                </div>
              </div>
            ) : (
              <div key={index} className="stat-card" style={{
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
                <div 
                  className="stat-icon" 
                  style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                >
                  <IconComponent size={24} />
                </div>
                <div className="stat-content">
                  <h3 style={{ color: stat.color }}>{stat.count}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            )
          );
        })}
      </div>

      {/* Administrative Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#1e293b' }}>
          Administrative Actions
        </h2>
        <div className="grid grid-3">
          {adminActions.map((action, index) => {
            const IconComponent = action.icon;
            // Use the card's color for gradient and shadow
            const cardColor = action.color || '#f3f4f6';
            return (
              <Link key={index} to={action.link} style={{ textDecoration: 'none' }}>
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
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Overview Sections */}
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
              Pending Equipment Requests
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
            <CheckCircle size={48} className="empty-state-icon" />
            <p>No pending requests</p>
            <Link to="/admin/equipment?tab=requests" className="btn btn-primary" style={{ marginTop: '16px' }}>
              View All Requests
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
              backgroundColor: '#fee2e2', 
              color: '#dc2626', 
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
            <Link to="/admin/matches" className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={16} />
              Schedule Match
            </Link>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default AdminPanel;
