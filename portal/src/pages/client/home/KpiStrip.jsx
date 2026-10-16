import React from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from '../../../components/premium/CountUp';
import { Calendar, CreditCard, ArrowRight, CheckCircle2, Award } from 'lucide-react';

export default function KpiStrip({
  payments = [],
  totalCredits = 0,
  totalReferrals = 0,
  convertedCount = 0,
  membership = {},
  isProjectActive = true
}) {
  const navigate = useNavigate();

  // Next payment computation
  const projectPayments = payments.filter(p => !p.title.toLowerCase().includes('anualidad'));
  const nextP = projectPayments
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .find(p => p.status !== 'completed');

  return (
    <div className="px-kpi-grid">
      {/* Card 1: Próximo Pago */}
      <div
        id="tour-payments"
        className="px-card px-card-interactive"
        onClick={() => navigate('/pagos')}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="px-label">Próximo Pago</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F0FDFA', color: '#00C4CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} />
            </div>
          </div>

          <div
            className="px-serif"
            style={{
              fontSize: '32px',
              color: '#111827',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            {projectPayments.length === 0
              ? 'Por definir'
              : nextP
              ? nextP.amount
              : 'Al corriente'}
          </div>

          <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.4 }}>
            {projectPayments.length === 0 ? (
              'Plan de pagos en configuración'
            ) : nextP && nextP.startTime ? (
              <span>Vence el {new Date(nextP.startTime).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
            ) : (
              <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Todos tus pagos al corriente
              </span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#00C4CC', fontWeight: 600 }}>
          <span>Ver plan de pagos</span>
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Card 2: Créditos HX */}
      <div
        id="tour-credits"
        className="px-card px-card-interactive"
        onClick={() => navigate('/referrals')}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span className="px-label">Créditos HX</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} />
            </div>
          </div>

          <div
            className="px-serif"
            style={{
              fontSize: '32px',
              color: '#111827',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}
          >
            $<CountUp value={totalCredits} /> <span style={{ fontSize: '14px', fontFamily: 'var(--px-font-sans)', fontWeight: 600, color: '#6B7280' }}>HX</span>
          </div>

          <div id="tour-referrals" style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.4 }}>
            Equivale a <strong style={{ color: '#111827' }}>${totalCredits.toLocaleString()} MXN</strong> en servicios
            {totalReferrals > 0 && ` · ${convertedCount} de ${totalReferrals} referidos`}
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#D97706', fontWeight: 600 }}>
          <span>Canjear y recomendar</span>
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Card 3: Nivel de Cliente */}
      <div
        id="tour-level"
        className="px-card px-card-interactive"
        onClick={() => navigate('/referrals')}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span className="px-label">Nivel de Cliente</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: membership.color || '#6B7280' }}>
              {membership.title || 'HummingX Member'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '4px 0 12px 0' }}>
            <div style={{ width: '56px', height: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={membership.img || '/member-icon.png'}
                alt={membership.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4, marginBottom: '6px' }}>
                {membership.next > 0 ? (
                  <>Te faltan <strong>{membership.next}</strong> {membership.next === 1 ? 'cierre' : 'cierres'} para <strong>{membership.nextTitle}</strong></>
                ) : (
                  <strong>Nivel máximo VIP alcanzado</strong>
                )}
              </div>
              {/* Thin progress bar */}
              <div style={{ width: '100%', height: '5px', background: '#F3F4F6', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(10, ((membership.nextTitle === 'HummingX VIP' ? convertedCount - 5 : convertedCount) / 5) * 100))}%`,
                    height: '100%',
                    background: membership.color || '#00C4CC',
                    borderRadius: '9999px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#4B5563', fontWeight: 600 }}>
          <span>Beneficios de socio</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}
