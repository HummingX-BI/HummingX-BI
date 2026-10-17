// portal/src/pages/admin/client-detail/PendingAlerts.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PendingAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={18} color="#D97706" /> Atención Requerida ({alerts.length})
      </h3>

      {alerts.map((alert) => {
        const Icon = alert.icon || AlertCircle;
        const isError = alert.type === 'error';
        const isWarning = alert.type === 'warning';

        const bg = isError ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#F0F9FF';
        const border = isError ? '#FECACA' : isWarning ? '#FED7AA' : '#BAE6FD';
        const textColor = isError ? '#991B1B' : isWarning ? '#9A3412' : '#0369A1';
        const titleColor = isError ? '#7F1D1D' : isWarning ? '#7C2D12' : '#0C4A6E';

        return (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
              <Icon size={18} color={textColor} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '13.5px', fontWeight: 600, color: titleColor }}>
                  {alert.title}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: textColor, opacity: 0.9 }}>
                  {alert.description}
                </p>
              </div>
            </div>

            {alert.actionLabel && (
              <button
                type="button"
                onClick={alert.onAction}
                className="cd-btn cd-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', background: '#FFFFFF', borderColor: border, color: textColor }}
              >
                {alert.actionLabel}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
