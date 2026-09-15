import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdminRoute) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    
    return () => {
      // Clean up if component unmounts
      document.body.classList.remove('light-theme');
    };
  }, [isAdminRoute]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isAdminRoute ? '#0b0b0e' : '#F8FAFC', position: 'relative' }}>
      <Sidebar />

      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1, color: isAdminRoute ? '#FFFFFF' : '#0F172A' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
