/**
 * ================================================================
 * MÓDULO: BOTONES DE ENVÍO
 * Fallback directo a los canales (WhatsApp / Instagram / Facebook / Email).
 * ================================================================
 */
import { CONFIG } from '../config.js';

export const SendButtonsModule = (() => {
  const PRESUPUESTO_LABELS = {
    menos_5k: 'Menos de $5,000 MXN',
    '5k_15k': '$5,000 — $15,000 MXN',
    '15k_50k': '$15,000 — $50,000 MXN',
    '50k_150k': '$50,000 — $150,000 MXN',
    mas_150k: 'Más de $150,000 MXN',
  };

  function buildMessage(data) {
    const lines = [
      `*Nueva solicitud — ${CONFIG.COMPANY_NAME}*`,
      '',
      `*Servicios requeridos:* ${data.servicios && data.servicios.length > 0 ? data.servicios.join(', ') : 'Ninguno seleccionado'}`,
      `*Negocio:* ${data.negocio || 'No especificado'}`,
      `*Presupuesto:* ${data.presupuesto ? (PRESUPUESTO_LABELS[data.presupuesto] || data.presupuesto) : 'Por definir'}`,
      '',
      `*Nombre:* ${data.nombre || 'No especificado'}`,
      `*Email:* ${data.email || 'No especificado'}`,
      `*WhatsApp:* ${data.telefono || 'No especificado'}`,
    ];

    if (data.mensaje) {
      lines.push('', `*Desafío / Mensaje:*`, data.mensaje);
    }

    lines.push('', '---', 'Enviado desde hummingxbi.com');
    return lines.join('\n');
  }

  function buildEmailSubject(data) {
    return `Solicitud de proyecto — ${data.negocio || 'Nuevo cliente'}`;
  }

  /** Abre WhatsApp con el mensaje pre-llenado */
  function sendWhatsApp(data, customNumber) {
    const msg = buildMessage(data);
    const encodedMsg = encodeURIComponent(msg);
    const targetNumber = customNumber || CONFIG.WA_NUMBER_1;
    const url = `https://wa.me/${targetNumber}?text=${encodedMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** Abre Instagram con el mensaje pre-llenado en DMs */
  function sendInstagram(data) {
    const msg = buildMessage(data);
    const encodedMsg = encodeURIComponent(msg);
    const url = `https://ig.me/m/${CONFIG.IG_USERNAME}?text=${encodedMsg}`;

    // Copiamos al portapapeles como respaldo de seguridad en caso de fallas de redirección en algunas versiones de la app
    if (navigator.clipboard && data) {
      navigator.clipboard.writeText(msg).then(() => {
        showToast('✅ Solicitud copiada. ¡Pégala en el chat de Instagram si no se auto-llena!');
      }).catch(() => {
        // Silenciar error
      });
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /** Abre Facebook Messenger o la Página Oficial */
  function sendFacebook(data) {
    const msg = buildMessage(data);

    if (navigator.clipboard && data) {
      navigator.clipboard.writeText(msg).then(() => {
        showToast('✅ Solicitud copiada. ¡Pégala en el chat de Facebook!');
      }).catch(() => {});
    }

    // Usar el link de la página oficial provisto por el usuario
    window.open(CONFIG.FB_PAGE_URL, '_blank', 'noopener,noreferrer');
  }

  function sendEmail(data) {
    const subject = buildEmailSubject(data);
    const body = buildMessage(data)
      .replace(/\*/g, '');        // Eliminar formato Markdown del cuerpo

    const mailtoUrl = [
      `mailto:${CONFIG.EMAIL_ADDRESS}`,
      `?subject=${encodeURIComponent(subject)}`,
      `&body=${encodeURIComponent(body)}`,
    ].join('');

    window.location.href = mailtoUrl;
  }

  /** Muestra un toast de notificación breve */
  function showToast(msg) {
    // Crear o reutilizar el toast
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: 'rgba(13, 148, 136, 0.95)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: '99999',
        opacity: '0',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        maxWidth: '90vw',
        textAlign: 'center',
      });
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    // Mostrar
    requestAnimationFrame(() => {
      Object.assign(toast.style, {
        opacity: '1',
        transform: 'translateX(-50%) translateY(0)',
      });
    });

    // Ocultar después de 4 segundos
    setTimeout(() => {
      Object.assign(toast.style, {
        opacity: '0',
        transform: 'translateX(-50%) translateY(20px)',
      });
    }, 4000);
  }

  /**
   * Método público de fallback.
   * Llamado por LeadIngestionModule cuando el endpoint serverless falla.
   * Redirige al canal directo sin pasar por el servidor.
   *
   * @param {string} channel  - 'whatsapp' | 'instagram' | 'email'
   * @param {object} formData - Estado del formulario desde FormModule.getState()
   */
  function sendDirect(channel, formData) {
    switch (channel) {
      case 'whatsapp': sendWhatsApp(formData, CONFIG.WA_NUMBER_1); break;
      case 'whatsapp2': sendWhatsApp(formData, CONFIG.WA_NUMBER_2); break;
      case 'instagram': sendInstagram(formData); break;
      case 'facebook': sendFacebook(formData); break;
      case 'email': sendEmail(formData); break;
      default:
        console.warn(`[SendButtons] Canal desconocido: ${channel}`);
    }
  }

  /**
   * init() — En v2.0 LeadIngestionModule gestiona la delegación de clicks
   * usando data-channel. Este módulo ya no registra sus propios listeners.
   * Se mantiene por compatibilidad con la cadena de inicialización.
   */
  function init() {
    // Intencionalmente vacío en v2.0: LeadIngestionModule gestiona los clicks.
    // Para migrar a framework: exportar sendDirect() y showToast() como acciones.
  }

  // API pública: sendDirect y showToast son consumidos por LeadIngestionModule
  return { init, sendDirect, showToast };
})();
