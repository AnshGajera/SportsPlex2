import React, { useState, useEffect } from 'react';
import { Users, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentHeadRequest = () => {
  const { currentUser } = useAuth();
  const [canRequest, setCanRequest] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Check if user can submit a request
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const response = await api.get('/student-head-requests/can-request');
        setCanRequest(response.data.canRequest);
        if (!response.data.canRequest) {
          console.log('Cannot request:', response.data.reason);
        }
      } catch (error) {
        console.error('Error checking eligibility:', error);
        setCanRequest(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    const fetchMyRequests = async () => {
      try {
        const response = await api.get('/student-head-requests/my-requests');
        setMyRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    if (currentUser && currentUser.role === 'student') {
      checkEligibility();
      fetchMyRequests();
    } else {
      setCheckingEligibility(false);
    }
  }, [currentUser]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('Please provide a reason for your request');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/student-head-requests/request', {
        reason: reason.trim()
      });

      alert('Your Student Head request has been submitted successfully!');
      setReason('');
      setCanRequest(false);
      
      // Refresh requests list
      const updatedRequests = await api.get('/student-head-requests/my-requests');
      setMyRequests(updatedRequests.data);

    } catch (error) {
      console.error('Error submitting request:', error);
      alert(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'approved': return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (checkingEligibility) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '20px' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'student') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
        <h2>Access Restricted</h2>
        <p>Only students can request to become Student Head.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <Users size={32} style={{ color: '#3b82f6' }} />
          Student Head Request
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Apply to become a Student Head and take on leadership responsibilities in our SportsPlex community.
        </p>
      </div>

      {/* Request Form */}
      {canRequest ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          marginBottom: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
            Submit Your Request
          </h2>
          
          <form onSubmit={handleSubmitRequest}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Why do you want to become a Student Head? *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain your motivation, leadership experience, and how you plan to contribute to the student community..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                maxLength={500}
                required
              />
              <div style={{ 
                textAlign: 'right', 
                fontSize: '12px', 
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {reason.length}/500 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              style={{
                background: loading || !reason.trim() ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading || !reason.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} style={{ color: '#d97706' }} />
            <span style={{ color: '#92400e', fontWeight: '500' }}>
              You cannot submit a new request at this time
            </span>
          </div>
        </div>
      )}

      {/* My Requests */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
          My Requests
        </h2>
        
        {myRequests.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No requests submitted yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myRequests.map((request) => (
              <div
                key={request._id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStatusIcon(request.status)}
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }} className={getStatusColor(request.status)}>
                      {request.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#374151' }}>Reason:</strong>
                  <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                    {request.reason}
                  </p>
                </div>

                {request.adminNotes && (
                  <div style={{ 
                    background: '#f9fafb', 
                    padding: '12px', 
                    borderRadius: '6px',
                    marginTop: '8px'
                  }}>
                    <strong style={{ color: '#374151', fontSize: '12px' }}>Admin Notes:</strong>
                    <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '12px' }}>
                      {request.adminNotes}
                    </p>
                  </div>
                )}

                {request.reviewedAt && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                    Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                    {request.reviewedBy && (
                      <span> by {request.reviewedBy.firstName} {request.reviewedBy.lastName}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHeadRequest;
