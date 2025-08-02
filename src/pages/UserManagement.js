import React, { useState } from 'react';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('admins');

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Mock student data
  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Alex Johnson', email: 'alex@example.com' }
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResult(null);
      return;
    }
    // Search in students
    const foundStudent = students.find(student =>
      student.name.toLowerCase().includes(value.toLowerCase()) ||
      student.email.toLowerCase().includes(value.toLowerCase())
    );
    if (foundStudent) {
      setActiveTab('students');
      setSearchResult(foundStudent);
    } else {
      setSearchResult(null);
    }
  };


  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage user roles and permissions</p>

        {/* Search bar for students */}
        <div style={{ marginTop: '24px', maxWidth: '340px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb',
            padding: '6px 12px',
            width: '100%'
          }}>
            <svg width="20" height="20" fill="none" stroke="#9ca3af" style={{ marginRight: '8px' }} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: '#64748b',
                fontSize: '1.1rem',
                width: '100%'
              }}
            />
          </div>
        </div>

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

            {/* Show search result if available */}
            {searchResult ? (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                <div><strong>Name:</strong> {searchResult.name}</div>
                <div><strong>Email:</strong> {searchResult.email}</div>
              </div>
            ) : null}

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
