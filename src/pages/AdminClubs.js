import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Star, Trophy, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import AddClubModal from '../components/Modals/AddClubModal';
import api from '../services/api';

const AdminClubs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clubs, setClubs] = useState([]);
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
      label: 'Total Members',
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
        
        // Debug: Log club data to see image field
        console.log('=== CLUBS DEBUG ===');
        clubsData.forEach((club, index) => {
          console.log(`Club ${index + 1}:`, {
            name: club.name,
            image: club.image,
            imageType: typeof club.image,
            fullClub: club
          });
        });
        
        // Update analytics
        const totalClubs = response.data.clubs?.length || response.data.length || 0;
        const totalMembers = (response.data.clubs || response.data).reduce((sum, club) => 
          sum + (club.members?.length || 0), 0);
        
        setAnalyticsData(prev => [
          { ...prev[0], count: totalClubs },
          { ...prev[1], count: totalMembers },
          { ...prev[2], count: 0 }, // Club events - implement later
          { ...prev[3], count: 0 }  // Achievements - implement later
        ]);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const handleAddClub = async (clubData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('description', clubData.description);
      formData.append('category', clubData.category);
      formData.append('contactEmail', clubData.contactEmail || '');
      formData.append('maxMembers', clubData.maxMembers || '');
      formData.append('requirements', clubData.requirements || '');
      formData.append('status', 'active'); // Always set to active
      
      if (clubData.image) {
        formData.append('image', clubData.image);
      }

      const response = await api.post('/clubs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        // Update local state with the new club from the server
        setClubs(prevClubs => [...prevClubs, response.data]);
        setAnalyticsData(prev => [
          { ...prev[0], count: prev[0].count + 1 },
          ...prev.slice(1)
        ]);
        console.log('Club created successfully:', response.data);
      }
    } catch (error) {
      console.error('Error creating club:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 'Failed to create club. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '16px'
      }}>
        <div>
          <h1 className="page-title">Sports Clubs - Admin</h1>
          <p className="page-subtitle">
            Manage all sports clubs in the system
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
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
          Add Club
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

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '16px',
        gap: '20px',
        flexWrap: 'nowrap'
      }}>
        {/* Tabs on the left */}
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button className="tab active">
            Manage Clubs
          </button>
        </div>

        {/* Search bar positioned right after tabs */}
        <div style={{ 
          minWidth: '280px', 
          maxWidth: '350px',
          flexShrink: 0,
          transform: 'translateY(-7px)'
        }}>
          <SearchBar
            placeholder="Search the clubs "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
              No sports clubs are currently available in the system.
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
                <ClubCard key={club._id || index} club={club} />
              ))
            }
          </div>
        )}
      </div>
      
      {/* Add Club Modal */}
      <AddClubModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClub}
      />
    </div>
  );
};

// ClubCard component
const ClubCard = ({ club }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/clubs/${club._id}`);
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    // If image fails to load, use gradient background
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const imageUrl = club.image ? `http://localhost:5000${club.image}` : null;
  console.log('Club card debug:', { name: club.name, image: club.image, imageUrl });

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
            src={imageUrl}
            alt={`${club.name} logo`}
            onError={handleImageError}
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain', // This ensures the logo fits properly without cropping
              objectPosition: 'center',
              padding: '20px', // Add some padding so logo doesn't touch edges
              backgroundColor: '#ffffff'
            }}
          />
        ) : (
          // Fallback: Display club name initials if no image
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center'
          }}>
            {club.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Category Badge */}
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
          
          <div style={{
            padding: '4px 8px',
            background: club.isActive ? '#dcfce7' : '#fee2e2',
            color: club.isActive ? '#166534' : '#dc2626',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {club.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClubs;
