import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const logoSrc = '/Logo HummingX BI png.png';

export default function ActivatePage() {
  const { token } = useParams();
  const { activate } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (pwd) => {
    if (pwd.length === 0) return { score: 0, label: '', color: 'transparent' };
    if (pwd.length < 6) return { score: 1, label: 'Muy corta', color: '#ef4444' };
    if (pwd.length < 8) return { score: 2, label: 'Débil', color: '#f97316' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { score: 3, label: 'Regular', color: '#eab308' };
    return { score: 4, label: 'Fuerte', color: '#22c55e' };
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden.');
    }
    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    setLoading(true);
    try {
      const user = await activate(token, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'El enlace de activación es inválido o ha expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0b0b0e',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="ambient-glow" />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }} className="fade-in-up">
        <div className="glass-card" style={{ padding: '40px 36px' }}>

          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,196,204,0.15)', borderRadius: '50%', filter: 'blur(12px)' }} />
              <img src={logoSrc} alt="HummingX BI" style={{ width: '48px', height: '48px', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '22px', color: 'white', marginBottom: '8px' }}>
              ¡Bienvenido a tu portal!
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              Crea una contraseña segura para acceder a tu cuenta de HummingX BI
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '20px',
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span style={{ fontSize: '13px', color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Nueva contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="hx-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength indicator */}
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Confirmar contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="hx-input"
                  style={{ paddingLeft: '42px', paddingRight: '42px', borderColor: form.confirm && form.confirm !== form.password ? 'rgba(239,68,68,0.5)' : form.confirm && form.confirm === form.password ? 'rgba(34,197,94,0.5)' : undefined }}
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={16} color="#22c55e" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Activando cuenta...' : '✓ Activar mi cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
