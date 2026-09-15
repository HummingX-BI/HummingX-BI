import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CreditCard, 
  Users, 
  Award, 
  ShoppingBag, 
  HelpCircle, 
  LogOut, 
  MessageCircle, 
  UserCircle 
} from 'lucide-react';

const logoSrc = '/logo.png';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clientLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { to: '/project', icon: FolderKanban, label: 'Mi Proyecto' },
    { to: '/referrals', icon: Users, label: 'Mis Referidos', isDev: true },
  ];

  const adminLinks = [
    { to: '/admin/clients', icon: Users, label: 'Directorio Clientes' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 8px', marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <img src={logoSrc} alt="HummingX BI" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#4B1D6F', margin: 0, letterSpacing: '-0.5px' }}>HummingX BI</h2>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#00C4CC', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Portal de Clientes</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map(({ to, icon: Icon, label, isDev }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              if (isDev) {
                e.preventDefault();
                alert("Nuestro equipo está trabajando en esta función. ¡Próximamente!");
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Icon size={18} />
              <span>{label}</span>
            </div>
            {isDev && (
              <span style={{ fontSize: '9px', background: '#FDE68A', color: '#D97706', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>Dev</span>
            )}
          </NavLink>
        ))}

        {/* WhatsApp divider */}
        <div style={{ borderTop: '1px solid #E2E8F0', margin: '16px 0' }} />

        <a
          href="https://wa.me/525575084267?text=Hola%20HummingX%20BI%2C%20necesito%20ayuda%20con%20mi%20proyecto"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
          style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MessageCircle size={18} />
          Soporte por WhatsApp
        </a>
      </nav>

      {/* User info + logout */}
      <div style={{
        borderTop: '1px solid #E2E8F0',
        paddingTop: '16px',
        marginTop: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: '#F1F5F9' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00C4CC20, #4B1D6F20)',
            border: '1px solid rgba(0,196,204,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <UserCircle size={20} color="#00C4CC" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.companyName || user?.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isAdmin ? 'Administrador' : 'Cliente VIP'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', marginTop: '8px', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444' }}
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
