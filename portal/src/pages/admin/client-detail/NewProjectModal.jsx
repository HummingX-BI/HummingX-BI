// portal/src/pages/admin/client-detail/NewProjectModal.jsx
import React from 'react';
import ConfirmDialog from './ConfirmDialog';

export default function NewProjectModal({
  isOpen,
  onClose,
  onConfirm,
  creatingProject,
  newProjectData,
  setNewProjectData,
  clientName,
}) {
  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      onConfirm={onConfirm}
      confirmText={creatingProject ? 'Creando...' : 'Crear Proyecto'}
      title="Crear Proyecto Adicional"
      description={`Se creará un nuevo proyecto formal para "${clientName}".`}
    >
      <div style={{ marginTop: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
          Nombre del Proyecto *
        </label>
        <input
          type="text"
          placeholder="Ej. Sistema ERP Módulo Logística"
          className="hx-input"
          style={{ width: '100%', marginBottom: '12px' }}
          value={newProjectData.name}
          onChange={(e) => setNewProjectData((prev) => ({ ...prev, name: e.target.value }))}
          autoFocus
        />
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
          Descripción / Alcance
        </label>
        <textarea
          rows={3}
          placeholder="Objetivos específicos y alcance..."
          className="hx-input"
          style={{ width: '100%' }}
          value={newProjectData.description}
          onChange={(e) => setNewProjectData((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>
    </ConfirmDialog>
  );
}
