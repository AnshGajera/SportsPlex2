import React, { useState, useEffect } from 'react';
import './EquipmentAvailabilityCard.css';

const EquipmentAvailabilityCard = ({ equipment, onRequestEquipment }) => {
  const [currentBookings, setCurrentBookings] = useState([]);
  const [nextAvailable, setNextAvailable] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (equipment.currentBookings) {
      setCurrentBookings(equipment.currentBookings);
      calculateNextAvailable(equipment.currentBookings);
    }
  }, [equipment]);

  const calculateNextAvailable = (bookings) => {
    if (!bookings || bookings.length === 0) {
      setNextAvailable(null);
      return;
    }

    // Find the earliest return date
    const returnDates = bookings.map(b => new Date(b.expectedReturnDate));
    const earliestReturn = new Date(Math.min(...returnDates));
    setNextAvailable(earliestReturn);
  };

  const getAvailabilityStatus = () => {
    const available = equipment.actualAvailableQuantity || equipment.availableQuantity || 0;
    const total = equipment.quantity || 0;
    
    if (available === 0) return { status: 'unavailable', color: '#dc3545', text: 'Fully Booked' };
    if (available <= total * 0.2) return { status: 'low', color: '#fd7e14', text: 'Low Availability' };
    if (available <= total * 0.5) return { status: 'medium', color: '#ffc107', text: 'Limited Availability' };
    return { status: 'available', color: '#28a745', text: 'Available' };
  };

  const getUtilizationPercentage = () => {
    const total = equipment.quantity || 1;
    const available = equipment.actualAvailableQuantity || equipment.availableQuantity || 0;
    return Math.round(((total - available) / total) * 100);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilAvailable = () => {
    if (!nextAvailable) return null;
    const now = new Date();
    const diffTime = nextAvailable - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const availabilityInfo = getAvailabilityStatus();
  const utilizationPercentage = getUtilizationPercentage();
  const daysUntilAvailable = getDaysUntilAvailable();

  return (
    <div className="equipment-availability-card">
      <div className="card-header">
        <div className="equipment-info">
          {equipment.image && (
            <img 
              src={`http://localhost:5000${equipment.image}`}
              alt={equipment.name}
              className="equipment-image"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div className="equipment-details">
            <h3 className="equipment-name">{equipment.name}</h3>
            <span className="category">{equipment.category}</span>
            <p className="description">{equipment.description}</p>
          </div>
        </div>
        
        <div className="availability-status">
          <div 
            className="status-indicator"
            style={{ backgroundColor: availabilityInfo.color }}
          >
            {availabilityInfo.text}
          </div>
          <div className="quantity-info">
            <span className="available-count">
              {equipment.actualAvailableQuantity || equipment.availableQuantity || 0}
            </span>
            <span className="total-count">/ {equipment.quantity}</span>
            <span className="unit-label">available</span>
          </div>
        </div>
      </div>

      <div className="availability-details">
        <div className="utilization-bar">
          <div className="utilization-label">
            <span>Utilization: {utilizationPercentage}%</span>
            {equipment.hasActiveBookings && (
              <span className="active-bookings">
                {equipment.totalActiveBookings} active booking{equipment.totalActiveBookings !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="utilization-track">
            <div 
              className="utilization-fill"
              style={{ 
                width: `${utilizationPercentage}%`,
                backgroundColor: availabilityInfo.color
              }}
            />
          </div>
        </div>

        {equipment.hasActiveBookings && (
          <div className="booking-timeline">
            <button 
              className="timeline-toggle"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Current Bookings ({currentBookings.length})
            </button>
            
            {showDetails && (
              <div className="current-bookings">
                {currentBookings.map((booking, index) => (
                  <div key={index} className="booking-item">
                    <div className="booking-info">
                      <span className="quantity">{booking.quantity} units</span>
                      <span className="user-initials">{booking.allocatedToInitials}</span>
                    </div>
                    <div className="booking-dates">
                      <span className="return-date">
                        Returns: {formatDate(new Date(booking.expectedReturnDate))}
                      </span>
                      <span className={`days-remaining ${booking.daysRemaining <= 1 ? 'urgent' : ''}`}>
                        {booking.daysRemaining <= 0 
                          ? 'Overdue' 
                          : `${booking.daysRemaining} days left`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {nextAvailable && daysUntilAvailable > 0 && (
          <div className="next-available">
            <div className="availability-prediction">
              <span className="prediction-label">Next availability:</span>
              <span className="prediction-date">{formatDate(nextAvailable)}</span>
              <span className="prediction-time">
                ({daysUntilAvailable} day{daysUntilAvailable !== 1 ? 's' : ''})
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="card-actions">
        <div className="equipment-location">
          <span className="location-label">Location:</span>
          <span className="location-value">{equipment.location || 'Not specified'}</span>
        </div>
        
        <div className="action-buttons">
          {(equipment.actualAvailableQuantity || equipment.availableQuantity || 0) > 0 ? (
            <button 
              className="btn-request available"
              onClick={() => onRequestEquipment && onRequestEquipment(equipment)}
            >
              Request Equipment
            </button>
          ) : (
            <button 
              className="btn-request unavailable"
              disabled
              title={`Next available: ${nextAvailable ? formatDate(nextAvailable) : 'Unknown'}`}
            >
              Currently Unavailable
            </button>
          )}
          
          <button 
            className="btn-notify"
            onClick={() => {
              // TODO: Implement notification system
              alert('Notification feature will be implemented soon!');
            }}
          >
            Notify When Available
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentAvailabilityCard;