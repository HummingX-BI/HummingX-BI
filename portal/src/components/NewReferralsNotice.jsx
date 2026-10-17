// portal/src/components/NewReferralsNotice.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Sparkles, ArrowRight, Check, X, Building2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../lib/api';
import { getToast } from './Layout';

export default function NewReferralsNotice() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [latestIso, setLatestIso] = useState(null);

  const fetchNewReferrals = useCallback(async (isInitial = false) => {
    try {
      let since = '';
      try {
        since = localStorage.getItem('hx_ref_seen') || '';
      } catch {
        // Ignorar error de acceso a localStorage
      }

      const url = since ? `/admin/referrals/new?since=${encodeURIComponent(since)}` : '/admin/referrals/new';
      const res = await api.get(url);

      if (res.data && res.data.count > 0) {
        setItems(res.data.items || []);
        setLatestIso(res.data.latest);

        // Notificar al Sidebar del contador
        window.dispatchEvent(new CustomEvent('hx:new-referrals-count', {
          detail: { count: res.data.count }
        }));

        // Si es el primer chequeo de la sesión y no se ha mostrado, abrir modal
        if (isInitial) {
          try {
            const alreadyChecked = sessionStorage.getItem('hx_notice_checked');
            if (!alreadyChecked) {
              setOpen(true);
              sessionStorage.setItem('hx_notice_checked', 'true');
            }
          } catch {
            setOpen(true);
          }
        } else {
          // Si llega uno nuevo mientras trabaja, emitir toast
          const first = res.data.items[0];
          if (first) {
            getToast()?.info('Nuevo recomendado', `${first.companyName}, de ${first.referrer?.displayName || 'Socio'}`);
          }
        }
      } else {
        window.dispatchEvent(new CustomEvent('hx:new-referrals-count', {
          detail: { count: 0 }
        }));
      }
    } catch {
      // Errores de red silenciosos
    }
  }, []);

  useEffect(() => {
    // 1. Chequeo inicial al montar
    fetchNewReferrals(true);

    // 2. Polling cada 90s solo si la pestaña está visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNewReferrals(false);
      }
    }, 90000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNewReferrals(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNewReferrals]);

  const markAsSeen = () => {
    if (latestIso) {
      try {
        localStorage.setItem('hx_ref_seen', latestIso);
      } catch {
        // Ignorar error
      }
    }
    setOpen(false);
    window.dispatchEvent(new CustomEvent('hx:new-referrals-count', {
      detail: { count: 0 }
    }));
  };

  const handleGoToCrm = (prospectId) => {
    markAsSeen();
    if (prospectId) {
      navigate(`/admin/prospects?highlight=${prospectId}`);
    } else {
      navigate('/admin/prospects');
    }
  };

  if (!items || items.length === 0) return null;

  const count = items.length;
  const title = count === 1 ? 'Nuevo recomendado' : `${count} nuevos recomendados`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }} />
        <Dialog.Content style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '520px',
          maxHeight: '85vh',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 10000,
          overflowY: 'auto',
          outline: 'none',
          border: '1px solid #E5E7EB',
          fontFamily: "'Inter Variable', sans-serif"
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00C4CC 0%, #1D4ED8 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <Dialog.Title style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={markAsSeen}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 16px' }}>
            Socios del portal han recomendado nuevas empresas. Puedes revisarlas y darles seguimiento en el CRM:
          </Dialog.Description>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {items.map((item) => {
              let timeAgo = '';
              try {
                timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es });
              } catch {
                timeAgo = 'recientemente';
              }

              return (
                <div
                  key={item.referralId}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    background: '#F9FAFB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Building2 size={16} style={{ color: '#00C4CC', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', truncate: 'true' }}>
                        {item.companyName}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {timeAgo}
                    </span>
                  </div>

                  {item.contactName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4B5563' }}>
                      <User size={13} style={{ color: '#9CA3AF' }} />
                      <span>Contacto: {item.contactName}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    Recomendado por <strong style={{ color: '#111827' }}>{item.referrer?.displayName}</strong>
                    {' '}(Cód. <strong>{item.referrer?.referralCode}</strong> · <span style={{ color: '#0284C7', fontWeight: 600 }}>{item.referrer?.tierName}</span>)
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={markAsSeen}
              style={{
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#4B5563',
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={15} />
              Entendido
            </button>
            <button
              type="button"
              onClick={() => handleGoToCrm(items[0]?.prospectId)}
              style={{
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#111827',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Ver en CRM
              <ArrowRight size={15} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
