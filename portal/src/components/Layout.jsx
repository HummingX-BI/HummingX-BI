import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tour, useTour } from './ui/product-tour';
import Sidebar from './Sidebar';
import { ToastContainer } from './Toast';
import { useToast } from '../lib/useToast';
import NewReferralsNotice from './NewReferralsNotice';
import { ChevronRight, Menu } from 'lucide-react';

// Expose a global toast emitter so any component can call it without prop drilling
let _globalToast = null;
export function getToast() { return _globalToast; }

export default function Layout({ children, customBreadcrumbLabel, fullWidth = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isImpersonating, stopImpersonating } = useAuth();
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Register global toast instance
  useEffect(() => { _globalToast = toast; }, [toast]);

  // Track route key to re-trigger page-enter animation on navigation & restore scroll top
  const [pageKey, setPageKey] = useState(location.pathname);
  const mainContentRef = useRef(null);

  useEffect(() => {
    setPageKey(location.pathname);
    window.scrollTo(0, 0);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Build breadcrumb from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbMap = {
    'dashboard': 'Inicio',
    'project': 'Mi Proyecto',
    'referrals': 'Mis Referidos',
    'pagos': 'Plan de Pagos',
    'admin': 'Admin',
    'clients': 'Clientes Activos',
    'prospects': 'CRM Prospectos',
    'citas': 'Agenda de Citas',
    'tareas': 'Tareas',
    'finanzas': 'Finanzas & Flujo',
    'tarjetas-qr': 'Tarjetas QR & NFC',
    'analytics': 'Analíticas',
  };

  const tourStorageKey = user ? `hummingx_tour_${user.id}` : null;
  const tour = useTour(tourStorageKey);

  useEffect(() => {
    if (user && user.role !== 'admin' && !isImpersonating && !tour.seen() && !sessionStorage.getItem('hummingx_tour_started')) {
      sessionStorage.setItem('hummingx_tour_started', 'true');
      setTimeout(() => tour.start(), 1000);
    }
  }, [user, tour.seen, isImpersonating]);

  // Cada paso indica en qué página vive (`page`). En celular el menú lateral está
  // oculto, así que los pasos del menú apuntan al botón ☰ (`mobileTarget`).
  const MENU = { mobileTarget: '.mobile-menu-btn' };
  const tourSteps = [
    { page: '/dashboard', target: 'body', title: 'Bienvenido', content: '¡Bienvenido a tu Portal de Clientes HummingX! Vamos a dar un rápido recorrido guiado para que sepas dónde encontrar todo. Haz clic en "Siguiente" para comenzar.', placement: 'center' },
    { page: '/dashboard', target: '.tour-step-dashboard', ...MENU, title: 'Inicio', content: 'Este es tu panel principal donde verás el resumen de todo.', mobileContent: 'Desde este menú (☰) navegas por todo tu portal. "Inicio" es tu panel principal con el resumen de todo.', placement: 'right' },
    { page: '/dashboard', target: '#tour-active-project', title: 'Tu Proyecto Activo', content: 'Aquí verás el nombre de tu proyecto, en qué etapa se encuentra actualmente, y botones para revisar los avances.', placement: 'bottom' },
    { page: '/dashboard', target: '#tour-progress', title: 'Barra de Progreso', content: 'Este indicador te mostrará el avance general de todo el proyecto en tiempo real.', placement: 'top' },
    { page: '/dashboard', target: '#tour-payments', title: 'Próximo Pago', content: 'Aquí podrás ver la fecha y monto de tu siguiente pago. Haz clic para ver el plan de pagos.', placement: 'top' },
    { page: '/dashboard', target: '#tour-milestone', title: 'Siguiente Hito', content: 'El siguiente gran objetivo a cumplir en la ruta de tu proyecto.', placement: 'top' },
    { page: '/dashboard', target: '#tour-credits', title: 'Créditos HX', content: 'Acumula créditos que podrás canjear por nuevos módulos o servicios.', placement: 'top' },
    { page: '/dashboard', target: '#tour-referrals', title: 'Referidos', content: 'La cantidad de empresas que nos has recomendado. ¡Invita a más para ganar créditos!', placement: 'top' },
    { page: '/dashboard', target: '#tour-level', title: 'Tu Nivel HummingX', content: 'Aquí puedes ver tu nivel actual de cliente, tus beneficios acumulados y lo que necesitas para subir de categoría.', placement: 'top' },
    { page: '/dashboard', target: '#tour-activity', title: 'Actividad Reciente', content: 'Un resumen de las últimas actualizaciones, entregas y mensajes de tu proyecto.', placement: 'top' },
    { page: '/dashboard', target: '#tour-recommendations', title: 'Recomendaciones', content: 'Sugerencias para escalar tu negocio digital o aprovechar al máximo tus créditos disponibles.', placement: 'top' },
    { page: '/dashboard', target: '.tour-step-project', ...MENU, title: 'Mi Proyecto', content: 'Aquí puedes ver los detalles a fondo. En el siguiente paso te llevaremos ahí automáticamente.', mobileContent: 'En el menú (☰) encontrarás "Mi Proyecto" con todos los detalles. En el siguiente paso te llevamos ahí.', placement: 'right' },
    { page: '/project', target: '#tour-project-timeline', title: 'Ruta de trabajo', content: 'En esta sección podrás ver toda la metodología y los pasos que seguiremos hasta lanzar tu proyecto.', placement: 'bottom' },
    { page: '/project', target: '#tour-active-stage', title: 'Detalles de la etapa', content: 'Te mantendremos al tanto de qué estamos haciendo exactamente y si necesitamos que revises algo.', placement: 'top' },
    { page: '/project', target: '#tour-next-step', title: 'Próximo Paso', content: 'Aquí verás el hito o etapa inmediatamente posterior y lo que viene en el proceso de tu proyecto.', placement: 'top' },
    { page: '/project', target: '#entregables', title: 'Entregables (Documentos)', content: 'Aquí podrás descargar contratos, cotizaciones, manuales y cualquier documento relacionado a tu proyecto.', placement: 'top' },
    { page: '/project', target: '#tour-bitacora', title: 'Bitácora de Desarrollo', content: 'El registro cronológico detallado con todas las actividades, notas y avances que nuestro equipo va realizando día a día.', placement: 'top' },
    { page: '/project', target: '.tour-step-referrals', ...MENU, title: 'Mis Referidos', content: 'Recomiéndanos con otras empresas y gana Créditos HX. En el siguiente paso te llevamos ahí.', mobileContent: 'En el menú (☰) está "Mis Referidos": recomiéndanos y gana Créditos HX. En el siguiente paso te llevamos ahí.', placement: 'right' },
    { page: '/referrals', target: '#tour-referrals-tier', title: 'Tu Nivel de Socio', content: 'Conforme recomiendes y se concreten nuevos proyectos, subirás de Member a Partner o VIP, desbloqueando mayores recompensas.', placement: 'bottom' },
    { page: '/referrals', target: '#tour-referrals-balance', title: 'Tus Créditos HX', content: 'Tu saldo acumulado de Créditos HX, canjeables por horas de consultoría y mejoras en tu sistema, y cuánto te falta para el siguiente nivel.', placement: 'bottom' },
    { page: '/referrals', target: '#tour-referrals-code', title: 'Tu Código de Socio', content: 'Comparte tu código único con directores o empresarios. Al contactarnos por WhatsApp o llamada con tu código, quedarán vinculados a tu cuenta para otorgarte créditos.', placement: 'bottom' },
    { page: '/referrals', target: '#tour-referrals-list', title: 'Tus Recomendaciones', content: 'Aquí registras a las empresas que nos recomiendas y sigues en tiempo real su avance y los créditos que te generan.', placement: 'bottom' },
    { page: '/referrals', target: '.tour-step-support', ...MENU, title: 'Soporte 24/7', content: 'Si tienes cualquier duda, usa este botón para mandarnos mensaje directo por WhatsApp. ¡Eso es todo, disfruta tu portal!', mobileContent: 'En el menú (☰) tienes el botón de Soporte para escribirnos directo por WhatsApp. ¡Eso es todo, disfruta tu portal!', placement: 'right' },
  ];

  const handleIndexChange = (i) => {
    const page = tourSteps[i]?.page;
    if (page && location.pathname !== page) navigate(page);
    tour.setIndex(i);
  };

  return (
    <div className="layout-root" style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Tour
        steps={tourSteps}
        open={tour.open}
        onOpenChange={tour.setOpen}
        index={tour.index}
        onIndexChange={handleIndexChange}
        onFinish={tour.markSeen}
        onSkip={tour.markSeen}
      />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        {/* Banner de Modo Administrador (Impersonación) */}
        {isImpersonating && (
          <div style={{
            background: '#111827',
            color: '#F9FAFB',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '13px',
            borderBottom: '2px solid #00C4CC',
            zIndex: 9999,
            position: 'sticky',
            top: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00C4CC' }} />
              <span>
                <strong>Modo Administrador (Solo Lectura):</strong> Estás visualizando el portal como <strong>{user?.companyName || user?.name || user?.email}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                stopImpersonating();
                navigate('/admin/clients');
              }}
              style={{
                background: '#00C4CC',
                color: '#111827',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Volver al Panel Admin →
            </button>
          </div>
        )}

        {/* Topbar */}
        <header className="topbar">
          {/* Hamburger — CSS shows it only on mobile */}
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
            style={{ background: 'rgba(0,0,0,0.07)', color: '#374151', marginRight: 12 }}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ flex: 1 }}>
            <span>Home</span>
            {pathParts.map((part, i) => {
              const isLast = i === pathParts.length - 1;
              const label = (isLast && customBreadcrumbLabel) ? customBreadcrumbLabel : (breadcrumbMap[part] || part);
              return (
                <span key={part} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChevronRight size={14} color="#9CA3AF" />
                  <span className={isLast ? 'current' : ''}>{label}</span>
                </span>
              );
            })}
          </div>
        </header>

        {/* Main Content — page-enter triggers fade-up on each route change */}
        <main
          ref={mainContentRef}
          className="layout-main-content"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', maxWidth: '100%' }}
        >
          <div
            key={pageKey}
            className="page-enter"
            style={{ maxWidth: fullWidth ? 'none' : '100%', padding: '32px', width: '100%', boxSizing: 'border-box' }}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Global Toast Container */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      {/* Admin Notice for New Referrals */}
      {user?.role === 'admin' && !isImpersonating && <NewReferralsNotice />}
    </div>
  );
}
