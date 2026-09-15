import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ActivatePage from './pages/auth/ActivatePage';

// Client pages
import DashboardPage from './pages/client/DashboardPage';
import ProjectPage from './pages/client/ProjectPage';
import CreditsPage from './pages/client/CreditsPage';
import ReferralsPage from './pages/client/ReferralsPage';
import BenefitsPage from './pages/client/BenefitsPage';
import ServicesPage from './pages/client/ServicesPage';
import SupportPage from './pages/client/SupportPage';

// Admin pages
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminClientDetailPage from './pages/admin/AdminClientDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/activate/:token" element={<ActivatePage />} />

          {/* Client routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/project" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
          <Route path="/credits" element={<ProtectedRoute><CreditsPage /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
          <Route path="/benefits" element={<ProtectedRoute><BenefitsPage /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Navigate to="/admin/clients" replace /></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute adminOnly><AdminClientsPage /></ProtectedRoute>} />
          <Route path="/admin/clients/:id" element={<ProtectedRoute adminOnly><AdminClientDetailPage /></ProtectedRoute>} />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
