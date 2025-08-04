import React, { useState } from 'react';
import { UserCheck, Check, X } from 'lucide-react';

const StudentHeadRequests = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const requests = [
    // Sample requests data
  ];

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Student Head Requests</h1>
        <p className="page-subtitle">Review and manage student head position requests</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button 
          className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button 
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>
      </div>

      {/* Pending Requests */}
      {activeTab === 'pending' && (
        <div>
          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No pending requests
              </h3>
              <p>There are no pending student head requests to review.</p>
            </div>
          ) : (
            <div className="grid grid-1">
              {pendingRequests.map((request, index) => (
                <RequestCard 
                  key={index} 
                  request={request}
                  showActions={true}
                  onApprove={() => {/* Handle approve */}}
                  onReject={() => {/* Handle reject */}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Requests */}
      {activeTab === 'approved' && (
        <div>
          {approvedRequests.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No approved requests
              </h3>
              <p>No requests have been approved yet.</p>
            </div>
          ) : (
            <div className="grid grid-1">
              {approvedRequests.map((request, index) => (
                <RequestCard key={index} request={request} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rejected Requests */}
      {activeTab === 'rejected' && (
        <div>
          {rejectedRequests.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No rejected requests
              </h3>
              <p>No requests have been rejected yet.</p>
            </div>
          ) : (
            <div className="grid grid-1">
              {rejectedRequests.map((request, index) => (
                <RequestCard key={index} request={request} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RequestCard = ({ request, showActions = false, onApprove, onReject }) => {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>
            {request?.studentName}
          </h3>
          <p style={{ color: '#64748b', marginBottom: '8px' }}>
            Group: {request?.group}
          </p>
          <span 
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: request?.status === 'approved' ? '#dcfce7' : 
                              request?.status === 'pending' ? '#fef3c7' : '#fee2e2',
              color: request?.status === 'approved' ? '#166534' : 
                     request?.status === 'pending' ? '#92400e' : '#dc2626'
            }}
          >
            {request?.status?.charAt(0).toUpperCase() + request?.status?.slice(1)}
          </span>
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary"
              onClick={onApprove}
              style={{ padding: '8px' }}
            >
              <Check size={20} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={onReject}
              style={{ padding: '8px' }}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
          Experience
        </h4>
        <p style={{ color: '#64748b', marginBottom: '16px' }}>
          {request?.experience}
        </p>

        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
          Motivation
        </h4>
        <p style={{ color: '#64748b' }}>
          {request?.motivation}
        </p>
      </div>
    </div>
  );
};

export default StudentHeadRequests;
