import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

const logoSrc = '/logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wakingDbNotice, setWakingDbNotice] = useState(false);
  const [retryStatus, setRetryStatus] = useState('');
  const timerRef = useRef(null);

  // Silently wake up serverless PostgreSQL instance as soon as the login page loads
  useEffect(() => {
    api.get('/auth/warmup').catch(() => {});
  }, []);

  const executeLogin = async (email, password, isAutoRetry = false) => {
    setError('');
    setLoading(true);
    setWakingDbNotice(false);

    // If request takes longer than 1.4s, notify user that DB is waking up
    timerRef.current = setTimeout(() => {
      setWakingDbNotice(true);
    }, 1400);

    try {
      const user = await login(email, password);
      clearTimeout(timerRef.current);
      const isNfc = user.role === 'nfc_operator' || user.role === 'NFC_OPERATOR';
      if (isNfc) {
        navigate('/admin/tarjetas-qr', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      clearTimeout(timerRef.current);
      const isWaking = err.response?.data?.isWakingUp || err.response?.status === 503 || err.response?.status === 504 || (err.message || '').includes('timeout');
      
      if (isWaking && !isAutoRetry) {
        setRetryStatus('Reactivando base de datos segura en la nube... Reintentando automáticamente en 2 segundos.');
        setWakingDbNotice(true);
        setTimeout(() => {
          setRetryStatus('Reconectando...');
          executeLogin(email, password, true);
        }, 2200);
        return;
      }

      setRetryStatus('');
      setWakingDbNotice(false);
      const apiError = err.response?.data?.error;
      let errorMsg = 'Error al iniciar sesión. Verifica tus credenciales.';
      if (typeof apiError === 'string') {
        errorMsg = apiError;
      } else if (apiError && typeof apiError === 'object' && apiError.message) {
        errorMsg = apiError.message;
      }
      setError(errorMsg);
    } finally {
      clearTimeout(timerRef.current);
      if (!retryStatus) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeLogin(form.email, form.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0b0e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div className="ambient-glow" />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '4rem 4rem',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }} className="fade-in-up">
        {/* Card */}
        <div className="glass-card" style={{ 
          padding: '40px 36px', 
          background: 'rgba(15, 15, 20, 0.6)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <img src={logoSrc} alt="HummingX BI" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '20px', color: 'white', lineHeight: 1 }}>
                  HummingX <span style={{ background: 'linear-gradient(135deg, #00C4CC, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BI</span>
                </div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Portal de Clientes
                </div>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
              Accede para ver el progreso de tu proyecto
            </p>
          </div>

          {/* Cold start database wake up banner */}
          {(wakingDbNotice || retryStatus) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(0, 196, 204, 0.1)', border: '1px solid rgba(0, 196, 204, 0.3)',
              marginBottom: '20px',
            }}>
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(0, 196, 204, 0.3)', borderTopColor: '#00C4CC', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '12.5px', color: '#67e8f9', lineHeight: 1.4 }}>
                {retryStatus || 'Conectando con la base de datos segura en la nube... Los servidores se reactivan al primer acceso.'}
              </span>
            </div>
          )}

          {/* Error */}
          {error && !retryStatus && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '20px',
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span style={{ fontSize: '13px', color: '#fca5a5' }}>
                {typeof error === 'object' ? error.message || JSON.stringify(error) : String(error)}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  className="hx-input"
                  style={{ 
                    paddingLeft: '42px', 
                    background: 'rgba(0,0,0,0.2)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white' 
                  }}
                  placeholder="tu@empresa.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="hx-input"
                  style={{ 
                    paddingLeft: '42px', paddingRight: '42px',
                    background: 'rgba(0,0,0,0.2)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'white' 
                  }}
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#00C4CC', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '4px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0b0b0e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Iniciando sesión...
                </>
              ) : 'Acceder al Portal'}
            </button>
          </form>

          {/* Quick Login Buttons (Dev) */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setForm({ email: 'admin@hummingxbi.com', password: 'HummingX2024!' })}
                style={{ padding: '4px 10px', fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Llenar Admin
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: 'demo@tahara.cafe', password: 'demo1234' })}
                style={{ padding: '4px 10px', fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}
              >
                Llenar Demo
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              ¿No tienes acceso?{' '}
              <a href="https://wa.me/525575084267" target="_blank" rel="noopener noreferrer" style={{ color: '#00C4CC', textDecoration: 'none' }}>
                Contáctanos por WhatsApp
              </a>
            </p>
          </div>
        </div>

        {/* Back to landing */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="https://hummingxbi.com" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            ← Volver a HummingX BI
          </a>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
