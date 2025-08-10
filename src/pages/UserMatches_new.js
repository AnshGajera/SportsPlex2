import React, { useState } from 'react';
import { Trophy, Play, Calendar, CheckCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const UserMatches = () => {
  const [activeTab, setActiveTab] = useState('live');
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
      label: 'My Matches',
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
  //       const response = await api.get('/user/matches/analytics');
  //       setAnalyticsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching matches analytics:', error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, []);

  const EmptyState = ({ icon: Icon, title, description, actionButton }) => (
    <div className="empty-state">
      <Icon size={64} className="empty-state-icon" />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
        {title}
      </h3>
      <p style={{ marginBottom: '24px' }}>
        {description}
      </p>
      {actionButton}
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Matches</h1>
        <p className="page-subtitle">View live scores and match schedules</p>
      </div>

      {/* Analytics Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
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
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
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
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: `${stat.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent size={24} color={stat.color} />
              </div>
              <div className="stat-content">
                <h3 style={{ 
                  color: stat.color, 
                  margin: 0, 
                  fontSize: '1.75rem', 
                  fontWeight: '700' 
                }}>
                  {stat.count}
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#64748b', 
                  fontSize: '0.875rem',
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
        marginBottom: '24px',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
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
        
        <SearchBar
          placeholder="Search matches..."
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
        <div>
          {liveMatches.length === 0 ? (
            <EmptyState
              icon={Play}
              title="No live matches"
              description="There are no matches currently being played."
            />
          ) : (
            <div className="grid grid-2">
              {liveMatches.map((match, index) => (
                <div key={index} className="card match-card">
                  <div className="match-header">
                    <span className="live-indicator">LIVE</span>
                    <span className="match-sport">{match.sport}</span>
                  </div>
                  <div className="match-teams">
                    <div className="team">
                      <span className="team-name">{match.team1}</span>
                      <span className="team-score">{match.score1}</span>
                    </div>
                    <div className="vs">VS</div>
                    <div className="team">
                      <span className="team-name">{match.team2}</span>
                      <span className="team-score">{match.score2}</span>
                    </div>
                  </div>
                  <div className="match-info">
                    <span>{match.venue}</span>
                    <span>{match.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div>
          {upcomingMatches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming matches"
              description="There are no matches scheduled in the near future."
            />
          ) : (
            <div className="grid grid-2">
              {upcomingMatches.map((match, index) => (
                <div key={index} className="card match-card">
                  <div className="match-header">
                    <span className="upcoming-indicator">UPCOMING</span>
                    <span className="match-sport">{match.sport}</span>
                  </div>
                  <div className="match-teams">
                    <div className="team">
                      <span className="team-name">{match.team1}</span>
                    </div>
                    <div className="vs">VS</div>
                    <div className="team">
                      <span className="team-name">{match.team2}</span>
                    </div>
                  </div>
                  <div className="match-info">
                    <span>{match.venue}</span>
                    <span>{match.date} at {match.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          {completedMatches.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No completed matches"
              description="No matches have been completed recently."
            />
          ) : (
            <div className="grid grid-2">
              {completedMatches.map((match, index) => (
                <div key={index} className="card match-card">
                  <div className="match-header">
                    <span className="completed-indicator">COMPLETED</span>
                    <span className="match-sport">{match.sport}</span>
                  </div>
                  <div className="match-teams">
                    <div className="team">
                      <span className="team-name">{match.team1}</span>
                      <span className="team-score">{match.finalScore1}</span>
                    </div>
                    <div className="vs">VS</div>
                    <div className="team">
                      <span className="team-name">{match.team2}</span>
                      <span className="team-score">{match.finalScore2}</span>
                    </div>
                  </div>
                  <div className="match-info">
                    <span>{match.venue}</span>
                    <span>{match.date}</span>
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

export default UserMatches;
