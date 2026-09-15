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

  useEffect(() => {
    const token = localStorage.getItem('hx_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => { setUser(data); localStorage.setItem('hx_user', JSON.stringify(data)); })
        .catch(() => { localStorage.removeItem('hx_token'); localStorage.removeItem('hx_user'); setUser(null); })
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
    setUser(null);
  };

  const activate = async (token, password) => {
    const { data } = await api.post('/auth/activate', { token, password });
    localStorage.setItem('hx_token', data.token);
    localStorage.setItem('hx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, activate, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
