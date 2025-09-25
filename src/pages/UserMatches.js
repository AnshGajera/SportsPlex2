import React, { useState, useEffect } from 'react';
import { Trophy, Play, Calendar, CheckCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

// Add CSS for pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(pulseStyle);


const getMatchStatus = (match) => {
  const now = new Date();
  const start = new Date(match.matchDate);
  
  // Get duration based on sport type
  let durationMinutes = 90; // default duration
  if (match.sport?.toLowerCase().includes('cricket')) {
    // Cricket duration based on format
    const format = match.matchConfig?.cricketConfig?.format || 'T20';
    switch (format) {
      case 'T20':
      case 'T10':
        durationMinutes = 180; // 3 hours for T20/T10
        break;
      case 'ODI':
        durationMinutes = 480; // 8 hours for ODI
        break;
      case 'Test':
        durationMinutes = 6 * 60; // 6 hours per day for Test
        break;
      default:
        durationMinutes = 180;
    }
  } else if (match.sport?.toLowerCase().includes('football')) {
    durationMinutes = match.matchConfig?.footballConfig?.duration || 90;
  } else if (match.sport?.toLowerCase().includes('basketball')) {
    const quarterDuration = match.matchConfig?.basketballConfig?.quarterDuration || 12;
    durationMinutes = quarterDuration * 4 + 15; // 4 quarters + breaks
  }
  
  // If match has explicit status in database, use that first
  if (match.status) {
    // Only override database status with time-based calculation for automatic transitions
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    // Auto-transition from upcoming to live if match time has started
    if (match.status === 'upcoming' && now >= start) {
      return 'live';
    }
    
    // Auto-transition from live to completed if match time has ended
    if (match.status === 'live' && now > end) {
      return 'completed';
    }
    
    // Return database status for manual overrides
    return match.status;
  }
  
  // Fallback to time-based calculation if no database status
  const end = new Date(start.getTime() + durationMinutes * 60000);
  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'live';
  return 'completed';
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="empty-state">
    <Icon size={64} className="empty-state-icon" />
    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
      {title}
    </h3>
    <p style={{ marginBottom: '12px' }}>
      {description}
    </p>
  </div>
);

const MatchCard = ({ match }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#ef4444';
      case 'upcoming': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#64748b';
      default: return '#6b7280';
    }
  };
  
  // Use computed status or fallback to getMatchStatus
  const currentStatus = match.computedStatus || getMatchStatus(match);
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      {/* Match Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {match.sport}
          </span>
          <span style={{
            padding: '4px 8px',
            background: getStatusColor(currentStatus),
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize',
            animation: currentStatus === 'live' ? 'pulse 2s infinite' : 'none'
          }}>
            {currentStatus}
          </span>
        </div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          margin: 0,
          lineHeight: '1.4'
        }}>
          {match.title}
        </h3>
      </div>
      {/* Teams */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px'
            }}>
              {match.team1.name}
            </h4>
            {(currentStatus === 'completed' || currentStatus === 'live') && (
              <div>
                {match.sport?.toLowerCase().includes('cricket') ? (
                  <div>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: currentStatus === 'live' ? '#ef4444' : '#3b82f6'
                    }}>
                      {match.team1?.cricketScore?.runs || match.team1?.score || 0}/{match.team1?.cricketScore?.wickets || 0}
                    </span>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      ({match.team1?.cricketScore?.overs || 0}.{match.team1?.cricketScore?.balls || 0} overs)
                    </div>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: currentStatus === 'live' ? '#ef4444' : '#3b82f6'
                  }}>
                    {match.team1.score || 0}
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{
            padding: '8px 16px',
            background: currentStatus === 'live' ? '#ef4444' : '#f3f4f6',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            color: currentStatus === 'live' ? '#fff' : '#6b7280'
          }}>
            {currentStatus === 'live' ? 'LIVE' : 'VS'}
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px'
            }}>
              {match.team2.name}
            </h4>
            {(currentStatus === 'completed' || currentStatus === 'live') && (
              <div>
                {match.sport?.toLowerCase().includes('cricket') ? (
                  <div>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: currentStatus === 'live' ? '#ef4444' : '#3b82f6'
                    }}>
                      {match.team2?.cricketScore?.runs || match.team2?.score || 0}/{match.team2?.cricketScore?.wickets || 0}
                    </span>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      ({match.team2?.cricketScore?.overs || 0}.{match.team2?.cricketScore?.balls || 0} overs)
                    </div>
                  </div>
                ) : (
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: currentStatus === 'live' ? '#ef4444' : '#3b82f6'
                  }}>
                    {match.team2.score || 0}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Match Details */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '12px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{ marginBottom: '4px' }}>
            📅 {formatDate(match.matchDate)}
          </div>
          <div>
            📍 {match.venue}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserMatches = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        const matchesData = response.data.matches || response.data;
        
        // Process matches to ensure correct status calculation
        const processedMatches = matchesData.map(match => {
          const currentStatus = getMatchStatus(match);
          return {
            ...match,
            // Add computed status for frontend use while preserving original
            computedStatus: currentStatus,
            status: match.status || currentStatus // Use database status or computed as fallback
          };
        });
        
        setMatches(processedMatches);
        setLastUpdated(new Date());
        
        // Update analytics based on computed status
        const liveMatches = processedMatches.filter(match => 
          (match.computedStatus || getMatchStatus(match)) === 'live'
        ).length;
        const upcomingMatches = processedMatches.filter(match => 
          (match.computedStatus || getMatchStatus(match)) === 'upcoming'
        ).length;
        const completedMatches = processedMatches.filter(match => 
          (match.computedStatus || getMatchStatus(match)) === 'completed'
        ).length;
        const totalMatches = processedMatches.length;
        
        setAnalyticsData(prev => [
          { ...prev[0], count: liveMatches },
          { ...prev[1], count: upcomingMatches },
          { ...prev[2], count: completedMatches },
          { ...prev[3], count: totalMatches }
        ]);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError(error.message || 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    
    // Auto-refresh every 30 seconds for better performance
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMatches, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filter matches based on computed status with proper search functionality
  const getFilteredMatches = (matches, status) => {
    return matches
      .filter(match => (match.computedStatus || getMatchStatus(match)) === status)
      .filter(match => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          match.title?.toLowerCase().includes(searchLower) ||
          match.team1?.name?.toLowerCase().includes(searchLower) ||
          match.team2?.name?.toLowerCase().includes(searchLower) ||
          match.sport?.toLowerCase().includes(searchLower) ||
          match.venue?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        // Sort by match date
        if (status === 'upcoming') {
          // Upcoming: closest first
          return new Date(a.matchDate) - new Date(b.matchDate);
        } else if (status === 'live') {
          // Live: most recent first
          return new Date(b.matchDate) - new Date(a.matchDate);
        } else {
          // Completed: most recent first
          return new Date(b.matchDate) - new Date(a.matchDate);
        }
      });
  };

  const liveMatches = getFilteredMatches(matches, 'live');
  const upcomingMatches = getFilteredMatches(matches, 'upcoming');
  const completedMatches = getFilteredMatches(matches, 'completed');

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
          <h1 className="page-title">Matches</h1>
          <p className="page-subtitle">
            View all matches, schedules and live scores across all sports
          </p>
        </div>
        
        {/* Refresh controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Last updated indicator */}
          {lastUpdated && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: autoRefresh ? '#10b981' : '#6b7280',
                borderRadius: '50%',
                animation: autoRefresh ? 'pulse 3s infinite' : 'none'
              }}></div>
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          
          {/* Manual refresh button */}
          <button
            onClick={() => window.location.reload()}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: '#fff',
              color: '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔄 Refresh
          </button>
          
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: autoRefresh ? '#10b981' : '#fff',
              color: autoRefresh ? '#fff' : '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: autoRefresh ? '#fff' : '#10b981',
              borderRadius: '50%'
            }}></div>
            Auto-refresh {autoRefresh ? 'ON (30s)' : 'OFF'}
          </button>
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

      {/* Error display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          color: '#dc2626'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>Error loading matches</p>
          <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{error}</p>
        </div>
      )}

      {/* Tabbed match lists */}
      {activeTab === 'live' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading matches...</p>
          </div>
        ) : liveMatches.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No live matches at the moment"
            description="There are no matches currently in progress. Check the upcoming matches."
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {liveMatches.map((match, index) => (
              <MatchCard key={match._id || index} match={match} />
            ))}
          </div>
        )
      )}
      {activeTab === 'upcoming' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading matches...</p>
          </div>
        ) : upcomingMatches.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming matches"
            description="There are no matches scheduled for the future."
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {upcomingMatches.map((match, index) => (
              <MatchCard key={match._id || index} match={match} />
            ))}
          </div>
        )
      )}
      {activeTab === 'completed' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading matches...</p>
          </div>
        ) : completedMatches.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No completed matches"
            description="No matches have been completed yet. Once matches are finished, they will appear here."
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {completedMatches.map((match, index) => (
              <MatchCard key={match._id || index} match={match} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default UserMatches;
