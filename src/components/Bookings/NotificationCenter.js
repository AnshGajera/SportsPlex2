import React from 'react';
import './NotificationCenter.css';

const NotificationCenter = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getNotificationClass = (type) => {
    return `notification notification-${type}`;
  };

  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClass(notification.type)}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {getNotificationIcon(notification.type)}
            </span>
            <span className="notification-message">
              {notification.message}
            </span>
          </div>
          <button
            className="notification-close"
            onClick={() => onRemove(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;