import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications?limit=5');
        if (res.success && res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('Notification fetch error:', err);
      }
    };

    fetchNotifications();

    // Listen for live socket events
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification', handleNewNotification);
      socket.on('admin_alert', handleNewNotification);

      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('admin_alert', handleNewNotification);
      };
    }
  }, [isAuthenticated, socket]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.warn('Error marking read:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-main)',
          backgroundColor: isOpen ? 'var(--bg-subtle)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color var(--transition-fast)'
        }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--accent-600)',
              color: '#ffffff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              minWidth: '16px',
              height: '16px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              border: '2px solid var(--bg-card)'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '320px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-light)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
          className="animate-fade-in"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-light)'
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary-600)',
                  fontWeight: 500
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8125rem'
                }}
              >
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id || Math.random()}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: item.isRead ? 'transparent' : 'var(--primary-50)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '2px'
                    }}
                  >
                    {item.title}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.message}</p>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--primary-600)',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            View All Notifications →
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
