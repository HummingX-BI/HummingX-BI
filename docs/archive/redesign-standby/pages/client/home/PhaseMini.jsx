import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PHASES = [
  { num: 1, label: 'Análisis' },
  { num: 2, label: 'Diseño' },
  { num: 3, label: 'Revisión' },
  { num: 4, label: 'Desarrollo' },
  { num: 5, label: 'Lanzamiento' },
];

export default function PhaseMini({ currentPhase = 1 }) {
  // If phase is 6 (Activo), all 5 are completed
  const effectivePhase = currentPhase;
  const progressPercent = Math.min(100, Math.max(0, ((effectivePhase - 1) / 4) * 100));

  return (
    <div id="tour-milestone" className="px-stepper-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <span className="px-label">Ruta de Ejecución</span>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>
            {effectivePhase >= 6 ? 'Todas las fases completadas con éxito' : `En curso: Fase ${effectivePhase} · ${PHASES[effectivePhase - 1]?.label || 'Desarrollo'}`}
          </h3>
        </div>
        <Link
          to="/project"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#00C4CC',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Ver bitácora y entregables <ArrowRight size={14} />
        </Link>
      </div>

      <div className="px-stepper">
        {/* Track Line */}
        <div className="px-stepper-line">
          <div
            className="px-stepper-line-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Phase Nodes */}
        {PHASES.map((p) => {
          const isCompleted = effectivePhase > p.num || effectivePhase === 6;
          const isCurrent = effectivePhase === p.num;

          return (
            <div key={p.num} className="px-stepper-item">
              <div
                className={`px-stepper-node ${
                  isCompleted ? 'completed' : isCurrent ? 'active' : 'pending'
                }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={2.5} /> : p.num}
              </div>
              <span
                className="px-stepper-label"
                style={{
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#111827' : isCompleted ? '#059669' : '#9CA3AF',
                  marginTop: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
