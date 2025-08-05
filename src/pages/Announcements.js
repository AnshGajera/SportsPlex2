import React, { useState } from 'react';
import { Search, Bell, Filter } from 'lucide-react';
import SearchBar from '../components/SearchBar';

const Announcements = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');

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

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">Create and manage announcements for all users</p>
      </div>

      <div className="tabs">
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

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <SearchBar
          placeholder="Search announcements by title or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
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

      {activeTab === 'all' && (
        <div>
          {announcements.length === 0 ? (
            <div className="empty-state">
              <Bell size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No announcements found
              </h3>
              <p>
                Try adjusting your search or filter to find announcements.
              </p>
            </div>
          ) : (
            <div className="grid grid-1">
              {announcements.map((announcement, index) => (
                <div key={index} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
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
    </div>
  );
};

export default Announcements;