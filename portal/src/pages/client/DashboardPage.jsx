import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  Rocket, 
  CreditCard, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Flag, 
  ShieldCheck, 
  Bell, 
  Award, 
  PlusCircle,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [referralData, setReferralData] = useState({ referrals: [], creditMovements: [], totalCredits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects/my').catch(() => ({ data: [] })),
      api.get('/referrals/my').catch(() => ({ data: { referrals: [], creditMovements: [], totalCredits: 0 } })),
    ]).then(([projRes, refRes]) => {
      setProjects(projRes.data || []);
      setReferralData(refRes.data || { referrals: [], creditMovements: [], totalCredits: 0 });
    }).finally(() => setLoading(false));
  }, []);

  const activeProject = projects.find(p => p.status === 'active') || projects[0] || {
    name: 'Página Web + Menú Digital',
    description: 'Diseño de experiencia interactiva y plataforma digital personalizada para la carta de Tahara Café con integración directa a pedidos.',
    progressPercent: 75,
    currentPhase: 3,
    estimatedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
  };

  const totalCredits = referralData.totalCredits || 2000;
  const referrals = referralData.referrals || [];
  const convertedCount = referrals.filter(r => r.status === 'converted').length || 5;
  const negotiatingCount = referrals.filter(r => r.status === 'negotiating' || r.status === 'contacted').length || 2;

  const clientName = user?.companyName || user?.name || 'Tahara Café';

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
        
        {/* Saludo Ejecutivo / Executive Greeting */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#F1F5F9', borderRadius: '9999px', marginBottom: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00696E', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Space Grotesk', sans-serif" }}>
                Portal Activo
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>
              Hola, {clientName}
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
              Qué gusto seguir construyendo contigo. Aquí tienes el pulso de tu operación digital.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <ShieldCheck size={22} color="#00C4CC" />
            <div style={{ textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Grotesk', sans-serif" }}>
                Tu suscripción
              </span>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Acompañamiento VIP
              </span>
            </div>
          </div>
        </section>

        {/* Bloque Dominante — Tu Proyecto */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '28px 32px',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)'
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            right: '-60px',
            top: '-60px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 196, 204, 0.15) 0%, rgba(10, 88, 163, 0.05) 70%, transparent 100%)',
            pointerEvents: 'none',
            filter: 'blur(30px)'
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top row: tags & estimated delivery */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#F1F5F9', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Rocket size={13} color="#0A58A3" /> Tu proyecto
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(0, 196, 204, 0.12)', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, color: '#00696E', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C4CC' }} />
                  En desarrollo
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748B', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                Entrega estimada: 3 semanas
              </span>
            </div>

            {/* Middle Row: Title & Progress Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                  {activeProject.name}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: 0, maxWidth: '520px' }}>
                  {activeProject.description}
                </p>
              </div>

              {/* Progress Container */}
              <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Avance general</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#00C4CC' }}>
                    {activeProject.progressPercent}%
                  </span>
                </div>
                {/* Progress bar track */}
                <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${activeProject.progressPercent}%`,
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #0A58A3, #00C4CC)',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '6px', fontFamily: "'Inter', sans-serif" }}>
                  <span>Planeación</span>
                  <span>Diseño UX</span>
                  <span style={{ color: '#00C4CC', fontWeight: 600 }}>Desarrollo</span>
                  <span>Lanzamiento</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Next Step & CTA */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(10, 88, 163, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3', flexShrink: 0 }}>
                  <Flag size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Próximo paso: Revisión del diseño interactivo
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Pronto podrás revisar la siguiente versión de tu proyecto y dejarnos comentarios.
                  </div>
                </div>
              </div>

              <Link to="/project" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px' }}>
                <span>Ver proyecto</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </section>

        {/* 2 Essential Cards (Créditos HX & Mis Referidos) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Créditos HX */}
          <div className="glass-card glass-card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 196, 204, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C4CC' }}>
                    <CreditCard size={20} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Créditos HX
                  </h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(0, 196, 204, 0.12)', color: '#008B91', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
                  Disponibles
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>
                    ${totalCredits.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>
                    HX
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                  Utilizables en servicios HummingX elegibles, nuevas funciones o mantenimiento preventivo.
                </p>
              </div>
            </div>

            <Link to="/credits" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0A58A3' }}>
              <span>Ver mis créditos</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Tus Recomendaciones */}
          <div className="glass-card glass-card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(10, 88, 163, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3' }}>
                    <Users size={20} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Tus recomendaciones
                  </h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: '#F1F5F9', color: '#475569', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
                  Red HummingX
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#00C4CC' }}>
                    {convertedCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                    convertidas
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '22px', fontWeight: 800, color: '#0A58A3' }}>
                    {negotiatingCount}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                    en negociación
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <Link to="/referrals" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0A58A3' }}>
                <span>Ver mis referidos</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/referrals" className="btn-secondary" style={{ textDecoration: 'none', padding: '6px 14px', fontSize: '12px' }}>
                <PlusCircle size={14} style={{ marginRight: '4px' }} />
                Recomendar empresa
              </Link>
            </div>
          </div>

        </section>

        {/* Two Balanced Lower Sections: Actividad Reciente & Nivel HummingX */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Left: Actividad Reciente */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#00C4CC" />
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Actividad reciente
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                  Últimos eventos
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Tu proyecto avanzó a Desarrollo</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Hace 2 horas</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C4CC', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Recibiste 2,000 Créditos HX de bono</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Ayer</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0A58A3', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Diseño interactivo aprobado por el cliente</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Hace 2 días</div>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/project" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0A58A3', paddingTop: '8px' }}>
              <span>Ver bitácora completa</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right: Nivel HummingX */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#784A9C" />
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Nivel de membresía
                  </h3>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(120, 74, 156, 0.1)', color: '#784A9C', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>
                  Exclusivo
                </span>
              </div>

              {/* Partner Highlight Box */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(35, 14, 56, 0.05), rgba(0, 196, 204, 0.05))', border: '1px solid rgba(120, 74, 156, 0.15)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#230E38', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E5FF' }}>
                    <Award size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>HummingX Partner</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Beneficios especiales y soporte de ingeniería preferencial.</div>
                  </div>
                </div>
              </div>

              {/* Progress to VIP */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>80% hacia HummingX VIP</span>
                  <span style={{ color: '#784A9C', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Nivel 2 de 3</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #784A9C, #00C4CC)', borderRadius: '9999px' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '10px', lineHeight: 1.4 }}>
                  Te falta 1 recomendación exitosa para desbloquear mantenimiento y beneficios VIP.
                </div>
              </div>
            </div>

            <Link to="/benefits" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0A58A3', paddingTop: '8px' }}>
              <span>Ver mis beneficios</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </section>

      </div>
    </Layout>
  );
}
