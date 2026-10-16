import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import Confetti from 'react-confetti';
import { FolderKanban, MessageSquare } from 'lucide-react';

// Premium Design System & Components
import { useAccentColor } from '../../components/premium/useAccentColor';
import Reveal from '../../components/premium/Reveal';
import ClientBadge from '../../components/premium/ClientBadge';
import HomeHero from './home/HomeHero';
import KpiStrip from './home/KpiStrip';
import PhaseMini from './home/PhaseMini';
import ActivityFeed from './home/ActivityFeed';
import ActionCard from './home/ActionCard';

const getDemoPayments = () => [
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

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [referralData, setReferralData] = useState({ referrals: [], creditMovements: [], totalCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [designApproved, setDesignApproved] = useState(false);
  const [realPayments, setRealPayments] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dynamically extract client brand accent color
  useAccentColor(user?.logoUrl);

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
            dueDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
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
          logo: null
        };
      });
      setRealPayments(pEvents.length > 0 ? pEvents : getDemoPayments());
    }).finally(() => setLoading(false));
  }, []);

  const activeProject = projects.find(p => p.status === 'active') || projects[0] || null;

  const totalCredits = referralData.totalCredits || 0;
  const referrals = referralData.referrals || [];
  const convertedCount = referrals.filter(r => r.status === 'converted').length || 0;
  const totalReferrals = referrals.length || 0;

  const getMembershipLevel = (converted) => {
    if (converted >= 10) return { title: 'HummingX VIP', img: '/vip-icon.png', next: 0, nextTitle: 'Máximo nivel', color: '#8B5CF6' };
    if (converted >= 5) return { title: 'HummingX Partner', img: '/partner-icon.png', next: 10 - converted, nextTitle: 'HummingX VIP', color: '#00C4CC' };
    return { title: 'HummingX Member', img: '/member-icon.png', next: 5 - converted, nextTitle: 'HummingX Partner', color: '#6B7280' };
  };

  const membership = getMembershipLevel(convertedCount);

  const phaseNames = ['', 'Análisis', 'Diseño', 'Revisión', 'Desarrollo', 'Lanzamiento', 'Activo'];
  const currentPhaseName = phaseNames[activeProject?.currentPhase] || 'Desarrollo';

  // Status phrases by phase
  const phaseStatusPhrases = [
    '',
    'Fase de Análisis: Levantamiento de requerimientos técnicos y arquitectura de información.',
    'Fase de Diseño: Creación de prototipos visuales interactivos y componentes del sistema.',
    'Fase de Revisión: Validación de la experiencia de usuario y aprobación de interfaz.',
    'Fase de Desarrollo: Construcción del código, lógica de negocio y APIs del sistema.',
    'Fase de Lanzamiento: Pruebas de calidad en staging, optimización y puesta en producción.',
    'Proyecto Activo y Terminado: Sistema desplegado en producción con monitoreo continuo.'
  ];
  const currentStatusPhrase = phaseStatusPhrases[activeProject?.currentPhase] || '';

  const estimatedDeliveryStr = activeProject?.estimatedDelivery
    ? new Date(activeProject.estimatedDelivery).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

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

  const handleApproveDesign = async () => {
    if (!activeProject) return;
    setDesignApproved(true);
    await api.put(`/projects/${activeProject.id}/design-status`, { designStatus: 'approved' }).catch(console.error);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, designStatus: 'approved' } : p));
  };

  const handleRequestModifications = async () => {
    if (!activeProject) return;
    await api.put(`/projects/${activeProject.id}/design-status`, { designStatus: 'modifications_requested' }).catch(console.error);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, designStatus: 'modifications_requested' } : p));
  };

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
        <div className="px-container" style={{ padding: '40px 0' }}>
          <Reveal>
            <div className="px-card" style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <ClientBadge logoUrl={user?.logoUrl} name={user?.name} companyName={user?.companyName} size={84} />
              <div style={{ maxWidth: '480px' }}>
                <h2 className="px-serif" style={{ fontSize: '28px', color: '#111827', margin: '0 0 10px 0' }}>
                  Tu proyecto está en preparación
                </h2>
                <p style={{ fontSize: '14.5px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                  Tu cuenta institucional está activa. Nuestro equipo técnico está preparando el entorno de tu proyecto y en breve verás aquí los avances en tiempo real.
                </p>
              </div>
              <a
                href="https://wa.me/525575084267"
                target="_blank"
                rel="noopener noreferrer"
                className="px-btn px-btn-accent"
                style={{ textDecoration: 'none', marginTop: '8px' }}
              >
                <MessageSquare size={16} /> Contactar al equipo de ingeniería
              </a>
            </div>
          </Reveal>
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

      <div className="px-container">
        {/* 1) HomeHero: Dark Hero with Glass Badge & Progress Ring */}
        <Reveal delay={0.05}>
          <HomeHero
            user={user}
            project={activeProject}
            phaseName={currentPhaseName}
            statusPhrase={currentStatusPhrase}
            estimatedDelivery={estimatedDeliveryStr}
          />
        </Reveal>

        {/* 2) KpiStrip: 3 Equal Height Cards */}
        <Reveal delay={0.15}>
          <KpiStrip
            payments={realPayments}
            totalCredits={totalCredits}
            totalReferrals={totalReferrals}
            convertedCount={convertedCount}
            membership={membership}
            isProjectActive={activeProject.currentPhase < 6}
          />
        </Reveal>

        {/* 3) PhaseMini: Stepper with Soft Pulse */}
        <Reveal delay={0.22}>
          <PhaseMini currentPhase={activeProject.currentPhase} />
        </Reveal>

        {/* 4) Two Columns: Activity Feed (Left) & Action Card (Right) */}
        <div className="px-two-col">
          <Reveal delay={0.3} style={{ height: '100%' }}>
            <ActivityFeed activities={activeProject.activities || []} />
          </Reveal>

          <Reveal delay={0.35} style={{ height: '100%' }}>
            <ActionCard
              project={activeProject}
              user={user}
              referralCode={referralData?.referralCode || user?.referralCode}
              designApproved={designApproved}
              onApproveDesign={handleApproveDesign}
              onRequestModifications={handleRequestModifications}
            />
          </Reveal>
        </div>
      </div>
    </Layout>
  );
}
