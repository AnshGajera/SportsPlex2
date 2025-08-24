import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Calendar, MapPin, Star, UserPlus, UserMinus, Trophy } from 'lucide-react';
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

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'club_head': return 'Club Head';
      case 'moderator': return 'Moderator';
      default: return 'Member';
    }
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

  // Check if user has access to club details - only members can view full details
  const hasAccess = !user || user.role === 'admin' || isUserMember();

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join to View Details</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You need to be a member of <strong className="text-blue-600">{club.name}</strong> to access detailed information and connect with other members.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleJoinClub}
                disabled={joining}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center font-medium"
              >
                <UserPlus size={18} className="mr-2" />
                {joining ? 'Joining...' : `Join ${club.name}`}
              </button>
              <button
                onClick={() => navigate('/user/clubs')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Clubs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/user/clubs')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Clubs
          </button>
        </div>

        {/* Club Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="relative">
            {/* Club Image/Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                                   radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
                  backgroundSize: '50px 50px'
                }}></div>
              </div>
              
              {club.image ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={`http://localhost:5000${club.image}`}
                    alt={club.name}
                    className="max-h-full max-w-full object-contain"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))' }}
                  />
                </div>
              ) : (
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={40} />
                  </div>
                  <h1 className="text-2xl font-bold">{club.name}</h1>
                </div>
              )}
            </div>

            {/* Club Info */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{club.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {club.category}
                    </span>
                    <span className="flex items-center">
                      <Users size={16} className="mr-1 text-blue-600" />
                      {club.members?.length || 0} members
                    </span>
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1 text-green-600" />
                      Created {formatDate(club.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{club.description}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  <button
                    onClick={() => navigate(`/clubs/${id}/events`)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm font-medium"
                  >
                    <Trophy size={16} className="mr-2" />
                    Events
                  </button>

                  {user && user.role !== 'admin' && (
                    <div>
                      {isUserMember() ? (
                        <button
                          onClick={handleLeaveClub}
                          disabled={joining}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center text-sm font-medium"
                        >
                          <UserMinus size={16} className="mr-2" />
                          {joining ? 'Leaving...' : 'Leave Club'}
                        </button>
                      ) : (
                        <button
                          onClick={handleJoinClub}
                          disabled={joining}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center text-sm font-medium"
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requirements Section */}
            {club.requirements && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star size={20} className="mr-2 text-yellow-500" />
                  Membership Requirements
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  {club.requirements}
                </p>
              </div>
            )}

            {/* Members Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Users size={20} className="mr-2 text-blue-600" />
                Club Members ({club.members?.length || 0})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {club.members?.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'club_head' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : member.role === 'moderator'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getRoleDisplayName(member.role)}
                        </span>
                        {member.user.rollNo && (
                          <span className="text-gray-400">•</span>
                        )}
                        {member.user.rollNo && (
                          <span>{member.user.rollNo}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy size={20} className="mr-2 text-purple-600" />
                Club Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Category</span>
                  <span className="text-gray-900 font-semibold">{club.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Total Members</span>
                  <span className="text-gray-900 font-semibold">{club.members?.length || 0}</span>
                </div>
                {club.maxMembers && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Max Members</span>
                    <span className="text-gray-900 font-semibold">{club.maxMembers}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    club.isActive 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {club.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-medium">Created</span>
                  <span className="text-gray-900 font-semibold">{formatDate(club.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {club.contactEmail && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail size={20} className="mr-2 text-green-600" />
                  Contact
                </h3>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={16} className="text-gray-400" />
                  <a
                    href={`mailto:${club.contactEmail}`}
                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
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
