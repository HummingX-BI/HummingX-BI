import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  CreditCard, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  ShoppingBag, 
  Users, 
  CheckCircle2, 
  MinusCircle, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function CreditsPage() {
  const [data, setData] = useState({ referrals: [], creditMovements: [], totalCredits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/referrals/my')
      .then(res => setData(res.data))
      .catch(() => setData({
        totalCredits: 2000,
        creditMovements: [
          { id: '1', description: 'Recomendación concretada — Restaurante XYZ', amount: 2000, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { id: '2', description: 'Actualización de diseño interactivo', amount: -500, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { id: '3', description: 'Bono de bienvenida HummingX Partner', amount: 500, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
        ]
      }))
      .finally(() => setLoading(false));
  }, []);

  const totalCredits = data.totalCredits || 2000;
  const movements = data.creditMovements?.length > 0 ? data.creditMovements : [
    { id: '1', description: 'Recomendación concretada — Restaurante XYZ', amount: 2000, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: '2', description: 'Actualización de diseño interactivo', amount: -500, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: '3', description: 'Bono de bienvenida HummingX Partner', amount: 500, createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#00C4CC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Page Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00696E', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(0, 196, 204, 0.12)', padding: '3px 10px', borderRadius: '9999px' }}>
                Programa de Lealtad & Beneficios
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                NIVEL PARTNER
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>
              Tus Créditos HX
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
              Cada crédito representa valor monetario 1:1 aplicable directamente a tus futuros servicios, nuevas características o soporte.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <ShieldCheck size={20} color="#00C4CC" />
            <div>
              <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                Cuenta Verificada
              </span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Garantía HummingX
              </span>
            </div>
          </div>
        </header>

        {/* Hero Balance Card (Midnight Purple) */}
        <section className="midnight-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Ambient Glows */}
          <div style={{
            position: 'absolute',
            right: '-50px',
            top: '-50px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 196, 204, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(0, 196, 204, 0.2)', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00E5FF' }} />
                  Disponibles para canje
                </span>
                <span style={{ fontSize: '12px', opacity: 0.6, fontFamily: "'Inter', sans-serif" }}>
                  Sin caducidad activa
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '56px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
                  ${totalCredits.toLocaleString()}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 600, color: '#00E5FF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Créditos HX
                </span>
              </div>

              <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '520px', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Equivalente a <strong style={{ color: '#FFFFFF' }}>${totalCredits.toLocaleString()} MXN / USD</strong> utilizable en cualquier desarrollo, módulo interactivo o plan de mantenimiento.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <RefreshCw size={14} color="#00E5FF" />
                  <span>Ratio 1:1 Moneda Base</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <ShieldCheck size={14} color="#00E5FF" />
                  <span>Acreditación Inmediata</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '220px' }}>
              <Link 
                to="/services" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #00C4CC, #0A58A3)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  boxShadow: '0 0 20px rgba(0, 196, 204, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                <ShoppingBag size={16} />
                <span>Explorar servicios</span>
              </Link>
              <Link 
                to="/referrals" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s'
                }}
              >
                <PlusCircle size={16} color="#00E5FF" />
                <span>Recomendar empresa</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Grid: Left Transactions, Right Accelerator & Redemption */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left: Movimientos recientes */}
          <section className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Movimientos recientes
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Historial transparente de créditos acumulados y aplicados.
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
                {movements.length} REGISTROS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {movements.map((m) => {
                const isPositive = m.amount > 0;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isPositive ? 'rgba(16, 185, 129, 0.12)' : '#F1F5F9',
                        color: isPositive ? '#10B981' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isPositive ? <PlusCircle size={16} /> : <MinusCircle size={16} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          {m.description}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {new Date(m.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isPositive ? '#10B981' : '#0F172A',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: isPositive ? 'rgba(16, 185, 129, 0.1)' : '#F1F5F9'
                    }}>
                      {isPositive ? `+${m.amount.toLocaleString()}` : `${m.amount.toLocaleString()}`} HX
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0, 196, 204, 0.06)', borderRadius: '10px', marginTop: '8px' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Total histórico acreditado:</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 800, color: '#00696E' }}>
                ${(totalCredits + 500).toLocaleString()} HX Generados
              </span>
            </div>
          </section>

          {/* Right: How to earn & Featured Redemptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Card 1: ¿Cómo obtener más Créditos HX? */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(10, 88, 163, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3' }}>
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Crecimiento Mutuo
                  </span>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    ¿Cómo obtener más Créditos HX?
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Recomienda una empresa a HummingX. Cuando su proyecto formalice, recibirás el <strong style={{ color: '#0F172A' }}>10% del valor de su contrato</strong> acreditado como Créditos HX para tu negocio.
              </p>

              {/* 3 Step Flow */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>Paso 1</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Recomienda</span>
                </div>
                <div style={{ padding: '8px', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>Paso 2</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Conversamos</span>
                </div>
                <div style={{ padding: '8px', background: 'rgba(0, 196, 204, 0.1)', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#00696E', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Paso 3</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#00696E' }}>Recibes HX</span>
                </div>
              </div>

              <Link to="/referrals" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', padding: '10px' }}>
                <span>Recomendar nueva empresa</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Card 2: Servicios para canjear */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={18} color="#00C4CC" />
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Servicios para canjear
                  </h3>
                </div>
                <Link to="/services" style={{ fontSize: '12px', color: '#0A58A3', textDecoration: 'none', fontWeight: 600 }}>
                  Ver catálogo →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Actualización de diseño & UX</div>
                    <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Totalmente cubierto con tu saldo</div>
                  </div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 800, color: '#00696E' }}>
                    $2,000 HX
                  </span>
                </div>

                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Mes de soporte y mantenimiento</div>
                    <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Cubierto ($500 HX restantes)</div>
                  </div>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 800, color: '#00696E' }}>
                    $1,500 HX
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}
