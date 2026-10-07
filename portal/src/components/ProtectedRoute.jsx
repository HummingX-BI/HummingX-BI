import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import api from '../lib/api';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isImpersonating, isAdmin } = useAuth();
  const location = useLocation();
  const trackedPathRef = useRef(null);

  useEffect(() => {
    if (!user || isImpersonating || isAdmin) return;

    // Only track if path actually changed
    if (trackedPathRef.current !== location.pathname) {
      api.post('/analytics/pageview', { path: location.pathname }).catch(() => {});
      trackedPathRef.current = location.pathname;
    }

    // Heartbeat every 60s
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        api.post('/analytics/heartbeat').catch(() => {});
      }
    }, 60000);

    return () => clearInterval(heartbeatInterval);
  }, [user, location.pathname, isImpersonating, isAdmin]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0b0e'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '2px solid transparent',
            borderColor: '#00C4CC',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  if (user.role === 'client' && user.active === false && !isImpersonating) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0b0e', color: '#fff', textAlign: 'center', padding: '20px' }}>
        <div style={{ background: '#1a1a24', padding: '40px', borderRadius: '16px', border: '1px solid #374151', maxWidth: '480px' }}>
          <div style={{ width: '64px', height: '64px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#F9FAFB' }}>Acceso Temporalmente Suspendido</h1>
          <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            Nuestro equipo está trabajando para mejorar tu experiencia o realizando mantenimiento en tu cuenta. Por favor, intenta de nuevo más tarde o contacta a soporte si crees que esto es un error.
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:soporte@hummingxbi.com'}
            style={{ background: '#374151', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Contactar a Soporte
          </button>
        </div>
      </div>
    );
  }

  return children;
}
