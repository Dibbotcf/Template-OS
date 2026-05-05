import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api';

export const SearchContext = createContext();

function formatTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function logToNotification(log) {
  const action = log.action;
  let title = '';
  let message = '';

  if (action === 'template_created') {
    const name = log.details ? (() => { try { return JSON.parse(log.details).name; } catch { return ''; } })() : '';
    title = 'Template Created';
    message = `${log.user_name} created template${name ? ` "${name}"` : ''}.`;
  } else if (action === 'template_updated') {
    const name = log.details ? (() => { try { return JSON.parse(log.details).name; } catch { return ''; } })() : '';
    title = 'Template Updated';
    message = `${log.user_name} updated template${name ? ` "${name}"` : ''}.`;
  } else if (action === 'template_deleted') {
    title = 'Template Deleted';
    message = `${log.user_name} deleted a template.`;
  } else if (action === 'data_created') {
    title = 'New Entry Added';
    message = `${log.user_name} added a new entry to a template.`;
  } else if (action === 'data_updated') {
    title = 'Entry Updated';
    message = `${log.user_name} updated a data entry.`;
  } else if (action === 'user_created') {
    const details = log.details ? (() => { try { return JSON.parse(log.details); } catch { return {}; } })() : {};
    title = 'New Member Added';
    message = `${log.user_name} added ${details.name || 'a new user'} as ${details.role || 'member'}.`;
  } else {
    title = action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    message = `${log.user_name} performed action: ${action}.`;
  }

  return {
    id: log.id,
    title,
    message,
    time: formatTimeAgo(log.timestamp),
    read: false,
  };
}

export const SearchProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Fetch real notifications from recent activity logs
  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/stats');
        const activity = res.data.recentActivity || [];
        setNotifications(activity.map(logToNotification));
      } catch (err) {
        // Fallback to welcome notification if fetch fails
        setNotifications([
          { id: 0, title: 'Welcome!', message: 'Welcome to Template OS. Get started by creating a template.', time: 'just now', read: true }
        ]);
      }
    };
    fetchNotifications();
  }, [token]);

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead 
    }}>
      {children}
    </SearchContext.Provider>
  );
};
