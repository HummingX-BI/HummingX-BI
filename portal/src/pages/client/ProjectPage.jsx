import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';

// Premium Design System & Components
import { useAccentColor } from '../../components/premium/useAccentColor';
import Reveal from '../../components/premium/Reveal';
import ClientBadge from '../../components/premium/ClientBadge';
import ProjectHero from './project/ProjectHero';
import PhaseRoadmap from './project/PhaseRoadmap';
import BrowserFrame from './project/BrowserFrame';
import NextStepCard from './project/NextStepCard';
import DeliverablesGrid from './project/DeliverablesGrid';
import Bitacora from './project/Bitacora';

const PHASE_TITLES = {
  1: 'Iniciamos la fase de Análisis',
  2: 'Entramos a la etapa de Diseño',
  3: 'Comenzamos la etapa de Revisión',
  4: 'Avanzamos a la etapa de Desarrollo',
  5: 'Llegamos a la etapa de Lanzamiento',
  6: 'Proyecto Completado y Activo'
};

export default function ProjectPage() {
  const { user, isImpersonating } = useAuth();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [designApproved, setDesignApproved] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);

  const revisionRef = useRef(null);

  // Dynamically extract client brand accent color
  useAccentColor(user?.logoUrl);

  useEffect(() => {
    if (!loading && project && revisionRef.current) {
      if (project.currentPhase === 3 || location.state?.scrollTo === 'revision') {
        setTimeout(() => {
          revisionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const handleApproveDesign = async () => {
    if (!project) return;
    setDesignApproved(true);
    await api.put(`/projects/${project.id}/design-status`, { designStatus: 'approved' }).catch(console.error);
    setProject(prev => ({ ...prev, designStatus: 'approved' }));
  };

  const handleRequestModifications = async () => {
    if (!project) return;
    await api.put(`/projects/${project.id}/design-status`, { designStatus: 'modifications_requested' }).catch(console.error);
    setProject(prev => ({ ...prev, designStatus: 'modifications_requested' }));
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

  if (!project) {
    return (
      <Layout>
        <div className="px-container" style={{ padding: '40px 0' }}>
          <Reveal>
            <div className="px-card" style={{ padding: '60px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <ClientBadge logoUrl={user?.logoUrl} name={user?.name} companyName={user?.companyName} size={84} />
              <div style={{ maxWidth: '480px' }}>
                <h2 className="px-serif" style={{ fontSize: '28px', color: '#111827', margin: '0 0 10px 0' }}>
                  Aún no tienes un proyecto activo
                </h2>
                <p style={{ fontSize: '14.5px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                  Estamos preparando todo tu entorno de trabajo. Cuando tu proyecto esté configurado, aparecerá aquí todo el panel de seguimiento detallado.
                </p>
              </div>
              <a
                href="https://wa.me/525575084267"
                target="_blank"
                rel="noopener noreferrer"
                className="px-btn px-btn-accent"
                style={{ textDecoration: 'none', marginTop: '8px' }}
              >
                <MessageSquare size={16} /> Contactar al equipo
              </a>
            </div>
          </Reveal>
        </div>
      </Layout>
    );
  }

  const currentPhaseNum = project?.currentPhase ?? 1;
  const showBrowserFrame = (currentPhaseNum === 3 || currentPhaseNum === 6) && Boolean(project?.previewUrl);

  return (
    <Layout>
      <div className="px-container">
        {/* 1) Project Hero */}
        <Reveal delay={0.05}>
          <ProjectHero
            project={project}
            user={user}
            celebrationActive={celebrationActive}
            celebrationText={PHASE_TITLES[currentPhaseNum]}
          />
        </Reveal>

        {/* 2) Phase Roadmap */}
        <Reveal delay={0.15}>
          <PhaseRoadmap project={project} />
        </Reveal>

        {/* 3) Interactive Browser Preview (if in phase 3 or 6 with previewUrl) */}
        {showBrowserFrame && (
          <div ref={revisionRef}>
            <Reveal delay={0.22}>
              <BrowserFrame
                previewUrl={project.previewUrl}
                title={project.currentPhase === 6 ? 'Sitio Web Activo' : 'Vista Previa de Diseño'}
              />
            </Reveal>
          </div>
        )}

        {/* 4) Two Columns: Deliverables & Bitacora (Left) vs Sticky NextStepCard (Right) */}
        <div className="px-two-col">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 5) Deliverables */}
            <Reveal delay={0.28}>
              <DeliverablesGrid project={project} />
            </Reveal>

            {/* 6) Bitácora */}
            {project?.activities && project.activities.length > 0 && (
              <Reveal delay={0.34}>
                <Bitacora activities={project.activities} />
              </Reveal>
            )}
          </div>

          <div>
            {/* 4) Next Step Card */}
            <Reveal delay={0.3}>
              <NextStepCard
                project={project}
                isImpersonating={isImpersonating}
                designApproved={designApproved}
                onApproveDesign={handleApproveDesign}
                onRequestModifications={handleRequestModifications}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </Layout>
  );
}
