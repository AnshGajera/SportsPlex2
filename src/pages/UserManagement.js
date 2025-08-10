import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start',
        marginBottom: '1px'
      }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user roles and permissions</p>
        </div>
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

        <SearchBar
          placeholder="Search student by name or email..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ 
            transform: 'translateY(-7px)',
            minWidth: '300px',
            maxWidth: '400px'
          }}
        />
      </div>

      {activeTab === 'admins' && (
        <div>
          {/* Admin content will go here */}
        </div>
      )}

      {activeTab === 'students' && (
        <div>
          {/* Show search result if available */}
          {searchResult && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div><strong>Name:</strong> {searchResult.name}</div>
              <div><strong>Email:</strong> {searchResult.email}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'studentHeads' && (
        <div>
          {/* Student Heads content will go here */}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
