import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, Users, Trophy } from 'lucide-react';

const ScheduleMatchModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    sport: '',
    matchType: '',
    team1: '',
    team2: '',
    date: '',
    time: '',
    venue: '',
    duration: '90',
    description: '',
    tournament: '',
    isPublic: true,
    allowSpectators: true,
    maxSpectators: '',
    registrationDeadline: '',
    equipment: []
  });

  const sports = [
    'Basketball',
    'Football',
    'Tennis',
    'Cricket',
    'Badminton',
    'Table Tennis',
    'Volleyball',
    'Swimming',
    'Athletics',
    'Boxing',
    'Wrestling',
    'Hockey'
  ];

  const matchTypes = [
    { value: 'friendly', label: 'Friendly Match', icon: Users },
    { value: 'tournament', label: 'Tournament Match', icon: Trophy },
    { value: 'league', label: 'League Match', icon: Calendar },
    { value: 'practice', label: 'Practice Match', icon: Clock }
  ];

  const venues = [
    'Main Sports Hall',
    'Basketball Court A',
    'Basketball Court B',
    'Football Field',
    'Tennis Court 1',
    'Tennis Court 2',
    'Badminton Court 1',
    'Badminton Court 2',
    'Swimming Pool',
    'Athletics Track',
    'Multi-purpose Hall',
    'Outdoor Field'
  ];

  const equipmentOptions = [
    'Basketball',
    'Football',
    'Tennis Rackets',
    'Badminton Rackets',
    'Table Tennis Paddles',
    'Volleyball',
    'Goal Posts',
    'Nets',
    'Cones',
    'Scoreboard',
    'Timer',
    'Whistle'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(item => item !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      title: '',
      sport: '',
      matchType: '',
      team1: '',
      team2: '',
      date: '',
      time: '',
      venue: '',
      duration: '90',
      description: '',
      tournament: '',
      isPublic: true,
      allowSpectators: true,
      maxSpectators: '',
      registrationDeadline: '',
      equipment: []
    });
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Minimum 1 hour from now
    return now.toISOString().slice(0, 16);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Match</h2>
              <p className="text-sm text-gray-500">Create a new sports match event</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Match Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                placeholder="e.g., Championship Final - Team A vs Team B"
              />
            </div>

            {/* Sport and Match Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="">Select sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              {/* Match Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {matchTypes.map(type => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.matchType === type.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="matchType"
                          value={type.value}
                          checked={formData.matchType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <IconComponent size={16} className={formData.matchType === type.value ? 'text-purple-600' : 'text-gray-400'} />
                        <span className={`text-sm ${formData.matchType === type.value ? 'text-purple-600 font-medium' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team 1 / Home Team *
                </label>
                <input
                  type="text"
                  name="team1"
                  value={formData.team1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team 2 / Away Team *
                </label>
                <input
                  type="text"
                  name="team2"
                  value={formData.team2}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter team name"
                />
              </div>
            </div>

            {/* Date, Time, and Venue */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={getMinDate()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue *
              </label>
              <select
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              >
                <option value="">Select venue</option>
                {venues.map(venue => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
            </div>

            {/* Tournament (if applicable) */}
            {formData.matchType === 'tournament' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  name="tournament"
                  value={formData.tournament}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter tournament name"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
                placeholder="Additional details about the match..."
              />
            </div>

            {/* Equipment Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Needed
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {equipmentOptions.map(equipment => (
                  <label
                    key={equipment}
                    className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                      formData.equipment.includes(equipment)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(equipment)}
                      onChange={() => handleEquipmentChange(equipment)}
                      className="sr-only"
                    />
                    <span className={`text-sm ${formData.equipment.includes(equipment) ? 'text-purple-600 font-medium' : 'text-gray-700'}`}>
                      {equipment}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Spectator Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  max={formData.date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Spectators
                </label>
                <input
                  type="number"
                  name="maxSpectators"
                  value={formData.maxSpectators}
                  onChange={handleInputChange}
                  min="1"
                  disabled={!formData.allowSpectators}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Public Match (visible to all users)
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Allow Spectators
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowSpectators"
                    checked={formData.allowSpectators}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Schedule Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMatchModal;
