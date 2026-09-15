import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Crown, 
  Layers, 
  Clock, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export default function BenefitsPage() {
  const { user } = useAuth();
  const clientName = user?.companyName || 'Tahara Café';

  const tiers = [
    {
      name: 'HummingX Member',
      level: 'Nivel 1',
      status: 'Completado',
      desc: 'Nivel de bienvenida corporativa al iniciar tu primer proyecto.',
      perks: [
        'Acceso al portal de seguimiento y entregables en tiempo real',
        'Soporte técnico estándar (respuesta en < 24 hrs hábiles)',
        'Acceso a la red de recomendaciones comerciales HummingX',
        'Generación estándar de Créditos HX base'
      ],
      isCurrent: false
    },
    {
      name: 'HummingX Partner',
      level: 'Nivel 2',
      status: 'Nivel Actual',
      desc: 'Acceso preferencial a créditos acumulables y atención técnica prioritaria.',
      perks: [
        '10% de Cashback directo en Créditos HX por cada empresa referida',
        'Atención técnica prioritaria (respuesta en < 2 hrs hábiles)',
        'Canje directo de créditos en servicios y nuevas funciones',
        'Revisión semestral de arquitectura y rendimiento digital',
        'Certificación activa de Aliado Tecnológico'
      ],
      isCurrent: true
    },
    {
      name: 'HummingX VIP',
      level: 'Nivel 3',
      status: 'Próximo Nivel',
      desc: 'Máxima distinción corporativa con ingeniería dedicada y exenciones completas.',
      perks: [
        '15% de Cashback en Créditos HX acumulables',
        'Mantenimiento preventivo mensual 100% bonificado',
        'Canal directo 24/7 con Ingeniero Líder asignado',
        'Capacitación continua y acceso preferencial a nuevos desarrollos',
        'Invitación a cenas ejecutivas y eventos privados de la red'
      ],
      isCurrent: false
    }
  ];

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Programa de Lealtad & Membresía
              </span>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00C4CC' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>
                Cliente Exclusivo
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>
              Tus Beneficios HummingX
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Tu lealtad y recomendaciones impulsan ventajas continuas para la aceleración digital de {clientName}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Award size={20} color="#784A9C" />
            <div>
              <span style={{ display: 'block', fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                Certificación Activa
              </span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Partner Elite 2025
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section: Current Membership & Progress to VIP */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Current Membership Card (Midnight Purple) */}
          <div className="midnight-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px', gridColumn: 'span 2' }}>
            {/* Ambient Cyan Glow */}
            <div style={{
              position: 'absolute',
              right: '-60px',
              top: '-60px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 196, 204, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#00C4CC', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0, 196, 204, 0.4)' }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Grotesk', sans-serif" }}>
                      Nivel Corporativo 2 de 3
                    </span>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                      HummingX Partner
                    </h2>
                  </div>
                </div>

                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  Membresía Activa
                </span>
              </div>

              <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '600px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                Cuentas con acceso preferencial a Créditos HX acumulables, atención de ingeniería prioritaria y privilegios arquitectónicos exclusivos en el desarrollo de software.
              </p>

              {/* 3 Metrics Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>Recomendaciones</span>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    5 <span style={{ fontSize: '12px', color: '#00E5FF', fontWeight: 600 }}>Exitosas</span>
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>Acumuladas</span>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>Créditos Generados</span>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#00E5FF', marginTop: '2px' }}>
                    $10,500 <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>HX</span>
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>Disponibles para canje</span>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>Tasa de Asignación</span>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                    10% <span style={{ fontSize: '12px', color: '#00E5FF', fontWeight: 600 }}>Cashback</span>
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>Por proyecto contratado</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', opacity: 0.8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#00E5FF" />
                <span>Acreditación válida durante todo el ejercicio fiscal 2025</span>
              </div>
              <span style={{ color: '#00E5FF', fontWeight: 600 }}>Estatus Activo</span>
            </div>
          </div>

          {/* Path to VIP Card */}
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Ruta de Crecimiento
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', color: '#784A9C' }}>
                  VIP TARGET
                </span>
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Próximo Nivel: HummingX VIP
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Alcanza la máxima distinción corporativa con beneficios de ingeniería dedicados y soporte 24/7 sin costo adicional.
              </p>

              {/* Progress to VIP */}
              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Progreso a VIP (4 / 5 empresas)</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 800, color: '#0A58A3' }}>80%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #0A58A3, #00C4CC)', borderRadius: '9999px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#00C4CC" />
                  <span>15% de Cashback en Créditos HX</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#00C4CC" />
                  <span>Mantenimiento preventivo mensual 100% cubierto</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#00C4CC" />
                  <span>Canal directo prioritario 24/7</span>
                </div>
              </div>
            </div>

            <a 
              href="/referrals" 
              className="btn-primary" 
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', padding: '10px' }}
            >
              <span>Sumar última recomendación</span>
              <ArrowRight size={15} />
            </a>
          </div>

        </section>

        {/* Comparison of Tiers (3 Column Cards) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
              Comparativa de Niveles Corporativos
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Beneficios acumulativos diseñados para maximizar el retorno tecnológico de tu empresa.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {tiers.map((t) => (
              <div 
                key={t.name}
                className={`glass-card ${t.isCurrent ? 'glass-card-hover' : ''}`}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: t.isCurrent ? '2px solid #00C4CC' : '1px solid #E2E8F0',
                  boxShadow: t.isCurrent ? '0 8px 24px -4px rgba(0, 196, 204, 0.15)' : 'none',
                  position: 'relative'
                }}
              >
                {t.isCurrent && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #00C4CC, #0A58A3)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '0.08em'
                  }}>
                    Tu Nivel Actual
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {t.level}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: t.isCurrent ? '#008B91' : '#64748B' }}>
                      {t.status}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                    {t.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.4, margin: '0 0 18px 0' }}>
                    {t.desc}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                    {t.perks.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155', lineHeight: 1.4 }}>
                        <CheckCircle2 size={15} color={t.isCurrent ? '#00C4CC' : '#94A3B8'} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: t.isCurrent ? '#00696E' : '#94A3B8' }}>
                    {t.isCurrent ? 'Activo en tu cuenta' : t.level === 'Nivel 1' ? 'Nivel Superado' : 'Próxima meta'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}
