import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {}
  }

  async function markRead(notif) {
    if (!notif.read) {
      await api.patch(`/notifications/${notif.id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: 1 } : n));
    }
    setOpen(false);
    // Navigate to the ticket
    const ticketId = notif.ticket_id;
    if (ticketId) navigate(`/tickets/${ticketId}`);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b font-semibold text-gray-700 text-sm">
            Benachrichtigungen ({unread.length} neu)
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Keine Benachrichtigungen</div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`w-full text-left px-3 py-2 text-sm border-b hover:bg-gray-50 ${
                  !n.read ? 'bg-brand-50 font-medium' : 'text-gray-600'
                }`}
              >
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('de-CH')}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
