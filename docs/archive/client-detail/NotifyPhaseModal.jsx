// portal/src/pages/admin/client-detail/NotifyPhaseModal.jsx
import React from 'react';
import ConfirmDialog from './ConfirmDialog';

export default function NotifyPhaseModal({
  isOpen,
  onClose,
  onConfirm,
  clientEmail,
  selectedPhase,
  setSelectedPhase,
  sendingNotification,
}) {
  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      onConfirm={onConfirm}
      confirmText={sendingNotification ? 'Enviando...' : 'Enviar Correo al Cliente'}
      title="Enviar Notificación de Fase"
      description={`Se enviará un correo editorial a ${clientEmail} informándole del estado de la fase seleccionada.`}
    >
      <div style={{ marginTop: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
          Fase a notificar
        </label>
        <select
          className="hx-input"
          style={{ width: '100%', cursor: 'pointer' }}
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(parseInt(e.target.value, 10))}
        >
          <option value="2">Fase 2: Diseño UX/UI (Tu proyecto está cobrando vida)</option>
          <option value="3">Fase 3: Revisión (Tiempo de Revisión y Feedback)</option>
          <option value="4">Fase 4: Desarrollo (Arranca el Desarrollo)</option>
          <option value="5">Fase 5: Lanzamiento (Fase de Lanzamiento y Servidores)</option>
          <option value="6">Fase 6: Activo (Proyecto 100% Activo)</option>
        </select>
      </div>
    </ConfirmDialog>
  );
}
