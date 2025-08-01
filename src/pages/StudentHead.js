import React, { useState } from 'react';
import { Users, UserCheck, CheckSquare } from 'lucide-react';

const StudentHead = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const groups = [
    // Sample groups data
  ];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '32px'
      }}>
        <div>
          <h1 className="page-title">Student Head Portal</h1>
          <p className="page-subtitle">Manage groups and student head requests</p>
        </div>
        {!showRequestModal && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowRequestModal(true)}
          >
            <UserCheck size={20} />
            Request Student Head Position
          </button>
        )}
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          My Requests
        </button>
      </div>

      {/* Groups Section */}
      {activeTab === 'groups' && (
        <div className="grid grid-3">
          {groups.length === 0 ? (
            <div className="empty-state">
              <Users size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No groups available
              </h3>
              <p style={{ marginBottom: '24px' }}>
                There are no student groups available at the moment.
              </p>
            </div>
          ) : (
            groups.map((group, index) => (
              <div key={index} className="card">
                {/* Group card content */}
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <StudentHeadRequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

const StudentHeadRequestModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    group: '',
    experience: '',
    motivation: ''
  });

  const groups = [
    'Sports Club',
    'Cultural Club',
    'Technical Club',
    'Literary Club'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Request Student Head Position</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Select Group</label>
            <select
              name="group"
              value={formData.group}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a group</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Experience</label>
            <textarea
              name="experience"
              placeholder="Share your relevant experience..."
              value={formData.experience}
              onChange={handleInputChange}
              rows={4}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="input-group">
            <label>Motivation</label>
            <textarea
              name="motivation"
              placeholder="Why do you want to be a student head?"
              value={formData.motivation}
              onChange={handleInputChange}
              rows={4}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckSquare size={20} />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentHead;
