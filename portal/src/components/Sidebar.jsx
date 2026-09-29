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
} from 'lucide-react';

const logoSrc = '/logo.png';

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Close drawer on route change
  useEffect(() => { onClose(); }, [location.pathname]);

  // Fetch admin client list
  useEffect(() => {
    if (isAdminRoute) {
      api.get('/admin/clients').then(res => setClients(res.data)).catch(console.error);
    }
  }, [isAdminRoute]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { to: '/project',   icon: FolderKanban,   label: 'Mi Proyecto' },
    { to: '/referrals', icon: Users,           label: 'Mis Referidos', isDev: true },
  ];

  const adminLinks = [
    { to: '/admin/clients',   icon: Users,    label: 'Resumen Clientes' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Control & Analíticas' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

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

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Logo Block ─────────────────────────────────────── */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
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
              {isAdminRoute ? 'Panel Administrativo' : 'Portal de Clientes'}
            </p>
          </div>
          {isAdminRoute && (
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px',
              borderRadius: '9999px', background: '#DBEAFE', color: '#1D4ED8', flexShrink: 0,
            }}>Admin</span>
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
        <nav className="client-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 12px' }}>
          <div className="section-label">{isAdminRoute ? 'Gestión' : 'Navegación'}</div>

          {links.map(({ to, icon: Icon, label, isDev }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} tour-step-${to.replace(/\//g, '')}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {isDev && (
                <span style={{
                  fontSize: '10px', background: 'rgba(255,255,255,0.1)',
                  color: '#9CA3AF', padding: '2px 6px', borderRadius: '9999px', fontWeight: 600,
                }}>Dev</span>
              )}
            </NavLink>
          ))}

          <hr className="separator" style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          {isAdminRoute ? (
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
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          ) : (
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
          )}
        </nav>

        {/* ── User Card + Logout ────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 12px 16px' }}>
          {/* User info row */}
          {user && (
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
                    objectFit: 'contain', background: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '2px', flexShrink: 0,
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
