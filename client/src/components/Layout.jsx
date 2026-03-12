import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NAV = {
  reporter: [
    { to: '/reporter', label: 'Dashboard' },
    { to: '/reporter/new', label: 'Neue Meldung' },
  ],
  technician: [
    { to: '/tickets', label: 'Tickets' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/tickets', label: 'Tickets' },
    { to: '/admin/users', label: 'Benutzer' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = NAV[user.role] || [];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Schadensmeldung</Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-sm hidden sm:inline">{user.name}</span>
            <button onClick={logout} className="text-sm bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">
              Logout
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-2 flex gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm pb-1 border-b-2 ${
                location.pathname === l.to ? 'border-white' : 'border-transparent hover:border-blue-300'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
