import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import TicketCard from '../../components/TicketCard';

export default function ReporterDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets')
      .then(({ data }) => setTickets(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in_progress').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meine Meldungen</h1>
        <Link
          to="/reporter/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          + Neue Meldung
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">{tickets.length}</div>
          <div className="text-sm text-gray-500">Gesamt</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{open}</div>
          <div className="text-sm text-gray-500">Offen</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
          <div className="text-sm text-gray-500">In Arbeit</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">Noch keine Meldungen erstellt</p>
          <Link to="/reporter/new" className="text-blue-600 hover:underline">
            Erste Schadensmeldung erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => <TicketCard key={t.id} ticket={t} />)}
        </div>
      )}
    </div>
  );
}
