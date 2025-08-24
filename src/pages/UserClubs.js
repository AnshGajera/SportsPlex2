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

  // Helper function to check if user is a member of a club
  const isUserMemberOfClub = (club, user) => {
    if (!club.members || !Array.isArray(club.members) || !user) return false;
    
    return club.members.some(member => {
      // Handle different possible user ID formats
      const memberId = member.user?._id || member.user?.id || member.user;
      const userId = user?._id || user?.id;
      
      return memberId === userId;
    });
  };

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
        
        // Debug: Log current user and club data
        console.log('=== USER CLUBS DEBUG ===');
        console.log('Current User:', currentUser);
        console.log('Clubs Data:', clubsData);
        
        // Filter clubs where user is a member using helper function
        const userClubs = clubsData.filter(club => isUserMemberOfClub(club, currentUser));
        
        console.log('Initial filtered user clubs:', userClubs);
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
      
      // Update my clubs using helper function
      const userClubs = clubsData.filter(club => isUserMemberOfClub(club, currentUser));
      
      console.log('Filtered user clubs after join:', userClubs);
      setMyClubs(userClubs);
      
      // Update analytics
      setAnalyticsData(prev => [
        { ...prev[0], count: clubsData.length },
        { ...prev[1], count: userClubs.length },
        { ...prev[2], count: 0 }, // Club events - implement later
        { ...prev[3], count: 0 }  // Achievements - implement later
      ]);
      
      alert('Successfully joined the club!');
    } catch (error) {
      console.error('Error joining club:', error);
      console.error('Error details:', error.response?.data);
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
                    isJoined={isUserMemberOfClub(club, currentUser)}
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

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    // If image fails to load, use gradient background
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const imageUrl = club.image ? `http://localhost:5000${club.image}` : null;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer group"
    >
      {/* Header Section with Title and Status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
              {club.name}
            </h3>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
              {club.category}
            </span>
          </div>
          
          {/* Member Badge */}
          {showMemberBadge && (
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
              ● Member
            </div>
          )}
        </div>
      </div>

      {/* Club Logo/Image Section - Enhanced Design */}
      <div className="px-4 pt-2">
        <div className="relative h-44 bg-white rounded-xl overflow-hidden shadow-inner border-2 border-gray-100 group-hover:border-blue-200 transition-all duration-300">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, #3b82f6 2px, transparent 2px),
                               radial-gradient(circle at 80% 50%, #8b5cf6 2px, transparent 2px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative h-full flex items-center justify-center p-3">
            {club.image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Logo Container with Aspect Ratio */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={`${club.name} logo`}
                    onError={handleImageError}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                    style={{ 
                      filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))',
                      maxWidth: '180px',
                      maxHeight: '180px'
                    }}
                  />
                </div>
                
                {/* Subtle glow effect behind logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl"></div>
                </div>
              </div>
            ) : (
              /* Enhanced Fallback Design */
              <div className="text-center relative">
                {/* Background Circle with Animation */}
                <div className="relative mb-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-xl relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <span className="text-3xl font-bold text-white relative z-10">
                      {club.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-blue-300 opacity-30 animate-ping"></div>
                </div>
                
                {/* Club name with better typography */}
                <div className="space-y-0.5">
                  <span className="block text-sm font-semibold text-gray-700">{club.name}</span>
                  <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">Sports Club</span>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                <div className="absolute top-6 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-60"></div>
              </div>
            )}
          </div>
          
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-100 to-transparent opacity-50 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-purple-100 to-transparent opacity-50 rounded-tr-3xl"></div>
        </div>
      </div>
      
      {/* Club Description and Info */}
      <div className="p-3">
        <p className="text-sm text-gray-600 leading-relaxed mb-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {club.description}
        </p>
        
        {/* Stats and Actions - Better Layout */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Users size={14} className="mr-1.5 text-blue-500" />
              <span className="font-medium text-gray-700">{club.members?.length || 0}</span>
              <span className="ml-1">members</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={14} className="mr-1.5 text-green-500" />
              <span className="font-medium text-gray-700">{new Date(club.createdAt).getFullYear()}</span>
            </div>
          </div>
          
          {/* Action Button or Status */}
          <div className="flex items-center">
            {!isJoined && onJoin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Join Club
              </button>
            )}
            
            {isJoined && (
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                ✓ Joined
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserClubs;
