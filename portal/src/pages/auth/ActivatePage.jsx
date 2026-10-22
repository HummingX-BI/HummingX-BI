import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { WelcomeAudio } from '../../lib/welcomeAudio';
import './WelcomeActivate.css';

const logoSrc = '/logo.png';

const HERO_WORDS = [
  { text: 'Bienvenido', cls: '' },
  { text: 'a', cls: '' },
  { text: 'HummingX', cls: 'brand-name' },
  { text: 'BI', cls: 'brand-name' },
];

const MIDDLE_WORDS = [
  { text: 'Gracias', cls: '' },
  { text: 'por', cls: '' },
  { text: 'confiar', cls: 'text-cyan-400' },
  { text: 'en', cls: '' },
  { text: 'nosotros.', cls: '' },
  { text: 'Nos', cls: '' },
  { text: 'emociona', cls: 'text-purple-400' },
  { text: 'acompañarte', cls: '' },
  { text: 'en', cls: '' },
  { text: 'este', cls: '' },
  { text: 'viaje', cls: '' },
  { text: 'y', cls: '' },
  { text: 'ver', cls: '' },
  { text: 'crecer', cls: 'text-blue-400' },
  { text: 'tu', cls: '' },
  { text: 'negocio.', cls: '' },
];

/*
 * Línea de tiempo en "pantallas" de scroll (1 = una altura de viewport).
 * La pista mide END + 1 pantallas (ver .welcome-track en WelcomeActivate.css: 490%).
 */
const T = {
  heroOut:  [0.45, 1.0],
  midIn:    [0.85, 1.25],
  midWords: [1.05, 2.15],
  midOut:   [2.35, 2.7],
  placeIn:  [2.6, 2.95],
  placeOut: [3.25, 3.55],
  splashAt: 3.45,
  end: 3.9,
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const range = (p, [a, b]) => clamp01((p - a) / (b - a));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function WelcomeScrollSequence({ onComplete }) {
  const rootRef = useRef(null);
  const heroPanelRef = useRef(null);
  const midPanelRef = useRef(null);
  const placePanelRef = useRef(null);
  const splashRef = useRef(null);
  const hintRef = useRef(null);
  const progressRef = useRef(null);
  const midWordRefs = useRef([]);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const html = document.documentElement;
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#040810';
    html.classList.add('welcome-lock');

    root.scrollTop = 0;
    try { root.focus({ preventScroll: true }); } catch { /* noop */ }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const heroPanel = heroPanelRef.current;
    const midPanel = midPanelRef.current;
    const placePanel = placePanelRef.current;
    const splash = splashRef.current;
    const hint = hintRef.current;
    const bar = progressRef.current;
    const words = midWordRefs.current.filter(Boolean);
    const n = words.length;

    let vh = root.clientHeight || window.innerHeight;
    let target = 0;
    let current = 0;
    let raf = 0;
    let lastTs = 0;
    let splashOn = false;
    let hintTimer = null;

    // Pequeño desplazamiento según el tamaño de pantalla (menos en móvil = más limpio)
    const shift = () => Math.min(64, vh * 0.07);

    function panelStyle(el, opacity, y, scale = 1) {
      if (!el) return;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = reduceMotion
        ? 'none'
        : `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      el.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible';
    }

    function render(p) {
      const d = shift();

      // 1) Hero: sale hacia arriba con un leve zoom-out
      const heroOut = easeInOut(range(p, T.heroOut));
      panelStyle(heroPanel, 1 - heroOut, -heroOut * d, 1 - heroOut * 0.05);

      // 2) Mensaje: entra desde abajo, las palabras se "encienden" una por una
      const midIn = easeOut(range(p, T.midIn));
      const midOut = easeInOut(range(p, T.midOut));
      panelStyle(midPanel, midIn * (1 - midOut), (1 - midIn) * d - midOut * d, 0.97 + midIn * 0.03);

      const s = range(p, T.midWords);
      for (let i = 0; i < n; i++) {
        const start = (i / n) * 0.82;
        const t = easeOut(clamp01((s - start) / 0.18));
        const w = words[i];
        w.style.opacity = (0.14 + 0.86 * t).toFixed(3);
        w.style.transform = reduceMotion ? 'none' : `translate3d(0, ${((1 - t) * 14).toFixed(1)}px, 0)`;
      }

      // 3) "Tu portal está preparado"
      const placeIn = easeOut(range(p, T.placeIn));
      const placeOut = easeInOut(range(p, T.placeOut));
      panelStyle(placePanel, placeIn * (1 - placeOut), (1 - placeIn) * d - placeOut * d, 1 + placeOut * 0.04);

      // 4) Splash final (sus elementos tienen transiciones escalonadas en CSS)
      const wantSplash = p >= T.splashAt;
      if (wantSplash !== splashOn) {
        splashOn = wantSplash;
        splash?.classList.toggle('active', wantSplash);
      }

      if (bar) bar.style.transform = `scaleX(${clamp01(p / T.end).toFixed(4)})`;
    }

    function tick(ts) {
      raf = 0;
      const dt = lastTs ? Math.min(64, ts - lastTs) : 16.67;
      lastTs = ts;
      const diff = target - current;
      if (reduceMotion || Math.abs(diff) < 0.0008) {
        current = target;
      } else {
        // Suavizado independiente de los fps (60/90/120 Hz se sienten igual)
        const k = 1 - Math.pow(1 - 0.16, dt / 16.67);
        current += diff * k;
      }
      render(current);
      if (current !== target) raf = requestAnimationFrame(tick);
      else lastTs = 0;
    }

    function kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function scheduleHint() {
      hint?.classList.remove('visible');
      if (hintTimer) clearTimeout(hintTimer);
      if (target < T.splashAt) {
        hintTimer = setTimeout(() => hint?.classList.add('visible'), 3800);
      }
    }

    function onScroll() {
      target = root.scrollTop / vh;
      scheduleHint();
      kick();
    }

    function onResize() {
      vh = root.clientHeight || window.innerHeight;
      target = root.scrollTop / vh;
      kick();
    }

    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    render(0);
    scheduleHint();
    // El hero se anima solo al entrar (no espera al primer scroll)
    const introTimer = setTimeout(() => root.classList.add('is-ready'), 60);

    try { WelcomeAudio.start(); } catch (e) { console.warn(e); }

    return () => {
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      if (hintTimer) clearTimeout(hintTimer);
      clearTimeout(introTimer);
      document.body.style.backgroundColor = originalBodyBg;
      html.classList.remove('welcome-lock');
    };
  }, []);

  const handleEnter = () => {
    if (exiting) return;
    setExiting(true);
    WelcomeAudio.startDashboardFadeOut(4);
    setTimeout(() => onComplete(), 900);
  };

  return (
    <div className="welcome-root" ref={rootRef} tabIndex={-1}>
      <div className="welcome-progress" aria-hidden="true">
        <div className="welcome-progress__bar" ref={progressRef}></div>
      </div>

      <div className="ambient" aria-hidden="true">
        <div className="light light-purple"></div>
        <div className="light light-cyan"></div>
        <div className="light light-blue"></div>
      </div>
      <div className="particles" aria-hidden="true"></div>

      <div className="welcome-track" aria-hidden="true"></div>

      <div className="stage">
        <div className="panel" ref={heroPanelRef}>
          <h1 className="hero-greeting">
            {HERO_WORDS.map((w, i) => (
              <span
                key={i}
                className={`word word--intro ${w.cls}`}
                style={{ transitionDelay: `${0.15 + i * 0.14}s` }}
              >
                {w.text}{i < HERO_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <p className="hero-sub">
            Tu portal interactivo está listo.<br />
            Nos entusiasma acompañarte en cada paso de tu proyecto.
          </p>
          <div className="scroll-hint">
            <span>Desliza para continuar</span>
            <div className="scroll-arrow"></div>
          </div>
        </div>

        <div className="panel" ref={midPanelRef}>
          <h2 className="middle-greeting">
            {MIDDLE_WORDS.map((w, i) => (
              <span key={i} ref={(el) => { midWordRefs.current[i] = el; }} className={`word ${w.cls}`}>
                {w.text}{i < MIDDLE_WORDS.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>
        </div>

        <div className="panel" ref={placePanelRef}>
          <p className="place-text">Tu portal interactivo<br />ya está preparado.</p>
          <p className="place-sub">Prepárate para llevar tu operación al siguiente nivel.</p>
        </div>
      </div>

      <div id="final-splash" ref={splashRef}>
        <img src={logoSrc} alt="HummingX BI" className="splash-logo" />
        <h1 className="splash-title">
          Todo <span className="splash-title__accent">listo.</span>
        </h1>
        <p className="splash-sub">Tu ecosistema digital está configurado y altamente asegurado.</p>
        <button type="button" className="splash-cta" onClick={handleEnter}>
          Acceder al portal <ArrowRight size={20} />
        </button>
      </div>

      <div ref={hintRef} className="global-scroll-hint" aria-hidden="true">
        <span>Sigue deslizando hacia abajo</span>
        <div className="scroll-arrow"></div>
      </div>
      <div id="exit-overlay" className={exiting ? 'active' : ''}></div>
    </div>
  );
}


export default function ActivatePage() {
  const { token } = useParams();
  const { activate } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('password'); 
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activatedUser, setActivatedUser] = useState(null);
  const [alreadyActivated, setAlreadyActivated] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(null); // null | 'expired' | 'replaced'
  const [checkingToken, setCheckingToken] = useState(token !== 'test');

  useEffect(() => {
    if (!token || token === 'test') {
      setCheckingToken(false);
      return;
    }
    api.get(`/auth/verify-invitation/${token}`)
      .then(res => {
        if (res.data?.alreadyActivated) {
          setAlreadyActivated(true);
        }
      })
      .catch(err => {
        const status = err.response?.status;
        if (err.response?.data?.alreadyActivated) setAlreadyActivated(true);
        // 400 = el enlace caducó (72 h). 404 = el token ya no existe: lo reemplazó un
        // correo de recordatorio más reciente. Antes ambos casos mostraban
        // "¡Ya creaste tu contraseña!", que es falso y deja al cliente atorado.
        else if (status === 400) setLinkInvalid('expired');
        else if (status === 404) setLinkInvalid('replaced');
        // Error de red/servidor: dejamos el formulario; el POST validará de nuevo.
      })
      .finally(() => setCheckingToken(false));
  }, [token]);

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
    // Desbloquear audio dentro del click (requisito de iOS) para que la música
    // suene y luego se pueda desvanecer suavemente.
    try { WelcomeAudio.prime(); } catch { /* noop */ }
    try {
      let user;
      if (token === 'test') {
        user = { role: 'client' };
      } else {
        user = await activate(token, form.password);
      }
      setActivatedUser(user);
      setStep('welcome');
    } catch (err) {
      if (err.response?.data?.alreadyActivated || err.response?.data?.error?.includes('ya fue activada') || err.response?.data?.error?.includes('creado tu contraseña')) {
        setAlreadyActivated(true);
      } else if (err.response?.data?.error?.includes('inválido o expirado')) {
        setLinkInvalid('expired');
      } else {
        setError(err.response?.data?.error || 'El enlace de activación es inválido o ha expirado.');
      }
      setLoading(false);
    }
  };

  if (step === 'welcome') {
    return <WelcomeScrollSequence onComplete={() => {
      navigate(activatedUser?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }} />;
  }

  if (checkingToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0b0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="bars-loader"><div></div><div></div><div></div></div>
      </div>
    );
  }

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
      <div className="ambient-glow" />

      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '4rem 4rem',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }} className="fade-in-up">
        <div className="glass-card" style={{ 
          padding: '40px 36px', 
          background: 'rgba(15, 15, 20, 0.6)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <img src={logoSrc} alt="HummingX BI" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '26px', color: 'white', lineHeight: 1 }}>
                  HummingX <span style={{ background: 'linear-gradient(135deg, #00C4CC, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BI</span>
                </div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Portal de Clientes
                </div>
              </div>
            </div>
            {!alreadyActivated && !linkInvalid && (
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                Crea tu contraseña para activar tu cuenta
              </p>
            )}
          </div>

          {linkInvalid && !alreadyActivated ? (
            <div className="activate-expired">
              <div className="activate-expired__icon">
                <Clock size={30} />
              </div>
              <h3 className="activate-expired__title">
                {linkInvalid === 'expired' ? 'Este enlace ya caducó' : 'Este enlace ya no es válido'}
              </h3>
              <p className="activate-expired__text">
                {linkInvalid === 'expired'
                  ? 'Por seguridad, los enlaces de activación duran 3 días. Pídele a tu contacto de HummingX BI que te reenvíe la invitación y usa el enlace del correo nuevo.'
                  : 'Te enviamos un correo más reciente con un enlace nuevo. Búscalo en tu bandeja (o en spam) y ábrelo desde ahí. Si no lo encuentras, pide que te reenvíen la invitación.'}
              </p>
              <button type="button" className="activate-expired__btn" onClick={() => navigate('/login')}>
                Ir a Iniciar Sesión →
              </button>
            </div>
          ) : alreadyActivated ? (
            <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 196, 204, 0.12)',
                border: '1px solid rgba(0, 196, 204, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: '#00C4CC',
                boxShadow: '0 0 24px rgba(0, 196, 204, 0.2)'
              }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
                ¡Ya creaste tu contraseña!
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: '0 0 28px' }}>
                Tu cuenta ya se encuentra activa. Puedes ingresar a tu portal de clientes con tu correo y contraseña.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '13px 36px',
                    fontSize: '14px',
                    fontWeight: 700,
                    borderRadius: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    background: '#00C4CC',
                    color: '#0b0b0e',
                    border: 'none',
                    boxShadow: '0 4px 18px rgba(0, 196, 204, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Ir a Iniciar Sesión →
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                  marginBottom: '20px', textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#fca5a5' }}>{error}</span>
                  </div>
                  {(error.toLowerCase().includes('activada') || error.toLowerCase().includes('inicia sesión') || error.toLowerCase().includes('expirado') || error.toLowerCase().includes('inválido')) && (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={{
                          background: '#00C4CC',
                          color: '#0b0b0e',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '10px 24px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Ir a Iniciar Sesión →
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      style={{ paddingLeft: '42px', paddingRight: '42px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', outline: 'none' }}
                      placeholder="Mínimo 8 caracteres"
                      value={form.password}
                      onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

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
                      style={{ paddingLeft: '42px', paddingRight: '42px', background: 'rgba(0,0,0,0.3)', color: 'white', width: '100%', padding: '12px 14px 12px 42px', borderRadius: '8px', outline: 'none', borderColor: form.confirm && form.confirm !== form.password ? 'rgba(239,68,68,0.5)' : form.confirm && form.confirm === form.password ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)' }}
                      placeholder="Repite tu contraseña"
                      value={form.confirm}
                      onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
                    />
                    {form.confirm && form.confirm === form.password && (
                      <CheckCircle size={16} color="#22c55e" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'white', color: 'black', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '16px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)' }}>
                  {loading ? 'Activando...' : 'Activar Cuenta'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
