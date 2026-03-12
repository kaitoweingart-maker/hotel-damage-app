const URGENCY_STYLES = {
  high: 'bg-red-100 text-red-800',
  normal: 'bg-gray-100 text-gray-800',
  low: 'bg-green-100 text-green-700',
};

const URGENCY_LABELS = {
  high: 'Hoch',
  normal: 'Normal',
  low: 'Niedrig',
};

export default function UrgencyBadge({ urgency }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${URGENCY_STYLES[urgency] || 'bg-gray-100'}`}>
      {URGENCY_LABELS[urgency] || urgency}
    </span>
  );
}
