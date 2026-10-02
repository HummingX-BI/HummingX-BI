/**
 * useToast — HummingX BI
 * Lightweight toast notification system.
 * No external dependencies — uses CSS classes from index.css.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Cliente creado', 'El correo fue enviado.');
 *   toast.error('Error', 'No se pudo guardar.');
 *   toast.info('Info', 'Actualizando datos...');
 */

import { useState, useCallback } from 'react';

let idCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    // Trigger exit animation first, then remove
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 250);
  }, []);

  const add = useCallback((type, title, message, duration = 4000) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, type, title, message, exiting: false }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  return {
    toasts,
    dismiss,
    success: (title, message, duration) => add('success', title, message, duration),
    error:   (title, message, duration) => add('error',   title, message, duration),
    info:    (title, message, duration) => add('info',    title, message, duration),
  };
}
