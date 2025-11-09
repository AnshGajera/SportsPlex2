import React from 'react';
import './ActiveBookingsCard.css';

const ActiveBookingsCard = ({ booking, isAdmin = false }) => {
  const {
    equipmentName,
    category,
    image,
    quantity,
    allocatedDate,
    expectedReturnDate,
    allocatedToInitials,
    allocatedTo,
    daysRemaining,
    status,
    isOverdue,
    urgencyLevel
  } = booking;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (isOverdue) return '#dc3545'; // red
    if (daysRemaining <= 1) return '#fd7e14'; // orange
    if (daysRemaining <= 3) return '#ffc107'; // yellow
    return '#28a745'; // green
  };

  const getUrgencyIcon = () => {
    if (isOverdue) return '🔴';
    if (urgencyLevel === 'high') return '🟡';
    if (urgencyLevel === 'medium') return '🟠';
    return '🟢';
  };

  return (
    <div className={`booking-card ${isOverdue ? 'overdue' : ''} ${urgencyLevel}-urgency`}>
      <div className="booking-header">
        <div className="equipment-info">
          {image && (
            <img 
              src={`http://localhost:5000${image}`} 
              alt={equipmentName}
              className="equipment-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="equipment-details">
            <h3 className="equipment-name">{equipmentName}</h3>
            <span className="category-badge">{category}</span>
          </div>
        </div>
        <div className="booking-status">
          <span className="status-indicator" style={{ backgroundColor: getStatusColor() }}>
            {getUrgencyIcon()} {isOverdue ? 'OVERDUE' : status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="booking-details">
        <div className="detail-row">
          <span className="label">Quantity:</span>
          <span className="value">{quantity} unit{quantity !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Allocated:</span>
          <span className="value">{formatDate(allocatedDate)}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Return Date:</span>
          <span className="value">{formatDate(expectedReturnDate)}</span>
        </div>
        
        <div className="detail-row">
          <span className="label">Allocated To:</span>
          <span className="value">
            {isAdmin && allocatedTo 
              ? `${allocatedTo.firstName} ${allocatedTo.lastName}` 
              : allocatedToInitials
            }
          </span>
        </div>

        {isAdmin && allocatedTo && (
          <div className="detail-row">
            <span className="label">Student ID:</span>
            <span className="value">{allocatedTo.studentId || 'N/A'}</span>
          </div>
        )}
      </div>

      <div className="booking-footer">
        <div className="time-remaining">
          {isOverdue ? (
            <span className="overdue-text">
              Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="remaining-text">
              {daysRemaining === 0 ? 'Due today' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
            </span>
          )}
        </div>
        
        {isAdmin && (
          <div className="admin-actions">
            <button className="btn-action btn-contact" title="Contact Student">
              📧 Contact
            </button>
            <button className="btn-action btn-extend" title="Extend Booking">
              ⏰ Extend
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBookingsCard;