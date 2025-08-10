import React, { useState } from 'react';
import { Trophy, Plus, Play, Calendar, CheckCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ScheduleMatchModal from '../components/Modals/ScheduleMatchModal';

const AdminMatches = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsData, setAnalyticsData] = useState([
    {
      icon: Play,
      count: 0,
      label: 'Live Matches',
      color: '#ef4444'
    },
    {
      icon: Calendar,
      count: 0,
      label: 'Upcoming',
      color: '#3b82f6'
    },
    {
      icon: CheckCircle,
      count: 0,
      label: 'Completed',
      color: '#10b981'
    },
    {
      icon: Trophy,
      count: 0,
      label: 'Total Matches',
      color: '#f59e0b'
    }
  ]);

  const liveMatches = [];
  const upcomingMatches = [];
  const completedMatches = [];

  // TODO: Fetch analytics data from backend
  // useEffect(() => {
  //   const fetchAnalytics = async () => {
  //     try {
  //       const response = await api.get('/admin/matches/analytics');
  //       setAnalyticsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching matches analytics:', error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, []);

  const handleScheduleMatch = (matchData) => {
    console.log('Scheduling match:', matchData);
    // TODO: Submit to backend API
    // Example: api.post('/admin/matches', matchData)
    // Then refresh the matches list
  };

  const EmptyState = ({ icon: Icon, title, description, actionButton }) => (
    <div className="empty-state">
      <Icon size={64} className="empty-state-icon" />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
        {title}
      </h3>
      <p style={{ marginBottom: '12px' }}>
        {description}
      </p>
      {actionButton}
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '16px'
      }}>
        <div>
          <h1 className="page-title">Matches Management - Admin</h1>
          <p className="page-subtitle">
            Manage matches, schedules and live scores across all sports
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowScheduleModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
            minWidth: 'fit-content'
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
          }}
        >
          <Plus size={18} />
          Schedule Match
        </button>
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

      {/* Navigation and Controls Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '16px',
        gap: '20px',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        {/* Tabs on the left */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button 
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Matches
          </button>
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Search bar positioned right after tabs */}
        <SearchBar
          placeholder="Search matches by team or event..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            transform: 'translateY(-7px)',
            minWidth: '300px',
            maxWidth: '400px'
          }}
        />
      </div>

      {activeTab === 'live' && (
        liveMatches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No live matches at the moment"
            description="There are no matches currently in progress. Check the upcoming matches or schedule a new one."
          />
        ) : (
          <div className="grid grid-1">
            {liveMatches.map((match, index) => (
              <div key={index} className="card">
                {/* Live match card content */}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'upcoming' && (
        upcomingMatches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No upcoming matches"
            description="There are no matches scheduled for the future. Schedule a new match to get started."
            actionButton={
              <button 
                className="btn btn-primary"
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule Match
              </button>
            }
          />
        ) : (
          <div className="grid grid-1">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="card">
                {/* Upcoming match card content */}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'completed' && (
        completedMatches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No completed matches"
            description="No matches have been completed yet. Once matches are finished, they will appear here."
          />
        ) : (
          <div className="grid grid-1">
            {completedMatches.map((match, index) => (
              <div key={index} className="card">
                {/* Completed match card content */}
              </div>
            ))}
          </div>
        )
      )}

      {showScheduleModal && (
        <ScheduleMatchModal 
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)} 
          onSubmit={handleScheduleMatch}
        />
      )}
    </div>
  );
};

export default AdminMatches;
