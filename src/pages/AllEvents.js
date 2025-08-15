import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Trophy, Tag, Filter, Search,
  Clock, DollarSign, Eye, Star, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AllEvents = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

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

    if (event.status !== 'published') {
      return { status: 'Draft', color: 'bg-gray-100 text-gray-800' };
    }

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
      case 'tournament': return <Trophy size={16} className="text-yellow-600" />;
      case 'match': return <Users size={16} className="text-blue-600" />;
      case 'workshop': return <Calendar size={16} className="text-green-600" />;
      default: return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.club.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    if (filter === 'all') return matchesSearch && matchesCategory;
    if (filter === 'upcoming') {
      return matchesSearch && matchesCategory && new Date(event.startDate) > new Date();
    }
    if (filter === 'ongoing') {
      const now = new Date();
      return matchesSearch && matchesCategory && new Date(event.startDate) <= now && new Date(event.endDate) >= now;
    }
    if (filter === 'completed') {
      return matchesSearch && matchesCategory && new Date(event.endDate) < new Date();
    }
    return matchesSearch && matchesCategory && event.eventType === filter;
  }) : [];

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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Events</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover exciting events, tournaments, and activities happening across all clubs on campus
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events, clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filters */}
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

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="inter-club">Inter-Club</option>
              <option value="intra-club">Intra-Club</option>
              <option value="external">External</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No events match your search criteria.' : 'No events are currently available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onView={() => navigate(`/events/${event._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onView }) => {
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

    if (event.status !== 'published') {
      return { status: 'Draft', color: 'bg-gray-100 text-gray-800' };
    }

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
      case 'tournament': return <Trophy size={16} className="text-yellow-600" />;
      case 'match': return <Users size={16} className="text-blue-600" />;
      case 'workshop': return <Calendar size={16} className="text-green-600" />;
      default: return <Calendar size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
         onClick={onView}>
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
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{event.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="flex items-center">
                {getEventTypeIcon(event.eventType)}
                <span className="ml-1 capitalize">{event.eventType}</span>
              </span>
              <span>•</span>
              <span className="capitalize">{event.category}</span>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
            {eventStatus.status}
          </span>
        </div>

        {/* Club Info */}
        <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-md">
          {event.club.image ? (
            <img
              src={`http://localhost:5000${event.club.image}`}
              alt={event.club.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-xs font-medium">
                {event.club.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-700 font-medium">{event.club.name}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-2 text-gray-400" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-2 text-gray-400" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-2 text-gray-400" />
            <span>{event.participantCount} / {event.maxParticipants} participants</span>
          </div>
          {event.registrationFee > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign size={14} className="mr-2 text-gray-400" />
              <span>₹{event.registrationFee}</span>
            </div>
          )}
        </div>

        {/* Registration Deadline */}
        <div className="flex items-center text-sm text-amber-600 mb-4">
          <Clock size={14} className="mr-2" />
          <span>Registration ends: {formatDate(event.registrationDeadline)}</span>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center text-sm text-gray-500">
            <Star size={14} className="mr-1" />
            <span>{event.participantCount} registered</span>
          </div>
          <div className="flex items-center text-indigo-600 hover:text-indigo-800">
            <span className="text-sm font-medium">View Details</span>
            <ChevronRight size={16} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllEvents;
