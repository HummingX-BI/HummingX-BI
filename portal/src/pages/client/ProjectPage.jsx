import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Check, Clock, Calendar, FileText, ExternalLink, 
  ShieldCheck, Layers, MessageCircle, Construction, CheckCircle, Activity, CheckCircle2, X
} from 'lucide-react';
import ProgressTicks from '../../components/ProgressTicks';

const Pin = ({ className, style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const PHASE_TITLES = {
  1: 'Iniciamos la fase de Análisis',
  2: 'Entramos a la etapa de Diseño',
  3: 'Comenzamos la etapa de Revisión',
  4: 'Avanzamos a la etapa de Desarrollo',
  5: 'Llegamos a la etapa de Lanzamiento',
  6: 'Proyecto Completado'
};

const ROADMAP_BASE = [
  { num: 1, title: 'Análisis', subtitle: 'Objetivos y alcance' },
  { num: 2, title: 'Diseño', subtitle: 'Identidad visual y flujos' },
  { num: 3, title: 'Revisión', subtitle: 'Validación conjunta' },
  { num: 4, title: 'Desarrollo', subtitle: 'Construcción interactiva' },
  { num: 5, title: 'Lanzamiento', subtitle: 'Publicación al público' },
];

export default function ProjectPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [designApproved, setDesignApproved] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  
  const revisionRef = useRef(null);

  useEffect(() => {
    if (!loading && project && revisionRef.current) {
      if (project.currentPhase === 3 || location.state?.scrollTo === 'revision') {
        setTimeout(() => {
          revisionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [loading, project, location.state]);

  useEffect(() => {
    api.get('/projects/my')
      .then(res => {
        const active = res.data.find(p => p.status === 'active') || res.data[0];
        setProject(active || null);
        if (active) {
          const phase = active.currentPhase || 1;
          const storageKey = `hx_celebrated_phase_${active.id}_${phase}`;
          if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, 'true');
            setCelebrationActive(true);
            setTimeout(() => setCelebrationActive(false), 3900);
          }
        }
      })
      .catch(() => {
        setProject(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div className="bars-loader"><div></div><div></div><div></div></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="fade-in-up card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Layers size={32} color="#9CA3AF" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Aún no tienes un proyecto activo</h2>
          <p style={{ fontSize: '16px', color: '#6B7280', margin: '0 0 32px', maxWidth: '400px', lineHeight: 1.5 }}>
            Estamos preparando todo tu entorno de trabajo. Cuando tu proyecto esté configurado, aparecerá aquí todo el panel de seguimiento.
          </p>
        </div>
      </Layout>
    );
  }

  const progress = project?.progressPercent ?? 0;
  const currentPhaseNum = project?.currentPhase ?? 1;

  const ROADMAP_STEPS = ROADMAP_BASE.map(step => ({
    ...step,
    status: step.num < currentPhaseNum ? 'completed' : step.num === currentPhaseNum ? 'active' : 'pending'
  }));

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Hero / Project Header Card */}
        <div id="tour-project-header" className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '24px', flexWrap: 'wrap' }}>
            
            {/* Lado Izquierdo: Información del proyecto y botones de aprobación */}
            <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '280px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {project?.currentPhase !== 6 && (
                    <span className="badge badge-cyan">En ejecución</span>
                  )}
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {project?.clientName || user?.companyName || user?.name || 'Cliente'} · Proyecto Digital
                  </span>
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 10px 0' }}>
                  {project?.name || 'Sin título'}
                </h1>
                {project?.description && (
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                    {project?.description}
                  </p>
                )}
                
                {/* Approve Buttons (solo durante la fase 3 de Revisión) */}
                {(project?.currentPhase === 3 && (project?.designStatus === 'pending' || project?.designStatus === 'modifications_resolved' || project?.designStatus === 'modifications_requested' || project?.designStatus === 'approved' || designApproved)) && (
                  <div style={{ marginTop: '16px', background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                      Por favor revisa el diseño en el enlace de la derecha. Si tienes comentarios, solicítalos. Si todo está perfecto, aprueba el diseño para avanzar a Desarrollo.
                    </p>
                    
                    {project.designStatus === 'approved' || designApproved ? (
                      <div style={{ padding: '10px 14px', background: '#D1FAE5', color: '#065F46', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} color="#059669" />
                        Diseño aprobado. Preparando desarrollo.
                      </div>
                    ) : project.designStatus === 'modifications_requested' ? (
                      <div style={{ padding: '10px 14px', background: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="#D97706" />
                        Modificaciones solicitadas.
                      </div>
                    ) : (
                      <>
                        {project.designStatus === 'modifications_resolved' && (
                          <div style={{ padding: '10px 14px', background: '#E0E7FF', color: '#3730A3', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <CheckCircle2 size={16} color="#4338CA" />
                            Cambios listos, por favor revisa de nuevo.
                          </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          <button 
                            onClick={async () => {
                              setDesignApproved(true);
                              await api.put(`/projects/${project.id}/design-status`, { designStatus: 'approved' }).catch(console.error);
                              setProject(prev => ({ ...prev, designStatus: 'approved' }));
                            }}
                            style={{ background: '#00C4CC', color: '#111827', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <CheckCircle2 size={14} /> Aprobar diseño
                          </button>
                          <a 
                            href="https://wa.me/525575084267?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20algunas%20modificaciones%20al%20dise%C3%B1o%20de%20mi%20proyecto." 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={async () => {
                              await api.put(`/projects/${project.id}/design-status`, { designStatus: 'modifications_requested' }).catch(console.error);
                              setProject(prev => ({ ...prev, designStatus: 'modifications_requested' }));
                            }}
                            style={{ background: 'transparent', color: '#374151', border: '1px solid #D1D5DB', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            Solicitar modificaciones
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Lado Derecho: solo en fase 3 (Revisión) con previewUrl */}
            {project?.currentPhase === 3 && project?.previewUrl && (
              <div ref={revisionRef} style={{ flex: '1 1 440px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minWidth: '300px' }}>
                <div className="browser-mockup" style={{ width: '100%', maxWidth: '480px' }}>
                  <div className="browser-mockup-header">
                    <div className="browser-mockup-dots">
                      <span className="browser-mockup-dot red"></span>
                      <span className="browser-mockup-dot yellow"></span>
                      <span className="browser-mockup-dot green"></span>
                    </div>
                    <div className="browser-mockup-address">
                      <ExternalLink size={10} style={{ opacity: 0.6 }} />
                      <span>{project.previewUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                  </div>
                  <div className="browser-mockup-body" style={{ height: '260px' }}>
                    <iframe 
                      src={project.previewUrl} 
                      title="Vista previa del sitio"
                    />
                  </div>
                </div>
                <a 
                  href={project.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary" 
                  style={{ textDecoration: 'none', justifyContent: 'center', width: '100%', maxWidth: '480px', fontSize: '13.5px', padding: '10px 16px' }}
                >
                  Ver diseño completo <ExternalLink size={15} style={{ marginLeft: '6px' }} />
                </a>
              </div>
            )}

          </div>

          {/* Progress Bar (A TODO LO ANCHO DE LA CARD - NUNCA DIVIDIDA) */}
          <div 
            style={{ 
              background: '#F9FAFB', 
              padding: '20px 24px', 
              borderRadius: '12px', 
              border: '1px solid #E5E7EB', 
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Overlay blanco del tamaño completo de la card que entra de izquierda a derecha y se desvanece */}
            {celebrationActive && (
              <div className="stage-announcement-overlay">
                <div className="stage-announcement-text">
                  <span className="stage-announcement-dot" />
                  <span>{PHASE_TITLES[currentPhaseNum] || 'Entramos a una nueva etapa'}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Avance general del proyecto</span>
                {currentPhaseNum <= 5 ? (
                  <span style={{ fontSize: '12px', color: '#6B7280', background: '#E5E7EB', padding: '2px 8px', borderRadius: '99px' }}>
                    Fase {currentPhaseNum} de 5
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '99px' }}>
                    Completado
                  </span>
                )}
              </div>
              <span style={{ fontSize: '26px', fontWeight: 800, color: '#00C4CC' }}>{progress}%</span>
            </div>
            <ProgressTicks value={progress} />
          </div>

        </div>

        {/* Timeline Stepper */}
        <div id="tour-project-timeline" className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Ruta de trabajo</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Desde la conceptualización hasta el lanzamiento.</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Metodología HummingX</span>
          </div>

          {/* Timeline Stepper (Post-its) */}
          <div style={{ position: 'relative', marginTop: '24px', zIndex: 0 }}>


            <div className="custom-scrollbar" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '12px', paddingBottom: '24px', paddingTop: '10px', position: 'relative', zIndex: 1, scrollSnapType: 'x mandatory' }}>
              {ROADMAP_STEPS.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isActive = step.status === 'active';
                
                const bgColors = {
                  completed: '#F3E8FF', // Morado claro
                  active: '#CFFAFE', // Cyan claro
                  pending: '#F9FAFB' // Gris claro
                };
                const textColors = {
                  completed: '#6B21A8',
                  active: '#0E7490',
                  pending: '#6B7280'
                };
                const borderColors = {
                  completed: '#D8B4FE',
                  active: '#A5F3FC',
                  pending: '#E5E7EB'
                };
                const pinColors = {
                  completed: '#A855F7',
                  active: '#00C4CC',
                  pending: '#9CA3AF'
                };
                
                // Alternating rotation for the post-it effect
                const rotations = ['rotate(-2deg)', 'rotate(2deg)', 'rotate(-1.5deg)', 'rotate(2.5deg)', 'rotate(-3deg)'];
                const rotate = rotations[idx % rotations.length];

                return (
                  <div key={step.num} className="post-it-wrapper" style={{ transform: rotate, minWidth: '195px', flex: '1 0 auto', scrollSnapAlign: 'start' }}>
                    <div className="post-it-container" style={{ minHeight: '190px' }}>
                      <div className="post-it-pin">
                        <Pin style={{ color: pinColors[step.status], width: '28px', height: '28px', transform: 'translateY(-4px)' }} />
                      </div>
                      <div className="post-it-content" style={{ backgroundColor: bgColors[step.status], borderColor: borderColors[step.status], color: textColors[step.status] }}>
                        <span className="post-it-num" style={{ opacity: 0.5 }}>0{step.num}</span>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', lineHeight: 1.2 }}>{step.title}</h3>
                        <p style={{ fontSize: '13px', opacity: 0.8, margin: '0 0 20px', lineHeight: 1.4 }}>{step.subtitle}</p>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '4px 8px', background: 'rgba(255,255,255,0.7)', borderRadius: '999px', width: 'fit-content', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          {isDone ? <Check size={14} /> : isActive ? <Clock size={14} /> : <Calendar size={14} />}
                          {isDone ? 'Listo' : isActive ? 'En curso' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Completion Banner */}
        {project?.currentPhase === 6 && (
          <div className="card fade-in-up" style={{ position: 'relative', overflow: 'hidden', width: '100%', marginBottom: '24px', padding: '40px', textAlign: 'center', background: '#0b0b0e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}>
            
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '280px', height: '280px', background: 'rgba(0,196,204,0.15)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '280px', height: '280px', background: 'rgba(75,29,111,0.25)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none', zIndex: 0 }}></div>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle size={48} color="#00C4CC" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.02em', color: '#fff' }}>
                ¡Hemos terminado al 100% con tu proyecto!
              </h2>
              <p style={{ fontSize: '16px', color: '#D1D5DB', margin: '0 auto 24px', maxWidth: '600px', lineHeight: 1.6 }}>
                Tu proyecto está completamente desplegado y activo. Nos encantó trabajar contigo y esperamos que a ti también. Para cualquier proyecto adicional, no dudes en contactarnos.
              </p>
            <a href="https://wa.me/525575084267" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', background: '#00C4CC', color: '#111827', border: 'none', padding: '12px 24px', fontSize: '15px', fontWeight: 700, borderRadius: '8px' }}>
              <MessageCircle size={18} /> Contactar a Soporte
            </a>
            </div>
          </div>
        )}

        {/* Two Detail Cards */}
        {project?.currentPhase !== 6 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Active Stage */}
          <div id="tour-active-stage" className="card" style={{ padding: '24px', borderTop: '3px solid #00C4CC', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Construction size={16} color="#0E7490" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0E7490', textTransform: 'uppercase' }}>
                {project?.currentPhase === 6 ? 'Proyecto Terminado' : 'Etapa en curso'}
              </span>
              <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: '11px' }}>Al día</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              {project?.currentPhase === 6 ? '100% Desplegado' : (project?.currentStageTitle || (() => {
                const activeStep = ROADMAP_STEPS.find(s => s.status === 'active') || ROADMAP_STEPS[ROADMAP_STEPS.length - 1];
                return activeStep.title;
              })())}
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 16px' }}>
              {project?.currentPhase === 6 ? 'Hemos terminado al 100% tu proyecto. Ya está listo para usarse.' : (project?.currentStageDescription || (() => {
                const activeStep = ROADMAP_STEPS.find(s => s.status === 'active') || ROADMAP_STEPS[ROADMAP_STEPS.length - 1];
                const messages = {
                  'Análisis': 'Nuestro equipo está evaluando paso a paso el contexto de tu negocio y modelo de operación para ofrecerte la solución ideal.',
                  'Diseño': 'Nuestro equipo está diseñando y estructurando paso a paso las pantallas y flujos de tu nueva plataforma.',
                  'Revisión': 'Hemos terminado una versión de tu proyecto. Necesitamos que lo revises a detalle y nos compartas tus observaciones o si necesitas alguna modificación.',
                  'Desarrollo': 'Estamos plasmando todas tus ideas y los diseños aprobados en código para hacer realidad tu proyecto.',
                  'Lanzamiento': 'Estamos afinando los últimos detalles y configurando servidores para que tu proyecto vea la luz.'
                };
                return messages[activeStep.title] || 'Ajustando los últimos detalles para la entrega final.';
              })())}
            </p>
            {(() => {
              const activeStep = ROADMAP_STEPS.find(s => s.status === 'active') || ROADMAP_STEPS[ROADMAP_STEPS.length - 1];
              if (activeStep.title === 'Revisión') {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ background: '#F0FDF4', padding: '14px 16px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534', lineHeight: 1.5, display: 'block' }}>
                        ¡Revisión lista! Puedes revisar la vista previa arriba y enviarnos tu aprobación o comentarios por WhatsApp para continuar.
                      </span>
                    </div>
                    
                    <div>
                      <a 
                        href="https://wa.me/525575084267?text=Hola%20HummingX%2C%20ya%20revisé%20el%20avance%20de%20mi%20proyecto." 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-secondary" 
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, padding: '10px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', width: '100%', textDecoration: 'none' }}
                      >
                        <MessageCircle size={16} /> Validar por WhatsApp
                      </a>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block' }}>Entrega estimada:</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  {project?.estimatedDelivery ? new Date(project.estimatedDelivery).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }) : '18 de septiembre, 2024'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#0E7490', fontWeight: 500 }}>
                <ShieldCheck size={14} /> Supervisión HummingX
              </div>
            </div>
          </div>

          {/* Next Step */}
          <div id="tour-next-step" className="card" style={{ padding: '24px', background: '#F9FAFB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <Clock size={14} color="#6B7280" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                {project?.currentPhase === 6 ? 'Publicación Finalizada' : 'Próximo paso'}
              </span>
            </div>
            
            {(() => {
              if (project?.currentPhase === 6) {
                return (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>100% Finalizado</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                      Tu proyecto se encuentra activo y publicado.
                    </p>
                  </>
                );
              }
              const activeStep = ROADMAP_STEPS.find(s => s.status === 'active') || ROADMAP_STEPS[ROADMAP_STEPS.length - 1];
              if (activeStep.title === 'Análisis') {
                return (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Diseño</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                      Pronto vas a poder ver el diseño y estructura visual de tu página.
                    </p>
                  </>
                );
              } else if (activeStep.title === 'Diseño') {
                return (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Revisión</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                      Vas a poder revisar el avance interactivo del diseño y hacernos tus comentarios.
                    </p>
                  </>
                );
              } else if (activeStep.title === 'Revisión') {
                return (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Desarrollo</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                      Una vez aprobado el diseño, vamos a codificar y desarrollar todas las funciones de tu página.
                    </p>
                  </>
                );
              } else if (activeStep.title === 'Desarrollo') {
                return (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Lanzamiento</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                      Vamos a planear el lanzamiento oficial de tu proyecto, configurando los servidores y dominios.
                    </p>
                  </>
                );
              } else if (activeStep.title === 'Lanzamiento') {
                return (
                  <>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>¡Página desplegada y lista!</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 20px' }}>
                      El próximo paso es entregar el proyecto activo y en producción.
                    </p>
                  </>
                );
              }
              return null;
            })()}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <a href="https://wa.me/525575084267" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', background: '#111827', color: '#fff', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', width: '100%', justifyContent: 'center' }}>
                <MessageCircle size={16} /> ¿Tienes dudas? Contáctanos
              </a>
            </div>
            </div>
          </div>
        )}

        {/* Deliverables */}
        <div id="entregables" className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Entregables importantes</h2>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Documentos y archivos clave de tu solución.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[
              { 
                title: 'Cotización de Servicios', 
                desc: project?.quoteLink ? 'Propuesta económica, alcance y tiempos.' : 'Aún no está listo, tu administrador lo agregará muy pronto para que lo tengas disponible.', 
                type: 'DOCUMENTO', 
                icon: FileText, 
                iconColor: project?.quoteLink ? '#00C4CC' : '#9CA3AF',
                link: project?.quoteLink,
                isPending: !project?.quoteLink
              },
              { 
                title: 'Contrato de Servicios', 
                desc: project?.contractLink ? 'Acuerdos legales, propiedad intelectual y SLA.' : 'Aún no está listo, tu administrador lo agregará muy pronto para que lo tengas disponible.', 
                type: 'LEGAL', 
                icon: ShieldCheck, 
                iconColor: project?.contractLink ? '#059669' : '#9CA3AF',
                typeColor: project?.contractLink ? '#059669' : '#6B7280', 
                typeBg: project?.contractLink ? '#ECFDF5' : '#F3F4F6',
                link: project?.contractLink,
                isPending: !project?.contractLink
              }
            ].map((doc, i) => (
              <div key={i} style={{ padding: '20px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <doc.icon size={18} color={doc.iconColor} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 8px', background: doc.typeBg || '#F3F4F6', borderRadius: '9999px', color: doc.typeColor || '#6B7280' }}>
                      {doc.type}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: doc.isPending ? '#6B7280' : '#111827', margin: '0 0 6px' }}>{doc.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{doc.desc}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                  {doc.isPending ? (
                    <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>Pendiente</span>
                  ) : (
                    <a href={doc.link} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px', color: '#0E7490', textDecoration: 'none', background: '#ECFEFF', borderRadius: '6px' }}>
                      <ExternalLink size={14} style={{ marginRight: '4px' }} /> Ver documento
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bitácora / Activities (Horizontal Full Width) */}
        {project?.activities && project.activities.length > 0 && (
          <div id="tour-bitacora" className="card" style={{ padding: '28px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#6B7280" /> Bitácora de Desarrollo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {project.activities.map(act => {
                const dateObj = new Date(act.createdAt);
                const monthStr = dateObj.toLocaleDateString('es-ES', { month: 'short' }).substring(0, 3).toUpperCase();
                const dayNum = dateObj.getDate();
                const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ 
                      width: '46px', height: '52px', background: '#F9FAFB', borderRadius: '8px', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      flexShrink: 0, border: '1px solid #E5E7EB' 
                    }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>{monthStr}</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', lineHeight: 1, marginTop: '2px' }}>{dayNum}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{act.description}</div>
                      <div style={{ fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Fase del proyecto</span>
                        <span style={{ color: '#D1D5DB' }}>•</span>
                        <span>{timeStr} hrs</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
