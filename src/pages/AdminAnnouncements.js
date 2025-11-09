import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, AlertCircle, Info, Star, Trash2, Edit } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import CreateAnnouncementModal from '../components/Modals/CreateAnnouncementModal';
import api from '../services/api';

const AdminAnnouncements = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const [analyticsData, setAnalyticsData] = useState([
    { icon: Bell, count: 0, label: 'Total Announcements', color: '#3b82f6' },
    { icon: AlertCircle, count: 0, label: 'High Priority', color: '#ef4444' },
    { icon: Info, count: 0, label: 'General', color: '#10b981' },
    { icon: Star, count: 0, label: 'Featured', color: '#f59e0b' }
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

  const priorityAnnouncements = announcements.filter(ann => ann.priority === 'high');

  const refreshAnalytics = async () => {
    try {
      const res = await api.get('/announcements/analytics');
      const data = res.data?.data || {};
      const mapped = [
        { icon: Bell, count: data.total || 0, label: 'Total Announcements', color: '#3b82f6' },
        { icon: AlertCircle, count: data.highPriority || 0, label: 'High Priority', color: '#ef4444' },
        { icon: Info, count: data.general || 0, label: 'General', color: '#10b981' },
        { icon: Star, count: data.important || 0, label: 'Featured', color: '#f59e0b' }
      ];
      setAnalyticsData(mapped);
    } catch (e) {
      // silent
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements/all');
      setAnnouncements(res.data?.announcements || []);
    } catch (e) {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    refreshAnalytics();
  }, []);

  const handleCreateAnnouncement = async (announcementData) => {
    try {
      await api.post('/announcements', announcementData);
      await fetchAnnouncements();
      await refreshAnalytics();
    } catch (e) {
      console.error('Create announcement failed', e);
    }
  };

  const handleEditClick = (announcement) => {
    setSelectedForEdit(announcement);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data) => {
    if (!selectedForEdit?._id) return;
    try {
      await api.put(`/announcements/${selectedForEdit._id}`, data);
      setEditModalOpen(false);
      setSelectedForEdit(null);
      await fetchAnnouncements();
      await refreshAnalytics();
    } catch (e) {
      console.error('Update failed', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      await fetchAnnouncements();
      await refreshAnalytics();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const filtered = announcements.filter(a => {
    const matchesSearch = [a.title, a.content].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Announcements - Admin/Student Head</h1>
          <p className="page-subtitle">Create and manage announcements for all users</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)', minWidth: 'fit-content' }}
        >
          <Plus size={18} />
          Create Announcement
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '16px' }}>
        {analyticsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card" style={{ background: '#fff', boxShadow: 'none', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: `${stat.color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComponent size={18} color={stat.color} />
              </div>
              <div className="stat-content">
                <h3 style={{ color: stat.color, margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{stat.count}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '16px', gap: '20px', flexWrap: 'nowrap' }}>
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Announcements</button>
          <button className={`tab ${activeTab === 'priority' ? 'active' : ''}`} onClick={() => setActiveTab('priority')}>By Priority</button>
        </div>

        <div style={{ minWidth: '280px', maxWidth: '350px', flexShrink: 0, transform: 'translateY(-7px)' }}>
          <SearchBar placeholder="Search announcements by title or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div style={{ flexShrink: 0 }}>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ transform: 'translateY(-7px)', padding: '10px 16px', paddingRight: '35px', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '13px', backgroundColor: '#ffffff', color: '#374151', minWidth: '150px', fontWeight: '400', height: '40px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', outline: 'none' }}>
            {announcementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === 'all' && (
        <div>
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>No announcements found</h3>
              <p style={{ marginBottom: '12px' }}>No announcements have been created yet. Create your first announcement to get started.</p>
            </div>
          ) : (
            <div className="grid grid-1">
              {filtered.map((announcement) => (
                <div key={announcement._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', backgroundColor: announcement.type === 'event' ? '#dbeafe' : announcement.type === 'maintenance' ? '#fee2e2' : '#f1f5f9', color: announcement.type === 'maintenance' ? '#dc2626' : announcement.type === 'event' ? '#2563eb' : '#64748b' }}>
                        {announcement.type}
                      </span>
                      {announcement.priority === 'high' && (
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e' }}>HIGH PRIORITY</span>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>{new Date(announcement.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>{announcement.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{announcement.content}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn" onClick={() => handleEditClick(announcement)}><Edit size={16} /> Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(announcement._id)}><Trash2 size={16} /> Delete</button>
                  </div>
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>No priority announcements</h3>
              <p>There are no high priority announcements at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-1">
              {priorityAnnouncements.map((announcement) => (
                <div key={announcement._id} className="card" style={{ border: '2px solid #fbbf24' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', backgroundColor: '#fef3c7', color: '#92400e' }}>HIGH PRIORITY</span>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', backgroundColor: announcement.type === 'event' ? '#dbeafe' : announcement.type === 'maintenance' ? '#fee2e2' : '#f1f5f9', color: announcement.type === 'maintenance' ? '#dc2626' : announcement.type === 'event' ? '#2563eb' : '#64748b' }}>
                        {announcement.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>{new Date(announcement.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>{announcement.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: '1.5' }}>{announcement.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateAnnouncementModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateAnnouncement} />
      <CreateAnnouncementModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} onSubmit={handleEditSubmit} initialData={selectedForEdit || undefined} mode="edit" />
    </div>
  );
};

export default AdminAnnouncements;
