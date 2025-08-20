import React, { useState } from 'react';
import { Trophy, Plus } from 'lucide-react';
import ScheduleMatch from '../components/Matches/ScheduleMatch';
import SearchBar from '../components/SearchBar';

const Matches = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const liveMatches = [];
  const upcomingMatches = [];
  const completedMatches = [];

  const EmptyState = ({ icon: Icon, title, description, actionButton }) => (
    <div className="empty-state">
      <Icon size={64} className="empty-state-icon" />
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
        {title}
      </h3>
      <p style={{ marginBottom: '24px' }}>
        {description}
      </p>
      {actionButton}
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '1px'
      }}>
        <div>
          <h1 className="page-title">Matches</h1>
          <p className="page-subtitle">View live scores and match schedules</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowScheduleModal(true)}
        >
          <Plus size={20} />
          Schedule Match
        </button>
      </div>

      {/* Tabs and Search Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '24px',
        flexWrap: 'nowrap',
        flexShrink: 0
      }}>
        <div className="tabs" style={{ flexShrink: 0 }}>
          <button 
            className={`tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            Live Matches
          </button>
          <button 
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
        
        <SearchBar
          placeholder="Search matches by team or event..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            transform: 'translateY(-7px)',
            minWidth: '300px',
            maxWidth: '400px'
          }}
        />
      </div>

      {activeTab === 'live' && (
        liveMatches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No live matches at the moment"
            description="There are no matches currently in progress. Check the upcoming matches or schedule a new one."
          />
        ) : (
          <div className="grid grid-1">
            {liveMatches.map((match, index) => (
              <div key={index} className="card">
                {/* Live match card content */}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'upcoming' && (
        upcomingMatches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No upcoming matches"
            description="There are no matches scheduled for the future. Schedule a new match to get started."
            actionButton={
              <button 
                className="btn btn-primary"
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule Match
              </button>
            }
          />
        ) : (
          <div className="grid grid-1">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="card">
                {/* Upcoming match card content */}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'completed' && (
        completedMatches.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No completed matches"
            description="No matches have been completed yet. Once matches are finished, they will appear here."
          />
        ) : (
          <div className="grid grid-1">
            {completedMatches.map((match, index) => (
              <div key={index} className="card">
                {/* Completed match card content */}
              </div>
            ))}
          </div>
        )
      )}

      {showScheduleModal && (
        <ScheduleMatch onClose={() => setShowScheduleModal(false)} />
      )}
    </div>
  );
};

export default Matches;