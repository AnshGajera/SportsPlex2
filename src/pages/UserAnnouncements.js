import React, { useState, useEffect } from 'react';
import { Search, Bell, Filter, AlertCircle, Info, Star } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const UserAnnouncements = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [analyticsData, setAnalyticsData] = useState([
    { icon: Bell, count: 0, label: 'Total Announcements', color: '#3b82f6' },
    { icon: AlertCircle, count: 0, label: 'High Priority', color: '#ef4444' },
    { icon: Info, count: 0, label: 'General', color: '#10b981' },
    { icon: Star, count: 0, label: 'Important', color: '#f59e0b' }
  ]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const announcementTypes = [
    'All Types', 'General', 'Sports Events', 'Equipment', 'Club Activities', 'Emergency', 'Maintenance'
  ];

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/announcements/analytics');
      const d = res.data?.data || {};
      setAnalyticsData([
        { icon: Bell, count: d.total || 0, label: 'Total Announcements', color: '#3b82f6' },
        { icon: AlertCircle, count: d.highPriority || 0, label: 'High Priority', color: '#ef4444' },
        { icon: Info, count: d.general || 0, label: 'General', color: '#10b981' },
        { icon: Star, count: d.important || 0, label: 'Important', color: '#f59e0b' }
      ]);
    } catch {}
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data?.announcements || []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadAnnouncements();
  }, []);

  const filtered = announcements.filter(a => {
    const matchesSearch = [a.title, a.content].join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const priorityAnnouncements = filtered.filter(ann => ann.priority === 'high');

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">Stay updated with the latest announcements and news</p>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'nowrap', flexShrink: 0 }}>
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Announcements</button>
          <button className={`tab ${activeTab === 'priority' ? 'active' : ''}`} onClick={() => setActiveTab('priority')}>Priority</button>
        </div>
        <SearchBar placeholder="Search announcements by title or content..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ transform: 'translateY(-7px)', minWidth: '300px', maxWidth: '400px' }} />
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={{ padding: '10px 16px', paddingRight: '35px', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '13px', backgroundColor: '#ffffff', color: '#374151', minWidth: '150px', fontWeight: '400', height: '40px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', outline: 'none', appearance: 'none', backgroundPosition: 'right 10px center', backgroundRepeat: 'no-repeat', backgroundSize: '14px', cursor: 'pointer', transform: 'translateY(-7px)' }}>
          {announcementTypes.map(type => (<option key={type} value={type}>{type}</option>))}
        </select>
      </div>

      {activeTab === 'all' && (
        <div>
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>No announcements found</h3>
              <p>There are no announcements available at the moment. Check back later for updates.</p>
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
                  <p style={{ color: '#64748b', lineHeight: '1.5' }}>{announcement.content}</p>
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
    </div>
  );
};

export default UserAnnouncements;
