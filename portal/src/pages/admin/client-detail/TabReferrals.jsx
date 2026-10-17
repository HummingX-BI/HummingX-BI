// portal/src/pages/admin/client-detail/TabReferrals.jsx
import React, { useState } from 'react';
import { 
  Users, 
  Coins, 
  Award, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import AwardCreditsModal from './AwardCreditsModal';
import AdjustCreditsModal from './AdjustCreditsModal';

export default function TabReferrals({ detail }) {
  const {
    client,
    adjustingCredits,
    showAdjustCreditsModal,
    setShowAdjustCreditsModal,
    creditAdjustmentForm,
    setCreditAdjustmentForm,
    handleAdjustCredits,
    submittingReward,
    handleAwardReward,
  } = detail;

  const [awardConfirmOpen, setAwardConfirmOpen] = useState(false);
  const [targetReferral, setTargetReferral] = useState(null);
  const [awardAmount, setAwardAmount] = useState(1500);

  const level = client?.level || 1;
  const levelReward = level === 1 ? 1500 : level === 2 ? 2500 : 3500;
  const levelName = level === 1 ? 'Socio Standard' : level === 2 ? 'Socio Partner' : 'Socio Élite';

  const referrals = client?.referralsMade || [];
  const creditMovements = client?.creditMovements || [];

  const handleOpenAwardModal = (ref) => {
    setTargetReferral(ref);
    setAwardAmount(levelReward);
    setAwardConfirmOpen(true);
  };

  const confirmAwardCredits = async () => {
    if (!targetReferral) return;
    await handleAwardReward(targetReferral.id, awardAmount);
    setAwardConfirmOpen(false);
    setTargetReferral(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'converted':
        return { label: 'Concretada', bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
      case 'negotiating':
        return { label: 'En Negociación', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'contacted':
        return { label: 'Contactado', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'inactive':
        return { label: 'Inactiva', bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
      default:
        return { label: 'Registrada', bg: '#F8FAFC', text: '#334155', border: '#E2E8F0' };
    }
  };

  return (
    <div className="cd-section">
      {/* Saldo y Nivel Grandes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="cd-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#F0FDFA',
              border: '1px solid #CCFBF1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Coins size={28} color="#00C4CC" />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Saldo en Créditos HX</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
              ${(client?.totalCredits || 0).toLocaleString('es-MX')}
            </div>
          </div>
          <button
            type="button"
            className="cd-btn cd-btn-secondary"
            onClick={() => {
              setCreditAdjustmentForm({ amount: '', reason: '', type: 'credit_adjustment' });
              setShowAdjustCreditsModal(true);
            }}
          >
            <Plus size={15} /> Ajuste manual
          </button>
        </div>

        <div className="cd-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={28} color="#2563EB" />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Nivel de Recompensas</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E40AF', marginTop: '2px' }}>
              Nivel {level} · {levelName}
            </div>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Bono por recomendación cerrada: <strong>${levelReward.toLocaleString('es-MX')} HX</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Recomendaciones */}
      <div className="cd-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#00C4CC" /> Recomendaciones del Cliente ({referrals.length})
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
              Empresas recomendadas por {client?.name || client?.companyName}.
            </p>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="cd-empty-state">
            <Users size={32} color="#94A3B8" />
            <div className="cd-empty-title">Sin recomendaciones registradas</div>
            <p className="cd-empty-desc">Este cliente aún no ha registrado prospectos o recomendaciones en su portal.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {referrals.map((ref) => {
              const badge = getStatusBadge(ref.status);
              const alreadyAwarded = ref.creditsGenerated > 0;

              return (
                <div
                  key={ref.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: '1 1 250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                        {ref.companyName}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {ref.contactName && <span>Contacto: <strong>{ref.contactName}</strong></span>}
                      {ref.contactPhone && <span>Tel: {ref.contactPhone}</span>}
                      {ref.contactEmail && <span>Email: {ref.contactEmail}</span>}
                    </div>

                    {ref.notes && (
                      <p style={{ margin: '6px 0 0', fontSize: '12.5px', color: '#475569', fontStyle: 'italic' }}>
                        "{ref.notes}"
                      </p>
                    )}

                    {alreadyAwarded && (
                      <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>
                        <CheckCircle2 size={13} /> Recompensa abonada: +${ref.creditsGenerated.toLocaleString('es-MX')} HX
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!alreadyAwarded && (
                      <button
                        type="button"
                        onClick={() => handleOpenAwardModal(ref)}
                        className="cd-btn cd-btn-primary"
                        style={{ padding: '7px 12px', fontSize: '12.5px' }}
                      >
                        <Award size={14} /> Abonar créditos
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Movimientos de Créditos */}
      <div className="cd-card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#64748B" /> Historial de Movimientos ({creditMovements.length})
        </h3>

        {creditMovements.length === 0 ? (
          <div className="cd-empty-state">
            <Coins size={32} color="#94A3B8" />
            <div className="cd-empty-title">Sin movimientos registrados</div>
            <p className="cd-empty-desc">No se registran abonos ni consumos de créditos para este cliente.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {creditMovements.map((mov) => {
              const isPositive = mov.amount > 0;
              const d = new Date(mov.createdAt);
              const dateStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <div
                  key={mov.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isPositive ? '#DCFCE7' : '#FEE2E2',
                        color: isPositive ? '#166534' : '#991B1B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{mov.description}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{dateStr}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '15px',
                      color: isPositive ? '#166534' : '#991B1B',
                    }}
                  >
                    {isPositive ? `+${mov.amount.toLocaleString('es-MX')}` : mov.amount.toLocaleString('es-MX')} HX
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AdjustCreditsModal
        isOpen={showAdjustCreditsModal}
        onClose={() => setShowAdjustCreditsModal(false)}
        creditAdjustmentForm={creditAdjustmentForm}
        setCreditAdjustmentForm={setCreditAdjustmentForm}
        handleAdjustCredits={handleAdjustCredits}
        adjustingCredits={adjustingCredits}
      />

      <AwardCreditsModal
        isOpen={awardConfirmOpen}
        onClose={() => setAwardConfirmOpen(false)}
        targetReferral={targetReferral}
        awardAmount={awardAmount}
        setAwardAmount={setAwardAmount}
        level={level}
        levelName={levelName}
        levelReward={levelReward}
        clientName={client?.name || client?.companyName}
        submittingReward={submittingReward}
        onConfirm={confirmAwardCredits}
      />
    </div>
  );
}
