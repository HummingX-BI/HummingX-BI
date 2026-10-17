// portal/src/pages/admin/AdminClientDetailPage.jsx
import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import { useClientDetail } from './client-detail/useClientDetail';
import ClientHeader from './client-detail/ClientHeader';
import ClientKpis from './client-detail/ClientKpis';
import TabOverview from './client-detail/TabOverview';
import TabProject from './client-detail/TabProject';
import TabPayments from './client-detail/TabPayments';
import TabBitacora from './client-detail/TabBitacora';
import TabReferrals from './client-detail/TabReferrals';
import TabActivity from './client-detail/TabActivity';
import TabSettings from './client-detail/TabSettings';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'proyecto', label: 'Proyecto' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'bitacora', label: 'Bitácora' },
  { id: 'referidos', label: 'Referidos y Créditos' },
  { id: 'actividad', label: 'Actividad' },
  { id: 'ajustes', label: 'Ajustes' },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'resumen';
  const detail = useClientDetail(id);
  const { client, loading, error } = detail;

  const setTab = (tabId) => setSearchParams({ tab: tabId });

  if (loading) {
    return (
      <Layout>
        <div className="cd-page-container">
          <div className="cd-skeleton" style={{ height: '70px', borderRadius: '12px' }} />
          <div className="cd-skeleton" style={{ height: '90px', borderRadius: '12px' }} />
          <div className="cd-skeleton" style={{ height: '400px', borderRadius: '12px' }} />
        </div>
      </Layout>
    );
  }

  if (error || !client) {
    return (
      <Layout>
        <div className="cd-page-container">
          <div className="cd-card cd-empty-state">
            <AlertCircle size={40} color="#EF4444" />
            <div className="cd-empty-title">{error || 'Cliente no encontrado'}</div>
            <p className="cd-empty-desc">No se encontró la información o el cliente fue eliminado.</p>
            <button type="button" onClick={() => navigate('/admin/clientes')} className="cd-btn cd-btn-secondary" style={{ marginTop: '16px' }}>
              <ArrowLeft size={16} /> Volver al listado
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cd-page-container">
        <ClientHeader detail={detail} />
        <ClientKpis client={client} activeProject={detail.activeProject} payments={detail.payments} />

        <div className="cd-tabs-wrapper">
          <div className="cd-tabs-list">
            {TABS.map((t) => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`cd-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <span>{t.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="cd-active-indicator"
                      className="cd-tab-indicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cd-tab-content">
          {activeTab === 'resumen' && (
            <TabOverview
              client={client}
              activeProject={detail.activeProject}
              payments={detail.payments}
              onResendInvitation={detail.handleResendInvitation}
              onNavigateTab={setTab}
            />
          )}
          {activeTab === 'proyecto' && (
            <TabProject
              client={client}
              activeProject={detail.activeProject}
              projectData={detail.projectData}
              setProjectData={detail.setProjectData}
              isProjectDirty={detail.isProjectDirty}
              savingProject={detail.savingProject}
              onSaveProject={detail.handleUpdateProject}
              onResetProject={detail.resetProjectForm}
              onNotifyPhase={detail.handleNotifyPhase}
              showNewProjectModal={detail.showNewProjectModal}
              setShowNewProjectModal={detail.setShowNewProjectModal}
              newProjectData={detail.newProjectData}
              setNewProjectData={detail.setNewProjectData}
              creatingProject={detail.creatingProject}
              onCreateProject={detail.handleCreateProject}
            />
          )}
          {activeTab === 'pagos' && <TabPayments detail={detail} />}
          {activeTab === 'bitacora' && <TabBitacora detail={detail} />}
          {activeTab === 'referidos' && <TabReferrals detail={detail} />}
          {activeTab === 'actividad' && <TabActivity detail={detail} />}
          {activeTab === 'ajustes' && <TabSettings detail={detail} />}
        </div>
      </div>
    </Layout>
  );
}
