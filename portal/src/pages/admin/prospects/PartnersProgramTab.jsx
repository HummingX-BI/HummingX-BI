import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  Award,
  Users,
  Coins,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export default function PartnersProgramTab({ onAwardCreditsSuccess }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awardingId, setAwardingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [toast, setToast] = useState('');

  const fetchOverview = async () => {
    try {
      const res = await api.get('/admin/referrals/overview');
      setData(res.data);
    } catch (err) {
      console.error('Error al cargar programa de socios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleAwardPending = async (award) => {
    setAwardingId(award.prospectId);
    try {
      const res = await api.post(`/admin/prospects/${award.prospectId}/award-referral-credits`, {
        amount: award.amount,
      });
      setToast(res.data.message || 'Créditos abonados exitosamente al socio.');
      setTimeout(() => setToast(''), 4000);
      await fetchOverview();
      if (onAwardCreditsSuccess) onAwardCreditsSuccess();
    } catch (err) {
      setToast(err.response?.data?.error || 'Error al abonar créditos.');
      setTimeout(() => setToast(''), 4000);
    } finally {
      setAwardingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
        Cargando métricas y ranking de socios...
      </div>
    );
  }

  const { metrics, partners = [], pendingAwards = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Toast */}
      {toast && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ECFDF5',
            border: '1px solid #10B981',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#065F46',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Top Metrics Bar ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
        
        {/* Socios Activos */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Socios Registrados</span>
            <Users size={16} color="#00C4CC" />
          </div>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{metrics?.totalPartners || 0}</span>
          <span style={{ fontSize: '11.5px', color: '#6B7280', display: 'block', marginTop: '4px' }}>
            {metrics?.activePartnersWithReferrals || 0} con recomendaciones activas
          </span>
        </div>

        {/* Total Recomendados */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Recomendaciones Totales</span>
            <Award size={16} color="#7C3AED" />
          </div>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{metrics?.totalReferrals || 0}</span>
          <span style={{ fontSize: '11.5px', color: '#047857', display: 'block', marginTop: '4px', fontWeight: 600 }}>
            {metrics?.convertedReferrals || 0} concretadas ({metrics?.conversionRate || 0}%)
          </span>
        </div>

        {/* Pasivo en Créditos HX */}
        <div className="card" style={{ padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Pasivo en Créditos HX</span>
            <Coins size={16} color="#00C4CC" />
          </div>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#00C4CC' }}>
            ${(metrics?.netLiability || 0).toLocaleString('es-MX')}
          </span>
          <span style={{ fontSize: '11.5px', color: '#6B7280', display: 'block', marginTop: '4px' }}>
            Otorgados: ${(metrics?.totalCreditsIssued || 0).toLocaleString('es-MX')}
          </span>
        </div>

        {/* Abonos Pendientes */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            borderRadius: '14px',
            border: metrics?.pendingAwardsCount > 0 ? '1px solid #FDE68A' : '1px solid #E5E7EB',
            background: metrics?.pendingAwardsCount > 0 ? '#FFFBEB' : '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: metrics?.pendingAwardsCount > 0 ? '#B45309' : '#6B7280', fontWeight: 600 }}>
              Abonos Pendientes
            </span>
            <ShieldAlert size={16} color={metrics?.pendingAwardsCount > 0 ? '#D97706' : '#9CA3AF'} />
          </div>
          <span style={{ fontSize: '26px', fontWeight: 800, color: metrics?.pendingAwardsCount > 0 ? '#D97706' : '#111827' }}>
            {metrics?.pendingAwardsCount || 0}
          </span>
          <span style={{ fontSize: '11.5px', color: '#6B7280', display: 'block', marginTop: '4px' }}>
            Prospectos ganados por recompensar
          </span>
        </div>

      </div>

      {/* ── Abonos Pendientes de Aprobación (High Priority Callout) ───────────── */}
      {pendingAwards.length > 0 && (
        <div
          style={{
            borderRadius: '14px',
            border: '1px solid #FCD34D',
            background: '#FEFCE8',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#D97706" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#92400E', margin: 0 }}>
                Abonos de Crédito Pendientes de Asignar
              </h3>
              <p style={{ fontSize: '12.5px', color: '#B45309', margin: '2px 0 0' }}>
                Estas empresas ganadas vinieron por recomendación. Abona los créditos correspondientes a cada socio con 1 clic.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingAwards.map((a) => (
              <div
                key={a.prospectId}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #FDE68A',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>{a.companyName}</strong>
                    <span style={{ fontSize: '11px', color: '#047857', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Ganado
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginTop: '2px' }}>
                    Recomendado por: <strong style={{ color: '#111827' }}>{a.referrerName}</strong> ({a.tierName})
                  </span>
                </div>

                <button
                  onClick={() => handleAwardPending(a)}
                  disabled={awardingId === a.prospectId}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <Coins size={14} />
                  {awardingId === a.prospectId ? 'Abonando...' : `Abonar $${a.amount?.toLocaleString('es-MX')} Créditos HX`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Ranking y Cartera de Socios ─────────────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
            Ranking de Socios y Cartera de Créditos
          </h3>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
            Listado ordenado de clientes activos por efectividad en recomendaciones y balance de créditos disponibles.
          </p>
        </div>

        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '50px minmax(200px, 1.8fr) 130px 110px 100px 100px 130px 110px',
            padding: '12px 18px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            fontSize: '11px',
            fontWeight: 700,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <div>Pos.</div>
          <div>Socio / Empresa</div>
          <div>Nivel / Insignia</div>
          <div>Código</div>
          <div style={{ textAlign: 'center' }}>Total Ref.</div>
          <div style={{ textAlign: 'center' }}>Ganados</div>
          <div style={{ textAlign: 'right' }}>Saldo Créditos</div>
          <div style={{ textAlign: 'right' }}>Contacto</div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {partners.map((p, idx) => {
            const rawPhone = (p.phone || '').replace(/[^0-9]/g, '');
            const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
            const whatsappUrl = rawPhone
              ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(p.name || p.companyName)}%2C%20te%20contacto%20de%20HummingX%20BI%20para%20agradecerte%20por%20tus%20recomendaciones.`
              : null;

            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px minmax(200px, 1.8fr) 130px 110px 100px 100px 130px 110px',
                  padding: '12px 18px',
                  borderBottom: idx < partners.length - 1 ? '1px solid #F3F4F6' : 'none',
                  gap: '10px',
                  alignItems: 'center',
                  fontSize: '13px',
                }}
              >
                {/* Posición */}
                <div style={{ fontWeight: 800, color: idx < 3 ? '#00C4CC' : '#6B7280' }}>
                  #{idx + 1}
                </div>

                {/* Socio */}
                <div style={{ minWidth: 0 }}>
                  <strong style={{ color: '#111827', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.companyName || p.name}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{p.name}</span>
                </div>

                {/* Nivel */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: p.level >= 3 ? '#FEF3C7' : p.level === 2 ? '#EDE9FE' : '#F0FDFA',
                      color: p.level >= 3 ? '#B45309' : p.level === 2 ? '#6D28D9' : '#0F766E',
                      border: p.level >= 3 ? '1px solid #FDE68A' : p.level === 2 ? '1px solid #DDD6FE' : '1px solid #CCFBF1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.tierName}
                  </span>
                </div>

                {/* Código */}
                <div>
                  {p.referralCode ? (
                    <button
                      onClick={() => handleCopyCode(p.referralCode)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '3px 7px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: '#111827',
                        cursor: 'pointer',
                      }}
                      title="Copiar código"
                    >
                      <span>{p.referralCode}</span>
                      {copiedCode === p.referralCode ? <Check size={11} color="#059669" /> : <Copy size={11} color="#6B7280" />}
                    </button>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>—</span>
                  )}
                </div>

                {/* Total Ref */}
                <div style={{ textAlign: 'center', fontWeight: 600, color: '#111827' }}>
                  {p.totalReferrals}
                </div>

                {/* Ganados */}
                <div style={{ textAlign: 'center', fontWeight: 700, color: '#047857' }}>
                  {p.convertedReferrals}
                </div>

                {/* Saldo Créditos */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: '#00C4CC' }}>
                    ${(p.balance || 0).toLocaleString('es-MX')}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#9CA3AF', display: 'block' }}>
                    Ganado: ${(p.totalEarned || 0).toLocaleString('es-MX')}
                  </span>
                </div>

                {/* Contacto WhatsApp */}
                <div style={{ textAlign: 'right' }}>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#047857',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
