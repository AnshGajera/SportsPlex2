import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Star, Calendar, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const UserClubs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch clubs data from backend
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get('/clubs');
        const clubsData = response.data.clubs || response.data;
        setClubs(clubsData);
        
        // Filter clubs where user is a member
        const userClubs = clubsData.filter(club => 
          club.members && club.members.some(member => 
            member.user === currentUser?.id || member.user?._id === currentUser?.id
          )
        );
        setMyClubs(userClubs);
        
        // Update analytics
        setAnalyticsData(prev => [
          { ...prev[0], count: clubsData.length },
          { ...prev[1], count: userClubs.length },
          { ...prev[2], count: 0 }, // Club events - implement later
          { ...prev[3], count: 0 }  // Achievements - implement later
        ]);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchClubs();
    }
  }, [currentUser]);

  const handleJoinClub = async (clubId) => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await api.post(`/clubs/${clubId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh clubs data
      const response = await api.get('/clubs');
      const clubsData = response.data.clubs || response.data;
      setClubs(clubsData);
      
      // Update my clubs
      const userClubs = clubsData.filter(club => 
        club.members && club.members.some(member => 
          member.user === currentUser?.id || member.user?._id === currentUser?.id
        )
      );
      setMyClubs(userClubs);
      
      alert('Successfully joined the club!');
    } catch (error) {
      console.error('Error joining club:', error);
      alert('Failed to join club. Please try again.');
    }
  };
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading clubs...</p>
            </div>
          ) : clubs.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No clubs available
              </h3>
              <p style={{ marginBottom: '12px' }}>
                No sports clubs are currently available. Check back later or contact administrator.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {clubs
                .filter(club => 
                  club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  club.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((club, index) => (
                  <UserClubCard 
                    key={club._id || index} 
                    club={club} 
                    isJoined={myClubs.some(myClub => myClub._id === club._id)}
                    onJoin={() => handleJoinClub(club._id)}
                  />
                ))
              }
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-clubs' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading your clubs...</p>
            </div>
          ) : myClubs.length === 0 ? (
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {myClubs.map((club, index) => (
                <UserClubCard 
                  key={club._id || index} 
                  club={club} 
                  isJoined={true}
                  showMemberBadge={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// UserClubCard component
const UserClubCard = ({ club, isJoined, onJoin, showMemberBadge }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Don't navigate if clicking on the join button
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/user/clubs/${club._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      {/* Club Image/Logo */}
      <div style={{
        height: '180px',
        background: club.image 
          ? '#f8f9fa' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {club.image ? (
          <img
            src={`http://localhost:5000${club.image}`}
            alt={`${club.name} logo`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              padding: '20px',
              backgroundColor: '#ffffff'
            }}
          />
        ) : (
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center'
          }}>
            {club.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#374151'
        }}>
          {club.category}
        </div>
        
        {showMemberBadge && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#10b981',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Member
          </div>
        )}
      </div>
      
      {/* Club Info */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px',
          lineHeight: '1.4'
        }}>
          {club.name}
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: '1.5',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {club.description}
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <Users size={16} />
            <span>{club.members?.length || 0} members</span>
          </div>
          
          {!isJoined && onJoin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              style={{
                padding: '6px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.target.style.background = '#2563eb'}
              onMouseLeave={e => e.target.style.background = '#3b82f6'}
            >
              Join Club
            </button>
          )}
          
          {isJoined && (
            <div style={{
              padding: '4px 8px',
              background: '#dcfce7',
              color: '#166534',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Joined
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserClubs;
