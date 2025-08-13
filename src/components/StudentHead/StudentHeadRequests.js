import React, { useState, useEffect } from 'react';
import { UserCheck, Check, X, Eye, Mail, Phone, Calendar, Book } from 'lucide-react';
import api from '../../services/api';
import { sendPromotionEmail } from '../../services/emailService';

// Add spinner animation CSS
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes modalSlideIn {
    0% { 
      opacity: 0; 
      transform: scale(0.95) translateY(-10px); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
`;

// Inject the CSS
if (!document.querySelector('#spinner-animation-style')) {
  const style = document.createElement('style');
  style.id = 'spinner-animation-style';
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

const StudentHeadRequests = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingRejection, setPendingRejection] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalStep, setModalStep] = useState('application'); // 'application', 'approve', 'reject'

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Auto hide after 5 seconds
  };

  // Fetch requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const response = await api.get('/admin/student-head-requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Handle approve request (from card or direct)
  const handleApprove = async (requestId, studentInfo) => {
    setPendingApproval({ requestId, studentInfo });
    setShowConfirmModal(true);
  };

  // Handle approve from modal
  const handleApproveFromModal = () => {
    if (!selectedApplication) return;
    goToApproveStep();
  };

  // Confirm approval
  const confirmApproval = async () => {
    const { requestId, studentInfo } = pendingApproval;
    setShowConfirmModal(false);
    setApproving(requestId);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await api.put(`/admin/student-head-requests/${requestId}`, {
        action: 'approve'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        // Update local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === requestId 
              ? { ...req, status: 'approved', reviewedAt: new Date() }
              : req
          )
        );

        // Send promotion email
        try {
          const emailResult = await sendPromotionEmail(
            studentInfo.email, 
            `${studentInfo.firstName} ${studentInfo.lastName}`
          );
          if (emailResult.success) {
            showNotification(
              `✅ ${studentInfo.firstName} ${studentInfo.lastName} has been promoted to Student Head! Congratulations email sent successfully.`,
              'success'
            );
          } else {
            showNotification(
              `✅ ${studentInfo.firstName} ${studentInfo.lastName} has been promoted to Student Head! (Email notification failed to send)`,
              'warning'
            );
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
          showNotification(
            `✅ ${studentInfo.firstName} ${studentInfo.lastName} has been promoted to Student Head! (Email notification failed to send)`,
            'warning'
          );
        }
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification(
        `❌ Failed to approve request for ${studentInfo.firstName} ${studentInfo.lastName}. Please try again.`,
        'error'
      );
    } finally {
      setApproving(null);
    }
  };

  // Cancel approval
  const cancelApproval = () => {
    setShowConfirmModal(false);
    setPendingApproval(null);
  };

  // Handle reject request (from card or direct)
  const handleReject = async (requestId, studentInfo) => {
    setPendingRejection({ requestId, studentInfo });
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Handle reject from modal
  const handleRejectFromModal = () => {
    if (!selectedApplication) return;
    goToRejectStep();
  };

  // Confirm rejection
  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection.', 'warning');
      return;
    }

    const { requestId, studentInfo } = pendingRejection;
    setShowRejectModal(false);
    setRejecting(requestId);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await api.put(`/admin/student-head-requests/${requestId}`, {
        action: 'reject',
        adminNotes: rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        // Update local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === requestId 
              ? { ...req, status: 'rejected', reviewedAt: new Date(), adminNotes: rejectionReason }
              : req
          )
        );

        showNotification(
          `🚫 ${studentInfo.firstName} ${studentInfo.lastName}'s request has been rejected and they have been notified.`,
          'info'
        );
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification(
        `❌ Failed to reject request for ${studentInfo.firstName} ${studentInfo.lastName}. Please try again.`,
        'error'
      );
    } finally {
      setRejecting(null);
    }
  };

  // Cancel rejection
  const cancelRejection = () => {
    setShowRejectModal(false);
    setPendingRejection(null);
    setRejectionReason('');
  };

  // Handle view application
  const handleViewApplication = (request) => {
    setSelectedApplication(request);
    setShowApplicationModal(true);
    setModalStep('application');
  };

  // Close application modal
  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedApplication(null);
    setModalStep('application');
  };

  // Navigate to approve step
  const goToApproveStep = () => {
    setModalStep('approve');
  };

  // Navigate to reject step
  const goToRejectStep = () => {
    setModalStep('reject');
    setRejectionReason('');
  };

  // Go back to previous step
  const goBackToApplication = () => {
    setModalStep('application');
    setRejectionReason(''); // Clear rejection reason when going back
  };

  // Confirm approval from modal
  const confirmModalApproval = async () => {
    if (!selectedApplication) return;
    
    setApproving(selectedApplication._id);
    setShowApplicationModal(false);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await api.put(`/admin/student-head-requests/${selectedApplication._id}`, {
        action: 'approve'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        // Update local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === selectedApplication._id 
              ? { ...req, status: 'approved', reviewedAt: new Date() }
              : req
          )
        );

        // Send promotion email
        try {
          const emailResult = await sendPromotionEmail(
            selectedApplication.student.email, 
            `${selectedApplication.student.firstName} ${selectedApplication.student.lastName}`
          );
          if (emailResult.success) {
            showNotification(
              `✅ ${selectedApplication.student.firstName} ${selectedApplication.student.lastName} has been promoted to Student Head! Congratulations email sent successfully.`,
              'success'
            );
          } else {
            showNotification(
              `✅ ${selectedApplication.student.firstName} ${selectedApplication.student.lastName} has been promoted to Student Head! (Email notification failed to send)`,
              'warning'
            );
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
          showNotification(
            `✅ ${selectedApplication.student.firstName} ${selectedApplication.student.lastName} has been promoted to Student Head! (Email notification failed to send)`,
            'warning'
          );
        }
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification(
        `❌ Failed to approve request for ${selectedApplication.student.firstName} ${selectedApplication.student.lastName}. Please try again.`,
        'error'
      );
    } finally {
      setApproving(null);
      closeApplicationModal();
    }
  };

  // Confirm rejection from modal
  const confirmModalRejection = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection.', 'warning');
      return;
    }

    setRejecting(selectedApplication._id);
    setShowApplicationModal(false);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await api.put(`/admin/student-head-requests/${selectedApplication._id}`, {
        action: 'reject',
        adminNotes: rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        // Update local state
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === selectedApplication._id 
              ? { ...req, status: 'rejected', reviewedAt: new Date(), adminNotes: rejectionReason }
              : req
          )
        );

        showNotification(
          `🚫 ${selectedApplication.student.firstName} ${selectedApplication.student.lastName}'s request has been rejected and they have been notified.`,
          'info'
        );
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification(
        `❌ Failed to reject request for ${selectedApplication.student.firstName} ${selectedApplication.student.lastName}. Please try again.`,
        'error'
      );
    } finally {
      setRejecting(null);
      closeApplicationModal();
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const approvedRequests = requests.filter(req => req.status === 'approved');
  const rejectedRequests = requests.filter(req => req.status === 'rejected');

  const handleViewProfile = async (student) => {
    setLoadingProfile(true);
    setShowUserModal(true);
    setSelectedUser(student); // Show basic info first
    
    try {
      // Fetch complete user data including certificates from user model
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await api.get(`/admin/users/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update with complete user data with certificates
      setSelectedUser(response.data);
    } catch (error) {
      console.error('Error fetching complete user profile:', error);
      // Keep the student data from the request if API fails
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      {/* Notification Component */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#10b981' : 
                     notification.type === 'warning' ? '#f59e0b' : '#ef4444',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && pendingApproval && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <UserCheck size={32} style={{ color: '#f59e0b' }} />
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Confirm Student Head Promotion
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Do you want to make this student Student Head?
              </p>
            </div>

            {/* Student Info */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '18px'
                }}>
                  {pendingApproval.studentInfo.firstName?.[0]}{pendingApproval.studentInfo.lastName?.[0]}
                </div>
                <div>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {pendingApproval.studentInfo.firstName} {pendingApproval.studentInfo.lastName}
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {pendingApproval.studentInfo.email}
                  </p>
                  {pendingApproval.studentInfo.department && (
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {pendingApproval.studentInfo.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelApproval}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                <UserCheck size={16} />
                Yes, Make Student Head
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && pendingRejection && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <X size={32} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Reject Student Head Request
              </h3>
              <p style={{
                margin: 0,
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Please provide a reason for rejecting this request
              </p>
            </div>

            {/* Student Info */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '18px'
                }}>
                  {pendingRejection.studentInfo.firstName?.[0]}{pendingRejection.studentInfo.lastName?.[0]}
                </div>
                <div>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {pendingRejection.studentInfo.firstName} {pendingRejection.studentInfo.lastName}
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {pendingRejection.studentInfo.email}
                  </p>
                  {pendingRejection.studentInfo.department && (
                    <p style={{
                      margin: '4px 0 0 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {pendingRejection.studentInfo.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Reason for rejection *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this request..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelRejection}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={!rejectionReason.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: !rejectionReason.trim() ? '#9ca3af' : '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: !rejectionReason.trim() ? 0.6 : 1
                }}
                onMouseEnter={e => {
                  if (rejectionReason.trim()) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
                onMouseLeave={e => {
                  if (rejectionReason.trim()) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }
                }}
              >
                <X size={16} />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            
            {/* Application View Step */}
            {modalStep === 'application' && (
              <>
                {/* Modal Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '24px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <UserCheck size={32} style={{ color: '#3b82f6' }} />
                  </div>
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Student Head Application
                  </h2>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: selectedApplication.status === 'approved' ? '#10b981' : 
                           selectedApplication.status === 'pending' ? '#f59e0b' : '#ef4444',
                    backgroundColor: selectedApplication.status === 'approved' ? '#10b98115' : 
                                    selectedApplication.status === 'pending' ? '#f59e0b15' : '#ef444415'
                  }}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </div>
                </div>

                {/* Student Information */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Applicant Information
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '20px'
                    }}>
                      {selectedApplication.student?.firstName?.[0]}{selectedApplication.student?.lastName?.[0]}
                    </div>
                    <div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {selectedApplication.student?.firstName} {selectedApplication.student?.lastName}
                      </h4>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {selectedApplication.student?.email}
                      </p>
                      {selectedApplication.student?.department && (
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          {selectedApplication.student?.department} • {selectedApplication.student?.college}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application Description */}
                {selectedApplication.reason && (
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Book size={18} style={{ color: '#3b82f6' }} />
                      Application Description
                    </h3>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: '#374151',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedApplication.reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Notes (for rejected requests) */}
                {selectedApplication.adminNotes && selectedApplication.status === 'rejected' && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #fecaca'
                  }}>
                    <h3 style={{
                      margin: '0 0 12px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <X size={18} style={{ color: '#dc2626' }} />
                      Rejection Reason
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#7f1d1d'
                    }}>
                      {selectedApplication.adminNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '24px'
                }}>
                  <button
                    onClick={closeApplicationModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Close
                  </button>
                  
                  <button
                    onClick={() => {
                      closeApplicationModal();
                      handleViewProfile(selectedApplication.student);
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#3b82f6',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }}
                  >
                    <Eye size={16} />
                    View Profile
                  </button>

                  {/* Show approve/reject buttons only for pending requests */}
                  {selectedApplication.status === 'pending' && (
                    <>
                      <button
                        onClick={handleApproveFromModal}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#10b981',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#059669';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                        }}
                      >
                        <UserCheck size={16} />
                        Approve
                      </button>
                      
                      <button
                        onClick={handleRejectFromModal}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ef4444',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                        }}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Approve Confirmation Step */}
            {modalStep === 'approve' && (
              <>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <UserCheck size={32} style={{ color: '#f59e0b' }} />
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Confirm Student Head Promotion
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    Do you want to make this student Student Head?
                  </p>
                </div>

                {/* Student Info */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {selectedApplication.student?.firstName?.[0]}{selectedApplication.student?.lastName?.[0]}
                    </div>
                    <div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {selectedApplication.student?.firstName} {selectedApplication.student?.lastName}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {selectedApplication.student?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={goBackToApplication}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmModalApproval}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                    }}
                  >
                    <UserCheck size={16} />
                    Yes, Make Student Head
                  </button>
                </div>
              </>
            )}

            {/* Reject Confirmation Step */}
            {modalStep === 'reject' && (
              <>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}>
                    <X size={32} style={{ color: '#ef4444' }} />
                  </div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Reject Student Head Request
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#6b7280',
                    lineHeight: '1.5'
                  }}>
                    Please provide a reason for rejecting this request
                  </p>
                </div>

                {/* Student Info */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {selectedApplication.student?.firstName?.[0]}{selectedApplication.student?.lastName?.[0]}
                    </div>
                    <div>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {selectedApplication.student?.firstName} {selectedApplication.student?.lastName}
                      </h4>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {selectedApplication.student?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Reason for rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejecting this request..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={goBackToApplication}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmModalRejection}
                    disabled={!rejectionReason.trim()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: !rejectionReason.trim() ? '#9ca3af' : '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: !rejectionReason.trim() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: !rejectionReason.trim() ? 0.6 : 1
                    }}
                    onMouseEnter={e => {
                      if (rejectionReason.trim()) {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }
                    }}
                    onMouseLeave={e => {
                      if (rejectionReason.trim()) {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }
                    }}
                  >
                    <X size={16} />
                    Reject Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={64} className="empty-state-icon" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                No pending requests
              </h3>
              <p>There are no pending student head requests to review.</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {pendingRequests.map((request, index) => (
                <RequestCard 
                  key={request._id || index} 
                  request={request}
                  onViewApplication={() => handleViewApplication(request)}
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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {approvedRequests.map((request, index) => (
                <RequestCard 
                  key={request._id || index} 
                  request={request}
                  onViewApplication={() => handleViewApplication(request)}
                />
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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {rejectedRequests.map((request, index) => (
                <RequestCard 
                  key={request._id || index} 
                  request={request}
                  onViewApplication={() => handleViewApplication(request)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <ProfileModal user={selectedUser} onClose={handleCloseModal} loading={loadingProfile} />
      )}
    </div>
  );
};

const RequestCard = ({ request, onViewApplication }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'default',
      height: 'fit-content',
      minHeight: '160px',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'none';
    }}>
      {/* Compact Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ 
            margin: '0 0 2px 0', 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#1f2937',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {request?.student?.firstName} {request?.student?.lastName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '500',
              color: getStatusColor(request?.status),
              backgroundColor: `${getStatusColor(request?.status)}15`
            }}>
              {getStatusLabel(request?.status)}
            </span>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: request?.student?.isVerified ? '#10b981' : '#f59e0b'
            }}></div>
          </div>
        </div>
      </div>

      {/* Essential Info */}
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', flex: '1' }}>
        {request?.student?.department && (
          <div style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            📚 {request?.student?.department}
          </div>
        )}
        {request?.student?.college && (
          <div style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            🏫 {request?.student?.college}
          </div>
        )}
        {request?.student?.email && (
          <div style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ✉️ {request?.student?.email}
          </div>
        )}
        {request?.student?.rollNo && request?.student?.rollNo !== 'N/A' && (
          <div style={{ marginBottom: '4px' }}>🎓 {request?.student?.rollNo}</div>
        )}
        {/* Always show certificate line for consistent spacing */}
        <div style={{ marginBottom: '4px', minHeight: '16px' }}>
          {request?.student?.certificates && request?.student?.certificates.length > 0 ? (
            `📜 ${request?.student?.certificates.length} certificate(s)`
          ) : (
            '' // Empty space for users with no certificates
          )}
        </div>
      </div>

      {/* Action Button */}
      <div style={{ marginTop: '8px', display: 'flex', height: '32px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewApplication();
          }}
          style={{
            width: '100%',
            padding: '8px 16px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            height: '36px'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Eye size={14} />
          View Application
        </button>
      </div>

      {/* Timeline Info - Compact */}
      <div style={{ 
        marginTop: '8px', 
        padding: '6px 0', 
        borderTop: '1px solid #f1f5f9',
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '10px', 
        color: '#9ca3af'
      }}>
        <span>📅 {formatDate(request?.submittedAt)}</span>
        {request?.reviewedAt && (
          <span>✅ {formatDate(request?.reviewedAt)}</span>
        )}
      </div>

      {/* Admin Notes - Compact */}
      {request?.adminNotes && (
        <div style={{ 
          marginTop: '8px', 
          padding: '6px 8px', 
          backgroundColor: '#fef2f2', 
          borderRadius: '4px',
          border: '1px solid #fecaca'
        }}>
          <h6 style={{ 
            fontSize: '10px', 
            fontWeight: '600', 
            marginBottom: '2px', 
            color: '#dc2626',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Admin Notes
          </h6>
          <p style={{ 
            fontSize: '11px', 
            color: '#991b1b', 
            margin: 0,
            lineHeight: '1.3'
          }}>
            {request.adminNotes}
          </p>
        </div>
      )}
    </div>
  );
};

// ProfileModal Component for viewing detailed student information
const ProfileModal = ({ user, onClose, loading = false }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreviewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const getPreviewUrl = (certificate) => {
    const cleanPath = certificate.filePath.replace(/^\/+/, '');
    return `http://localhost:5000/${cleanPath}`;
  };

  const isImageFile = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (fileName) => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '0',
        width: '90vw',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative'
      }}>
        {/* Header with tabs */}
        <div style={{ 
          borderBottom: '1px solid #e5e7eb',
          padding: '24px 32px 0 32px',
          position: 'sticky',
          top: 0,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          zIndex: 10
        }}>
          {/* Close Button */}
          <button 
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              background: 'none', 
              border: 'none', 
              fontSize: 24, 
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ×
          </button>

          {/* User Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {user.firstName} {user.middleName} {user.lastName}
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: user.role === 'admin' ? '#ef4444' : user.role === 'student_head' ? '#f59e0b' : '#3b82f6',
                backgroundColor: user.role === 'admin' ? '#fef2f2' : user.role === 'student_head' ? '#fefbf2' : '#eff6ff'
              }}>
                {user.role === 'admin' ? 'Administrator' : user.role === 'student_head' ? 'Student Head' : 'Student'}
              </span>
              <span style={{
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: user.isVerified ? '#059669' : '#d97706',
                backgroundColor: user.isVerified ? '#d1fae5' : '#fef3c7'
              }}>
                {user.isVerified ? 'Verified' : 'Unverified'}
              </span>
              {user.certificates && user.certificates.length > 0 && (
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#7c3aed',
                  backgroundColor: '#f3e8ff'
                }}>
                  {user.certificates.length} Certificate(s)
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '0' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'profile' ? '#3b82f6' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'profile' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'certificates' ? '#3b82f6' : 'transparent',
                color: activeTab === 'certificates' ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderBottom: activeTab === 'certificates' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Certificates ({loading ? '...' : user.certificates?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {activeTab === 'profile' ? (
            // Profile Tab Content
            <div>
              {/* Personal Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                  Personal Information
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                      {user.firstName} {user.middleName} {user.lastName}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>{user.email}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                      {user.phoneNumber && user.phoneNumber !== 'N/A' ? user.phoneNumber : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px', textTransform: 'capitalize' }}>
                      {user.gender || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                  Academic Information
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>College</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                      {user.college && user.college !== 'N/A' ? user.college : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                      {user.department && user.department !== 'N/A' ? user.department : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll Number</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                      {user.rollNo && user.rollNo !== 'N/A' ? user.rollNo : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Created</label>
                    <div style={{ fontSize: '16px', color: '#1f2937', marginTop: '4px' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                  Account Status
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px'
                }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Verification Status</div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: user.isVerified ? '#059669' : '#d97706'
                    }}>
                      {user.isVerified ? 'Verified ✓' : 'Pending ⏳'}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Role</div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: user.role === 'admin' ? '#ef4444' : user.role === 'student_head' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {user.role === 'admin' ? 'Administrator' : user.role === 'student_head' ? 'Student Head' : 'Student'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Certificates Tab Content
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                Certificates & Documents
              </h3>
              {loading ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Loading Certificates...</h4>
                  <p style={{ margin: 0 }}>Fetching complete user profile from database...</p>
                </div>
              ) : user.certificates && user.certificates.length > 0 ? (
                <div style={{ display: 'flex', gap: '16px', height: '500px' }}>
                  {/* Certificate List */}
                  <div style={{ 
                    flex: selectedCertificate ? '0 0 300px' : '1',
                    transition: 'flex 0.3s ease'
                  }}>
                    <div style={{ display: 'grid', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                      {user.certificates.map((certificate, index) => (
                        <div key={index} style={{
                          border: selectedCertificate === certificate ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          background: selectedCertificate === certificate ? '#eff6ff' : '#f9fafb',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handlePreviewCertificate(certificate)}
                        onMouseEnter={e => {
                          if (selectedCertificate !== certificate) {
                            e.currentTarget.style.background = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={e => {
                          if (selectedCertificate !== certificate) {
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                {certificate.title}
                              </h4>
                              {certificate.description && (
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
                                  {certificate.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewCertificate(certificate);
                              }}
                              style={{
                                padding: '4px 8px',
                                background: selectedCertificate === certificate ? '#3b82f6' : '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              {selectedCertificate === certificate ? 'Viewing' : 'Preview'}
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#6b7280' }}>
                            <span>📄 {certificate.originalName}</span>
                            <span>📊 {formatFileSize(certificate.size)}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                            📅 {new Date(certificate.uploadDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificate Preview */}
                  {selectedCertificate && (
                    <div style={{ 
                      flex: '1',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff'
                    }}>
                      <div style={{
                        padding: '12px',
                        borderBottom: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                            {selectedCertificate.title}
                          </h4>
                          {selectedCertificate.description && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                              {selectedCertificate.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedCertificate(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            marginLeft: '8px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ padding: '16px', height: '430px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isImageFile(selectedCertificate.originalName) ? (
                          <img
                            src={getPreviewUrl(selectedCertificate)}
                            alt={selectedCertificate.title}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : isPdfFile(selectedCertificate.originalName) ? (
                          <iframe
                            src={getPreviewUrl(selectedCertificate)}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: '4px'
                            }}
                            title={selectedCertificate.title}
                          />
                        ) : (
                          <div style={{
                            textAlign: 'center',
                            color: '#6b7280'
                          }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                            <p>Preview not available for this file type</p>
                            <a
                              href={getPreviewUrl(selectedCertificate)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#3b82f6',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              Open in new tab →
                            </a>
                          </div>
                        )}
                        <div style={{ display: 'none', textAlign: 'center', color: '#6b7280' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                          <p>Failed to load certificate</p>
                          <a
                            href={getPreviewUrl(selectedCertificate)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#3b82f6',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Try opening in new tab →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No Certificates Found</h4>
                  <p style={{ margin: 0 }}>This user hasn't uploaded any certificates yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHeadRequests;
