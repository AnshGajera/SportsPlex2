import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  X, 
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  FileText,
  ExternalLink
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage - it's stored in userInfo object
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        
        // Check if we have user info but no token - this means we need to re-login
        const token = userInfo.token;
        
        if (!token) {
          // Clear any stale user data and redirect to login
          localStorage.removeItem('userInfo');
          setError('Please login again to access admin features.');
          setUsers([]);
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users-management`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized access. Please login as admin.');
            localStorage.removeItem('userInfo');
            setUsers([]);
            setLoading(false);
            return;
          }
          if (response.status === 403) {
            setError('Access denied. Admin privileges required.');
            setUsers([]);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched users from database:', data);
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(`Failed to load users: ${error.message}`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showCertificateModal) {
          closeCertificateModal();
        } else if (showProfileModal) {
          closeModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCertificateModal, showProfileModal]);

  // Filter users based on search term and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.role.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const closeModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const closeCertificateModal = () => {
    setShowCertificateModal(false);
    setSelectedCertificate(null);
  };

  const handleExportUsers = async () => {
    try {
      // Use filtered users instead of fetching all users
      const usersToExport = filteredUsers;
      
      if (usersToExport.length === 0) {
        alert('No users to export. Please adjust your search criteria.');
        return;
      }
      
      // Convert to CSV format using the filtered users
      const csvData = [
        ['Name', 'Email', 'Phone', 'Role', 'Department', 'Join Date', 'Certificates Count'],
        ...usersToExport.map(user => [
          user.name,
          user.email,
          user.phone || 'N/A',
          user.role || 'N/A',
          user.department || 'N/A',
          new Date(user.joinDate).toLocaleDateString(),
          user.certificates ? user.certificates.length : 0
        ])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Include search term in filename if there's a search
      const searchSuffix = searchTerm ? `_search_${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const statusSuffix = filterStatus !== 'all' ? `_${filterStatus}` : '';
      a.download = `users_export${searchSuffix}${statusSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
      
      a.click();
      window.URL.revokeObjectURL(url);
      
      // Show success message with count
      alert(`Successfully exported ${usersToExport.length} user(s) to CSV.`);
      
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const retryFetch = () => {
    // Clear localStorage and redirect to login
    localStorage.clear();
    window.location.href = '/login';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading users...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={retryFetch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and view all registered users</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleExportUsers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={filteredUsers.length === 0}
              >
                <Download className="h-4 w-4" />
                Export {filteredUsers.length > 0 ? `${filteredUsers.length} ` : ''}Users
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => new Date(u.joinDate).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'faculty'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>{user.certificates ? user.certificates.length : 0} certificates</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Joined {new Date(user.joinDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleViewProfile(user)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users match your search</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {users.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">No users have been registered yet.</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.role}</p>
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${
                      selectedUser.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : selectedUser.role === 'faculty'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {selectedUser.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {selectedUser.phone}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <div className="text-gray-900">{selectedUser.department}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {selectedUser.role === 'Student' ? 'Student ID' : 'Employee ID'}
                      </label>
                      <div className="text-gray-900">
                        {selectedUser.studentId || selectedUser.employeeId}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(selectedUser.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(selectedUser.lastLogin).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Certificates ({selectedUser.certificates ? selectedUser.certificates.length : 0})
                  </h3>
                </div>

                {selectedUser.certificates && selectedUser.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.certificates.map((cert, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              {cert.mimeType.includes('image') ? (
                                <FileText className="h-5 w-5 text-purple-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{cert.title}</h4>
                              <p className="text-sm text-gray-600">{cert.originalName}</p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{cert.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>Size: {formatFileSize(cert.size)}</span>
                          <span>Uploaded: {new Date(cert.uploadDate).toLocaleDateString()}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleViewCertificate(cert)}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View Certificate
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No certificates uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewing Modal */}
      {showCertificateModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-lg">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 truncate">{selectedCertificate.title}</h2>
                <p className="text-sm text-gray-600 truncate">{selectedCertificate.originalName}</p>
              </div>
              <button
                onClick={closeCertificateModal}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Certificate Info */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Size: {formatFileSize(selectedCertificate.size)}</span>
                <span>Uploaded: {new Date(selectedCertificate.uploadDate).toLocaleDateString()}</span>
              </div>
              
              {selectedCertificate.description && (
                <p className="text-gray-700 mt-2 text-sm">{selectedCertificate.description}</p>
              )}
            </div>
            
            {/* Certificate Content */}
            <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center relative">
              {selectedCertificate.mimeType && selectedCertificate.mimeType.includes('image') ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={selectedCertificate.filePath.startsWith('http') 
                      ? selectedCertificate.filePath 
                      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedCertificate.filePath.startsWith('/') ? selectedCertificate.filePath : `/${selectedCertificate.filePath}`}`
                    } 
                    alt={selectedCertificate.title}
                    className="max-w-full max-h-full object-contain shadow-lg rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Error fallback for images */}
                  <div style={{ display: 'none' }} className="flex flex-col items-center justify-center text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading certificate</h3>
                    <p className="text-gray-600 mb-4">Unable to display this certificate image.</p>
                    <a
                      href={selectedCertificate.filePath.startsWith('http') 
                        ? selectedCertificate.filePath 
                        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedCertificate.filePath.startsWith('/') ? selectedCertificate.filePath : `/${selectedCertificate.filePath}`}`
                      }
                      download={selectedCertificate.originalName}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download File
                    </a>
                  </div>
                </div>
              ) : selectedCertificate.mimeType && selectedCertificate.mimeType.includes('pdf') ? (
                <iframe
                  src={selectedCertificate.filePath.startsWith('http') 
                    ? selectedCertificate.filePath 
                    : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedCertificate.filePath.startsWith('/') ? selectedCertificate.filePath : `/${selectedCertificate.filePath}`}`
                  }
                  className="w-full h-full border-0"
                  title={selectedCertificate.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot preview this file type</h3>
                  <p className="text-gray-600 mb-4">This file type cannot be displayed in the browser.</p>
                  <a
                    href={selectedCertificate.filePath.startsWith('http') 
                      ? selectedCertificate.filePath 
                      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedCertificate.filePath.startsWith('/') ? selectedCertificate.filePath : `/${selectedCertificate.filePath}`}`
                    }
                    download={selectedCertificate.originalName}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Press ESC to close or click outside the modal
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedCertificate.filePath.startsWith('http') 
                      ? selectedCertificate.filePath 
                      : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedCertificate.filePath.startsWith('/') ? selectedCertificate.filePath : `/${selectedCertificate.filePath}`}`
                    }
                    download={selectedCertificate.originalName}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors inline-flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                  <button
                    onClick={closeCertificateModal}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
