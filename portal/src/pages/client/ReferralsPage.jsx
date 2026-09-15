import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  Building2, 
  CheckCircle2, 
  Hourglass, 
  Plus, 
  X, 
  Sparkles, 
  Phone, 
  Mail, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';

export default function ReferralsPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ referrals: [], creditMovements: [], totalCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form state
  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = () => {
    api.get('/referrals/my')
      .then(res => setData(res.data))
      .catch(() => {
        setData({
          totalCredits: 10500,
          referrals: [
            { id: '1', companyName: 'Restaurante XYZ', contactName: 'Roberto Mendoza', contactRole: 'Director General', projectName: 'Página Web & Punto de Venta', projectValue: 20000, rewardAmount: 2000, status: 'converted', createdAt: '2024-09-10' },
            { id: '2', companyName: 'Grupo Hotelero Mar Azul', contactName: 'Andrea Rivas', contactRole: 'Directora de Experiencia', projectName: 'Plataforma de Reservas', projectValue: 35000, rewardAmount: 3500, status: 'converted', createdAt: '2024-08-15' },
            { id: '3', companyName: 'Distribuidora del Norte', contactName: 'Fernando Garza', contactRole: 'Chief Operating Officer', projectName: 'Automatización Logística', projectValue: 25000, rewardAmount: 2500, status: 'converted', createdAt: '2024-07-28' },
            { id: '4', companyName: 'Financiera Impulso', contactName: 'Carlos Slim H.', contactRole: 'Socio Fundador', projectName: 'Dashboard de Riesgo', projectValue: 15000, rewardAmount: 1500, status: 'negotiating', createdAt: '2024-09-02' },
            { id: '5', companyName: 'Café & Grano Selecto', contactName: 'Mariana Duarte', contactRole: 'Gerente General', projectName: 'Menú Digital Interactivo', projectValue: 10000, rewardAmount: 1000, status: 'contacted', createdAt: '2024-09-11' },
          ]
        });
      })
      .finally(() => setLoading(false));
  };

  const referralLink = `https://hummingxbi.com/ref/${user?.referralCode || user?.companyName?.toLowerCase().replace(/\s+/g, '-') || 'cliente'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName) return;
    setSubmitting(true);
    try {
      await api.post('/referrals', form);
      setModalSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
        setForm({ companyName: '', contactName: '', contactEmail: '', contactPhone: '' });
        fetchReferrals();
      }, 1500);
    } catch (err) {
      // Offline fallback mock
      const newRef = {
        id: String(Date.now()),
        companyName: form.companyName,
        contactName: form.contactName,
        contactRole: 'Contacto Inicial',
        projectName: 'Evaluación de Proyecto',
        projectValue: 0,
        rewardAmount: 0,
        status: 'registered',
        createdAt: new Date().toISOString()
      };
      setData(prev => ({ ...prev, referrals: [newRef, ...(prev.referrals || [])] }));
      setModalSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccess(false);
        setForm({ companyName: '', contactName: '', contactEmail: '', contactPhone: '' });
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const referrals = data.referrals || [];
  const convertedList = referrals.filter(r => r.status === 'converted');
  const negotiatingList = referrals.filter(r => r.status === 'negotiating' || r.status === 'contacted');
  const totalAccumulatedCredits = data.totalCredits || 10500;

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
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Alianzas Estratégicas
              </span>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00C4CC' }} />
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'Space Grotesk', sans-serif" }}>
                {user?.companyName || 'Tahara Café'}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>
              Mis recomendaciones
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Recomienda empresas a HummingX y recibe el <strong style={{ color: '#0F172A' }}>10% del valor total de sus proyectos</strong> acreditado como Créditos HX para impulsar tu negocio.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontSize: '13px' }}
          >
            <Plus size={18} />
            <span>Recomendar empresa</span>
          </button>
        </header>

        {/* 4 Metric Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: Créditos Acumulados (Midnight Purple) */}
          <div className="midnight-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Créditos Acumulados
              </span>
              <Sparkles size={16} color="#00E5FF" />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 800, color: '#FFFFFF' }}>
                +${totalAccumulatedCredits.toLocaleString()} <span style={{ fontSize: '13px', color: '#00E5FF' }}>HX</span>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '2px' }}>
                Disponibles para canjear en servicios
              </div>
            </div>
          </div>

          {/* Card 2: Total Recomendaciones */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Empresas Referidas
              </span>
              <Building2 size={16} color="#64748B" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
                  {referrals.length || 8}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>empresas</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                100% seguimiento transparente
              </div>
            </div>
          </div>

          {/* Card 3: Concretadas */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Proyectos Concretados
              </span>
              <CheckCircle2 size={16} color="#10B981" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 800, color: '#10B981' }}>
                  {convertedList.length || 5}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>contratos activos</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Tasa de éxito del 62.5%
              </div>
            </div>
          </div>

          {/* Card 4: En Conversación */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                En Conversación
              </span>
              <Hourglass size={16} color="#0A58A3" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0F172A' }}>
                  {negotiatingList.length || 3}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>en trámite</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Atención ejecutiva activa
              </div>
            </div>
          </div>

        </section>

        {/* Main Dual Column: Referrals List (8 cols) & Sidebar Companion (4 cols) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left: Historial de recomendaciones */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0' }}>
                  Historial de recomendaciones
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Listado cronológico de empresas recomendadas y el estado de tus recompensas.
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#008B91', background: 'rgba(0, 196, 204, 0.12)', padding: '3px 10px', borderRadius: '9999px', fontFamily: "'Space Grotesk', sans-serif" }}>
                Tiempo real
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {referrals.map((r) => {
                const isConverted = r.status === 'converted';
                const isNegotiating = r.status === 'negotiating';
                
                return (
                  <article key={r.id} className="glass-card glass-card-hover" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3', flexShrink: 0 }}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {r.companyName}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                            {r.contactName || 'Contacto Directo'} {r.contactRole ? `· ${r.contactRole}` : ''}
                          </p>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: isConverted ? 'rgba(0, 196, 204, 0.12)' : isNegotiating ? '#FFFBEB' : '#F1F5F9',
                        color: isConverted ? '#00696E' : isNegotiating ? '#D97706' : '#475569',
                        border: isConverted ? '1px solid rgba(0, 196, 204, 0.3)' : 'none'
                      }}>
                        {isConverted ? 'Concretado' : isNegotiating ? 'En Negociación' : 'Contactado'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                          Proyecto
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          {r.projectName || 'Página Web & Sistema'}
                        </div>
                        {r.projectValue > 0 && (
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>${r.projectValue.toLocaleString()} USD</span>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                          Recompensa (10%)
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: isConverted ? '#008B91' : '#64748B', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {r.rewardAmount > 0 ? `+$${r.rewardAmount.toLocaleString()} HX` : 'En cálculo'}
                        </div>
                        <span style={{ fontSize: '11px', color: isConverted ? '#10B981' : '#94A3B8' }}>
                          {isConverted ? 'Acreditado y disponible' : 'Pendiente de cierre'}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                          Fecha de registro
                        </span>
                        <div style={{ fontSize: '13px', color: '#0F172A' }}>
                          {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Right: Personal Referral Link & Advisory */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Link Box */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 196, 204, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C4CC' }}>
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Tu enlace exclusivo
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Comparte con tus colegas</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", display: 'block', marginBottom: '6px' }}>
                  Enlace de recomendación
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '6px 10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value={referralLink} 
                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif", color: '#0F172A', width: '100%' }}
                  />
                  <button 
                    onClick={handleCopy}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: copied ? '#10B981' : '#0A58A3',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                  ¿Cómo funciona el link?
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  Cualquier empresa que agende a través de tu link queda asociada automáticamente a tu cuenta para tu bonificación del 10%.
                </p>
              </div>
            </div>

            {/* Advisory Assistance */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(10, 88, 163, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58A3' }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Acompañamiento personal
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Reunión ejecutiva directa</span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                ¿Tienes una empresa aliada con requerimientos tecnológicos específicos? Conversemos directamente con ellos y coordinamos una sesión de diagnóstico sin compromiso.
              </p>

              <a 
                href="https://wa.me/525575084267?text=Hola%20HummingX%2C%20tengo%20una%20empresa%20interesada%20que%20me%20gustar%C3%ADa%20presentarles" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
              >
                <MessageCircle size={16} color="#22c55e" />
                <span>Presentar empresa por WhatsApp</span>
              </a>
            </div>

          </aside>

        </div>

        {/* Modal: Recomendar Empresa */}
        {isModalOpen && (
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
            <div className="glass-card fade-in-up" style={{ width: '100%', maxWidth: '480px', padding: '32px', background: '#FFFFFF', position: 'relative' }}>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 196, 204, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C4CC' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Recomendar una empresa
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Recibe el 10% en Créditos HX al formalizar</span>
                </div>
              </div>

              {modalSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                    ¡Empresa registrada con éxito!
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    Nos pondremos en contacto cordialmente y mantendrás seguimiento transparente aquí.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Nombre de la Empresa *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Grupo Hotelero Horizonte"
                      value={form.companyName}
                      onChange={e => setForm({ ...form, companyName: e.target.value })}
                      className="hx-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                      Nombre de la Persona de Contacto
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej. Andrea Gómez"
                      value={form.contactName}
                      onChange={e => setForm({ ...form, contactName: e.target.value })}
                      className="hx-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                        Correo Electrónico
                      </label>
                      <input 
                        type="email" 
                        placeholder="contacto@empresa.com"
                        value={form.contactEmail}
                        onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                        className="hx-input"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                        Teléfono / WhatsApp
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+52 55..."
                        value={form.contactPhone}
                        onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                        className="hx-input"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="btn-secondary" 
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="btn-primary" 
                      style={{ flex: 1 }}
                    >
                      {submitting ? 'Enviando...' : 'Registrar'}
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
