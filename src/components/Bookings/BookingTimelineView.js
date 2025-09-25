import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './BookingTimelineView.css';

const BookingTimelineView = ({ equipmentId, isAdmin = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter

  useEffect(() => {
    fetchBookingTimeline();
  }, [equipmentId, timeRange]);

  const fetchBookingTimeline = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin 
        ? `/equipment/bookings/admin?equipmentId=${equipmentId}&timeRange=${timeRange}`
        : `/equipment/bookings/public?equipmentId=${equipmentId}`;
      
      const response = await api.get(endpoint);

      if (response.status === 200) {
        const data = response.data;
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } else {
        throw new Error('Failed to fetch booking timeline');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTimelineData = () => {
    const now = new Date();
    const daysToShow = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - Math.floor(daysToShow / 2));
    
    const timeline = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayBookings = bookings.filter(booking => {
        const allocDate = new Date(booking.allocatedDate);
        const returnDate = new Date(booking.expectedReturnDate);
        return date >= allocDate && date <= returnDate;
      });
      
      timeline.push({
        date: date,
        dayBookings: dayBookings,
        isToday: date.toDateString() === now.toDateString(),
        isPast: date < now,
        isFuture: date > now
      });
    }
    
    return timeline;
  };

  const getBookingBarHeight = (bookingsCount, maxQuantity = 10) => {
    return Math.min((bookingsCount / maxQuantity) * 100, 100);
  };

  const formatDate = (date, format = 'short') => {
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="loading-spinner"></div>
        <p>Loading booking timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-error">
        <p>Error loading timeline: {error}</p>
        <button onClick={fetchBookingTimeline} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const timelineData = generateTimelineData();
  const maxBookingsPerDay = Math.max(...timelineData.map(day => day.dayBookings.length), 1);

  return (
    <div className="booking-timeline">
      <div className="timeline-header">
        <h3>Booking Timeline</h3>
        <div className="timeline-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="timeline-range-select"
          >
            <option value="week">7 Days</option>
            <option value="month">30 Days</option>
            <option value="quarter">90 Days</option>
          </select>
        </div>
      </div>

      <div className="timeline-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <div className="legend-color active"></div>
          <span>Active Bookings</span>
        </div>
        <div className="legend-item">
          <div className="legend-color past"></div>
          <span>Past</span>
        </div>
      </div>

      <div className="timeline-chart">
        <div className="timeline-grid">
          {timelineData.map((day, index) => {
            const bookingsCount = day.dayBookings.length;
            const barHeight = getBookingBarHeight(bookingsCount, maxBookingsPerDay);
            
            return (
              <div 
                key={index} 
                className={`timeline-day ${day.isToday ? 'today' : ''} ${day.isPast ? 'past' : ''}`}
                title={`${formatDate(day.date, 'full')}: ${bookingsCount} booking${bookingsCount !== 1 ? 's' : ''}`}
              >
                <div className="day-label">
                  {formatDate(day.date)}
                </div>
                <div className="booking-bar-container">
                  <div 
                    className={`booking-bar ${bookingsCount > 0 ? 'has-bookings' : ''}`}
                    style={{ 
                      height: `${barHeight}%`,
                      backgroundColor: day.isToday ? '#ffc107' : day.isPast ? '#6c757d' : '#007bff'
                    }}
                  >
                    {bookingsCount > 0 && (
                      <span className="booking-count">{bookingsCount}</span>
                    )}
                  </div>
                </div>
                
                {day.dayBookings.length > 0 && (
                  <div className="day-bookings-tooltip">
                    <h4>{formatDate(day.date, 'full')}</h4>
                    {day.dayBookings.map((booking, idx) => (
                      <div key={idx} className="tooltip-booking">
                        <div className="booking-info">
                          <span className="quantity">{booking.quantity} units</span>
                          {isAdmin && booking.allocatedTo && (
                            <span className="user">
                              {booking.allocatedTo.firstName} {booking.allocatedTo.lastName}
                            </span>
                          )}
                        </div>
                        <div className="booking-dates">
                          {formatDate(new Date(booking.allocatedDate))} - {formatDate(new Date(booking.expectedReturnDate))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="timeline-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-value">{bookings.filter(b => b.status === 'allocated').length}</span>
            <span className="stat-label">Active Bookings</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {Math.round(bookings.reduce((sum, b) => sum + (b.daysRemaining || 0), 0) / (bookings.length || 1))}
            </span>
            <span className="stat-label">Avg Days Remaining</span>
          </div>
          {isAdmin && (
            <div className="stat-item">
              <span className="stat-value">
                {bookings.filter(b => b.isOverdue).length}
              </span>
              <span className="stat-label">Overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingTimelineView;