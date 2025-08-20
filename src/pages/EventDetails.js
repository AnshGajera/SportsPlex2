import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, Users, Trophy, Clock, DollarSign, 
  FileText, Download, UserPlus, UserMinus, Award, ExternalLink,
  Phone, Mail, Tag, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data);
      
      // Check if current user is registered
      if (currentUser && response.data.participants) {
        setIsRegistered(response.data.participants.some(p => p.user._id === currentUser._id));
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    setRegistering(true);
    try {
      if (isRegistered) {
        await api.post(`/events/${eventId}/unregister`);
        setIsRegistered(false);
        setEvent(prev => ({
          ...prev,
          participantCount: prev.participantCount - 1,
          participants: prev.participants.filter(p => p.user._id !== currentUser._id)
        }));
      } else {
        await api.post(`/events/${eventId}/register`);
        setIsRegistered(true);
        setEvent(prev => ({
          ...prev,
          participantCount: prev.participantCount + 1,
          participants: [...prev.participants, { user: currentUser, registeredAt: new Date() }]
        }));
      }
    } catch (error) {
      console.error('Error with registration:', error);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    if (!event) return { status: 'Unknown', color: 'bg-gray-100 text-gray-800', canRegister: false };

    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const regDeadline = new Date(event.registrationDeadline);

    if (event.status !== 'published') {
      return { status: 'Draft', color: 'bg-gray-100 text-gray-800', canRegister: false };
    }

    if (now > endDate) {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800', canRegister: false };
    }

    if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', color: 'bg-blue-100 text-blue-800', canRegister: false };
    }

    if (now > regDeadline) {
      return { status: 'Registration Closed', color: 'bg-yellow-100 text-yellow-800', canRegister: false };
    }

    if (event.participantCount >= event.maxParticipants) {
      return { status: 'Full', color: 'bg-red-100 text-red-800', canRegister: false };
    }

    return { status: 'Registration Open', color: 'bg-green-100 text-green-800', canRegister: true };
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'tournament': return <Trophy size={20} />;
      case 'match': return <Users size={20} />;
      case 'workshop': return <Calendar size={20} />;
      default: return <Calendar size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getEventTypeIcon(event.eventType)}
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${eventStatus.color}`}>
              {eventStatus.status}
            </span>
            <span className="text-gray-600">by {event.club.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {event.banner ? (
          <div className="h-64 md:h-80 rounded-lg overflow-hidden">
            <img
              src={`http://localhost:5000${event.banner}`}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-64 md:h-80 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            {getEventTypeIcon(event.eventType)}
            <span className="text-white text-6xl font-bold ml-4">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Registration Button Overlay */}
        {eventStatus.canRegister && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleRegistration}
              disabled={registering}
              className={`px-6 py-3 rounded-lg font-medium text-white shadow-lg ${
                isRegistered
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {registering ? 'Processing...' : isRegistered ? 'Unregister' : 'Register Now'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
            <div className="prose max-w-none text-gray-700">
              {event.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Rules and Regulations */}
          {event.rules && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rules & Regulations</h2>
              <div className="prose max-w-none text-gray-700">
                {event.rules.split('\n').map((rule, index) => (
                  <p key={index} className="mb-2">• {rule}</p>
                ))}
              </div>
            </section>
          )}

          {/* Prizes */}
          {event.prizes && event.prizes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prizes & Awards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {event.prizes.map((prize, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="text-yellow-600" size={20} />
                      <span className="font-semibold text-gray-900">{prize.position}</span>
                    </div>
                    <p className="text-lg font-bold text-amber-600">{prize.prize}</p>
                    {prize.description && (
                      <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Documents */}
          {event.documents && event.documents.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-3">
                {event.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-gray-500" size={20} />
                      <span className="text-gray-900 font-medium">{doc.name}</span>
                    </div>
                    <a
                      href={`http://localhost:5000${doc.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Registered Participants</h2>
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <p className="text-sm text-gray-600">
                    {event.participantCount} of {event.maxParticipants} spots filled
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {event.participants.map((participant, index) => (
                    <div key={index} className="p-4 border-b last:border-b-0 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {participant.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{participant.user.name}</p>
                          <p className="text-sm text-gray-500">{participant.user.email}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(participant.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info Card */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Start Date</p>
                  <p className="text-sm text-gray-600">{formatDate(event.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">End Date</p>
                  <p className="text-sm text-gray-600">{formatDate(event.endDate)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Registration Deadline</p>
                  <p className="text-sm text-gray-600">{formatDate(event.registrationDeadline)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Venue</p>
                  <p className="text-sm text-gray-600">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Participants</p>
                  <p className="text-sm text-gray-600">
                    {event.participantCount} / {event.maxParticipants}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Tag className="text-gray-500 mt-1" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-sm text-gray-600 capitalize">{event.category}</p>
                </div>
              </div>

              {event.registrationFee > 0 && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="text-gray-500 mt-1" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Registration Fee</p>
                    <p className="text-sm text-gray-600">₹{event.registrationFee}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {event.contactInfo && (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">
                      {event.contactInfo.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.contactInfo.name}</p>
                    <p className="text-sm text-gray-600">{event.contactInfo.designation}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="text-gray-500" size={16} />
                  <a
                    href={`tel:${event.contactInfo.phone}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {event.contactInfo.phone}
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="text-gray-500" size={16} />
                  <a
                    href={`mailto:${event.contactInfo.email}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {event.contactInfo.email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Registration Status */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Status</h3>
            
            {currentUser ? (
              <div className="space-y-4">
                {isRegistered ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-medium">You are registered</span>
                  </div>
                ) : eventStatus.canRegister ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <AlertCircle size={20} />
                    <span className="font-medium">Registration available</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <XCircle size={20} />
                    <span className="font-medium">Registration closed</span>
                  </div>
                )}

                {eventStatus.canRegister && (
                  <button
                    onClick={handleRegistration}
                    disabled={registering}
                    className={`w-full px-4 py-2 rounded-md font-medium text-white ${
                      isRegistered
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } disabled:opacity-50`}
                  >
                    {registering ? 'Processing...' : isRegistered ? 'Unregister' : 'Register Now'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle size={20} />
                  <span className="font-medium">Login required to register</span>
                </div>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Login to Register
                </button>
              </div>
            )}
          </div>

          {/* Club Information */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Organized by</h3>
            
            <div className="flex items-center space-x-3">
              {event.club.image ? (
                <img
                  src={`http://localhost:5000${event.club.image}`}
                  alt={event.club.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">
                    {event.club.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{event.club.name}</p>
                <p className="text-sm text-gray-600">{event.club.category}</p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/clubs/${event.club._id}`)}
              className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 flex items-center justify-center space-x-1"
            >
              <span>View Club</span>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
