import React from 'react';
import { ExternalLink, Lock, Maximize2 } from 'lucide-react';

export default function BrowserFrame({ previewUrl, title = 'Vista previa del proyecto' }) {
  if (!previewUrl) return null;

  const displayUrl = previewUrl.replace(/^https?:\/\//, '');

  return (
    <div className="px-browser-frame">
      {/* Top Browser Bar */}
      <div className="px-browser-bar">
        <div className="px-browser-dots">
          <span className="px-browser-dot" style={{ background: '#EF4444' }} />
          <span className="px-browser-dot" style={{ background: '#F59E0B' }} />
          <span className="px-browser-dot" style={{ background: '#10B981' }} />
        </div>

        <div className="px-browser-url">
          <Lock size={12} color="#059669" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayUrl}
          </span>
        </div>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-btn px-btn-secondary"
          title="Abrir en pantalla completa en una nueva pestaña"
          style={{
            padding: '6px 12px',
            minHeight: '32px',
            fontSize: '12px',
            textDecoration: 'none',
            borderRadius: '8px',
          }}
        >
          <Maximize2 size={13} />
          <span>Pantalla completa</span>
        </a>
      </div>

      {/* Frame Body */}
      <div style={{ position: 'relative', width: '100%', height: '420px', background: '#FFFFFF' }}>
        <iframe
          src={previewUrl}
          title={title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
