import React, { useState, useEffect } from 'react';
import { Crown, Clock, CheckCircle, XCircle, Send, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentHeadRequest = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canRequest, setCanRequest] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [reason, setReason] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Calculate analytics data based on user's request status
  const getAnalyticsData = () => {
    let statusText = 'Not Applied';
    let statusIcon = XCircle;
    let statusColor = '#6b7280';

    if (existingRequest) {
      switch (existingRequest.status) {
        case 'pending':
          statusText = 'Applied (Pending)';
          statusIcon = Clock;
          statusColor = '#f59e0b';
          break;
        case 'approved':
          statusText = 'Approved';
          statusIcon = CheckCircle;
          statusColor = '#10b981';
          break;
        case 'rejected':
          statusText = 'Rejected';
          statusIcon = XCircle;
          statusColor = '#ef4444';
          break;
      }
    }

    // Return only the status card
    return [
      {
        icon: statusIcon,
        count: statusText,
        label: 'Your Status',
        color: statusColor
      }
    ];
  };

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  // Check if user can request and fetch existing request
  useEffect(() => {
    const fetchRequestStatus = async () => {
      if (!currentUser) return;

      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        
        // Check if user can request
        const canRequestResponse = await api.get('/student-head-requests/can-request', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCanRequest(canRequestResponse.data.canRequest);

        // Get existing requests
        const requestResponse = await api.get('/student-head-requests/my-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get the most recent request if any
        const requests = requestResponse.data;
        if (requests && requests.length > 0) {
          setExistingRequest(requests[0]); // Most recent request
        }

        // If user can't request and has no existing request, show the reason
        if (!canRequestResponse.data.canRequest && (!requests || requests.length === 0)) {
          showNotification(canRequestResponse.data.reason || 'You cannot submit a request at this time.', 'info');
        }

      } catch (error) {
        console.error('Error fetching request status:', error);
        showNotification('Failed to load request status.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestStatus();
  }, [currentUser]);

  // Handle form submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      showNotification('Please provide a reason for your request.', 'error');
      return;
    }

    if (reason.length > 500) {
      showNotification('Reason must be less than 500 characters.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await api.post('/student-head-requests/request', {
        reason: reason.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 201) {
        showNotification('Your Student Head request has been submitted successfully!', 'success');
        setExistingRequest(response.data.request);
        setCanRequest(false);
        setReason('');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      showNotification(error.response?.data?.message || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return FileText;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Student Head Request</h1>
        <p className="page-subtitle">Apply for Student Head position and track your request status</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          style={{
            padding: '16px',
            marginBottom: '24px',
            borderRadius: '8px',
            backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: notification.type === 'success' ? '#166534' : '#dc2626',
            border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Status Card - Fixed Size - Left Aligned */}
      <div style={{ 
        marginBottom: '32px'
      }}>
        {getAnalyticsData().map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="card" style={{
              background: `linear-gradient(135deg, #fff 0%, ${stat.color}15 100%)`,
              border: `1px solid ${stat.color}25`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              width: '300px',
              maxWidth: '300px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${stat.color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ 
                    fontSize: typeof stat.count === 'string' ? '1.25rem' : '2rem', 
                    fontWeight: '700', 
                    color: stat.color, 
                    margin: '0 0 8px 0',
                    lineHeight: '1.2'
                  }}>
                    {stat.count}
                  </p>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>
                    {stat.label}
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComponent size={24} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-2" style={{ gap: '24px' }}>
        {/* Request Form or Status */}
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={24} color="#f59e0b" />
              Student Head Application
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              {existingRequest ? 'Your current application status' : 'Submit your application for Student Head position'}
            </p>
          </div>

          {existingRequest ? (
            /* Show existing request status */
            <div>
              <div style={{ 
                padding: '20px', 
                borderRadius: '12px', 
                backgroundColor: `${getStatusColor(existingRequest.status)}15`,
                border: `2px solid ${getStatusColor(existingRequest.status)}25`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {React.createElement(getStatusIcon(existingRequest.status), { 
                    size: 24, 
                    color: getStatusColor(existingRequest.status) 
                  })}
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.25rem', 
                    fontWeight: '600',
                    color: getStatusColor(existingRequest.status),
                    textTransform: 'capitalize'
                  }}>
                    {existingRequest.status}
                  </h3>
                </div>
                
                <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                  <strong>Submitted:</strong> {formatDate(existingRequest.submittedAt)}
                </p>
                
                {existingRequest.reviewedAt && (
                  <p style={{ margin: '0 0 8px 0', color: '#374151' }}>
                    <strong>Reviewed:</strong> {formatDate(existingRequest.reviewedAt)}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Your Application Reason:
                </h4>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>
                    {existingRequest.reason}
                  </p>
                </div>
              </div>

              {existingRequest.adminNotes && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                    Admin Notes:
                  </h4>
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#fef7f0', 
                    borderRadius: '8px',
                    border: '1px solid #fed7aa'
                  }}>
                    <p style={{ margin: 0, color: '#ea580c', lineHeight: '1.6' }}>
                      {existingRequest.adminNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Show submit new request button for rejected requests */}
              {existingRequest.status === 'rejected' && (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    Your previous request was rejected. You can submit a new application.
                  </p>
                  <button
                    onClick={() => {
                      setExistingRequest(null);
                      setCanRequest(true);
                      setReason('');
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'none';
                    }}
                  >
                    <Send size={16} />
                    Submit New Application
                  </button>
                </div>
              )}
            </div>
          ) : canRequest ? (
            /* Show request form */
            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
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
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  maxLength={500}
                  required
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: '4px',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <span>Maximum 500 characters</span>
                  <span>{reason.length}/500</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: submitting || !reason.trim() ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: submitting || !reason.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && reason.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting && reason.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'none';
                  }
                }}
              >
                <Send size={16} />
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          ) : (
            /* Show why user can't request */
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Crown size={48} color="#9ca3af" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Cannot Submit Request
              </h3>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {currentUser?.role !== 'student' 
                  ? 'Only students can apply for Student Head position'
                  : 'You may already have a pending request or are not eligible at this time'
                }
              </p>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '8px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={24} color="#3b82f6" />
              Information
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              Learn about the Student Head role and application process
            </p>
          </div>

          <div style={{ space: '24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Student Head Responsibilities
              </h3>
              <ul style={{ color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>Managing student activities and events</li>
                <li style={{ marginBottom: '8px' }}>Coordinating with administrators</li>
                <li style={{ marginBottom: '8px' }}>Overseeing club operations</li>
                <li style={{ marginBottom: '8px' }}>Supporting fellow students</li>
                <li style={{ marginBottom: '8px' }}>Representing student interests</li>
              </ul>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Application Process
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>1</div>
                  <span style={{ color: '#6b7280' }}>Submit your application with reason</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>2</div>
                  <span style={{ color: '#6b7280' }}>Admin reviews your application</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: '#10b981',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>3</div>
                  <span style={{ color: '#6b7280' }}>Receive notification of decision</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginTop: '24px'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>
                Note
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: '1.5' }}>
                Applications are reviewed by administrators on a case-by-case basis. 
                Please provide a detailed and honest reason for your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHeadRequest;
