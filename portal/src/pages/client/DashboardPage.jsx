import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  Rocket, CreditCard, Users, ArrowRight, CheckCircle2, Flag, 
  TrendingUp, Clock, BarChart3, FolderKanban, ExternalLink, CheckCircle,
  Award, Crown, Shield, Calendar, Check
} from 'lucide-react';
import Confetti from 'react-confetti';
import { Player } from '@lottiefiles/react-lottie-player';
import trophyAnimation from '../../assets/lottie/Trophy.json';
import conversationAnimation from '../../assets/lottie/Conversation.json';
import ProgressTicks from '../../components/ProgressTicks';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [referralData, setReferralData] = useState({ referrals: [], creditMovements: [], totalCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [designApproved, setDesignApproved] = useState(false);

  const demoPayments = [
    {
      id: "1",
      title: "Pago 1: Anticipo",
      description: "Pago inicial para comenzar el proyecto.",
      startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 3600000),
      color: "green",
      category: "Pago Completado",
      tags: ["Facturado"],
    },
    {
      id: "2",
      title: "Pago 2: Intermedio",
      description: "Pago correspondiente a la etapa de diseño aprobada.",
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600000),
      color: "blue",
      category: "Próximo Pago",
      tags: ["Pendiente"],
    },
    {
      id: "3",
      title: "Pago 3: Finiquito",
      description: "Pago final previo a entrega y despliegue.",
      startTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000 + 3600000),
      color: "orange",
      category: "Pago Programado",
      tags: ["Pendiente"],
    }
  ];

  const [realPayments, setRealPayments] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/projects/my').catch(() => ({ data: [] })),
      api.get('/referrals/my').catch(() => ({ data: { referrals: [], creditMovements: [], totalCredits: 0 } })),
      api.get('/payments/my-payments').catch(() => ({ data: [] })),
    ]).then(([projRes, refRes, payRes]) => {
      setProjects(projRes.data || []);
      setReferralData(refRes.data || { referrals: [], creditMovements: [], totalCredits: 0 });
      
      const pEvents = (payRes.data || []).map(p => {
        let color = 'blue';
        if (p.status === 'completed') color = 'green';
        if (p.status === 'overdue') color = 'red';
        if (p.status === 'upcoming') color = 'orange';

        let dueDate = new Date();
        if (p.dueDate) {
          const dateStr = typeof p.dueDate === 'string' ? p.dueDate.split('T')[0] : '';
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            dueDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
          } else {
            dueDate = new Date(p.dueDate);
          }
        }

        return {
          id: p.id,
          title: p.title,
          description: p.description || '',
          amount: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p.amount),
          rawAmount: p.amount,
          status: p.status,
          startTime: dueDate,
          endTime: new Date(dueDate.getTime() + 3600000),
          color,
          category: p.status === 'completed' ? 'Pago Completado' : p.status === 'upcoming' ? 'Próximo Pago' : 'Pago Programado',
          tags: [p.status === 'completed' ? 'Facturado' : 'Pendiente'],
          logo: null // Client view must not show client logo/icon
        };
      });
      setRealPayments(pEvents);
    }).finally(() => setLoading(false));
  }, []);

  const activeProject = projects.find(p => p.status === 'active') || projects[0] || null;

  const totalCredits = referralData.totalCredits || 0;
  const referrals = referralData.referrals || [];
  const convertedCount = referrals.filter(r => r.status === 'converted').length || 0;
  const negotiatingCount = referrals.filter(r => r.status === 'negotiating' || r.status === 'contacted').length || 0;
  const totalReferrals = referrals.length || 0;
  const clientName = user?.companyName || user?.name || 'Cliente';

  const getMembershipLevel = (converted) => {
    if (converted >= 10) return { title: 'HummingX VIP', img: '/vip-icon.jpg', next: 0, nextTitle: 'Máximo nivel', color: '#8b5cf6', bg: 'transparent' };
    if (converted >= 5) return { title: 'HummingX Partner', img: '/partner-icon.jpg', next: 10 - converted, nextTitle: 'HummingX VIP', color: '#f59e0b', bg: 'transparent' };
    return { title: 'HummingX Member', img: '/member-icon.png', next: 5 - converted, nextTitle: 'HummingX Partner', color: '#0ea5e9', bg: 'transparent' };
  };

  const membership = getMembershipLevel(convertedCount);

  const phaseNames = ['', 'Análisis', 'Diseño', 'Revisión', 'Desarrollo', 'Lanzamiento', 'Activo'];
  const currentPhaseName = phaseNames[activeProject?.currentPhase] || 'Desarrollo';

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (activeProject && activeProject.currentPhase === 6) {
      const key = `confetti_shown_${activeProject.id}`;
      if (!localStorage.getItem(key)) {
        setShowConfetti(true);
        localStorage.setItem(key, 'true');
        setTimeout(() => setShowConfetti(false), 8000);
      }
    }
  }, [activeProject]);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="bars-loader"><div></div><div></div><div></div></div>
        </div>
      </Layout>
    );
  }

  if (!activeProject) {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #00C4CC22 0%, #0066FF22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderKanban size={32} color="#00C4CC" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>Tu proyecto está en camino</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '360px', margin: 0 }}>
            Tu cuenta está activa. Pronto nuestro equipo configurará tu proyecto y lo verás aquí. Si tienes dudas, contáctanos por WhatsApp.
          </p>
          <a href="https://wa.me/5215519492070" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 24px' }}>
            Contactar al equipo
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={800} />
        </div>
      )}
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user?.logoUrl ? (
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <img src={user.logoUrl} alt="Logo de la empresa" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #00C4CC 0%, #0066FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 800, boxShadow: '0 8px 16px -4px rgba(0, 196, 204, 0.3)' }}>
                {user?.companyName ? user.companyName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'C')}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: '26px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', margin: 0 }}>
                  Bienvenido, {user?.name ? user.name.split(' ')[0] : 'Cliente'}
                </h1>
                <span className="badge badge-cyan" style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px' }}>
                  En línea
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#6B7280', margin: 0, textTransform: 'capitalize' }}>
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Resumen de operación
              </p>
            </div>
          </div>
        </div>

        {/* Main Project Card - HIGHEST PRIORITY */}
        <div id="tour-active-project" className="card" style={{ padding: '32px', borderTop: '4px solid #00C4CC' }}>
          <div className="project-card-header">
            <div style={{ flex: '1 1 300px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FolderKanban size={18} color="#00C4CC" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#00C4CC', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Tu proyecto activo</span>
                {activeProject.currentPhase === 6 ? (
                  <span className="badge badge-green" style={{ fontSize: '11px' }}>Completado</span>
                ) : (
                  <span className="badge badge-cyan" style={{ fontSize: '11px' }}>En desarrollo</span>
                )}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>
                {activeProject.name}
              </h2>

              {activeProject.currentPhase === 3 && (
                <div className="review-callout">
                  <span className="review-callout-kicker">
                    <span className="review-callout-dot"></span>
                    Siguiente acción
                  </span>
                  <strong>Tómate un momento para revisar el avance</strong>
                  <p className="review-callout-desc" style={{ marginBottom: '16px' }}>
                    El siguiente paso es que nos compartas tu opinión para que podamos continuar avanzando con tu proyecto.
                  </p>
                  
                  {activeProject.designStatus === 'approved' || designApproved ? (
                    <div style={{ padding: '12px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#059669" />
                      Diseño aprobado. Estamos preparando todo para avanzar a la fase de Desarrollo.
                    </div>
                  ) : activeProject.designStatus === 'modifications_requested' ? (
                    <div style={{ padding: '12px 16px', background: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="#D97706" />
                      Solicitud de modificaciones enviada. Nuestro equipo está trabajando en los ajustes.
                    </div>
                  ) : (
                    <>
                      {activeProject.designStatus === 'modifications_resolved' && (
                        <div style={{ padding: '12px 16px', background: '#E0E7FF', color: '#3730A3', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <CheckCircle2 size={18} color="#4338CA" />
                          ¡Cambios listos! Hemos completado las modificaciones que solicitaste. Por favor revisa de nuevo.
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <button 
                          onClick={async () => {
                            setDesignApproved(true);
                            await api.put(`/projects/${activeProject.id}/design-status`, { designStatus: 'approved' }).catch(console.error);
                            setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, designStatus: 'approved' } : p));
                          }}
                        style={{ background: '#00C4CC', color: '#111827', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CheckCircle2 size={16} /> Aprobar diseño
                      </button>
                      <a 
                        href="https://wa.me/525575084267?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20algunas%20modificaciones%20al%20dise%C3%B1o%20de%20mi%20proyecto." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={async () => {
                          await api.put(`/projects/${activeProject.id}/design-status`, { designStatus: 'modifications_requested' }).catch(console.error);
                          setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, designStatus: 'modifications_requested' } : p));
                        }}
                        style={{ background: 'transparent', color: '#374151', border: '1px solid #D1D5DB', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Solicitar modificaciones
                      </a>
                    </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {activeProject.currentPhase === 3 && activeProject.previewUrl ? (
              <div className="project-preview-column">
                <div className="browser-mockup">
                  <div className="browser-mockup-header">
                    <div className="browser-mockup-dots">
                      <span className="browser-mockup-dot red"></span>
                      <span className="browser-mockup-dot yellow"></span>
                      <span className="browser-mockup-dot green"></span>
                    </div>
                    <div className="browser-mockup-address">
                      <ExternalLink size={10} style={{ opacity: 0.6 }} />
                      <span>{activeProject.previewUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                  </div>
                  <div className="browser-mockup-body" style={{ height: '230px' }}>
                    <iframe 
                      src={activeProject.previewUrl} 
                      title="Vista previa del sitio"
                    />
                  </div>
                </div>
                <Link to="/project" state={{ scrollTo: 'revision' }} className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center', width: '100%', fontSize: '13.5px', padding: '10px 16px' }}>
                  Ver diseño completo <ArrowRight size={15} style={{ marginLeft: '6px' }}/>
                </Link>
              </div>
            ) : (
              activeProject.currentPhase !== 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <Link to="/project" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                    Ver detalles del proyecto <ArrowRight size={16} style={{ marginLeft: '6px' }}/>
                  </Link>
                </div>
              )
            )}
          </div>
          {activeProject.currentPhase === 6 && (
            <div style={{ position: 'relative', overflow: 'hidden', width: '100%', padding: '32px 40px', background: '#0b0b0e', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '40px', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
              
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '280px', height: '280px', background: 'rgba(0,196,204,0.15)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0 }}></div>
              <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '280px', height: '280px', background: 'rgba(75,29,111,0.25)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0 }}></div>

              <div style={{ flexShrink: 0, width: 160, height: 160, position: 'relative', zIndex: 1 }}>
                <Player autoplay loop speed={0.25} src={trophyAnimation} style={{ width: '160px', height: '160px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', maxWidth: '600px', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={24} color="#00C4CC" /> ¡Hemos terminado al 100% con tu proyecto!
                </h3>
                <p style={{ fontSize: '15px', color: '#D1D5DB', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  Tu proyecto está completamente desplegado y activo. Nos encantó trabajar contigo y esperamos que a ti también. Para cualquier proyecto adicional, no dudes en contactarnos.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', width: '100%' }}>
                  <a href="https://wa.me/525575084267" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#00C4CC', color: '#111827', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}>
                    Soporte / Reportar un problema
                  </a>
                  <Link to="/project" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}>
                    Ver detalles del proyecto
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Big Progress Bar */}
          <div id="tour-progress" style={{ background: '#F9FAFB', padding: '24px 28px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>Avance general del proyecto</span>
                {activeProject.currentPhase <= 5 ? (
                  <span style={{ fontSize: '13px', color: '#6B7280', background: '#E5E7EB', padding: '4px 10px', borderRadius: '99px' }}>Fase {activeProject.currentPhase} de 5</span>
                ) : (
                  <span style={{ fontSize: '13px', color: '#059669', background: '#D1FAE5', padding: '4px 10px', borderRadius: '99px' }}>Completado</span>
                )}
              </div>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#00C4CC' }}>{activeProject.progressPercent}%</span>
            </div>
            <ProgressTicks value={activeProject.progressPercent} />
          </div>
        </div>

        {/* 4 KPI Stat Cards */}
        <div className="stats-grid-4">
          {(() => {
            const annuityPayments = realPayments.filter(p => p.title.toLowerCase().includes('anualidad'));
            const projectPayments = realPayments.filter(p => !p.title.toLowerCase().includes('anualidad'));
            
            const nextP = projectPayments.sort((a,b) => new Date(a.startTime) - new Date(b.startTime)).find(p => p.status !== 'completed');
            const nextAnnuity = annuityPayments.sort((a,b) => new Date(a.startTime) - new Date(b.startTime)).find(p => p.status !== 'completed');

            return (
              <>
                <div id="tour-payments" className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/payments')}>
                  <div className="stat-label">
                    <div className="stat-icon-badge stat-icon-cyan">
                      <Calendar size={16} />
                    </div>
                    Próximo Pago
                  </div>
                  <div className="stat-value" style={{ fontSize: nextP ? '26px' : '20px' }}>
                    {projectPayments.length === 0 ? 'Por definir' : nextP ? nextP.amount : '¡Todo cubierto!'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: projectPayments.length === 0 ? '#6B7280' : '#00C4CC', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {projectPayments.length === 0 ? (
                      <span>Plan en configuración</span>
                    ) : nextP && nextP.startTime ? (
                      <>Vence el {nextP.startTime.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} <ArrowRight size={12} /></>
                    ) : (
                      <>Al corriente con tus pagos <Check size={12} /></>
                    )}
                  </div>
                </div>

                {activeProject.currentPhase === 6 ? (
                  <div id="tour-milestone" className="stat-card">
                    <div className="stat-label">
                      <div className="stat-icon-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                        <Calendar size={16} />
                      </div>
                      Próxima Anualidad
                    </div>
                    <div className="stat-value" style={{ fontSize: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nextAnnuity ? nextAnnuity.amount : 'Sin anualidad'}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>
                      {nextAnnuity && nextAnnuity.startTime ? `Vence el ${nextAnnuity.startTime.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No hay anualidad pendiente'}
                    </div>
                  </div>
                ) : (
                  <div id="tour-milestone" className="stat-card">
                    <div className="stat-label">
                      <div className="stat-icon-badge stat-icon-blue">
                        <Rocket size={16} />
                      </div>
                      Siguiente Hito
                    </div>
                    <div className="stat-value" style={{ fontSize: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {phaseNames[activeProject.currentPhase + 1] || 'Entrega Final'}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>Próximamente en tu ruta</div>
                  </div>
                )}
              </>
            );
          })()}

          <div id="tour-credits" className="stat-card">
            <div className="stat-label">
              <div className="stat-icon-badge stat-icon-amber">
                <CreditCard size={16} />
              </div>
              Créditos HX
            </div>
            <div className="stat-value">${totalCredits.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', letterSpacing: 'normal' }}>MXN</span></div>
            <div style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>Disponibles para canje</div>
          </div>

          <div id="tour-referrals" className="stat-card">
            <div className="stat-label">
              <div className="stat-icon-badge stat-icon-purple">
                <Users size={16} />
              </div>
              Referidos
            </div>
            <div className="stat-value">{totalReferrals}</div>
            <div className={`stat-trend ${convertedCount > 0 ? 'up' : ''}`} style={{ color: convertedCount === 0 ? '#6B7280' : undefined }}>
              <CheckCircle2 size={13} /> {convertedCount} convertidos
            </div>
          </div>
        </div>

        {/* Two Bottom Cards */}
        <div className="stats-grid-2" style={{ alignItems: 'flex-start' }}>

          {/* Activity Log */}
          <div id="tour-activity" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '280px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Actividad reciente
              </h3>
              <Link to="/project" style={{ fontSize: '13px', fontWeight: 500, color: '#0E7490', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver todo <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
              {(!activeProject.activities || activeProject.activities.length === 0) ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                  Tu proyecto fue creado exitosamente. Estamos configurando tu entorno de trabajo.
                </div>
              ) : (
                [...activeProject.activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((activity, i) => {
                  const dateObj = new Date(activity.createdAt);
                  const monthStr = dateObj.toLocaleDateString('es-ES', { month: 'short' }).substring(0, 3).toUpperCase();
                  const dayNum = dateObj.getDate();
                  const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                  return (
                    <div key={activity.id || i} style={{ 
                      display: 'flex', alignItems: 'center', gap: '16px', 
                      padding: '16px 0',
                      borderBottom: i < activeProject.activities.length - 1 ? '1px solid #F3F4F6' : 'none' 
                    }}>
                      <div style={{ 
                        width: '46px', height: '52px', background: '#F9FAFB', borderRadius: '8px', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                        flexShrink: 0, border: '1px solid #E5E7EB' 
                      }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>{monthStr}</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', lineHeight: 1, marginTop: '2px' }}>{dayNum}</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px 0' }}>{activity.description}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Fase del proyecto</span>
                          <span style={{ color: '#D1D5DB' }}>•</span>
                          <span>{timeStr} hrs</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Recomendaciones Card */}
            <div id="tour-recommendations" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '280px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Recomendaciones
                </h3>
                <Link to="/referrals" style={{ fontSize: '13px', fontWeight: 500, color: '#0E7490', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Ver <ArrowRight size={14} />
                </Link>
              </div>

              {totalReferrals === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <Player autoplay loop src={conversationAnimation} style={{ width: '120px', height: '120px', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px' }}>
                    Refiere para subir de nivel.
                  </p>
                  <Link to="/referrals" className="btn-secondary" style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '12.5px' }}>
                    Recomendar
                  </Link>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{convertedCount}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Convertidas</div>
                    </div>
                    <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{negotiatingCount}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>En proceso</div>
                    </div>
                  </div>

                  <div style={{ paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Créditos acumulados</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>${totalCredits.toLocaleString()} <span style={{ fontSize: '12px' }}>HX</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Membership Level Card */}
            <div id="tour-level" className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '280px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Tu Nivel HummingX
                </h3>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <img src={membership.img} alt={membership.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{membership.title}</div>
                
                {membership.next > 0 ? (
                  <div style={{ width: '100%', marginTop: '16px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '8px' }}>
                      Faltan <strong>{membership.next}</strong> referidos para <strong>{membership.nextTitle}</strong>.
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${((membership.nextTitle === 'HummingX VIP' ? convertedCount - 5 : convertedCount) / 5) * 100}%`, height: '100%', background: membership.color, borderRadius: '99px' }}></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', marginTop: '16px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: 600 }}>
                      ¡Felicidades! Tienes el nivel VIP.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}
