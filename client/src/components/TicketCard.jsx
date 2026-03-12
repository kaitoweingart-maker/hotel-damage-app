import { Link } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge';
import UrgencyBadge from './UrgencyBadge';

const HOTEL_NAMES = {
  GBAL: 'Zurich Airport',
  GNBE: 'Solothurn',
  NYAL: 'Nyon',
  HCSI: 'Chalet Swiss',
};

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-mono">{ticket.ticket_id}</span>
            <TicketStatusBadge status={ticket.status} />
            <UrgencyBadge urgency={ticket.urgency} />
          </div>
          <p className="font-medium text-gray-900 truncate">{ticket.description}</p>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span>{HOTEL_NAMES[ticket.hotel] || ticket.hotel}</span>
            <span>Zimmer {ticket.room}</span>
            {ticket.reporter_name && <span>von {ticket.reporter_name}</span>}
          </div>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(ticket.created_at).toLocaleDateString('de-CH')}
        </div>
      </div>
    </Link>
  );
}
