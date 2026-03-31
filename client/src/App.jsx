import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ReporterDashboard from './pages/reporter/DashboardPage';
import NewReportPage from './pages/reporter/NewReportPage';
import TicketListPage from './pages/technician/TicketListPage';
import TicketDetailPage from './pages/technician/TicketDetailPage';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminNewReportPage from './pages/admin/NewReportPage';
import UsersPage from './pages/admin/UsersPage';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'reporter') return <Navigate to="/reporter" />;
  if (user.role === 'technician') return <Navigate to="/tickets" />;
  return <Navigate to="/admin" />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Reporter */}
        <Route path="/reporter" element={<ProtectedRoute roles={['reporter']}><ReporterDashboard /></ProtectedRoute>} />
        <Route path="/reporter/new" element={<ProtectedRoute roles={['reporter']}><NewReportPage /></ProtectedRoute>} />
        {/* Technician */}
        <Route path="/tickets" element={<ProtectedRoute roles={['technician', 'admin']}><TicketListPage /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute roles={['technician', 'admin', 'reporter']}><TicketDetailPage /></ProtectedRoute>} />
        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/new" element={<ProtectedRoute roles={['admin']}><AdminNewReportPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
