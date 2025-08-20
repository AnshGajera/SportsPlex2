import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Calendar, MapPin, Users, Trophy, Edit, 
  Trash2, Eye, Clock, DollarSign, Tag, Filter
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateEventModal from '../components/Modals/CreateEventModal';

const ClubEvents = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubDetails();
    fetchClubEvents();
  }, [clubId]);

  const fetchClubDetails = async () => {
    try {
      const response = await api.get(`/clubs/${clubId}`);
      setClub(response.data);
    } catch (error) {
      console.error('Error fetching club details:', error);
    }
  };

  const fetchClubEvents = async () => {
    try {
      const response = await api.get(`/events/club/${clubId}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching club events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const regDeadline = new Date(event.registrationDeadline);

    if (now < regDeadline && event.status === 'published') {
      return { status: 'Registration Open', color: 'bg-green-100 text-green-800' };
    }
    if (now >= regDeadline && now < startDate) {
      return { status: 'Registration Closed', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', color: 'bg-blue-100 text-blue-800' };
    }
    if (now > endDate) {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
    return { status: event.status, color: 'bg-gray-100 text-gray-800' };
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'tournament': return <Trophy size={16} />;
      case 'match': return <Users size={16} />;
      case 'workshop': return <Calendar size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'upcoming') {
      return matchesSearch && new Date(event.startDate) > new Date();
    }
    if (filter === 'ongoing') {
      const now = new Date();
      return matchesSearch && new Date(event.startDate) <= now && new Date(event.endDate) >= now;
    }
    if (filter === 'completed') {
      return matchesSearch && new Date(event.endDate) < new Date();
    }
    return matchesSearch && event.eventType === filter;
  });

  // Check if user can manage events (club head/moderator)
  const canManageEvents = club && club.members.some(member => 
    member.user._id === currentUser?._id && ['club_head', 'moderator'].includes(member.role)
  ) || currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {club?.name} Events
            </h1>
            <p className="text-gray-600">Manage and view club events, tournaments, and activities</p>
          </div>
        </div>

        {canManageEvents && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="tournament">Tournaments</option>
              <option value="match">Matches</option>
              <option value="workshop">Workshops</option>
            </select>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No events match your search criteria.' : 'This club hasn\'t created any events yet.'}
          </p>
          {canManageEvents && !searchTerm && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <Plus size={20} />
              <span>Create First Event</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              canManage={canManageEvents}
              onDelete={handleDeleteEvent}
              onView={() => navigate(`/events/${event._id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
        clubId={clubId}
      />
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, canManage, onDelete, onView }) => {
  const eventStatus = getEventStatus(event);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const regDeadline = new Date(event.registrationDeadline);

    if (now < regDeadline && event.status === 'published') {
      return { status: 'Registration Open', color: 'bg-green-100 text-green-800' };
    }
    if (now >= regDeadline && now < startDate) {
      return { status: 'Registration Closed', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (now >= startDate && now <= endDate) {
      return { status: 'Ongoing', color: 'bg-blue-100 text-blue-800' };
    }
    if (now > endDate) {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
    return { status: event.status, color: 'bg-gray-100 text-gray-800' };
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'tournament': return <Trophy size={16} />;
      case 'match': return <Users size={16} />;
      case 'workshop': return <Calendar size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Banner */}
      {event.banner ? (
        <div className="h-48 bg-gray-200">
          <img
            src={`http://localhost:5000${event.banner}`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          {getEventTypeIcon(event.eventType)}
          <span className="text-white text-4xl font-bold ml-2">
            {event.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                {getEventTypeIcon(event.eventType)}
                <span className="ml-1 capitalize">{event.eventType}</span>
              </span>
              <span className="flex items-center">
                <Tag size={14} />
                <span className="ml-1 capitalize">{event.category}</span>
              </span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
            {eventStatus.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-2" />
            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-2" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-2" />
            <span>{event.participantCount} / {event.maxParticipants} participants</span>
          </div>
          {event.registrationFee > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign size={14} className="mr-2" />
              <span>₹{event.registrationFee}</span>
            </div>
          )}
        </div>

        {/* Registration Deadline */}
        <div className="flex items-center text-sm text-amber-600 mb-4">
          <Clock size={14} className="mr-2" />
          <span>Registration ends: {formatDate(event.registrationDeadline)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={onView}
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
          >
            <Eye size={16} />
            <span>View Details</span>
          </button>

          {canManage && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView()}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-md"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(event._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubEvents;
