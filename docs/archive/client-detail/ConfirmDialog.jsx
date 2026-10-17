// portal/src/pages/admin/client-detail/ConfirmDialog.jsx
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  description = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  loading = false,
  requireMatch = null,
  requireMatchLabel = 'Escribe para confirmar:',
}) {
  const [matchInput, setMatchInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMatchInput('');
    }
  }, [isOpen]);

  const canConfirm = requireMatch ? matchInput.trim().toLowerCase() === requireMatch.trim().toLowerCase() : true;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="cd-dialog-overlay" />
        <Dialog.Content className="cd-dialog-content">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isDestructive && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={20} />
                </div>
              )}
              <Dialog.Title style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            {description}
          </Dialog.Description>

          {requireMatch && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                {requireMatchLabel} <strong style={{ color: '#111827' }}>{requireMatch}</strong>
              </label>
              <input
                type="text"
                className="hx-input"
                style={{ width: '100%', borderColor: matchInput && !canConfirm ? '#EF4444' : undefined }}
                placeholder={requireMatch}
                value={matchInput}
                onChange={(e) => setMatchInput(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: '13.5px', fontWeight: 600 }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading || !canConfirm}
              className={isDestructive ? 'btn-danger' : 'btn-primary'}
              style={{
                padding: '9px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                background: isDestructive ? '#DC2626' : undefined,
                opacity: !canConfirm ? 0.5 : 1,
                cursor: !canConfirm ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Procesando...' : confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
