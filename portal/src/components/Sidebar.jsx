import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users,
  LogOut, 
  MessageCircle, 
  ChevronRight,
  Search,
  Building,
  BarChart3,
  Menu,
  X,
  Calendar,
  Briefcase,
  CalendarDays,
  CheckSquare,
  DollarSign,
  QrCode
} from 'lucide-react';

const logoSrc = '/logo.png';

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user, logout, isAdmin, isNfcOperator: authIsNfc } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newReferralsCount, setNewReferralsCount] = useState(0);

  const isNfcOperator = authIsNfc || user?.role === 'nfc_operator' || user?.role === 'NFC_OPERATOR';
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Close drawer on route change
  useEffect(() => { onClose(); }, [location.pathname]);

  // Sync new referrals count for CRM badge (only for full admin)
  useEffect(() => {
    const handleCount = (e) => {
      if (typeof e.detail?.count === 'number') {
        setNewReferralsCount(e.detail.count);
      }
    };
    window.addEventListener('hx:new-referrals-count', handleCount);

    if (isAdminRoute && !isNfcOperator && isAdmin) {
      try {
        const since = localStorage.getItem('hx_ref_seen') || '';
        api.get(since ? `/admin/referrals/new?since=${encodeURIComponent(since)}` : '/admin/referrals/new')
          .then(res => {
            if (res.data?.count !== undefined) setNewReferralsCount(res.data.count);
          })
          .catch(() => {});
      } catch {}
    }

    return () => window.removeEventListener('hx:new-referrals-count', handleCount);
  }, [location.pathname, isAdminRoute, isNfcOperator, isAdmin]);

  // Fetch admin client list (only for full admin)
  useEffect(() => {
    if (isAdminRoute && !isNfcOperator && isAdmin) {
      api.get('/admin/clients').then(res => setClients(res.data)).catch(console.error);
    }
  }, [isAdminRoute, isNfcOperator, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clientSections = [
    {
      title: 'Navegación',
      links: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
        { to: '/project',   icon: FolderKanban,   label: 'Mi Proyecto' },
        { to: '/pagos',     icon: Calendar,       label: 'Plan de Pagos' },
        { to: '/referrals', icon: Users,          label: 'Mis Referidos' },
      ],
    },
  ];

  const adminSections = [
    {
      title: 'Comercial',
      links: [
        { to: '/admin/prospects',   icon: Briefcase,    label: 'CRM Prospectos' },
        { to: '/admin/citas',       icon: CalendarDays, label: 'Agenda de Citas' },
      ],
    },
    {
      title: 'Operación',
      links: [
        { to: '/admin/clients',     icon: Users,        label: 'Clientes Activos' },
        { to: '/admin/tareas',      icon: CheckSquare,  label: 'Tareas' },
        { to: '/admin/tarjetas-qr', icon: QrCode,       label: 'Tarjetas QR & NFC' },
      ],
    },
    {
      title: 'Dinero',
      links: [
        { to: '/admin/finanzas',    icon: DollarSign,   label: 'Finanzas & Cobranza' },
        { to: '/admin/pagos',       icon: Calendar,     label: 'Calendario de Pagos' },
      ],
    },
    {
      title: 'Control',
      links: [
        { to: '/admin/analytics',   icon: BarChart3,    label: 'Control & Analíticas' },
      ],
    },
  ];

  const nfcOperatorSections = [
    {
      title: 'Módulo Asignado',
      links: [
        { to: '/admin/tarjetas-qr', icon: QrCode, label: 'Tarjetas QR & NFC' },
      ],
    },
  ];

  const sections = isNfcOperator
    ? nfcOperatorSections
    : (isAdmin ? adminSections : clientSections);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // User avatar: show logoUrl if available, else initials
  const userInitial = (user?.companyName || user?.name || 'U').charAt(0).toUpperCase();

  const sidebarContent = (
    <aside
      className={`client-sidebar${mobileOpen ? ' sidebar-open' : ''}`}
      style={{
        width: '256px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Ambient background glows */}
      <>
        <div className="ambient-glow" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6 }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
        }} />
      </>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>

        {/* ── Logo Block ─────────────────────────────────────── */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}>
          <img
            src={logoSrc}
            alt="HummingX BI"
            className="sidebar-logo-img"
            style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: 0,
              letterSpacing: '-0.01em', lineHeight: 1.3,
            }}>HummingX BI</h2>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#00C4CC', margin: 0, lineHeight: 1.3 }}>
              {isAdminRoute ? (isNfcOperator ? 'Módulo NFC & QR' : 'Panel Administrativo') : 'Portal de Clientes'}
            </p>
          </div>
          {isAdminRoute && (
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px',
              borderRadius: '9999px',
              background: isNfcOperator ? '#CCFBF1' : '#DBEAFE',
              color: isNfcOperator ? '#0F766E' : '#1D4ED8',
              flexShrink: 0,
            }}>{isNfcOperator ? 'Operador' : 'Admin'}</span>
          )}
          {/* Close button — shown via CSS on mobile */}
          <button
            onClick={onClose}
            style={{
              display: 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', padding: 4, borderRadius: 6,
            }}
            className="sidebar-close-btn"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav Links ─────────────────────────────────────── */}
        <nav className="client-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 12px', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {sections.map((section, sIdx) => (
            <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: sIdx < sections.length - 1 ? '4px' : '0' }}>
              <div className="section-label" style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 8px 2px',
              }}>
                {section.title}
              </div>

              {section.links.map(({ to, icon: Icon, label, isDev }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin' || to === '/dashboard'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} tour-step-${to.replace(/\//g, '')}`}
                >
                  <Icon size={17} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {to === '/admin/prospects' && newReferralsCount > 0 && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#00C4CC',
                      color: '#0D1527',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      minWidth: '18px',
                      textAlign: 'center',
                      lineHeight: '16px'
                    }}>
                      {newReferralsCount}
                    </span>
                  )}
                  {isDev && (
                    <span style={{
                      fontSize: '10px', background: 'rgba(255,255,255,0.1)',
                      color: '#9CA3AF', padding: '2px 6px', borderRadius: '9999px', fontWeight: 600,
                    }}>Dev</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}

          {!isNfcOperator && <hr className="separator" style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.08)' }} />}

          {isAdminRoute && !isNfcOperator ? (
            /* Admin: quick client directory */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div className="section-label" style={{ marginBottom: '8px' }}>Directorio Rápido</div>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px 6px 32px', fontSize: '12px',
                    borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredClients.map(c => {
                  const isActive = location.pathname === `/admin/clients/${c.id}`;
                  return (
                    <Link
                      key={c.id}
                      to={`/admin/clients/${c.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                        borderRadius: '6px', textDecoration: 'none', color: '#D1D5DB',
                        background: isActive ? 'rgba(0,196,204,0.15)' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        transition: 'background 150ms, transform 150ms',
                        transform: isActive ? 'translateX(2px)' : 'none',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(2px)'; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}}
                    >
                      <Building size={14} color={isActive ? '#00C4CC' : '#9CA3AF'} />
                      <span style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.companyName || c.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (!isAdminRoute && !isNfcOperator ? (
            /* Client: WhatsApp support */
            <>
              <div className="section-label">Soporte</div>
              <a
                href="https://wa.me/525575084267?text=Hola%20HummingX%20BI%2C%20necesito%20ayuda%20con%20mi%20proyecto"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item tour-step-support"
                style={{ color: '#00C4CC' }}
              >
                <MessageCircle size={18} />
                <span>Soporte por WhatsApp</span>
                <ChevronRight size={14} style={{ color: '#9CA3AF' }} />
              </a>
            </>
          ) : null)}
        </nav>

        {/* ── User Card + Logout ────────────────────────────── */}
        <div style={{ padding: '12px 12px 16px', flexShrink: 0, marginTop: 'auto' }}>
          {/* User info row */}
          {user && (!isAdminRoute || isNfcOperator) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 10px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              marginBottom: '6px',
            }}>
              {/* Avatar: logo if available, otherwise initials */}
              {user.logoUrl ? (
                <img
                  src={user.logoUrl}
                  alt={user.companyName || user.name}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    objectFit: 'contain', background: 'transparent',
                    border: 'none', padding: 0, flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #00C4CC 0%, #004953 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '15px', fontWeight: 700,
                }}>
                  {userInitial}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px', fontWeight: 600, color: '#F9FAFB',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user.companyName || user.name}
                </div>
                <div style={{
                  fontSize: '11px', color: '#9CA3AF',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{
              width: '100%', padding: '8px 10px',
              border: 'none', background: 'none', cursor: 'pointer',
              color: '#DC2626', fontSize: '13px',
              transition: 'background 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile backdrop — only rendered when open */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {sidebarContent}
    </>
  );
}

// Export hamburger button so Layout can render it in the topbar
export function HamburgerButton({ onClick }) {
  return (
    <button
      className="mobile-menu-btn"
      onClick={onClick}
      aria-label="Abrir menú de navegación"
    >
      <Menu size={20} />
    </button>
  );
}
