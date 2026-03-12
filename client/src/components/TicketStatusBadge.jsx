const STATUS_STYLES = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-brand-100 text-brand-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  rejected: 'Abgelehnt',
};

export default function TicketStatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
