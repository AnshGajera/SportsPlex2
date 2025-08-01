import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const ScheduleMatch = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    team1: '',
    team2: '',
    sport: '',
    venue: '',
    date: '',
    time: ''
  });

  const sports = [
    'Basketball',
    'Football',
    'Tennis',
    'Cricket',
    'Badminton',
    'Table Tennis',
    'Volleyball'
  ];

  const venues = [
    'Sports Complex Court 1',
    'Sports Complex Court 2',
    'Main Ground',
    'Basketball Court A',
    'Basketball Court B',
    'Tennis Court 1',
    'Tennis Court 2'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Match scheduled:', formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Schedule New Match</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Match Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Basketball Championship"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Team 1</label>
              <input
                type="text"
                name="team1"
                placeholder="Team A"
                value={formData.team1}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Team 2</label>
              <input
                type="text"
                name="team2"
                placeholder="Team B"
                value={formData.team2}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Sport</label>
            <select
              name="sport"
              value={formData.sport}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Sport</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Venue</label>
            <select
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Venue</option>
              {venues.map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Calendar size={20} />
              Schedule Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMatch;