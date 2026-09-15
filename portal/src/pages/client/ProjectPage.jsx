import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  Rocket, 
  Check, 
  Clock, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Layers, 
  MessageCircle, 
  ArrowRight,
  CheckCircle2,
  Construction
} from 'lucide-react';

const ROADMAP_STEPS = [
  { num: 1, title: '1. Planeación', subtitle: 'Objetivos y alcance', status: 'completed' },
  { num: 2, title: '2. Diseño', subtitle: 'Identidad visual y flujos', status: 'completed' },
  { num: 3, title: '3. Desarrollo', subtitle: 'Construcción interactiva', status: 'active' },
  { num: 4, title: '4. Revisión', subtitle: 'Validación final conjunta', status: 'upcoming' },
  { num: 5, title: '5. Lanzamiento', subtitle: 'Publicación al público', status: 'pending' },
];

export default function ProjectPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/my')
      .then(res => {
        const active = res.data.find(p => p.status === 'active') || res.data[0];
        setProject(active || {
          name: 'Página Web + Menú Digital',
          description: 'Estamos diseñando y desarrollando la nueva experiencia digital interactiva para Tahara Café, pensada para cautivar a tus clientes desde cualquier dispositivo.',
          progressPercent: 75,
          currentPhase: 3,
          estimatedDelivery: '18 de septiembre, 2024'
        });
      })
      .catch(() => {
        setProject({
          name: 'Página Web + Menú Digital',
          description: 'Estamos diseñando y desarrollando la nueva experiencia digital interactiva para Tahara Café, pensada para cautivar a tus clientes desde cualquier dispositivo.',
          progressPercent: 75,
          currentPhase: 3,
          estimatedDelivery: '18 de septiembre, 2024'
        });
      })
      .finally(() => setLoading(false));
  }, []);

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

  const progress = project?.progressPercent ?? 75;

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Hero & Overview Header */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          boxShadow: '0 2px 12px -2px rgba(15, 23, 42, 0.04)'
        }}>
          {/* Ambient blur */}
          <div style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 196, 204, 0.12) 0%, rgba(10, 88, 163, 0.04) 70%, transparent 100%)',
            pointerEvents: 'none',
            filter: 'blur(30px)'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(0, 196, 204, 0.12)', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, color: '#00696E', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C4CC' }} />
                    Proyecto en Ejecución
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Tahara Café · Expansión Digital
                  </span>
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 10px 0' }}>
                  {project?.name || 'Página Web + Menú Digital'}
                </h1>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                  {project?.description || 'Estamos desarrollando tu solución digital personalizada para cautivar a tus clientes.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a 
                  href="https://wa.me/525575084267?text=Hola%20HummingX%2C%20quisiera%20consultar%20sobre%20mi%20proyecto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary" 
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                >
                  <MessageCircle size={16} color="#0A58A3" />
                  <span>Consultar con equipo</span>
                </a>
                <a 
                  href="#entregables" 
                  className="btn-primary" 
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                >
                  <FileText size={16} />
                  <span>Ver entregables</span>
                </a>
              </div>
            </div>

            {/* Progress Metric Band */}
            <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Avance general
                  </span>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    Fase 3 de 5 en marcha
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                    {progress}%
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>completado</span>
                </div>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0A58A3, #00C4CC)',
                  borderRadius: '9999px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

          </div>
        </section>

        {/* Interactive Visual Timeline (Ruta de trabajo) */}
        <section style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '28px 32px',
          boxShadow: '0 2px 12px -2px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                Ruta de trabajo
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Un recorrido claro desde la conceptualización hasta el estreno de tu plataforma.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Grotesk', sans-serif" }}>
              Metodología HummingX
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {ROADMAP_STEPS.map((step) => {
              const isDone = step.status === 'completed';
              const isActive = step.status === 'active';
              
              return (
                <div key={step.num} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: isDone ? '#0A58A3' : isActive ? '#00C4CC' : '#F1F5F9',
                      color: isDone || isActive ? '#FFFFFF' : '#94A3B8',
                      boxShadow: isActive ? '0 0 16px rgba(0, 196, 204, 0.45)' : 'none',
                      flexShrink: 0
                    }}>
                      {isDone ? <Check size={18} strokeWidth={3} /> : isActive ? <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF' }} /> : `0${step.num}`}
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: isDone ? '#0A58A3' : isActive ? '#008B91' : '#94A3B8'
                    }}>
                      {isDone ? 'Completado' : isActive ? 'Fase Actual' : 'Pendiente'}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: isDone || isActive ? '#0F172A' : '#64748B', margin: '0 0 2px 0' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Dual Focus: Etapa Actual & Próximo Paso */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Active Stage Card */}
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', borderTop: '4px solid #00C4CC' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(0, 196, 204, 0.12)', color: '#00696E', display: 'inline-flex' }}>
                    <Construction size={16} />
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00696E', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Etapa en curso
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '9999px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  Al día con el cronograma
                </span>
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                Desarrollo de la experiencia
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Nuestro equipo de ingeniería está construyendo la plataforma interactiva del menú digital para que tus comensales ordenen y exploren con total fluidez.
              </p>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                  Módulo prioritario en desarrollo
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  Catálogo digital de especialidad y pedidos en tiempo real
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Optimizando tiempos de respuesta y navegación táctil en smartphones.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Fecha estimada de entrega:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A58A3', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {project?.estimatedDelivery ? new Date(project.estimatedDelivery).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }) : '18 de septiembre, 2024'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00696E', fontWeight: 600 }}>
                <ShieldCheck size={16} color="#00C4CC" />
                Supervisión HummingX
              </div>
            </div>
          </div>

          {/* Next Step Card (Midnight Purple) */}
          <div className="midnight-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            {/* Ambient Cyan Glow */}
            <div style={{
              position: 'absolute',
              right: '-40px',
              top: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 196, 204, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '12px' }}>
                <Clock size={12} />
                Próximo paso
              </div>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                Revisión del diseño interactivo
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.85, lineHeight: '1.6', margin: '0 0 20px 0' }}>
                Pronto podrás explorar la siguiente versión funcional en vivo desde tu propio dispositivo y compartirnos tus observaciones para el lanzamiento.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <CheckCircle2 size={16} color="#00E5FF" />
                  <span>Navegación completa desde tu propio smartphone</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <CheckCircle2 size={16} color="#00E5FF" />
                  <span>Alineación final de precios, fotos y descripción de productos</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <a 
                href="https://wa.me/525575084267?text=Hola%20HummingX%2C%20estoy%20listo%20para%20la%20siguiente%20revisi%C3%B3n" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  background: '#FFFFFF',
                  color: '#230E38',
                  fontWeight: 700,
                  fontSize: '13px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <span>Agendar sesión de revisión</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

        </section>

        {/* Key Deliverables & Documents (Entregables importantes) */}
        <section id="entregables" style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '28px 32px',
          boxShadow: '0 2px 12px -2px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                Entregables importantes
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Acceso inmediato a los documentos estratégicos y archivos clave de tu solución.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#008B91', background: 'rgba(0, 196, 204, 0.1)', padding: '3px 10px', borderRadius: '9999px', fontFamily: "'Space Grotesk', sans-serif" }}>
              3 DOCUMENTOS DISPONIBLES
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* Deliverable 1 */}
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <FileText size={18} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', background: '#E2E8F0', borderRadius: '4px', color: '#475569' }}>
                    PDF
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Brief del proyecto
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  Objetivos comerciales, alcance acordado y visión de marca formalizada.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>1.2 MB</span>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Descargando Brief del proyecto...'); }} style={{ fontSize: '12px', fontWeight: 600, color: '#0A58A3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Descargar</span>
                  <Download size={13} />
                </a>
              </div>
            </div>

            {/* Deliverable 2 */}
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#784A9C', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <Layers size={18} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', background: 'rgba(0, 196, 204, 0.15)', borderRadius: '4px', color: '#00696E' }}>
                    APROBADO
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Diseño interactivo
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  Prototipo visual validado de la experiencia de usuario y presentación de la carta.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Figma / Web</span>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Abriendo prototipo interactivo...'); }} style={{ fontSize: '12px', fontWeight: 600, color: '#008B91', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Ver diseño</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Deliverable 3 */}
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', background: '#E2E8F0', borderRadius: '4px', color: '#475569' }}>
                    LEGAL
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Acuerdo & Contrato
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  Acuerdo de confidencialidad, garantías de propiedad intelectual y SLA de entrega.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>850 KB</span>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Descargando Contrato y Garantías...'); }} style={{ fontSize: '12px', fontWeight: 600, color: '#0A58A3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>Descargar</span>
                  <Download size={13} />
                </a>
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
}
