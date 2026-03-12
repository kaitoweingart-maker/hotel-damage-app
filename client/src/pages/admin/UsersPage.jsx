import { useState, useEffect } from 'react';
import api from '../../api/client';

const ROLE_LABELS = { reporter: 'Mitarbeiter', technician: 'Handwerker', admin: 'Admin' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'reporter', hotel: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {}
    setLoading(false);
  }

  function openCreate() {
    setEditingUser(null);
    setForm({ username: '', password: '', name: '', role: 'reporter', hotel: '' });
    setShowForm(true);
    setError('');
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({ username: user.username, password: '', name: user.name, role: user.role, hotel: user.hotel || '' });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        const updates = { name: form.name, role: form.role, hotel: form.hotel || null };
        if (form.password) updates.password = form.password;
        await api.put(`/users/${editingUser.id}`, updates);
      } else {
        await api.post('/users', form);
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler');
    }
  }

  async function deleteUser(user) {
    if (!confirm(`${user.name} wirklich löschen?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Fehler');
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Laden...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Benutzerverwaltung</h1>
        <button onClick={openCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700">
          + Neuer Benutzer
        </button>
      </div>

      {/* User form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">{editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingUser ? 'Neues Passwort (leer = unverändert)' : 'Passwort'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required={!editingUser}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="reporter">Mitarbeiter</option>
                <option value="technician">Handwerker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel (optional)</label>
              <select
                value={form.hotel}
                onChange={(e) => setForm({ ...form, hotel: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Keins / Alle</option>
                <option value="GBAL">Zurich Airport</option>
                <option value="GNBE">Solothurn</option>
                <option value="NYAL">Nyon</option>
                <option value="HCSI">Chalet Swiss</option>
                <option value="PRZA">Prize by Radisson</option>
                <option value="MUBRIG">Hotel Mulin</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-700">
                Speichern
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Benutzername</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rolle</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Hotel</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'technician' ? 'bg-brand-100 text-brand-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.hotel || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(u)} className="text-brand-600 hover:underline text-sm mr-3">
                    Bearbeiten
                  </button>
                  <button onClick={() => deleteUser(u)} className="text-red-600 hover:underline text-sm">
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
