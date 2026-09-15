import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Cpu, 
  BarChart3, 
  LifeBuoy, 
  Clock, 
  MessageCircle,
  Check
} from 'lucide-react';

const SERVICES = [
  {
    id: 's1',
    category: 'elegible software',
    title: 'Actualización de Diseño & UX',
    tag: '100% CANJEABLE CON CRÉDITOS HX',
    tagColor: '#008B91',
    problem: 'Interfaces desactualizadas que reducen la confianza y frenan la conversión de clientes potenciales.',
    solution: 'Rediseño integral de interfaz, optimización responsive y modernización de componentes interactivos.',
    hxPrice: 2000,
    usdPrice: 2000,
    fullyCovered: true,
    timeline: '1 a 2 semanas',
    features: ['Diseño en Figma', 'Implementación web moderna', 'Optimización móvil', 'Revisión final conjunta']
  },
  {
    id: 's2',
    category: 'elegible soporte',
    title: 'Mes de Mantenimiento Preventivo & SLA',
    tag: '100% CANJEABLE CON CRÉDITOS HX',
    tagColor: '#008B91',
    problem: 'Sistemas sin monitoreo activo propensos a caídas imprevistas o degradación de velocidad.',
    solution: 'Auditoría continua de infraestructura, actualización de parches, backups y atención técnica prioritaria.',
    hxPrice: 1500,
    usdPrice: 1500,
    fullyCovered: true,
    timeline: 'Suscripción mensual',
    features: ['Soporte < 2 hrs', 'Backups diarios', 'Monitoreo de uptime', 'Optimización de base de datos']
  },
  {
    id: 's3',
    category: 'elegible software',
    title: 'Automatización de Procesos & APIs',
    tag: 'COBERTURA PARCIAL CON CRÉDITOS HX',
    tagColor: '#0A58A3',
    problem: 'Tareas operativas repetitivas y desconexión entre el software de ventas, inventario y facturación.',
    solution: 'Conexión automatizada vía API de sistemas clave para eliminar errores manuales y ahorrar horas operativas.',
    hxPrice: 2000,
    usdPrice: 6000,
    fullyCovered: false,
    timeline: '3 a 4 semanas',
    features: ['Integración de Webhooks', 'Conexión con POS / ERP', 'Notificaciones automáticas', 'Pruebas de estrés']
  },
  {
    id: 's4',
    category: 'software',
    title: 'Dashboard Ejecutivo HummingX BI',
    tag: 'SOLUCIÓN ENTERPRISE',
    tagColor: '#784A9C',
    problem: 'Datos dispersos en múltiples hojas de cálculo que impiden tomar decisiones estratégicas en tiempo real.',
    solution: 'Panel analítico centralizado con KPIs financieros, operativos y proyecciones automáticas para directivos.',
    hxPrice: 2000,
    usdPrice: 8500,
    fullyCovered: false,
    timeline: '4 a 6 semanas',
    features: ['Modelado de datos en PostgreSQL', 'Visualizaciones interactivas', 'Control de roles', 'Capacitación ejecutiva']
  }
];

export default function ServicesPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [orderedService, setOrderedService] = useState(null);

  const totalCredits = 2000; // Available credits

  const filteredServices = SERVICES.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'elegible') return s.category.includes('elegible');
    if (filter === 'software') return s.category.includes('software');
    if (filter === 'soporte') return s.category.includes('soporte');
    return true;
  });

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Available Credits Banner (Midnight Purple) */}
        <div className="midnight-card" style={{ padding: '24px 32px' }}>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', color: '#00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00E5FF', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Balance Disponible
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>
                    · {user?.companyName || 'Tahara Café'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 800 }}>
                    ${totalCredits.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '15px', color: '#00E5FF', fontWeight: 600 }}>Créditos HX</span>
                  <span style={{ fontSize: '13px', opacity: 0.7, marginLeft: '6px' }}>
                    listos para canjear de inmediato
                  </span>
                </div>
              </div>
            </div>

            <Link 
              to="/credits" 
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: 'uppercase'
              }}
            >
              Ver Movimientos →
            </Link>
          </div>
        </div>

        {/* Section Header & Filter Pills */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00C4CC' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0A58A3', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>
                Catálogo de Capacidades & Soluciones
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>
              Soluciones y Servicios HummingX
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Aplica tus Créditos HX acumulados o contrata nuevas capacidades tecnológicas con atención de ingeniería prioritaria.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '4px', borderRadius: '9999px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                background: filter === 'all' ? '#00C4CC' : 'transparent',
                color: filter === 'all' ? '#111827' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              Todos ({SERVICES.length})
            </button>
            <button 
              onClick={() => setFilter('elegible')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                background: filter === 'elegible' ? '#00C4CC' : 'transparent',
                color: filter === 'elegible' ? '#111827' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              Canjeables con Créditos HX
            </button>
            <button 
              onClick={() => setFilter('software')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                background: filter === 'software' ? '#00C4CC' : 'transparent',
                color: filter === 'software' ? '#111827' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              Desarrollo & Software
            </button>
            <button 
              onClick={() => setFilter('soporte')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                background: filter === 'soporte' ? '#00C4CC' : 'transparent',
                color: filter === 'soporte' ? '#111827' : '#64748B',
                transition: 'all 0.2s'
              }}
            >
              Soporte & Optimización
            </button>
          </div>
        </header>

        {/* Services Cards List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredServices.map((service) => {
            return (
              <article 
                key={service.id}
                className="glass-card glass-card-hover"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  borderLeft: `4px solid ${service.tagColor}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ maxWidth: '680px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        background: 'rgba(0, 196, 204, 0.12)',
                        color: '#00696E'
                      }}>
                        {service.tag}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {service.timeline}
                      </span>
                    </div>

                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                      {service.title}
                    </h3>

                    {/* Problem -> Solution */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '2px' }}>
                          El Desafío
                        </span>
                        <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                          {service.problem}
                        </p>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#008B91', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '2px' }}>
                          La Solución HummingX
                        </span>
                        <p style={{ fontSize: '13px', color: '#0F172A', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                          {service.solution}
                        </p>
                      </div>
                    </div>

                    {/* Features list */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
                      {service.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                          <Check size={14} color="#00C4CC" strokeWidth={3} />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA Panel */}
                  <div style={{
                    minWidth: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9',
                    alignSelf: 'stretch'
                  }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                        Inversión estimada
                      </span>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        ${service.usdPrice.toLocaleString()} <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>USD</span>
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: 600, color: service.fullyCovered ? '#008B91' : '#0A58A3' }}>
                        {service.fullyCovered 
                          ? 'Totalmente cubierto con tus $2,000 HX' 
                          : `Aplica tus $2,000 HX y cubre diferencia`}
                      </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <a 
                        href={`https://wa.me/525575084267?text=Hola%20HummingX%2C%20quisiera%20solicitar%20el%20servicio%3A%20${encodeURIComponent(service.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary" 
                        style={{
                          width: '100%',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          padding: '10px'
                        }}
                      >
                        <span>{service.fullyCovered ? 'Canjear con Créditos HX' : 'Solicitar cotización'}</span>
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>

                </div>
              </article>
            );
          })}
        </section>

      </div>
    </Layout>
  );
}
