import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, CheckSquare, Trophy, Activity, Play, Calendar } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const StudentHead = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchTab, setMatchTab] = useState('live');

  const groups = [
    // Sample groups data
  ];

  // Fetch matches data from backend
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        const matchesData = response.data.matches || response.data;
        setMatches(matchesData);
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

  const navigateToLiveScore = (match) => {
    navigate(`/admin/live-score/${match._id}`);
  };

  const liveMatches = matches.filter(match => getMatchStatus(match) === 'live');
  const upcomingMatches = matches.filter(match => getMatchStatus(match) === 'upcoming');
  const completedMatches = matches.filter(match => getMatchStatus(match) === 'completed');

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="page-title">Student Head Portal</h1>
          <p className="page-subtitle">Manage groups and student head requests</p>
        </div>
        {!showRequestModal && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowRequestModal(true)}
          >
            <UserCheck size={20} />
            Request Student Head Position
          </button>
        )}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <Trophy size={16} />
          Live Matches
        </button>
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <Users size={16} />
          Groups
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <UserCheck size={16} />
          My Requests
        </button>
      </div>

      {/* Matches Section */}
      {activeTab === 'matches' && (
        <div>
          {/* Match Stats */}
          <div className="stats-grid" style={{ marginBottom: '16px' }}>
            <div className="stat-card" style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#ef444415',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Play size={18} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ color: '#ef4444', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  {liveMatches.length}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>
                  Live Matches
                </p>
              </div>
            </div>

            <div className="stat-card" style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#3b82f615',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Calendar size={18} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ color: '#3b82f6', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                  {upcomingMatches.length}
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>
                  Upcoming
                </p>
              </div>
            </div>
          </div>

          {/* Match Navigation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            marginBottom: '16px',
            gap: '20px'
          }}>
            <div className="tabs" style={{ flexShrink: 0 }}>
              <button 
                className={`tab ${matchTab === 'live' ? 'active' : ''}`}
                onClick={() => setMatchTab('live')}
              >
                Live Matches
              </button>
              <button 
                className={`tab ${matchTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setMatchTab('upcoming')}
              >
                Upcoming
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

          {/* Live Matches */}
          {matchTab === 'live' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading matches...</p>
              </div>
            ) : liveMatches.length === 0 ? (
              <div className="empty-state">
                <Play size={64} className="empty-state-icon" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  No live matches at the moment
                </h3>
                <p style={{ marginBottom: '12px' }}>
                  There are no matches currently in progress. Check the upcoming matches.
                </p>
              </div>
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
                    <StudentHeadMatchCard 
                      key={match._id || index} 
                      match={match} 
                      onUpdateLiveScore={() => navigateToLiveScore(match)}
                    />
                  ))
                }
              </div>
            )
          )}

          {/* Upcoming Matches */}
          {matchTab === 'upcoming' && (
            loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Loading matches...</p>
              </div>
            ) : upcomingMatches.length === 0 ? (
              <div className="empty-state">
                <Calendar size={64} className="empty-state-icon" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  No upcoming matches
                </h3>
                <p style={{ marginBottom: '12px' }}>
                  There are no matches scheduled for the future.
                </p>
              </div>
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
                    <StudentHeadMatchCard 
                      key={match._id || index} 
                      match={match} 
                      onUpdateLiveScore={() => navigateToLiveScore(match)}
                    />
                  ))
                }
              </div>
            )
          )}
        </div>
      )}

      {/* Groups Section */}
      {activeTab === 'groups' && (
        <div className="grid grid-3">
          {groups.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No groups available
              </h3>
              <p style={{ marginBottom: '24px' }}>
                There are no student groups available at the moment.
              </p>
            </div>
          ) : (
            groups.map((group, index) => (
              <div key={index} className="card">
                {/* Group card content */}
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <StudentHeadRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

// StudentHead MatchCard component
const StudentHeadMatchCard = ({ match, onUpdateLiveScore }) => {
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
          <div style={{ marginBottom: '12px' }}>
            📍 {match.venue}
          </div>
          
          {/* Live Score Update Button */}
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
                  <Play size={14} />
                  Start Match
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentHeadRequestModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    group: '',
    experience: '',
    motivation: ''
  });

  const groups = [
    'Sports Club',
    'Cultural Club',
    'Technical Club',
    'Literary Club'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Request Student Head Position</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Select Group</label>
            <select
              name="group"
              value={formData.group}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a group</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Experience</label>
            <textarea
              name="experience"
              placeholder="Share your relevant experience..."
              value={formData.experience}
              onChange={handleInputChange}
              rows={4}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="input-group">
            <label>Motivation</label>
            <textarea
              name="motivation"
              placeholder="Why do you want to be a student head?"
              value={formData.motivation}
              onChange={handleInputChange}
              rows={4}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckSquare size={20} />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentHead;
