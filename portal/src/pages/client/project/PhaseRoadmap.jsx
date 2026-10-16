import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  ClipboardList, Paintbrush, Search, Code2, Rocket, 
  Check, Construction, ShieldCheck, Clock
} from 'lucide-react';

const ROADMAP_STEPS = [
  { num: 1, title: 'Análisis', subtitle: 'Objetivos y alcance', icon: ClipboardList },
  { num: 2, title: 'Diseño', subtitle: 'Identidad visual y flujos', icon: Paintbrush },
  { num: 3, title: 'Revisión', subtitle: 'Validación conjunta', icon: Search },
  { num: 4, title: 'Desarrollo', subtitle: 'Construcción interactiva', icon: Code2 },
  { num: 5, title: 'Lanzamiento', subtitle: 'Publicación al público', icon: Rocket },
];

const PHASE_MESSAGES = {
  1: 'Nuestro equipo está evaluando paso a paso el contexto de tu negocio y modelo de operación para ofrecerte la solución ideal.',
  2: 'Nuestro equipo está diseñando y estructurando paso a paso las pantallas y flujos de tu nueva plataforma.',
  3: 'Hemos terminado una versión interactiva de tu proyecto. Necesitamos que lo revises a detalle y nos compartas tus observaciones o aprobación.',
  4: 'Estamos plasmando todas tus ideas y los diseños aprobados en código frontend y backend para hacer realidad tu proyecto.',
  5: 'Estamos afinando los últimos detalles y configurando servidores seguros y dominio para el lanzamiento oficial.'
};

export default function PhaseRoadmap({ project }) {
  const shouldReduceMotion = useReducedMotion();
  const currentPhase = project?.currentPhase || 1;
  const isCompleted = currentPhase === 6;

  const currentStep = ROADMAP_STEPS[Math.min(currentPhase - 1, 4)];
  const currentTitle = project?.currentStageTitle || (isCompleted ? '100% Desplegado y Activo' : currentStep.title);
  const currentDesc = project?.currentStageDescription || (isCompleted 
    ? 'Hemos terminado al 100% tu proyecto. Tu ecosistema digital se encuentra activo y listo para operar.' 
    : (PHASE_MESSAGES[currentPhase] || 'Avanzando en los hitos del proyecto.'));

  const fillPercent = isCompleted ? 100 : Math.min(100, Math.max(0, ((currentPhase - 1) / 4) * 100));

  return (
    <div id="tour-project-timeline" className="px-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="px-label">Metodología de Desarrollo</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
            Ruta de trabajo por fases
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#059669', fontWeight: 600, background: '#ECFDF5', padding: '4px 12px', borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
          <ShieldCheck size={14} /> Supervisión continua de ingeniería
        </div>
      </div>

      {/* Stepper with animated line */}
      <div className="px-stepper" style={{ padding: '10px 0' }}>
        <div className="px-stepper-line">
          <motion.div
            className="px-stepper-line-fill"
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {ROADMAP_STEPS.map((step) => {
          const isDone = currentPhase > step.num || isCompleted;
          const isActive = currentPhase === step.num && !isCompleted;
          const IconComponent = step.icon;

          return (
            <div key={step.num} className="px-stepper-item">
              <div
                className={`px-stepper-node ${isDone ? 'completed' : isActive ? 'active' : 'pending'}`}
                style={{ width: '42px', height: '42px', borderRadius: '14px' }}
              >
                {isDone ? (
                  <Check size={20} strokeWidth={2.5} />
                ) : (
                  <IconComponent size={18} />
                )}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#111827' : isDone ? '#059669' : '#6B7280',
                  marginTop: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.title}
              </span>
              <span
                className="px-stepper-label"
                style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.subtitle}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expanded Active Stage Detail Box */}
      <div
        id="tour-active-stage"
        style={{
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Construction size={16} color="var(--px-accent)" />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--px-accent)' }}>
              {isCompleted ? 'Proyecto Finalizado' : `Detalles de la Fase ${currentPhase}`}
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '6px' }}>
            En cronograma
          </span>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
          {currentTitle}
        </h3>

        <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
          {currentDesc}
        </p>
      </div>
    </div>
  );
}
