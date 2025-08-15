import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Trophy, FileText, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateEventModal = ({ isOpen, onClose, onEventCreated, clubId, isAdminMode = false }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'tournament',
    category: 'inter-club',
    organizedBy: clubId || '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    maxParticipants: 50,
    registrationFee: 0,
    rules: '',
    requirements: '',
    contactInfo: {
      email: currentUser?.email || '',
      phone: '',
      person: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()
    },
    invitedClubs: [],
    isPublic: true,
    tags: [],
    prizes: [{ position: '1st', description: '', value: '' }]
  });
  const [files, setFiles] = useState({
    banner: null,
    documents: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchClubs();
      if (clubId) {
        setFormData(prev => ({ ...prev, organizedBy: clubId }));
      }
    }
  }, [isOpen, clubId]);

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      setClubs(response.data.clubs || response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === 'banner') {
      setFiles(prev => ({ ...prev, banner: selectedFiles[0] }));
    } else if (name === 'documents') {
      setFiles(prev => ({ ...prev, documents: Array.from(selectedFiles) }));
    }
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: '', description: '', value: '' }]
    }));
  };

  const removePrize = (index) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const updatePrize = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const addTag = (tag) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && !Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (files.banner) {
        submitData.append('banner', files.banner);
      }
      files.documents.forEach(doc => {
        submitData.append('documents', doc);
      });

      const response = await api.post('/events', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onEventCreated(response.data);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventType: 'tournament',
      category: 'inter-club',
      organizedBy: clubId || '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      venue: '',
      maxParticipants: 50,
      registrationFee: 0,
      rules: '',
      requirements: '',
      contactInfo: {
        email: currentUser?.email || '',
        phone: '',
        person: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()
      },
      invitedClubs: [],
      isPublic: true,
      tags: [],
      prizes: [{ position: '1st', description: '', value: '' }]
    });
    setFiles({ banner: null, documents: [] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {(isAdminMode || !clubId) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organizing Club *
                </label>
                <select
                  name="organizedBy"
                  value={formData.organizedBy}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Club</option>
                  {clubs.map(club => (
                    <option key={club._id} value={club._id}>{club.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="tournament">Tournament</option>
                <option value="match">Match</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="inter-club">Inter-Club</option>
                <option value="intra-club">Intra-Club</option>
                <option value="open">Open</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Dates and Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                End Date *
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Participation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users size={16} className="inline mr-1" />
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Registration Fee (₹)
              </label>
              <input
                type="number"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Prizes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <Trophy size={16} className="inline mr-1" />
                Prizes
              </label>
              <button
                type="button"
                onClick={addPrize}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Prize
              </button>
            </div>
            {formData.prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md">
                <input
                  type="text"
                  placeholder="Position (e.g., 1st, 2nd)"
                  value={prize.position}
                  onChange={(e) => updatePrize(index, 'position', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Prize description"
                  value={prize.description}
                  onChange={(e) => updatePrize(index, 'description', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., ₹5000)"
                  value={prize.value}
                  onChange={(e) => updatePrize(index, 'value', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removePrize(index)}
                  className="text-red-600 hover:text-red-800 px-3 py-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Rules and Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rules
              </label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactInfo.person"
                  value={formData.contactInfo.person}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Banner
              </label>
              <input
                type="file"
                name="banner"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                Documents
              </label>
              <input
                type="file"
                name="documents"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">
              Make this event public (visible to all users)
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
