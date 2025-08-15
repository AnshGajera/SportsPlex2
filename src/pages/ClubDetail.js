import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Calendar, MapPin, Star, UserPlus, UserMinus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const response = await api.get(`/clubs/${id}`);
      setClub(response.data);
    } catch (error) {
      console.error('Error fetching club details:', error);
      setError('Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    if (!user) {
      alert('Please login to join clubs');
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/clubs/${id}/join`);
      if (response.data) {
        setClub(prev => ({
          ...prev,
          members: [...prev.members, {
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            },
            role: 'member',
            joinedAt: new Date().toISOString()
          }]
        }));
        alert('Successfully joined the club!');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      alert(error.response?.data?.message || 'Failed to join club');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm('Are you sure you want to leave this club?')) return;

    setJoining(true);
    try {
      await api.post(`/clubs/${id}/leave`);
      setClub(prev => ({
        ...prev,
        members: prev.members.filter(member => member.user._id !== user._id)
      }));
      alert('Successfully left the club');
    } catch (error) {
      console.error('Error leaving club:', error);
      alert(error.response?.data?.message || 'Failed to leave club');
    } finally {
      setJoining(false);
    }
  };

  const isUserMember = () => {
    return user && club?.members?.some(member => member.user._id === user._id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The club you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/user/clubs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {/* Club Image */}
            <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              {club.image ? (
                <img
                  src={`http://localhost:5000${club.image}`}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <Users size={64} className="mx-auto mb-4" />
                  <h1 className="text-4xl font-bold">{club.name}</h1>
                </div>
              )}
            </div>

            {/* Club Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">{club.category}</span>
                  <span className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {club.members?.length || 0} members
                  </span>
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    Created {formatDate(club.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">About {club.name}</h2>
                <p className="text-gray-600">Learn more about this club</p>
              </div>
              {user && user.role !== 'admin' && (
                <div>
                  {isUserMember() ? (
                    <button
                      onClick={handleLeaveClub}
                      disabled={joining}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <UserMinus size={16} className="mr-2" />
                      {joining ? 'Leaving...' : 'Leave Club'}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinClub}
                      disabled={joining}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <UserPlus size={16} className="mr-2" />
                      {joining ? 'Joining...' : 'Join Club'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">{club.description}</p>
            </div>

            {/* Requirements */}
            {club.requirements && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Requirements</h3>
                <p className="text-gray-700 leading-relaxed">{club.requirements}</p>
              </div>
            )}

            {/* Recent Members */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Members</h3>
              <div className="space-y-3">
                {club.members?.slice(0, 5).map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="capitalize">{member.role}</span>
                        {member.user.rollNo && (
                          <>
                            <span>•</span>
                            <span>{member.user.rollNo}</span>
                          </>
                        )}
                        {member.user.department && (
                          <>
                            <span>•</span>
                            <span>{member.user.department}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {club.members?.length > 5 && (
                  <p className="text-sm text-gray-500 mt-3">
                    And {club.members.length - 5} more members...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{club.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Members</span>
                  <span className="font-medium">{club.members?.length || 0}</span>
                </div>
                {club.maxMembers && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Max Members</span>
                    <span className="font-medium">{club.maxMembers}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    club.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {club.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(club.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {club.contactEmail && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="flex items-center space-x-3">
                  <Mail size={20} className="text-gray-400" />
                  <a
                    href={`mailto:${club.contactEmail}`}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {club.contactEmail}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
