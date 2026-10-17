// portal/src/pages/admin/client-detail/TabProject.jsx
import { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Send,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Layers,
  Calendar,
  Palette
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import NewProjectModal from './NewProjectModal';
import NotifyPhaseModal from './NotifyPhaseModal';

export default function TabProject({
  client,
  activeProject,
  projectData,
  setProjectData,
  isProjectDirty,
  savingProject,
  onSaveProject,
  onResetProject,
  onNotifyPhase,
  showNewProjectModal,
  setShowNewProjectModal,
  newProjectData,
  setNewProjectData,
  creatingProject,
  onCreateProject,
}) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedNotifyPhase, setSelectedNotifyPhase] = useState(activeProject?.currentPhase || 1);
  const [sendingNotification, setSendingNotification] = useState(false);

  if (!activeProject && !client.projects?.length) {
    return (
      <div className="cd-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <FolderGit2 size={40} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
          Sin Proyecto Activo
        </h3>
        <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 20px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
          Este cliente aún no tiene un proyecto de ingeniería registrado. Crea uno para comenzar el seguimiento de fases.
        </p>
        <button
          type="button"
          onClick={() => setShowNewProjectModal(true)}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '13.5px' }}
        >
          <Plus size={16} />
          <span>Crear Primer Proyecto</span>
        </button>

        {/* Modal Nuevo Proyecto */}
        <ConfirmDialog
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onConfirm={onCreateProject}
          loading={creatingProject}
          title="Crear Proyecto para el Cliente"
          description="Se creará un proyecto formal en fase 1 de Análisis con 10% de avance."
          confirmText="Crear Proyecto"
        >
          <div style={{ marginTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              placeholder={`Proyecto ${client.companyName || client.name}`}
              className="hx-input"
              style={{ width: '100%', marginBottom: '12px' }}
              value={newProjectData.name}
              onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
              autoFocus
            />
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Descripción / Alcance Inicial
            </label>
            <textarea
              rows={3}
              placeholder="Detalles de la solución de software o BI..."
              className="hx-input"
              style={{ width: '100%' }}
              value={newProjectData.description}
              onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </ConfirmDialog>
      </div>
    );
  }

  const phaseNames = {
    1: 'Fase 1: Análisis y Requerimientos',
    2: 'Fase 2: Diseño UX/UI',
    3: 'Fase 3: Revisión de Prototipos',
    4: 'Fase 4: Desarrollo e Ingeniería',
    5: 'Fase 5: Pruebas y Lanzamiento',
    6: 'Fase 6: Proyecto 100% Activo'
  };

  const handleNotifyConfirm = async () => {
    setSendingNotification(true);
    await onNotifyPhase(selectedNotifyPhase);
    setSendingNotification(false);
    setShowNotifyModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Card Header & Acciones Rápidas */}
      <div className="cd-card">
        <div className="cd-card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h2 className="cd-card-title">
              <FolderGit2 size={18} color="#00C4CC" />
              <span>{activeProject.name}</span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#6B7280' }}>
              ID: {activeProject.id} · Creado el {new Date(activeProject.createdAt).toLocaleDateString('es-MX')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Botón Notificar Fase (Adenda A.3.b) */}
            <button
              type="button"
              onClick={() => {
                setSelectedNotifyPhase(projectData.currentPhase || activeProject.currentPhase);
                setShowNotifyModal(true);
              }}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} color="#00C4CC" />
              <span>Notificar fase al cliente</span>
            </button>

            {/* Botón Nuevo Proyecto */}
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Nuevo proyecto</span>
            </button>
          </div>
        </div>

        {/* Formulario Principal de Proyecto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          {/* Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              className="hx-input"
              style={{ width: '100%' }}
              value={projectData.name || ''}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Fase Actual */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Fase Actual de Desarrollo
            </label>
            <select
              className="hx-input"
              style={{ width: '100%', cursor: 'pointer' }}
              value={projectData.currentPhase || 1}
              onChange={(e) => setProjectData(prev => ({ ...prev, currentPhase: parseInt(e.target.value, 10) }))}
            >
              {Object.entries(phaseNames).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Porcentaje de Avance */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                Progreso General (%)
              </label>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#00C4CC' }}>
                {projectData.progressPercent || 0}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              style={{ width: '100%', accentColor: '#00C4CC' }}
              value={projectData.progressPercent || 0}
              onChange={(e) => setProjectData(prev => ({ ...prev, progressPercent: parseInt(e.target.value, 10) }))}
            />
          </div>

          {/* Fecha Estimada de Entrega */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Fecha Estimada de Entrega (ETA)
            </label>
            <input
              type="date"
              className="hx-input"
              style={{ width: '100%' }}
              value={projectData.estimatedDelivery || ''}
              onChange={(e) => setProjectData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
            />
          </div>

          {/* Estado de Diseño UX/UI */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Estado del Diseño UX/UI
            </label>
            <select
              className="hx-input"
              style={{ width: '100%', cursor: 'pointer' }}
              value={projectData.designStatus || 'pending_review'}
              onChange={(e) => setProjectData(prev => ({ ...prev, designStatus: e.target.value }))}
            >
              <option value="pending_review">En preparación interna</option>
              <option value="in_review">En revisión por el cliente</option>
              <option value="modifications_requested">Modificaciones solicitadas</option>
              <option value="modifications_resolved">Modificaciones resueltas (listas)</option>
              <option value="approved">Aprobado formalmente</option>
            </select>
          </div>

          {/* Descripción */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Descripción y Objetivos Clave
            </label>
            <textarea
              rows={3}
              className="hx-input"
              style={{ width: '100%' }}
              value={projectData.description || ''}
              onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Sección Enlaces Externos */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 14px 0' }}>
            Enlaces y Entregables del Proyecto
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#6B7280', marginBottom: '4px' }}>
                URL Prototipo / Figma
              </label>
              <input
                type="url"
                placeholder="https://figma.com/file/..."
                className="hx-input"
                style={{ width: '100%', fontSize: '12.5px' }}
                value={projectData.figmaUrl || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, figmaUrl: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#6B7280', marginBottom: '4px' }}>
                URL Previsualización / Staging
              </label>
              <input
                type="url"
                placeholder="https://demo.hummingxbi.com"
                className="hx-input"
                style={{ width: '100%', fontSize: '12.5px' }}
                value={projectData.previewUrl || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, previewUrl: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#6B7280', marginBottom: '4px' }}>
                URL Cotización / Propuesta
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                className="hx-input"
                style={{ width: '100%', fontSize: '12.5px' }}
                value={projectData.quoteLink || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, quoteLink: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#6B7280', marginBottom: '4px' }}>
                URL Contrato Formal
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                className="hx-input"
                style={{ width: '100%', fontSize: '12.5px' }}
                value={projectData.contractLink || ''}
                onChange={(e) => setProjectData(prev => ({ ...prev, contractLink: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Aparece sólo si isProjectDirty) */}
      {isProjectDirty && (
        <div className="cd-sticky-bottom-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Hay cambios sin guardar en el proyecto</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onResetProject}
              disabled={savingProject}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12.5px', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)' }}
            >
              <RotateCcw size={14} />
              <span>Descartar</span>
            </button>
            <button
              type="button"
              onClick={onSaveProject}
              disabled={savingProject}
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '12.5px', background: '#00C4CC' }}
            >
              <Save size={14} />
              <span>{savingProject ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Notificar Fase al Cliente */}
      <NotifyPhaseModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        onConfirm={handleNotifyConfirm}
        clientEmail={client.email}
        selectedPhase={selectedNotifyPhase}
        setSelectedPhase={setSelectedNotifyPhase}
        sendingNotification={sendingNotification}
      />

      {/* Modal Crear Nuevo Proyecto */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onConfirm={onCreateProject}
        creatingProject={creatingProject}
        newProjectData={newProjectData}
        setNewProjectData={setNewProjectData}
        clientName={client.companyName || client.name}
      />
    </div>
  );
}
