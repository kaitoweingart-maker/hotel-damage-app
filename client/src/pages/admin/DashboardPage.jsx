import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import TicketCard from '../../components/TicketCard';

const HOTEL_NAMES = {
  GBAL: 'Zurich Airport',
  GNBE: 'Solothurn',
  NYAL: 'Nyon',
  HCSI: 'Chalet Swiss',
  PRZA: 'Prize by Radisson',
  MUBRIG: 'Hotel Mulin',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        api.get('/tickets/stats/overview'),
        api.get('/tickets'),
      ]);
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.slice(0, 10));
    } catch (err) {
      setError('Dashboard konnte nicht geladen werden. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Laden...</div>;
  if (error || !stats) return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{error || 'Fehler beim Laden'}</p>
      <button onClick={loadData} className="text-brand-600 hover:underline font-medium">
        Erneut laden
      </button>
    </div>
  );

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

      {/* Recent Tickets - full detail with TicketCards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Neueste Tickets</h2>
          <Link to="/tickets" className="text-sm text-brand-600 hover:underline">Alle anzeigen</Link>
        </div>
        <div className="space-y-3">
          {recentTickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
        </div>
      </div>
    </div>
  );
}
