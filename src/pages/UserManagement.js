import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const { currentUser } = useAuth();

  // Fetch all users from the backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching all users...');
      const response = await api.get('/admin/users');
      console.log('✅ Users fetched successfully:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  // Handle user profile click
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Close user modal
  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Handle file preview
  const handleFilePreview = (certificate) => {
    console.log('Certificate data:', certificate); // Debug log
    
    let fileUrl;
    if (certificate.filePath) {
      // Check if filePath already includes the backend server URL
      if (certificate.filePath.startsWith('http')) {
        fileUrl = certificate.filePath;
      } else if (certificate.filePath.startsWith('/uploads')) {
        // Path starts with /uploads, append to backend server
        fileUrl = `http://localhost:5000${certificate.filePath}`;
      } else if (certificate.filePath.startsWith('uploads')) {
        // Path starts with uploads (no leading slash)
        fileUrl = `http://localhost:5000/${certificate.filePath}`;
      } else {
        // Assume it's just a filename in the certificates directory
        fileUrl = `http://localhost:5000/uploads/certificates/${certificate.filePath}`;
      }
    } else if (certificate.fileUrl) {
      fileUrl = certificate.fileUrl;
    } else {
      console.error('No file path or URL found for certificate:', certificate);
      return;
    }
    
    console.log('Constructed file URL:', fileUrl); // Debug log
    
    setPreviewFile({
      url: fileUrl,
      name: certificate.title || certificate.originalName || 'Certificate',
      type: certificate.mimeType || 'application/pdf',
      originalName: certificate.originalName
    });
    setShowFilePreview(true);
  };

  // Close file preview
  const closeFilePreview = () => {
    setShowFilePreview(false);
    setPreviewFile(null);
  };

  // Render file preview modal
  const renderFilePreview = () => {
    if (!previewFile || !showFilePreview) return null;

    const isImage = previewFile.type?.startsWith('image/');
    const isPDF = previewFile.type === 'application/pdf';
    const isText = previewFile.type?.startsWith('text/');

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Preview Header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: '600' }}>
                {previewFile.name}
              </h3>
              {previewFile.originalName && (
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  {previewFile.originalName}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a
                href={previewFile.url}
                download={previewFile.originalName || previewFile.name}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📥 Download
              </a>
              <button
                onClick={closeFilePreview}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div style={{ 
            flex: 1, 
            padding: '24px', 
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {isImage ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : isPDF ? (
              <iframe
                src={previewFile.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title={previewFile.name}
              />
            ) : isText ? (
              <iframe
                src={previewFile.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
                title={previewFile.name}
              />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                  Preview not available
                </div>
                <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                  This file type cannot be previewed in the browser.
                </div>
                <a
                  href={previewFile.url}
                  download={previewFile.originalName || previewFile.name}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}
                >
                  📥 Download File
                </a>
              </div>
            )}

            {/* Fallback for failed image load */}
            {isImage && (
              <div style={{
                display: 'none',
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
                <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                  Image could not be loaded
                </div>
                <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                  The image file might be corrupted or in an unsupported format.
                </div>
                <a
                  href={previewFile.url}
                  download={previewFile.originalName || previewFile.name}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}
                >
                  📥 Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render detailed user modal
  const renderUserModal = () => {
    if (!selectedUser || !showUserModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          {/* Modal Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            borderRadius: '12px 12px 0 0'
          }}>
            <h2 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: '700' }}>
              User Profile Details
            </h2>
            <button
              onClick={closeUserModal}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ padding: '24px' }}>
            {/* User Basic Info */}
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '20px' }}>
                {selectedUser.firstName && selectedUser.lastName 
                  ? `${selectedUser.firstName} ${selectedUser.middleName || ''} ${selectedUser.lastName}`.trim()
                  : selectedUser.name || 'No name provided'
                }
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <strong style={{ color: '#374151' }}>Email:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>{selectedUser.email}</div>
                </div>
                
                <div>
                  <strong style={{ color: '#374151' }}>Role:</strong>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ 
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: selectedUser.role === 'admin' ? '#dc2626' : selectedUser.role === 'student_head' ? '#2563eb' : '#059669',
                      background: selectedUser.role === 'admin' ? '#fee2e2' : selectedUser.role === 'student_head' ? '#dbeafe' : '#d1fae5'
                    }}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                {selectedUser.rollNo && selectedUser.rollNo !== 'N/A' && (
                  <div>
                    <strong style={{ color: '#374151' }}>Roll Number:</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>{selectedUser.rollNo}</div>
                  </div>
                )}

                {selectedUser.phoneNumber && selectedUser.phoneNumber !== 'N/A' && (
                  <div>
                    <strong style={{ color: '#374151' }}>Phone Number:</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>{selectedUser.phoneNumber}</div>
                  </div>
                )}

                {selectedUser.college && selectedUser.college !== 'N/A' && (
                  <div>
                    <strong style={{ color: '#374151' }}>College:</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>{selectedUser.college}</div>
                  </div>
                )}

                {selectedUser.department && selectedUser.department !== 'N/A' && (
                  <div>
                    <strong style={{ color: '#374151' }}>Department:</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>{selectedUser.department}</div>
                  </div>
                )}

                <div>
                  <strong style={{ color: '#374151' }}>Member Since:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#374151' }}>Last Updated:</strong>
                  <div style={{ color: '#6b7280', marginTop: '4px' }}>
                    {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates Section */}
            <div>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#111827', 
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📜 Certificates 
                <span style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {selectedUser.certificates?.length || 0}
                </span>
              </h3>

              {!selectedUser.certificates || selectedUser.certificates.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    No Certificates Uploaded
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    This user hasn't uploaded any certificates yet.
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {selectedUser.certificates.map((certificate, index) => (
                    <div key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#ffffff'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#111827',
                          flex: 1
                        }}>
                          {certificate.title || certificate.name || `Certificate ${index + 1}`}
                        </h4>
                        <div style={{
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          #{index + 1}
                        </div>
                      </div>

                      {certificate.description && certificate.description.trim() && (
                        <p style={{
                          margin: '0 0 12px 0',
                          color: '#6b7280',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          {certificate.description}
                        </p>
                      )}

                      {certificate.uploadDate && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151', fontSize: '12px' }}>Upload Date: </strong>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>
                            {new Date(certificate.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {certificate.originalName && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151', fontSize: '12px' }}>File Name: </strong>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>
                            {certificate.originalName}
                          </span>
                        </div>
                      )}

                      {certificate.size && (
                        <div style={{ marginBottom: '12px' }}>
                          <strong style={{ color: '#374151', fontSize: '12px' }}>File Size: </strong>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>
                            {(certificate.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      )}

                      {(certificate.filePath || certificate.fileUrl) && (
                        <button
                          onClick={() => handleFilePreview(certificate)}
                          style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            width: '100%',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                        >
                          �️ Preview Certificate
                        </button>
                      )}

                      {!certificate.filePath && !certificate.fileUrl && (
                        <div style={{
                          textAlign: 'center',
                          padding: '12px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          📄 File not available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter users by role
  const getFilteredUsers = (role) => {
    return users.filter(user => user.role === role);
  };

  // Render user profile card
  const renderUserCard = (user) => {
    return (
      <div 
        key={user._id} 
        onClick={() => handleUserClick(user)}
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Click indicator */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          color: '#9ca3af',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Click to view details →
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: '60px' }}>
            {/* User Name */}
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.middleName || ''} ${user.lastName}`.trim()
                : user.name || 'No name provided'
              }
            </h3>

            {/* Email */}
            <p style={{ 
              margin: '0 0 12px 0', 
              color: '#6b7280', 
              fontSize: '14px' 
            }}>
              📧 {user.email}
            </p>

            {/* Profile Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginTop: '16px'
            }}>
              <div>
                <span style={{ fontWeight: '500', color: '#374151' }}>Role: </span>
                <span style={{ 
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: user.role === 'admin' ? '#dc2626' : user.role === 'student_head' ? '#2563eb' : '#059669',
                  background: user.role === 'admin' ? '#fee2e2' : user.role === 'student_head' ? '#dbeafe' : '#d1fae5'
                }}>
                  {user.role}
                </span>
              </div>

              {user.rollNo && user.rollNo !== 'N/A' && (
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Roll No: </span>
                  <span style={{ color: '#6b7280' }}>{user.rollNo}</span>
                </div>
              )}

              {user.phoneNumber && user.phoneNumber !== 'N/A' && (
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Phone: </span>
                  <span style={{ color: '#6b7280' }}>{user.phoneNumber}</span>
                </div>
              )}

              {user.college && user.college !== 'N/A' && (
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>College: </span>
                  <span style={{ color: '#6b7280' }}>{user.college}</span>
                </div>
              )}

              {user.department && user.department !== 'N/A' && (
                <div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>Department: </span>
                  <span style={{ color: '#6b7280' }}>{user.department}</span>
                </div>
              )}

              <div>
                <span style={{ fontWeight: '500', color: '#374151' }}>Joined: </span>
                <span style={{ color: '#6b7280' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Certificates */}
            {user.certificates && user.certificates.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Certificates: </span>
                <span style={{ 
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#7c2d12',
                  background: '#fed7aa'
                }}>
                  {user.certificates.length} certificate(s)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render user list for each tab
  const renderUserList = (userList, title) => {
    if (loading) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading users...</div>
          <div style={{ fontSize: '14px' }}>Please wait while we fetch user data</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          padding: '20px', 
          background: '#fee2e2', 
          border: '1px solid #fca5a5', 
          borderRadius: '8px',
          color: '#dc2626',
          marginTop: '16px'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchUsers}
            style={{ 
              marginLeft: '10px', 
              padding: '6px 12px', 
              background: '#dc2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    if (userList.length === 0) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#6b7280' 
        }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No {title.toLowerCase()} found</div>
          <div style={{ fontSize: '14px' }}>There are currently no users with the {title.toLowerCase()} role.</div>
        </div>
      );
    }

    return (
      <div style={{ marginTop: '16px' }}>
        <div style={{ 
          marginBottom: '16px', 
          fontSize: '14px', 
          color: '#6b7280' 
        }}>
          Showing {userList.length} {title.toLowerCase()}
        </div>
        {userList.map(renderUserCard)}
      </div>
    );
  };

  // Check admin access
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Access Denied</h2>
        <p style={{ color: '#6b7280', marginBottom: '8px' }}>You need admin privileges to access this page.</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Current user role: <strong>{currentUser?.role || 'Not logged in'}</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
      {/* Render File Preview Modal */}
      {renderFilePreview()}
      
      {/* Render User Modal */}
      {renderUserModal()}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#111827', 
          marginBottom: '8px' 
        }}>
          User Management
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280', 
          margin: '0' 
        }}>
          View and manage user profiles and permissions
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        display: 'flex', 
        gap: '24px', 
        marginBottom: '24px' 
      }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 0',
            fontWeight: '600',
            fontSize: '16px',
            color: activeTab === 'students' ? '#2563eb' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'students' ? '2px solid #2563eb' : '2px solid transparent'
          }}
        >
          Students ({getFilteredUsers('student').length})
        </button>
        <button
          onClick={() => setActiveTab('studentHeads')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 0',
            fontWeight: '600',
            fontSize: '16px',
            color: activeTab === 'studentHeads' ? '#2563eb' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'studentHeads' ? '2px solid #2563eb' : '2px solid transparent'
          }}
        >
          Student Heads ({getFilteredUsers('student_head').length})
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 0',
            fontWeight: '600',
            fontSize: '16px',
            color: activeTab === 'admins' ? '#2563eb' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'admins' ? '2px solid #2563eb' : '2px solid transparent'
          }}
        >
          Admins ({getFilteredUsers('admin').length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'students' && (
          <div>
            <h2 style={{ marginBottom: '16px', color: '#111827' }}>Students</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Manage student accounts and view their profiles.
            </p>
            {renderUserList(getFilteredUsers('student'), 'Students')}
          </div>
        )}
        
        {activeTab === 'studentHeads' && (
          <div>
            <h2 style={{ marginBottom: '16px', color: '#111827' }}>Student Heads</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Manage student head accounts with elevated privileges.
            </p>
            {renderUserList(getFilteredUsers('student_head'), 'Student Heads')}
          </div>
        )}
        
        {activeTab === 'admins' && (
          <div>
            <h2 style={{ marginBottom: '16px', color: '#111827' }}>Administrators</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              Manage administrator accounts with full system access.
            </p>
            {renderUserList(getFilteredUsers('admin'), 'Admins')}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
