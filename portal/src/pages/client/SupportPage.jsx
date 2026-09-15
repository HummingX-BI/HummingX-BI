import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { 
  HelpCircle, 
  MessageCircle, 
  FileEdit, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2, 
  X,
  ShieldCheck
} from 'lucide-react';

const FAQS = [
  {
    q: '¿Cómo reporto un cambio urgente en mi plataforma?',
    a: 'Puedes utilizar la opción "Solicitar un cambio" o escribir directamente por el canal de WhatsApp prioritario. Las solicitudes de contenido se procesan en un plazo promedio de 24 horas hábiles.'
  },
  {
    q: '¿Cómo se aplican mis Créditos HX en nuevos requerimientos?',
    a: 'Tus Créditos HX tienen una paridad 1:1 con el valor monetario base. Al solicitar una nueva función o módulo, simplemente indícanos que deseas aplicar tu saldo disponible.'
  },
  {
    q: '¿Qué cubre el acuerdo de nivel de servicio (SLA)?',
    a: 'Como cliente HummingX Partner cuentas con garantía de primera respuesta técnica en menos de 2 horas hábiles para incidencias y disponibilidad de asesoría estratégica continua.'
  }
];

export default function SupportPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'change' | 'incident' | 'feature' | 'message'
  const [formSent, setFormSent] = useState(false);
  const [ticketText, setTicketText] = useState('');

  const handleSendTicket = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setActiveModal(null);
      setTicketText('');
    }, 1500);
  };

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header with Live SLA Availability */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Acompañamiento Directo
              </span>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00C4CC' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>
                SLA PARTNER
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>
              Centro de Asistencia & Soporte
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Tu equipo de ingeniería y consultoría está disponible para atender cualquier requerimiento con agilidad y transparencia.
            </p>
          </div>

          {/* Live SLA Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ position: 'relative', width: '10px', height: '10px' }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10B981', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span style={{ position: 'relative', display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Equipo Activo
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', fontFamily: "'Space Grotesk', sans-serif" }}>
                Respuesta promedio: &lt; 2 hrs
              </span>
            </div>
          </div>
        </header>

        {/* 4 Core Action Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Option 1: Hablar con HummingX */}
          <div className="glass-card glass-card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 196, 204, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C4CC' }}>
                  <MessageCircle size={22} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', background: '#F1F5F9', padding: '3px 10px', borderRadius: '9999px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  INMEDIATO
                </span>
              </div>

              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                Hablar con HummingX
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Conversación directa con tu asesor técnico para despejar dudas puntuales, revisar avances o consultas operativas.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href="https://wa.me/525575084267?text=Hola%20HummingX%2C%20necesito%20asistencia%20con%20mi%20cuenta"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', padding: '10px' }}
              >
                <MessageCircle size={15} />
                <span>Abrir chat por WhatsApp</span>
              </a>
              <button 
                onClick={() => setActiveModal('message')}
                className="btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', padding: '10px' }}
              >
                <span>Mensaje en plataforma</span>
              </button>
            </div>
          </div>

          {/* Option 2: Solicitar un cambio */}
          <div className="glass-card glass-card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(10, 88, 163, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3' }}>
                  <FileEdit size={22} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '3px 10px', borderRadius: '9999px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  24 HRS HÁBILES
                </span>
              </div>

              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                Solicitar un cambio
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                ¿Necesitas actualizar textos, fotos de productos, precios o ajustes en lo publicado de tu plataforma?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setActiveModal('change')}
                className="btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', padding: '10px' }}
              >
                <FileEdit size={15} color="#0A58A3" />
                <span>Solicitar cambio de contenido</span>
              </button>
              <span style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Revisión estimada en 24 hrs hábiles
              </span>
            </div>
          </div>

          {/* Option 3: Reportar un problema */}
          <div className="glass-card glass-card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                  <AlertTriangle size={22} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: '9999px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  PRIORIDAD ALTA
                </span>
              </div>

              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                Reportar un problema
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Si algo no responde correctamente en tu catálogo web o menú digital, nuestro equipo lo resolverá con prioridad.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setActiveModal('incident')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <AlertTriangle size={15} color="#00C4CC" />
                <span>Reportar incidencia técnica</span>
              </button>
              <span style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Garantía de respuesta SLA HummingX
              </span>
            </div>
          </div>

          {/* Option 4: Proponer nueva función (Midnight Purple) */}
          <div className="midnight-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
            {/* Cyan glow */}
            <div style={{
              position: 'absolute',
              right: '-30px',
              top: '-30px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 196, 204, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E5FF' }}>
                  <Sparkles size={22} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#00E5FF', background: 'rgba(0, 196, 204, 0.15)', padding: '3px 10px', borderRadius: '9999px', fontFamily: "'Space Grotesk', sans-serif" }}>
                  FINANCIABLE 100% HX
                </span>
              </div>

              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>
                Proponer nueva función
              </h2>
              <p style={{ fontSize: '13px', opacity: 0.85, lineHeight: 1.5, margin: 0 }}>
                ¿Tienes una nueva idea comercial para tu negocio? Cuéntanosla y evaluamos su alcance. Puedes cubrirla con tus Créditos HX.
              </p>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <button 
                onClick={() => setActiveModal('feature')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: '#FFFFFF',
                  color: '#230E38',
                  fontWeight: 700,
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span>Proponer funcionalidad</span>
              </button>
            </div>
          </div>

        </section>

        {/* FAQs Accordion Section */}
        <section style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '28px 32px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
              Preguntas frecuentes
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Dudas comunes sobre el acompañamiento y operación de tu cuenta.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  style={{
                    borderRadius: '10px',
                    border: '1px solid #F1F5F9',
                    background: isOpen ? '#F8FAFC' : '#FFFFFF',
                    overflow: 'hidden',
                    borderLeft: isOpen ? '3px solid #00C4CC' : '1px solid #F1F5F9'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={18} color="#00C4CC" /> : <ChevronDown size={18} color="#94A3B8" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 18px 16px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Generic Ticket Modal */}
        {activeModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '460px', padding: '28px', background: '#FFFFFF', position: 'relative' }}>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                {activeModal === 'change' && 'Solicitar cambio de contenido'}
                {activeModal === 'incident' && 'Reportar incidencia técnica'}
                {activeModal === 'feature' && 'Proponer nueva funcionalidad'}
                {activeModal === 'message' && 'Enviar mensaje al equipo'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
                Describe los detalles a continuación y tu asesor asignado te dará seguimiento.
              </p>

              {formSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>¡Solicitud enviada con éxito!</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Ticket registrado bajo tu cuenta.</div>
                </div>
              ) : (
                <form onSubmit={handleSendTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea 
                    required
                    rows={4}
                    value={ticketText}
                    onChange={e => setTicketText(e.target.value)}
                    placeholder="Describe aquí lo que necesitas..."
                    className="hx-input"
                    style={{ resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary" style={{ flex: 1 }}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                      Enviar requerimiento
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
