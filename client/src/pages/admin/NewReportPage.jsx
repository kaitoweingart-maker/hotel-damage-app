import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import PhotoUpload from '../../components/PhotoUpload';

const HOTELS = [
  { code: 'GBAL', name: 'Zurich Airport' },
  { code: 'GNBE', name: 'Solothurn' },
  { code: 'NYAL', name: 'Nyon' },
  { code: 'HCSI', name: 'Chalet Swiss' },
  { code: 'PRZA', name: 'Prize by Radisson' },
  { code: 'MUBRIG', name: 'Hotel Mulin' },
];

export default function AdminNewReportPage() {
  const navigate = useNavigate();
  const [hotel, setHotel] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('hotel', hotel);
      formData.append('room', room);
      formData.append('description', description);
      formData.append('urgency', urgency);
      files.forEach((f) => formData.append('images', f));

      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Erstellen');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Neue Schadensmeldung</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hotel *</label>
          <select
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            required
          >
            <option value="">Bitte wählen...</option>
            {HOTELS.map((h) => (
              <option key={h.code} value={h.code}>{h.name} ({h.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zimmer / Bereich *</label>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="z.B. 201, Lobby, Küche"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Beschreiben Sie den Schaden..."
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dringlichkeit</label>
          <div className="flex gap-3">
            {[
              { value: 'low', label: 'Niedrig', color: 'border-green-400 bg-green-50' },
              { value: 'normal', label: 'Normal', color: 'border-gray-400 bg-gray-50' },
              { value: 'high', label: 'Hoch', color: 'border-red-400 bg-red-50' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex-1 text-center py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                  urgency === opt.value ? opt.color + ' font-medium' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={opt.value}
                  checked={urgency === opt.value}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
          <PhotoUpload files={files} setFiles={setFiles} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Wird gesendet...' : 'Schadensmeldung absenden'}
        </button>
      </form>
    </div>
  );
}
