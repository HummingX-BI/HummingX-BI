import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../../../lib/api';

export default function CreditAdjustModal({ isOpen, onClose, clientId, currentBalance = 0, onSuccess, toast }) {
  const [type, setType] = useState('adjustment'); // 'adjustment' | 'redeemed'
  const [rawAmount, setRawAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const parsedAmount = useMemo(() => {
    const val = parseInt(rawAmount, 10);
    if (isNaN(val)) return 0;
    if (type === 'redeemed') {
      return -Math.abs(val);
    }
    return val;
  }, [rawAmount, type]);

  const newBalance = currentBalance + parsedAmount;
  const isNegative = newBalance < 0;

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (parsedAmount === 0) {
      setErrorMsg('El monto debe ser distinto de cero.');
      return;
    }
    if (Math.abs(parsedAmount) > 100000) {
      setErrorMsg('El monto máximo permitido es 100,000.');
      return;
    }
    if (description.trim().length < 3) {
      setErrorMsg('El motivo debe tener al menos 3 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/admin/clients/${clientId}/credit-movements`, {
        amount: parsedAmount,
        type,
        description: description.trim(),
      });
      toast?.success('Saldo Actualizado', 'El movimiento de créditos se registró correctamente.');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al ajustar los créditos.';
      setErrorMsg(msg);
      toast?.error('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
        }} />
        <Dialog.Content style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 10000,
          outline: 'none',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} />
              </div>
              <Dialog.Title style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Ajustar Saldo de Créditos
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px' }}>
            Registra un ajuste administrativo o canje de créditos para este cliente.
          </Dialog.Description>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '12.5px',
              marginBottom: '14px',
              border: '1px solid #FECACA',
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Tipo de movimiento
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setType('adjustment')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: type === 'adjustment' ? '2px solid #00C4CC' : '1px solid #D1D5DB',
                    background: type === 'adjustment' ? '#F0FDFA' : '#FFFFFF',
                    color: type === 'adjustment' ? '#0F766E' : '#4B5563',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Ajuste (+ o −)
                </button>
                <button
                  type="button"
                  onClick={() => setType('redeemed')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: type === 'redeemed' ? '2px solid #EF4444' : '1px solid #D1D5DB',
                    background: type === 'redeemed' ? '#FEF2F2' : '#FFFFFF',
                    color: type === 'redeemed' ? '#DC2626' : '#4B5563',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Canje (−)
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Monto {type === 'redeemed' ? '(se restará automáticamente)' : '(ej. 500 o -500)'} *
              </label>
              <input
                type="number"
                required
                className="hx-input"
                placeholder={type === 'redeemed' ? 'Ej. 1000' : 'Ej. 500 o -500'}
                value={rawAmount}
                onChange={e => setRawAmount(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Motivo del movimiento * (mín. 3 caracteres)
              </label>
              <input
                type="text"
                required
                className="hx-input"
                placeholder="Ej. Canje de descuento en factura F-102"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Vista previa de saldo */}
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Saldo actual</span>
                <strong style={{ fontSize: '14px', color: '#111827' }}>${currentBalance.toLocaleString()} HX</strong>
              </div>
              <ArrowRight size={16} color="#9CA3AF" />
              <div>
                <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Nuevo saldo</span>
                <strong style={{ fontSize: '15px', color: isNegative ? '#DC2626' : '#059669', fontWeight: 700 }}>
                  ${newBalance.toLocaleString()} HX
                </strong>
              </div>
            </div>

            {isNegative && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#FFFBEB',
                color: '#B45309',
                fontSize: '12px',
                border: '1px solid #FDE68A',
              }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span>Atención: el saldo del cliente quedará en negativo.</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || parsedAmount === 0}
              >
                {submitting ? 'Aplicando...' : 'Aplicar Movimiento'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
