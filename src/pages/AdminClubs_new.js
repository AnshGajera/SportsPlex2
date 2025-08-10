import React, { useState } from 'react';
import { Search, Users, Star, Trophy, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import AddClubModal from '../components/Modals/AddClubModal';

const AdminClubs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const clubs = [
    // Add sample clubs here if needed
  ];

  // TODO: Fetch analytics data from backend
  // useEffect(() => {
  //   const fetchAnalytics = async () => {
  //     try {
  //       const response = await api.get('/admin/clubs/analytics');
  //       setAnalyticsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching clubs analytics:', error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, []);

  const handleAddClub = (clubData) => {
    console.log('Adding club:', clubData);
    // TODO: Submit to backend API
    // Example: api.post('/admin/clubs', clubData)
    // Then refresh the clubs list
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
        <div className="empty-state">
          <Users size={64} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            No clubs available
          </h3>
          <p style={{ marginBottom: '12px' }}>
            No sports clubs are currently available in the system.
          </p>
        </div>
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

export default AdminClubs;
