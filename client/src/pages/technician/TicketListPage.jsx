import { useState, useEffect } from 'react';
import api from '../../api/client';
import TicketCard from '../../components/TicketCard';

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');

  useEffect(() => {
    loadTickets();
  }, [statusFilter, hotelFilter]);

  async function loadTickets() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (hotelFilter) params.hotel = hotelFilter;
      const { data } = await api.get('/tickets', { params });
      setTickets(data);
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Alle Tickets</h1>

      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Alle Status</option>
          <option value="open">Offen</option>
          <option value="in_progress">In Bearbeitung</option>
          <option value="completed">Abgeschlossen</option>
          <option value="rejected">Abgelehnt</option>
        </select>
        <select
          value={hotelFilter}
          onChange={(e) => setHotelFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Alle Hotels</option>
          <option value="GBAL">Zurich Airport</option>
          <option value="GNBE">Solothurn</option>
          <option value="NYAL">Nyon</option>
          <option value="HCSI">Chalet Swiss</option>
          <option value="PRZA">Prize by Radisson</option>
          <option value="MUBRIG">Hotel Mulin</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Keine Tickets gefunden</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}
    </div>
  );
}
