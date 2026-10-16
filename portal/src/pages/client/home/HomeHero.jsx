import React from 'react';
import ClientBadge from '../../../components/premium/ClientBadge';
import ProgressRing from '../../../components/premium/ProgressRing';
import CountUp from '../../../components/premium/CountUp';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeHero({
  user,
  project,
  phaseName = '',
  statusPhrase = '',
  estimatedDelivery = ''
}) {
  const clientName = user?.name ? user.name.split(' ')[0] : 'Cliente';
  const projectName = project?.name || 'Tu Proyecto Digital';
  const progressPercent = project?.progressPercent || 0;

  return (
    <div id="tour-active-project" className="px-hero">
      {/* Left Column: Client Identity & Project Info */}
      <div className="px-hero-left">
        <ClientBadge
          logoUrl={user?.logoUrl}
          name={user?.name}
          companyName={user?.companyName}
          size={96}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
              Hola, {clientName}
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(var(--px-accent-rgb), 0.16)',
                color: 'var(--px-accent)',
                border: '1px solid rgba(var(--px-accent-rgb), 0.3)',
              }}
            >
              Fase {project?.currentPhase || 1}: {phaseName}
            </span>
          </div>

          <h1
            className="px-serif"
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1.15,
              margin: '0 0 10px 0',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
            }}
          >
            {projectName}
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: '0 0 16px 0',
              lineHeight: 1.5,
              maxWidth: '640px',
            }}
          >
            {statusPhrase || 'Tu ecosistema digital está siendo desarrollado con los más altos estándares tecnológicos.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {estimatedDelivery && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.65)' }}>
                <Calendar size={14} color="var(--px-accent)" />
                <span>Entrega estimada: <strong style={{ color: '#FFFFFF' }}>{estimatedDelivery}</strong></span>
              </div>
            )}
            <Link
              to="/project"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--px-accent)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Ver detalles de la ruta <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Circular Progress Ring */}
      <div id="tour-progress" className="px-hero-right">
        <ProgressRing progress={progressPercent} size={180} strokeWidth={11}>
          <div
            className="px-serif"
            style={{
              fontSize: '52px',
              color: '#FFFFFF',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            <CountUp value={progressPercent} suffix="%" />
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.65)',
              marginTop: '4px',
            }}
          >
            Avance del proyecto
          </span>
        </ProgressRing>
      </div>
    </div>
  );
}
