import React from 'react';
import ClientBadge from '../../../components/premium/ClientBadge';
import ProgressRing from '../../../components/premium/ProgressRing';
import CountUp from '../../../components/premium/CountUp';
import { Calendar, ExternalLink, Sparkles } from 'lucide-react';

export default function ProjectHero({
  project,
  user,
  celebrationActive = false,
  celebrationText = '',
  onOpenPreview
}) {
  const currentPhase = project?.currentPhase || 1;
  const progressPercent = project?.progressPercent || 0;
  const projectName = project?.name || 'Tu Proyecto Digital';
  const description = project?.description || '';
  const estimatedDelivery = project?.estimatedDelivery
    ? new Date(project.estimatedDelivery).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const isCompleted = currentPhase === 6;

  return (
    <div id="tour-project-header" className="px-hero" style={{ position: 'relative' }}>
      {/* Celebration announcement overlay */}
      {celebrationActive && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 11, 14, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.4s ease',
          }}
        >
          <div
            style={{
              padding: '16px 28px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(var(--px-accent-rgb), 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
              border: '1px solid rgba(var(--px-accent-rgb), 0.4)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Sparkles size={20} color="var(--px-accent)" />
            <span>{celebrationText || '¡Avanzamos a una nueva fase en tu proyecto!'}</span>
          </div>
        </div>
      )}

      {/* Left Column: Info & Contextual Action */}
      <div className="px-hero-left">
        <ClientBadge
          logoUrl={user?.logoUrl}
          name={user?.name}
          companyName={user?.companyName}
          size={96}
        />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: isCompleted ? 'rgba(16, 185, 129, 0.16)' : 'rgba(var(--px-accent-rgb), 0.16)',
                color: isCompleted ? '#10B981' : 'var(--px-accent)',
                border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(var(--px-accent-rgb), 0.3)',
              }}
            >
              {isCompleted ? 'Proyecto Completado' : `Fase ${currentPhase} de 5`}
            </span>

            <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>

            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {project?.clientName || user?.companyName || user?.name || 'Cliente'}
            </span>
          </div>

          <h1
            className="px-serif"
            style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              lineHeight: 1.15,
              margin: '0 0 10px 0',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              wordBreak: 'break-word',
            }}
          >
            {projectName}
          </h1>

          {description && (
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.75)',
                margin: '0 0 16px 0',
                lineHeight: 1.5,
                maxWidth: '620px',
              }}
            >
              {description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {estimatedDelivery && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.65)' }}>
                <Calendar size={14} color="var(--px-accent)" />
                <span>Entrega estimada: <strong style={{ color: '#FFFFFF' }}>{estimatedDelivery}</strong></span>
              </div>
            )}

            {project?.previewUrl && (
              <a
                href={project.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-btn px-btn-accent"
                style={{ padding: '8px 18px', minHeight: '38px', fontSize: '13px', textDecoration: 'none' }}
              >
                {isCompleted ? 'Ver sitio web' : 'Ver diseño en vivo'} <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Progress Ring */}
      <div className="px-hero-right">
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
            Avance general
          </span>
        </ProgressRing>
      </div>
    </div>
  );
}
