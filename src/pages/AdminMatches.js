import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Play, Calendar, CheckCircle, Activity, Edit3 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ScheduleMatchModal from '../components/Modals/ScheduleMatchModal';
import api from '../services/api';

const AdminMatches = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch matches data from backend
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        const matchesData = response.data.matches || response.data;
        setMatches(matchesData);
        
        // Update analytics
        const liveMatches = matchesData.filter(match => getMatchStatus(match) === 'live').length;
        const upcomingMatches = matchesData.filter(match => getMatchStatus(match) === 'upcoming').length;
        const completedMatches = matchesData.filter(match => getMatchStatus(match) === 'completed').length;
        const totalMatches = matchesData.length;
        
        setAnalyticsData(prev => [
          { ...prev[0], count: liveMatches },
          { ...prev[1], count: upcomingMatches },
          { ...prev[2], count: completedMatches },
          { ...prev[3], count: totalMatches }
        ]);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    // Poll every minute to update live/completed status
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  const getMatchStatus = (match) => {
    const now = new Date();
    const start = new Date(match.matchDate);
    const durationMinutes = Number(match.duration) || 90;
    const end = new Date(start.getTime() + durationMinutes * 60000);

    if (now < start) return 'upcoming';
    if (now >= start && now < end) return 'live';
    return 'completed';
  };

  const liveMatches = matches.filter(match => getMatchStatus(match) === 'live');
  const upcomingMatches = matches.filter(match => getMatchStatus(match) === 'upcoming');
  const completedMatches = matches.filter(match => getMatchStatus(match) === 'completed');

  const handleScheduleMatch = (newMatch) => {
    setMatches(prevMatches => [...prevMatches, newMatch]);
    setAnalyticsData(prev => [
      prev[0], // Live matches unchanged
      { ...prev[1], count: prev[1].count + 1 }, // Upcoming +1
      prev[2], // Completed unchanged
      { ...prev[3], count: prev[3].count + 1 }  // Total +1
    ]);
  };

  const navigateToLiveScore = (match) => {
    navigate(`/admin/live-score/${match._id}`);
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
        loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading matches...</p>
          </div>
        ) : liveMatches.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No live matches at the moment"
            description="There are no matches currently in progress. Check the upcoming matches or schedule a new one."
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {liveMatches
              .filter(match => 
                match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.team2.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((match, index) => (
                <MatchCard 
                  key={match._id || index} 
                  match={match} 
                  onUpdateLiveScore={() => navigateToLiveScore(match)}
                  showUpdateButton={true}
                />
              ))
            }
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {upcomingMatches
              .filter(match => 
                match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.team2.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((match, index) => (
                <MatchCard 
                  key={match._id || index} 
                  match={match} 
                  onUpdateLiveScore={() => navigateToLiveScore(match)}
                  showUpdateButton={true}
                />
              ))
            }
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
            {completedMatches
              .filter(match => 
                match.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.team2.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((match, index) => (
                <MatchCard 
                  key={match._id || index} 
                  match={match} 
                  onUpdateLiveScore={() => navigateToLiveScore(match)}
                  showUpdateButton={true}
                />
              ))
            }
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

// MatchCard component
const MatchCard = ({ match, onUpdateLiveScore, showUpdateButton = false }) => {
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
      default: return '#6b7280';
    }
  };

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
            background: getStatusColor(match.status),
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {match.status}
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
            {(match.status === 'completed' || match.status === 'live') && (
              <div>
                {match.sport?.toLowerCase().includes('cricket') ? (
                  <div>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: match.status === 'live' ? '#ef4444' : '#3b82f6'
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
                    color: match.status === 'live' ? '#ef4444' : '#3b82f6'
                  }}>
                    {match.team1.score || 0}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div style={{
            padding: '8px 16px',
            background: match.status === 'live' ? '#ef4444' : '#f3f4f6',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            color: match.status === 'live' ? '#fff' : '#6b7280'
          }}>
            {match.status === 'live' ? 'LIVE' : 'VS'}
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
            {(match.status === 'completed' || match.status === 'live') && (
              <div>
                {match.sport?.toLowerCase().includes('cricket') ? (
                  <div>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: match.status === 'live' ? '#ef4444' : '#3b82f6'
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
                    color: match.status === 'live' ? '#ef4444' : '#3b82f6'
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
          <div style={{ marginBottom: showUpdateButton ? '12px' : '0' }}>
            📍 {match.venue}
          </div>
          
          {/* Live Score Update Button */}
          {showUpdateButton && (
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={onUpdateLiveScore}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: match.status === 'live' ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = match.status === 'live' ? '#dc2626' : '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = match.status === 'live' ? '#ef4444' : '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {match.status === 'live' ? (
                  <>
                    <Activity size={14} />
                    Update Live Score
                  </>
                ) : (
                  <>
                    <Edit3 size={14} />
                    {match.status === 'upcoming' ? 'Start Match' : 'Edit Score'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMatches;
