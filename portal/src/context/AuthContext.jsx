import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hx_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const [isImpersonating, setIsImpersonating] = useState(() => localStorage.getItem('hx_is_impersonating') === 'true');

  useEffect(() => {
    const token = localStorage.getItem('hx_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => { setUser(data); localStorage.setItem('hx_user', JSON.stringify(data)); })
        .catch(() => { 
          localStorage.removeItem('hx_token'); 
          localStorage.removeItem('hx_user'); 
          localStorage.removeItem('hx_admin_impersonator_token');
          localStorage.removeItem('hx_admin_impersonator_user');
          localStorage.removeItem('hx_is_impersonating');
          setIsImpersonating(false);
          setUser(null); 
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hx_token', data.token);
    localStorage.setItem('hx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('hx_token');
    localStorage.removeItem('hx_user');
    localStorage.removeItem('hx_admin_impersonator_token');
    localStorage.removeItem('hx_admin_impersonator_user');
    localStorage.removeItem('hx_is_impersonating');
    setIsImpersonating(false);
    setUser(null);
  };

  const activate = async (token, password) => {
    const { data } = await api.post('/auth/activate', { token, password });
    localStorage.setItem('hx_token', data.token);
    localStorage.setItem('hx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const impersonate = async (clientId) => {
    const adminToken = localStorage.getItem('hx_token');
    const adminUser = localStorage.getItem('hx_user');
    
    const { data } = await api.post(`/admin/impersonate/${clientId}`);
    
    // Guardar sesión del admin para poder volver
    localStorage.setItem('hx_admin_impersonator_token', adminToken);
    localStorage.setItem('hx_admin_impersonator_user', adminUser);
    localStorage.setItem('hx_is_impersonating', 'true');
    setIsImpersonating(true);
    
    // Establecer sesión del cliente
    localStorage.setItem('hx_token', data.token);
    localStorage.setItem('hx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const stopImpersonating = () => {
    const adminToken = localStorage.getItem('hx_admin_impersonator_token');
    const adminUser = localStorage.getItem('hx_admin_impersonator_user');
    
    if (adminToken && adminUser) {
      localStorage.setItem('hx_token', adminToken);
      localStorage.setItem('hx_user', adminUser);
      localStorage.removeItem('hx_admin_impersonator_token');
      localStorage.removeItem('hx_admin_impersonator_user');
      localStorage.removeItem('hx_is_impersonating');
      setIsImpersonating(false);
      try {
        const parsed = JSON.parse(adminUser);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      activate, 
      isAdmin: user?.role === 'admin',
      isImpersonating,
      impersonate,
      stopImpersonating
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
