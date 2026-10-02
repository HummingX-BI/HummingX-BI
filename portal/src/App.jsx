import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import ActivatePage from './pages/auth/ActivatePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Client pages
import DashboardPage from './pages/client/DashboardPage';
import ProjectPage from './pages/client/ProjectPage';
import ReferralsPage from './pages/client/ReferralsPage';
import ClientPaymentsPage from './pages/client/ClientPaymentsPage';

// Admin pages
import AdminClientsPage from './pages/admin/AdminClientsPage';
import AdminClientDetailPage from './pages/admin/AdminClientDetailPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/activate/:token" element={<ActivatePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Client routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/project" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
          <Route path="/pagos" element={<ProtectedRoute><ClientPaymentsPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><Navigate to="/admin/clients" replace /></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute adminOnly><AdminClientsPage /></ProtectedRoute>} />
          <Route path="/admin/clients/:id" element={<ProtectedRoute adminOnly><AdminClientDetailPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/pagos" element={<ProtectedRoute adminOnly><AdminPaymentsPage /></ProtectedRoute>} />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
