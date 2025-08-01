import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  // Form data for profile editing
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    college: '',
    department: '',
    rollNo: ''
  });

  // Certificate upload data
  const [certificateData, setCertificateData] = useState({
    title: '',
    description: '',
    file: null
  });

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000); // Hide after 5 seconds
  };

  useEffect(() => {
    console.log('=== PROFILE COMPONENT MOUNT DEBUG ===');
    console.log('currentUser from context:', currentUser);
    console.log('localStorage userInfo:', localStorage.getItem('userInfo'));
    
    if (currentUser) {
      console.log('Setting initial profile data to currentUser');
      // Always set initial profile data to currentUser to avoid loading state
      setProfileData(currentUser);
      setFormData({
        firstName: currentUser.firstName || '',
        middleName: currentUser.middleName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        college: currentUser.college || '',
        department: currentUser.department || '',
        rollNo: currentUser.rollNo || ''
      });
      
      console.log('Initial form data set:', {
        firstName: currentUser.firstName || '',
        middleName: currentUser.middleName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        college: currentUser.college || '',
        department: currentUser.department || '',
        rollNo: currentUser.rollNo || ''
      });
      
      // Then try to fetch more complete data from API
      fetchUserProfile();
      fetchCertificates();
    }
    console.log('=== END PROFILE MOUNT DEBUG ===');
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      console.log('=== FRONTEND PROFILE DEBUG ===');
      console.log('Current user from context:', currentUser);
      console.log('Making API call to /profile...');
      
      const response = await api.get('/profile');
      console.log('Profile API response status:', response.status);
      console.log('Profile API response data:', response.data);
      
      const userData = response.data;
      
      console.log('Setting profile data to:', userData);
      console.log('Form data will be set to:', {
        firstName: userData.firstName || '',
        middleName: userData.middleName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        college: userData.college || '',
        department: userData.department || '',
        rollNo: userData.rollNo || ''
      });
      
      // Always update with API data if we get a successful response
      setProfileData(userData);
      setFormData({
        firstName: userData.firstName || '',
        middleName: userData.middleName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        college: userData.college || '',
        department: userData.department || '',
        rollNo: userData.rollNo || ''
      });
      
      // IMPORTANT: Update the currentUser in AuthContext with complete profile data
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      console.log('Updated currentUser in context with complete profile data:', updatedUser);
      
      console.log('Profile data updated successfully');
      console.log('=== END FRONTEND DEBUG ===');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Using fallback currentUser data');
      // Keep using currentUser data if API fails - already set in useEffect
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/profile/certificates');
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/profile/update', formData);
      
      // Update current user in context and localStorage
      const updatedUser = { ...currentUser, ...response.data.user };
      setCurrentUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      // Refresh profile data
      await fetchUserProfile();
      
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Error updating profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setCertificateData(prev => ({
        ...prev,
        file: files[0]
      }));
    } else {
      setCertificateData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCertificateUpload = async (e) => {
    e.preventDefault();
    if (!certificateData.file || !certificateData.title) {
      showNotification('Please provide a title and select a file', 'error');
      return;
    }

    setUploadingCertificate(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('title', certificateData.title);
      formDataUpload.append('description', certificateData.description);
      formDataUpload.append('certificate', certificateData.file);

      await api.post('/profile/certificates', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form and refresh certificates
      setCertificateData({ title: '', description: '', file: null });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchCertificates();
      showNotification('Certificate uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading certificate:', error);
      showNotification('Error uploading certificate. Please try again.', 'error');
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      await api.delete(`/profile/certificates/${certificateId}`);
      fetchCertificates();
      showNotification('Certificate deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting certificate:', error);
      showNotification('Error deleting certificate. Please try again.', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  // Use profileData if available, otherwise use currentUser
  const displayData = profileData || currentUser;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : notification.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {displayData.firstName?.charAt(0)}{displayData.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {displayData.firstName} {displayData.lastName}
              </h1>
              <p className="text-gray-600">{displayData.email}</p>
              <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                {displayData.role?.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
        
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College *
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{formData.firstName} {formData.middleName} {formData.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{formData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone Number</label>
              <p className="text-gray-900">{formData.phoneNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Roll Number</label>
              <p className="text-gray-900">{formData.rollNo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">College</label>
              <p className="text-gray-900">{formData.college}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-900">{formData.department}</p>
            </div>
          </div>
        )}
      </div>

      {/* Certificates Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Certificates</h2>
        
        {/* Upload Certificate Form */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Certificate</h3>
          <form onSubmit={handleCertificateUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={certificateData.title}
                  onChange={handleCertificateChange}
                  required
                  placeholder="e.g., Basketball Championship Certificate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  onChange={handleCertificateChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={certificateData.description}
                onChange={handleCertificateChange}
                rows="3"
                placeholder="Brief description of the certificate..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={uploadingCertificate}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {uploadingCertificate ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </form>
        </div>

        {/* Certificates List */}
        <div className="space-y-4">
          {certificates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No certificates uploaded yet.</p>
          ) : (
            certificates.map((certificate) => (
              <div key={certificate._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{certificate.title}</h4>
                    {certificate.description && (
                      <p className="text-gray-600 mt-1">{certificate.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>File: {certificate.originalName}</span>
                      <span>Size: {formatFileSize(certificate.size)}</span>
                      <span>Uploaded: {new Date(certificate.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={`http://localhost:5000${certificate.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteCertificate(certificate._id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
