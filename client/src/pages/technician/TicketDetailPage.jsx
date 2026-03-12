import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import TicketStatusBadge from '../../components/TicketStatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';
import PhotoUpload from '../../components/PhotoUpload';

const HOTEL_NAMES = {
  GBAL: 'Zurich Airport',
  GNBE: 'Solothurn',
  NYAL: 'Nyon',
  HCSI: 'Chalet Swiss',
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [completionComment, setCompletionComment] = useState('');
  const [completionFiles, setCompletionFiles] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => { loadTicket(); }, [id]);

  async function loadTicket() {
    try {
      const { data } = await api.get(`/tickets/${id}`);
      setTicket(data);
    } catch {
      navigate(-1);
    }
    setLoading(false);
  }

  async function updateStatus(status) {
    await api.patch(`/tickets/${id}/status`, { status });
    loadTicket();
  }

  async function addComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.post(`/tickets/${id}/comments`, { comment });
    setComment('');
    loadTicket();
  }

  async function completeTicket(e) {
    e.preventDefault();
    const formData = new FormData();
    if (completionComment) formData.append('comment', completionComment);
    completionFiles.forEach((f) => formData.append('images', f));
    await api.post(`/tickets/${id}/completion`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setShowCompletion(false);
    loadTicket();
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Laden...</div>;
  if (!ticket) return null;

  const canTakeAction = user.role === 'technician' || user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-sm text-gray-500 font-mono">{ticket.ticket_id}</span>
            <h1 className="text-xl font-bold text-gray-800 mt-1">{ticket.description}</h1>
          </div>
          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={ticket.urgency} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Hotel:</span>
            <span className="ml-2 font-medium">{HOTEL_NAMES[ticket.hotel] || ticket.hotel}</span>
          </div>
          <div>
            <span className="text-gray-500">Zimmer:</span>
            <span className="ml-2 font-medium">{ticket.room}</span>
          </div>
          <div>
            <span className="text-gray-500">Gemeldet von:</span>
            <span className="ml-2 font-medium">{ticket.reporter_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Erstellt:</span>
            <span className="ml-2 font-medium">{new Date(ticket.created_at).toLocaleString('de-CH')}</span>
          </div>
          {ticket.technician_name && (
            <div>
              <span className="text-gray-500">Techniker:</span>
              <span className="ml-2 font-medium">{ticket.technician_name}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {canTakeAction && ticket.status !== 'completed' && ticket.status !== 'rejected' && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            {ticket.status === 'open' && (
              <button
                onClick={() => updateStatus('in_progress')}
                className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700"
              >
                Annehmen
              </button>
            )}
            {ticket.status === 'in_progress' && (
              <button
                onClick={() => setShowCompletion(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
              >
                Abschliessen
              </button>
            )}
            {ticket.status !== 'rejected' && (
              <button
                onClick={() => updateStatus('rejected')}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-200"
              >
                Ablehnen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Completion form */}
      {showCompletion && (
        <form onSubmit={completeTicket} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <h2 className="font-bold text-gray-800">Ticket abschliessen</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kommentar zur Fertigstellung</label>
            <textarea
              value={completionComment}
              onChange={(e) => setCompletionComment(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Beschreibung der durchgeführten Arbeiten..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos der Reparatur</label>
            <PhotoUpload files={completionFiles} setFiles={setCompletionFiles} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              Abschliessen
            </button>
            <button type="button" onClick={() => setShowCompletion(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Images */}
      {ticket.images && ticket.images.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-bold text-gray-800 mb-3">Fotos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ticket.images.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={`/uploads/${img.image_path}`}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg"
                />
                <span className={`absolute top-1 left-1 text-xs px-2 py-0.5 rounded ${
                  img.type === 'completion' ? 'bg-green-500 text-white' : 'bg-brand-500 text-white'
                }`}>
                  {img.type === 'completion' ? 'Fertigstellung' : 'Meldung'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion info */}
      {ticket.completion_comment && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <h2 className="font-bold text-green-800 mb-2">Abschlusskommentar</h2>
          <p className="text-green-700">{ticket.completion_comment}</p>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="font-bold text-gray-800 mb-3">Kommentare</h2>
        {ticket.comments && ticket.comments.length > 0 ? (
          <div className="space-y-3 mb-4">
            {ticket.comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.user_name}</span>
                  <span className="text-xs text-gray-400">{c.user_role}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(c.created_at).toLocaleString('de-CH')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Noch keine Kommentare</p>
        )}

        <form onSubmit={addComment} className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kommentar hinzufügen..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700"
          >
            Senden
          </button>
        </form>
      </div>
    </div>
  );
}
