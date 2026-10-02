/**
 * Toast.jsx — HummingX BI
 * Renders the toast notification stack.
 * Drop this once into Layout.jsx (already done) and call useToast anywhere.
 */

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={16} color="#059669" />,
  error:   <XCircle     size={16} color="#DC2626" />,
  info:    <Info        size={16} color="#00C4CC" />,
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notificaciones">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}${toast.exiting ? ' toast-exit' : ''}`}
          role="alert"
          aria-live="assertive"
        >
          <span className="toast-icon">{icons[toast.type]}</span>
          <div className="toast-body">
            {toast.title   && <div className="toast-title">{toast.title}</div>}
            {toast.message && <div className="toast-message">{toast.message}</div>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(249,250,251,0.5)', padding: '0 0 0 8px',
              display: 'flex', alignItems: 'center', flexShrink: 0,
              transition: 'color 150ms',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'rgba(249,250,251,0.9)'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(249,250,251,0.5)'}
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
