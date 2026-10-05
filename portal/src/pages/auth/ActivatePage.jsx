import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { WelcomeAudio } from '../../lib/welcomeAudio';
import './WelcomeActivate.css';

const logoSrc = '/logo.png';

function WelcomeScrollSequence({ onComplete }) {
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    // Restauramos scroll a 0 por si acaso
    window.scrollTo(0, 0);
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#040810';
    document.documentElement.classList.add('hide-scrollbar-global');

    const heroWords = [
      { text: 'Bienvenido',  classes: [] },
      { text: 'a',  classes: [] },
      { text: 'HummingX', classes: ['brand-name'] },
      { text: 'BI', classes: ['brand-name'] },
    ];

    const heroEl = document.getElementById('hero-text');
    if (heroEl && heroEl.children.length === 0) {
      heroWords.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word ' + w.classes.join(' ');
        span.textContent = w.text + (i < heroWords.length - 1 ? '\u00A0' : '');
        span.style.transitionDelay = `${i * 0.15}s`;
        heroEl.appendChild(span);
      });
    }

    const middleWords = [
      { text: 'Gracias', classes: [] },
      { text: 'por', classes: [] },
      { text: 'confiar', classes: ['text-cyan-400'] },
      { text: 'en', classes: [] },
      { text: 'nosotros.', classes: [] },
      { text: 'Nos', classes: [] },
      { text: 'emociona', classes: ['text-purple-400'] },
      { text: 'acompañarte', classes: [] },
      { text: 'en', classes: [] },
      { text: 'este', classes: [] },
      { text: 'viaje', classes: [] },
      { text: 'y', classes: [] },
      { text: 'ver', classes: [] },
      { text: 'crecer', classes: ['text-blue-400'] },
      { text: 'tu', classes: [] },
      { text: 'negocio.', classes: [] },
    ];

    const middleEl = document.getElementById('middle-text');
    if (middleEl && middleEl.children.length === 0) {
      middleWords.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word ' + w.classes.join(' ');
        span.textContent = w.text + (i < middleWords.length - 1 ? '\u00A0' : '');
        middleEl.appendChild(span);
      });
    }

    const TOTAL_SECTIONS = 4.5;
    const trackHeight = window.innerHeight * TOTAL_SECTIONS;
    const trackEl = document.getElementById('track');
    if (trackEl) trackEl.style.height = trackHeight + 'px';

    const panelHero  = document.getElementById('panel-hero');
    const panelCards = document.getElementById('panel-cards');
    const panelPlace = document.getElementById('panel-place');
    const finalSplash = document.getElementById('final-splash');
    const heroSub = document.getElementById('hero-sub');

    let heroWordsNodes = null;
    let middleWordsNodes = null;

    setTimeout(() => {
      heroWordsNodes = heroEl?.querySelectorAll('.word') || null;
      middleWordsNodes = middleEl?.querySelectorAll('.word') || null;
    }, 50);

    function showPanel(el) {
      [panelHero, panelCards, panelPlace].forEach(p => p?.classList.remove('active'));
      if (el) el.classList.add('active');
    }

    function triggerCards(secProgress) {
      const progress = Math.max(0, Math.min(1, (secProgress - 1.2) / 0.8));
      middleWordsNodes?.forEach((w, i) => {
        const threshold = i / (middleWordsNodes?.length || 1);
        if (progress > threshold) w.classList.add('shown');
        else w.classList.remove('shown');
      });
    }

    function triggerPlace() {
      document.getElementById('place-text')?.classList.add('shown');
      document.getElementById('place-sub')?.classList.add('shown');
    }

    function showSplash() {
      if (finalSplash) finalSplash.classList.add('active');
    }

    function hideSplash() {
      if (finalSplash) finalSplash.classList.remove('active');
    }

    let scrollTimeout = null;
    const globalHint = document.getElementById('global-scroll-hint');

    function resetScrollHint(sec) {
      if (globalHint) globalHint.classList.remove('visible');
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      // If we are not at the very end, set a timeout to show the hint
      if (sec < 3.2) {
        scrollTimeout = setTimeout(() => {
          if (globalHint) globalHint.classList.add('visible');
        }, 4000);
      }
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }

    function handleScroll() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const sec = scrollY / vh;
      resetScrollHint(sec);

      if (sec < 1.2) {
        showPanel(panelHero);
        heroWordsNodes?.forEach((w, i) => {
          if (sec >= i * 0.15) w.classList.add('shown');
          else w.classList.remove('shown');
        });
        if (sec > 0.6 && heroSub) heroSub.classList.add('shown');
        else if (sec <= 0.6 && heroSub) heroSub.classList.remove('shown');
      }
      else if (sec < 2.5) {
        showPanel(panelCards);
        triggerCards(sec);
      }
      else if (sec < 3.2) {
        showPanel(panelPlace);
        triggerPlace();
        hideSplash();
      }
      else {
        showPanel(null);
        showSplash();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (panelHero) panelHero.classList.add('active');

    try {
      WelcomeAudio.start();
    } catch (e) { console.warn(e) }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      document.body.style.backgroundColor = originalBodyBg;
      document.documentElement.classList.remove('hide-scrollbar-global');
    };
  }, []);

  const handleEnter = () => {
    WelcomeAudio.startDashboardFadeOut(4);
    const overlay = document.getElementById('exit-overlay');
    if (overlay) overlay.classList.add('active');
    setTimeout(() => {
      onComplete();
    }, 900);
  };

  return (
    <div className="welcome-root">
      <div className="ambient">
        <div className="light light-purple" id="lp"></div>
        <div className="light light-cyan"   id="lc"></div>
        <div className="light light-blue"   id="lb"></div>
      </div>
      <div className="particles"></div>

      <div className="scroll-track" id="track"></div>

      <div className="stage">
        <div className="panel" id="panel-hero">
          <h1 className="hero-greeting" id="hero-text"></h1>
          <p className="hero-sub" id="hero-sub">
            Tu portal interactivo está listo.<br/>
            Nos entusiasma acompañarte en cada paso de tu proyecto.
          </p>
          <div className="scroll-hint">
            <span>Desliza para continuar</span>
            <div className="scroll-arrow"></div>
          </div>
        </div>

        <div className="panel" id="panel-cards">
          <h2 className="middle-greeting" id="middle-text"></h2>
        </div>

        <div className="panel" id="panel-place">
          <p className="place-text" id="place-text">Tu portal interactivo<br/>ya está preparado.</p>
          <p className="place-sub"  id="place-sub">Prepárate para llevar tu operación al siguiente nivel.</p>
        </div>
      </div>

      <div id="final-splash" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src={logoSrc} alt="HummingX BI" className="splash-title" style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 24px', display: 'block', filter: 'drop-shadow(0 0 20px rgba(0, 188, 212, 0.3))' }} />
        <h1 className="splash-title hero-greeting" style={{ margin: '0 0 16px', color: '#fff' }}>
          Todo <span style={{ background: 'linear-gradient(135deg, #00C4CC, #00E5FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>listo.</span>
        </h1>
        <p className="splash-sub" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px' }}>
          Tu ecosistema digital está configurado y altamente asegurado.
        </p>
        <button onClick={handleEnter} style={{ background: 'none', border: 'none', color: '#00C4CC', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '50px', transition: 'all 0.3s' }} onMouseEnter={(e) => e.target.style.textShadow = '0 0 10px rgba(0,196,204,0.5)'} onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
          Acceder al portal <ArrowRight size={20} />
        </button>
      </div>

      <div id="global-scroll-hint" className="global-scroll-hint">
        <span>Sigue deslizando hacia abajo</span>
        <div className="scroll-arrow"></div>
      </div>
      <div id="exit-overlay"></div>
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
        if (err.response?.data?.alreadyActivated) {
          setAlreadyActivated(true);
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        }
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
            {!alreadyActivated && (
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
                Crea tu contraseña para activar tu cuenta
              </p>
            )}
          </div>

          {alreadyActivated ? (
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
