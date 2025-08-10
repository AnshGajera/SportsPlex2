import React, { useState } from 'react';
import { Search, Users, Star, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';

const UserClubs = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();
  const [analyticsData, setAnalyticsData] = useState([
    {
      icon: Users,
      count: 0,
      label: 'Total Clubs',
      color: '#3b82f6'
    },
    {
      icon: Star,
      count: 0,
      label: 'Joined Clubs',
      color: '#10b981'
    },
    {
      icon: Calendar,
      count: 0,
      label: 'Club Events',
      color: '#f59e0b'
    },
    {
      icon: Trophy,
      count: 0,
      label: 'Achievements',
      color: '#8b5cf6'
    }
  ]);

  const clubs = [
    // Add sample clubs here if needed
  ];

  const myClubs = [
    // Add user's clubs here if needed
  ];

  // TODO: Fetch analytics data from backend
  // useEffect(() => {
  //   const fetchAnalytics = async () => {
  //     try {
  //       const response = await api.get('/user/clubs/analytics');
  //       setAnalyticsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching clubs analytics:', error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, []);

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 className="page-title">Sports Clubs</h1>
        <p className="page-subtitle">
          {activeTab === 'browse' ? 'Discover and join sports clubs' : 'Manage your club memberships'}
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

      {/* Tabs and Search Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '16px',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button 
            className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse Clubs
          </button>
          <button 
            className={`tab ${activeTab === 'my-clubs' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-clubs')}
          >
            My Clubs
          </button>
        </div>

        {activeTab === 'browse' && (
          <SearchBar
            placeholder="Search clubs by name or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              transform: 'translateY(-7px)',
              minWidth: '300px',
              maxWidth: '400px'
            }}
          />
        )}
      </div>

      {activeTab === 'browse' && (
        <div>
          <div className="empty-state">
            <Users size={64} className="empty-state-icon" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              No clubs available
            </h3>
            <p style={{ marginBottom: '12px' }}>
              No sports clubs are currently available. Check back later or contact administrator.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'my-clubs' && (
        <div>
          {myClubs.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No clubs joined
              </h3>
              <p style={{ marginBottom: '12px' }}>
                You haven't joined any clubs yet. Browse available clubs to get started.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('browse')}
              >
                Browse Clubs
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {myClubs.map((club, index) => (
                <div key={index} className="card">
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <Users size={24} color="#64748b" />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
                    {club.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                    {club.description}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#64748b'
                  }}>
                    <span>{club.members} members</span>
                    <span>Joined {club.joinedDate}</span>
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

export default UserClubs;
