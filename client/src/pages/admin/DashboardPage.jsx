import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

const HOTEL_NAMES = {
  GBAL: 'Zurich Airport',
  GNBE: 'Solothurn',
  NYAL: 'Nyon',
  HCSI: 'Chalet Swiss',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets/stats/overview')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Laden...</div>;
  if (!stats) return <div className="text-center py-8 text-gray-500">Fehler beim Laden</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500">Gesamt</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-yellow-600">{stats.open}</div>
          <div className="text-sm text-gray-500">Offen</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-brand-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">In Bearbeitung</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-3xl font-bold text-red-600">{stats.highUrgency}</div>
          <div className="text-sm text-gray-500">Dringend</div>
        </div>
      </div>

      {/* By Hotel */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-3">Nach Hotel</h2>
        <div className="space-y-2">
          {stats.byHotel.map((h) => (
            <div key={h.hotel} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="font-medium">{HOTEL_NAMES[h.hotel] || h.hotel}</span>
              <div className="flex items-center gap-4 text-sm">
                <span>{h.count} Tickets</span>
                <span className="text-yellow-600">{h.open_count} offen</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Neueste Tickets</h2>
          <Link to="/tickets" className="text-sm text-brand-600 hover:underline">Alle anzeigen</Link>
        </div>
        <div className="space-y-2">
          {stats.recentTickets.map((t) => (
            <Link
              key={t.id}
              to={`/tickets/${t.id}`}
              className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 rounded px-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">{t.ticket_id}</span>
                <span className="text-sm truncate max-w-[200px]">{t.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <UrgencyBadge urgency={t.urgency} />
                <TicketStatusBadge status={t.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
