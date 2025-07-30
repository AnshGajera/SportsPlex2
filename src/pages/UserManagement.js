import React, { useState } from 'react';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('admins');

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage user roles and permissions</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'admins' ? 'active' : ''}`}
          onClick={() => setActiveTab('admins')}
        >
          Admins
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`tab ${activeTab === 'studentHeads' ? 'active' : ''}`}
          onClick={() => setActiveTab('studentHeads')}
        >
          Student Heads
        </button>
      </div>

      <div className="section-content" style={{ marginTop: '24px' }}>
        {activeTab === 'admins' && (
          <div>
            <h2>Admins</h2>
            <p>Manage admin users here.</p>
          </div>
        )}
        {activeTab === 'students' && (
          <div>
            <h2>Students</h2>
            <p>Manage student users here.</p>
          </div>
        )}
        {activeTab === 'studentHeads' && (
          <div>
            <h2>Student Heads</h2>
            <p>Manage student head users here.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .tabs {
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 24px;
        }
        .tabs button {
          background: none;
          border: none;
          padding: 12px 0;
          font-weight: 600;
          font-size: 16px;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.3s, border-color 0.3s;
        }
        .tabs button.active {
          color: #2563eb;
          border-bottom-color: #2563eb;
        }
        .tabs button:hover:not(.active) {
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
