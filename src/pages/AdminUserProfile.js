import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Calendar, GraduationCap, 
  MapPin, Award, FileText, Download
} from 'lucide-react';
import api from '../services/api';

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadCertificate = async (certificate) => {
    try {
      const response = await api.get(`/uploads/certificates/${certificate.filePath.split('/').pop()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', certificate.originalName || `certificate-${certificate.title}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold">
                {user.firstName} {user.middleName} {user.lastName}
              </h2>
              <p className="text-indigo-100 text-lg capitalize">{user.role}</p>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User size={20} className="mr-2" />
                Personal Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail size={16} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {user.gender && (
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="text-gray-900 capitalize">{user.gender}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <GraduationCap size={20} className="mr-2" />
                Academic Information
              </h3>
              
              <div className="space-y-3">
                {user.rollNo && (
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Roll Number</p>
                      <p className="text-gray-900">{user.rollNo}</p>
                    </div>
                  </div>
                )}

                {user.college && (
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">College</p>
                      <p className="text-gray-900">{user.college}</p>
                    </div>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center">
                    <GraduationCap size={16} className="text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="text-gray-900">{user.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      {user.certificates && user.certificates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <Award size={20} className="mr-2" />
            Certificates ({user.certificates.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.certificates.map((certificate, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{certificate.title}</h4>
                    {certificate.description && (
                      <p className="text-sm text-gray-600 mt-1">{certificate.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Uploaded: {formatDate(certificate.uploadDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadCertificate(certificate)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
                  >
                    <Download size={16} />
                  </button>
                </div>
                
                {certificate.filePath && (
                  <div className="mt-3">
                    <img
                      src={`http://localhost:3001${certificate.filePath}`}
                      alt={certificate.title}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserProfile;
