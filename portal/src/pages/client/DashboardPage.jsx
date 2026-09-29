import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  Rocket, CreditCard, Users, ArrowRight, CheckCircle2, Flag, 
  TrendingUp, Clock, BarChart3, FolderKanban, ExternalLink, CheckCircle
} from 'lucide-react';
import Confetti from 'react-confetti';
import { Player } from '@lottiefiles/react-lottie-player';
import trophyAnimation from '../../assets/lottie/Trophy.json';
import conversationAnimation from '../../assets/lottie/Conversation.json';

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
    description: 'Diseño de experiencia interactiva y plataforma digital personalizada.',
    progressPercent: 75,
    currentPhase: 3,
    estimatedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
  };

  const totalCredits = referralData.totalCredits || 0;
  const referrals = referralData.referrals || [];
  const convertedCount = referrals.filter(r => r.status === 'converted').length || 0;
  const negotiatingCount = referrals.filter(r => r.status === 'negotiating' || r.status === 'contacted').length || 0;
  const totalReferrals = referrals.length || 0;
  const clientName = user?.companyName || user?.name || 'Tahara Café';

  const phaseNames = ['', 'Análisis', 'Diseño', 'Revisión', 'Desarrollo', 'Lanzamiento', 'Activo'];
  const currentPhaseName = phaseNames[activeProject.currentPhase] || 'Desarrollo';

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="bars-loader"><div></div><div></div><div></div></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {activeProject && activeProject.currentPhase === 6 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />
        </div>
      )}
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user?.logoUrl ? (
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fff', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <img src={user.logoUrl} alt="Logo de la empresa" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #00C4CC 0%, #004953 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 700, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              {user?.companyName ? user.companyName.charAt(0).toUpperCase() : (user?.name ? user.name.charAt(0).toUpperCase() : 'C')}
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: '28px', fontWeight: 800, color: '#111827', letterSpacing: '-0.015em', margin: '0 0 4px 0' }}>
              Bienvenido, {user?.name ? user.name.split(' ')[0] : 'Cliente'}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Aquí tienes el resumen de tu operación.
            </p>
          </div>
        </div>

        {/* Main Project Card - HIGHEST PRIORITY */}
        <div id="tour-active-project" className="card" style={{ padding: '32px', borderTop: '4px solid #00C4CC' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '48px' }}>
            <div style={{ flex: '1 1 auto', maxWidth: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FolderKanban size={18} color="#00C4CC" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#00C4CC', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Tu proyecto activo</span>
                {activeProject.currentPhase === 6 ? (
                  <span className="badge badge-green" style={{ fontSize: '11px' }}>Completado</span>
                ) : (
                  <span className="badge badge-cyan" style={{ fontSize: '11px' }}>En desarrollo</span>
                )}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 24px 0' }}>
                {activeProject.name}
              </h2>

              {/* Dynamic Phase Message */}
              {activeProject.currentPhase !== 6 && (
                <div style={{ padding: '16px', background: '#F3F4F6', borderRadius: '8px', borderLeft: '4px solid #7B2FBE', display: 'inline-block' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
                    {activeProject.currentPhase === 1 && "Estamos dando el primer paso en tu proyecto."}
                    {activeProject.currentPhase === 2 && "Estamos trabajando paso a paso en el diseño de tu página."}
                    {activeProject.currentPhase === 3 && "¡Tómate un tiempo para revisar el avance!"}
                    {activeProject.currentPhase === 4 && "Estamos afinando los últimos detalles en el desarrollo."}
                    {activeProject.currentPhase === 5 && "Estamos afinando los últimos detalles. El próximo paso es el lanzamiento."}
                  </p>
                  <p style={{ fontSize: '13px', color: '#4B5563', margin: 0 }}>
                    {activeProject.currentPhase === 3 && "Por favor revisa el proyecto y déjanos tus comentarios para poder avanzar."}
                  </p>
                </div>
              )}
            </div>
            
            {activeProject.currentPhase === 3 && activeProject.previewUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '-4px' }}>
                <div style={{ width: '400px', height: '240px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #E5E7EB', background: '#F3F4F6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '8px' }}>
                  <iframe 
                    src={activeProject.previewUrl} 
                    style={{ width: '1600px', height: '960px', transform: 'scale(0.25)', transformOrigin: 'top left', border: 'none', pointerEvents: 'none' }}
                    title="Vista previa del sitio"
                  />
                </div>
                <Link to="/project" state={{ scrollTo: 'revision' }} className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center', width: '400px', fontSize: '13px' }}>
                  Ver diseño completo <ArrowRight size={14} style={{ marginLeft: '6px' }}/>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', marginLeft: 'auto' }}>
                <Link to="/project" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                  Ver detalles del proyecto <ArrowRight size={16} style={{ marginLeft: '6px' }}/>
                </Link>
              </div>
            )}
          </div>
          {activeProject.currentPhase === 6 && (
            <div style={{ width: '100%', padding: '32px 40px', background: '#111827', borderRadius: '12px', border: '1px solid #374151', marginBottom: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '40px', color: '#fff' }}>
              
              <div style={{ flexShrink: 0, width: 160, height: 160 }}>
                <Player autoplay loop src={trophyAnimation} style={{ width: '160px', height: '160px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', maxWidth: '600px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={24} color="#00C4CC" /> ¡Hemos terminado al 100% con tu proyecto!
                </h3>
                <p style={{ fontSize: '15px', color: '#D1D5DB', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  Tu proyecto está completamente desplegado y activo. Nos encantó trabajar contigo y esperamos que a ti también. Para cualquier proyecto adicional, no dudes en contactarnos.
                </p>
                <p style={{ fontSize: '15px', color: '#D1D5DB', margin: 0, lineHeight: 1.6 }}>
                  Recuerda que puedes usar tus puntos HummingX en cualquier momento, ¡solo escríbenos por WhatsApp y dinos en qué te gustaría usarlos!
                </p>
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
            <div className="progress-track" style={{ height: '16px', background: '#E5E7EB' }}>
              <div className="progress-fill" style={{ width: `${activeProject.progressPercent}%`, background: 'linear-gradient(90deg, #00C4CC, #7B2FBE)' }} />
            </div>
          </div>
        </div>

        {/* 4 KPI Stat Cards */}
        <div className={activeProject.currentPhase === 6 ? 'stats-grid-2' : 'stats-grid-4'}>
          {activeProject.currentPhase !== 6 && (
            <>
              <div className="stat-card">
                <div className="stat-label">
                  <BarChart3 size={16} color="#6B7280" /> Estado del Proyecto
                </div>
                <div className="stat-value">A tiempo</div>
                <div className="stat-trend up">
                  <TrendingUp size={14} /> Avanzando según lo planeado
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">
                  <Rocket size={16} color="#6B7280" /> Siguiente Hito
                </div>
                <div className="stat-value" style={{ fontSize: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {phaseNames[activeProject.currentPhase + 1] || 'Entrega Final'}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Próximamente</div>
              </div>
            </>
          )}

          <div id="tour-credits" className="stat-card">
            <div className="stat-label">
              <CreditCard size={16} color="#6B7280" /> Créditos HX
            </div>
            <div className="stat-value">${totalCredits.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Disponibles para canje</div>
          </div>

          <div id="tour-referrals" className="stat-card">
            <div className="stat-label">
              <Users size={16} color="#6B7280" /> Referidos
            </div>
            <div className="stat-value">{totalReferrals}</div>
            <div className={`stat-trend ${convertedCount > 0 ? 'up' : ''}`} style={{ color: convertedCount === 0 ? '#6B7280' : undefined }}>
              <CheckCircle2 size={14} /> {convertedCount} convertidos
            </div>
          </div>
        </div>

        {/* Two Bottom Cards */}
        <div className="stats-grid-2" style={{ alignItems: 'start' }}>

          {/* Activity Log */}
          <div id="tour-activity" className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Actividad reciente
              </h3>
              <Link to="/project" style={{ fontSize: '13px', fontWeight: 500, color: '#0E7490', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver todo <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {(!activeProject.activities || activeProject.activities.length === 0) ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                  Tu proyecto fue creado exitosamente. Estamos configurando tu entorno de trabajo.
                </div>
              ) : (
                activeProject.activities.map((activity, i) => (
                  <div key={activity.id || i} style={{ 
                    display: 'flex', alignItems: 'flex-start', gap: '12px', 
                    padding: '12px 0',
                    borderBottom: i < activeProject.activities.length - 1 ? '1px solid #F3F4F6' : 'none' 
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C4CC', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{activity.description}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {new Date(activity.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} a las {new Date(activity.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="tour-recommendations" className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Tus recomendaciones
              </h3>
              <Link to="/referrals" style={{ fontSize: '13px', fontWeight: 500, color: '#0E7490', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver todo <ArrowRight size={14} />
              </Link>
            </div>

            {totalReferrals === 0 ? (
              <div style={{ padding: '32px 0 16px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Player autoplay loop src={conversationAnimation} style={{ width: '200px', height: '200px', marginBottom: '16px', marginTop: '-40px' }} />
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 20px', maxWidth: '320px' }}>
                  Aún no tienes ninguna recomendación. Recomienda a una empresa para obtener recompensas.
                </p>
                <Link to="/referrals" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '13px' }}>
                  Recomendar ahora
                </Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{convertedCount}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Convertidas</div>
                  </div>
                  <div style={{ padding: '16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{negotiatingCount}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>En negociación</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Créditos acumulados</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>${totalCredits.toLocaleString()} HX</div>
                  </div>
                  <Link to="/referrals" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '13px' }}>
                    Ir a Referidos
                  </Link>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </Layout>
  );
}
