import React, { useState } from 'react';
import { Search, Bell, Filter, Plus, AlertCircle, Info, Star } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CreateAnnouncementModal from '../components/Modals/CreateAnnouncementModal';

const AdminAnnouncements = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([
    {
      icon: Bell,
      count: 0,
      label: 'Total Announcements',
      color: '#3b82f6'
    },
    {
      icon: AlertCircle,
      count: 0,
      label: 'High Priority',
      color: '#ef4444'
    },
    {
      icon: Info,
      count: 0,
      label: 'General',
      color: '#10b981'
    },
    {
      icon: Star,
      count: 0,
      label: 'Featured',
      color: '#f59e0b'
    }
  ]);

  const announcementTypes = [
    'All Types',
    'General',
    'Sports Events',
    'Equipment',
    'Club Activities',
    'Emergency',
    'Maintenance'
  ];

  const announcements = [
    // Add sample announcements here if needed
  ];

  const priorityAnnouncements = announcements.filter(ann => ann.priority === 'high');

  // TODO: Fetch analytics data from backend
  // useEffect(() => {
  //   const fetchAnalytics = async () => {
  //     try {
  //       const response = await api.get('/admin/announcements/analytics');
  //       setAnalyticsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching announcements analytics:', error);
  //     }
  //   };
  //   fetchAnalytics();
  // }, []);

  const handleCreateAnnouncement = (announcementData) => {
    console.log('Creating announcement:', announcementData);
    // TODO: Submit to backend API
    // Example: api.post('/admin/announcements', announcementData)
    // Then refresh the announcements list
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
          <h1 className="page-title">Announcements - Admin</h1>
          <p className="page-subtitle">Create and manage announcements for all users</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
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
          Create Announcement
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
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Announcements
          </button>
          <button 
            className={`tab ${activeTab === 'priority' ? 'active' : ''}`}
            onClick={() => setActiveTab('priority')}
          >
            By Priority
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
            placeholder="Search announcements by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type dropdown */}
        <div style={{ flexShrink: 0 }}>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              transform: 'translateY(-7px)',
              padding: '10px 16px',
              paddingRight: '35px',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              fontSize: '13px',
              backgroundColor: '#ffffff',
              color: '#374151',
              minWidth: '150px',
              fontWeight: '400',
              height: '40px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              outline: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 10px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '14px',
              cursor: 'pointer'
            }}
          >
            {announcementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === 'all' && (
        <div>
          {announcements.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No announcements found
              </h3>
              <p style={{ marginBottom: '12px' }}>
                No announcements have been created yet. Create your first announcement to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {announcements.map((announcement, index) => (
                <div key={index} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: announcement.type === 'Emergency' ? '#fee2e2' : 
                                         announcement.type === 'Sports Events' ? '#dbeafe' : '#f1f5f9',
                          color: announcement.type === 'Emergency' ? '#dc2626' : 
                                 announcement.type === 'Sports Events' ? '#2563eb' : '#64748b'
                        }}
                      >
                        {announcement.type}
                      </span>
                      {announcement.priority === 'high' && (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600',
                          backgroundColor: '#fef3c7',
                          color: '#92400e'
                        }}>
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                      {announcement.date}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                    {announcement.title}
                  </h3>
                  <p style={{ color: '#64748b', lineHeight: '1.5' }}>
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'priority' && (
        <div>
          {priorityAnnouncements.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No priority announcements
              </h3>
              <p>
                There are no high priority announcements at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {priorityAnnouncements.map((announcement, index) => (
                <div key={index} className="card" style={{ border: '2px solid #fbbf24' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600',
                        backgroundColor: '#fef3c7',
                        color: '#92400e'
                      }}>
                        HIGH PRIORITY
                      </span>
                      <span 
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: announcement.type === 'Emergency' ? '#fee2e2' : 
                                         announcement.type === 'Sports Events' ? '#dbeafe' : '#f1f5f9',
                          color: announcement.type === 'Emergency' ? '#dc2626' : 
                                 announcement.type === 'Sports Events' ? '#2563eb' : '#64748b'
                        }}
                      >
                        {announcement.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                      {announcement.date}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                    {announcement.title}
                  </h3>
                  <p style={{ color: '#64748b', lineHeight: '1.5' }}>
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />
    </div>
  );
};

export default AdminAnnouncements;
