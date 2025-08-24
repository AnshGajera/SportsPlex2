import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, Star, Trophy, Calendar, Plus, Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import AddClubModal from '../components/Modals/AddClubModal';
import EditClubModal from '../components/Modals/EditClubModal';
import api from '../services/api';

const AdminClubs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
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

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`Are you sure you want to delete "${clubName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/clubs/${clubId}`);
      
      // Remove the club from local state
      setClubs(prevClubs => prevClubs.filter(club => club._id !== clubId));
      
      // Update analytics
      setAnalyticsData(prev => [
        { ...prev[0], count: prev[0].count - 1 },
        ...prev.slice(1)
      ]);
      
      alert('Club deleted successfully');
    } catch (error) {
      console.error('Error deleting club:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete club. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleClubUpdated = (updatedClub) => {
    setClubs(prev => prev.map(club => 
      club._id === updatedClub._id ? updatedClub : club
    ));
  };

  const handleEditClub = (club) => {
    setEditingClub(club);
    setIsEditModalOpen(true);
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
                <ClubCard 
                  key={club._id || index} 
                  club={club} 
                  onDelete={handleDeleteClub}
                  onEdit={handleEditClub}
                />
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

      {/* Edit Club Modal */}
      <EditClubModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClub(null);
        }}
        club={editingClub}
        onClubUpdated={handleClubUpdated}
      />
    </div>
  );
};

// ClubCard component
const ClubCard = ({ club, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Don't navigate if clicking on edit button
    if (e.target.closest('.edit-button')) {
      return;
    }
    navigate(`/admin/clubs/${club._id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(club);
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
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer group"
    >
      {/* Header Section with Title */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
              {club.name}
            </h3>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
              {club.category}
            </span>
          </div>
          
          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="edit-button p-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600 flex-shrink-0"
            title="Edit Club"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Club Logo/Image Section - Redesigned */}
      <div className="px-4 pt-2">
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-blue-200 transition-all duration-300 shadow-inner">
          {/* Dynamic Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, #10b981 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px, 80px 80px, 40px 40px'
            }}></div>
          </div>
          
          {/* Main Content Container */}
          <div className="relative h-full flex items-center justify-center p-4">
            {club.image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Premium Logo Container */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={`${club.name} logo`}
                      onError={handleImageError}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-all duration-700 ease-out"
                      style={{ 
                        filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1)) drop-shadow(0 4px 10px rgba(59, 130, 246, 0.1))',
                        maxWidth: '200px',
                        maxHeight: '200px'
                      }}
                    />
                    {/* Subtle animated glow behind logo */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-blue-200/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                  </div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-blue-400/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-6 right-6 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse delay-300"></div>
                <div className="absolute top-1/3 right-4 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-pulse delay-700"></div>
              </div>
            ) : (
              /* Enhanced Premium Fallback Design */
              <div className="text-center relative w-full">
                {/* Main Logo Circle with Modern Design */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    {/* Main gradient circle */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden group-hover:scale-105 transition-all duration-500 border border-white/20">
                      {/* Animated shine overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out"></div>
                      
                      {/* Club initial */}
                      <span className="text-3xl font-bold text-white relative z-10 tracking-wider">
                        {club.name.charAt(0).toUpperCase()}
                      </span>
                      
                      {/* Inner glow */}
                      <div className="absolute inset-2 rounded-xl bg-white/10 backdrop-blur-sm"></div>
                    </div>
                    
                    {/* Rotating ring effect */}
                    <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl border-2 border-blue-300/30 group-hover:border-blue-400/50 group-hover:rotate-180 transition-all duration-1000 ease-out"></div>
                    
                    {/* Outer pulsing glow */}
                    <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 animate-pulse blur-sm"></div>
                  </div>
                </div>
                
                {/* Modern Typography */}
                <div className="space-y-2 px-2">
                  <h4 className="text-lg font-bold text-gray-800 leading-tight truncate group-hover:text-blue-700 transition-colors">
                    {club.name}
                  </h4>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Sports Club</span>
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Modern floating decorations */}
                <div className="absolute top-6 left-8 w-2 h-8 bg-gradient-to-b from-blue-400/40 to-transparent rounded-full transform rotate-12 animate-pulse"></div>
                <div className="absolute top-8 right-8 w-2 h-6 bg-gradient-to-b from-purple-400/40 to-transparent rounded-full transform -rotate-12 animate-pulse delay-500"></div>
                <div className="absolute bottom-8 left-6 w-1 h-4 bg-gradient-to-b from-green-400/40 to-transparent rounded-full transform rotate-45 animate-pulse delay-1000"></div>
                <div className="absolute bottom-6 right-8 w-1.5 h-5 bg-gradient-to-b from-yellow-400/40 to-transparent rounded-full transform -rotate-45 animate-pulse delay-700"></div>
              </div>
            )}
          </div>
          
          {/* Modern corner accents */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-50 via-purple-50/50 to-transparent rounded-bl-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-50 via-blue-50/50 to-transparent rounded-tr-3xl opacity-60"></div>
          
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
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
        
        {/* Stats and Status - Better Layout */}
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
          
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            club.isActive 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {club.isActive ? '● Active' : '● Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClubs;
