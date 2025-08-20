import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Calendar, Users, MapPin, Clock, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';
import CreateEventModal from '../components/Modals/CreateEventModal';
import ManageEventMatchesModal from '../components/Modals/ManageEventMatchesModal';

const AdminEvents = () => {
  // Fetch clubs from API
  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      setClubs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
    }
  };

  // Handle event creation from modal
  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
    setIsCreateModalOpen(false);
    fetchEvents(); // Refresh stats and list
  };
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  // Matches modal state
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState(false);
  const [selectedEventForMatches, setSelectedEventForMatches] = useState(null);
  const [eventMatches, setEventMatches] = useState([]); // Dummy matches for now
  // Dummy: fetch matches for an event (replace with API later)
  const fetchMatchesForEvent = (eventId) => {
    // Replace with API call
    setEventMatches([
      { name: 'Quarter Final', date: '2025-08-20', teams: 'Team A vs Team B', round: 'Quarter Final' },
      { name: 'Semi Final', date: '2025-08-22', teams: 'Team C vs Team D', round: 'Semi Final' },
    ]);
  };

  const handleOpenMatchesModal = (event) => {
    setSelectedEventForMatches(event);
    fetchMatchesForEvent(event._id);
    setIsMatchesModalOpen(true);
  };

  const handleAddMatch = (match) => {
    setEventMatches([...eventMatches, match]);
  };

  const [stats, setStats] = useState([
    {
      label: 'Total Events',
      count: 0,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-500',
      icon: Trophy
    },
    {
      label: 'Upcoming Events',
      count: 0,
      bg: 'bg-green-50',
      iconColor: 'text-green-500',
      textColor: 'text-green-500',
      icon: Calendar
    },
    {
      label: 'Ongoing Events',
      count: 0,
      bg: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-500',
      icon: Clock
    },
    {
      label: 'Completed Events',
      count: 0,
      bg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      textColor: 'text-purple-500',
      icon: Users
    }
  ]);

  useEffect(() => {
    fetchEvents();
    fetchClubs();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsData = Array.isArray(response.data) ? response.data : [];
      setEvents(eventsData);
      // Update stats
      const now = new Date();
      const upcomingEvents = eventsData.filter(event => new Date(event.startDate) > now).length;
      const ongoingEvents = eventsData.filter(event => 
        new Date(event.startDate) <= now && new Date(event.endDate) >= now
      ).length;
      const completedEvents = eventsData.filter(event => new Date(event.endDate) < now).length;
      const totalEvents = eventsData.length;

      setStats(prev => [
        { ...prev[0], count: totalEvents },
        { ...prev[1], count: upcomingEvents },
        { ...prev[2], count: ongoingEvents },
        { ...prev[3], count: completedEvents }
      ]);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
      fetchEvents(); // Refresh to update stats
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                         event.club.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClub = selectedClub === '' || event.club._id === selectedClub;
    const matchesType = filterType === 'all' || event.eventType === filterType;
    
    if (filterStatus === 'all') return matchesSearch && matchesClub && matchesType;
    
    const eventStatus = getEventStatus(event);
    const statusMatch = eventStatus.status.toLowerCase().includes(filterStatus.toLowerCase());
    
    return matchesSearch && matchesClub && matchesType && statusMatch;
  }) : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
  <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600">Manage all campus events and activities</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow flex items-center py-5 px-6">
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl mr-4 ${stat.bg}`}>
              <stat.icon size={28} className={stat.iconColor} />
            </div>
            <div className="flex flex-col justify-center">
              <span className={`text-xl font-bold ${stat.textColor}`}>{stat.count}</span>
              <span className="text-sm text-gray-500 mt-1">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
  {/* Filters */}
  <div className="bg-white rounded-xl shadow p-6 space-y-4 mt-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
              />
            </div>
          </div>
          {/* Club Filter */}
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          >
            <option value="">All Clubs</option>
            {clubs.map(club => (
              <option key={club._id} value={club._id}>{club.name}</option>
            ))}
          </select>
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          >
            <option value="all">All Status</option>
            <option value="registration">Registration Open</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          >
            <option value="all">All Types</option>
            <option value="tournament">Tournament</option>
            <option value="match">Match</option>
            <option value="workshop">Workshop</option>
            <option value="competition">Competition</option>
          </select>
        </div>
      </div>
  {/* Events Table */}
  <div className="bg-white rounded-xl shadow overflow-hidden mt-6 border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => {
                const eventStatus = getEventStatus(event);
                return (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getEventTypeIcon(event.eventType)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500 capitalize">{event.eventType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {event.club.image ? (
                          <img
                            src={`http://localhost:5000${event.club.image}`}
                            alt={event.club.name}
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                        )}
                        <span className="text-sm text-gray-900">{event.club.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.startDate)}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {event.venue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.participantCount} / {event.maxParticipants}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(event.participantCount / event.maxParticipants) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${eventStatus.color}`}>{eventStatus.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/events/${event._id}`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {/* Add edit functionality */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenMatchesModal(event)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg border border-gray-300 ml-2"
                        >
                          Manage Matches
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedClub || filterStatus !== 'all' || filterType !== 'all'
                ? 'No events match your current filters.'
                : 'No events have been created yet.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} className="mr-2" />
              Create First Event
            </button>
          </div>
        )}
      </div>
      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
        clubId={selectedClub || null}
        isAdminMode={true}
      />
      {/* Manage Matches Modal */}
      <ManageEventMatchesModal
        isOpen={isMatchesModalOpen}
        onClose={() => setIsMatchesModalOpen(false)}
        event={selectedEventForMatches}
        matches={eventMatches}
        onAddMatch={handleAddMatch}
      />
    </div>
  );
};
export default AdminEvents;
