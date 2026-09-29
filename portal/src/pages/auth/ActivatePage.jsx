import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { WelcomeAudio } from '../../lib/welcomeAudio';
import './WelcomeActivate.css';

const logoSrc = '/logo.png';

export default function ActivatePage() {
  const { token } = useParams();
  const { activate } = useAuth();
  const navigate = useNavigate();
  
  const hasEnteredRef = useRef(false);
  
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Strength logic
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
      
      // Animación de salida y música
      hasEnteredRef.current = true;
      WelcomeAudio.startDashboardFadeOut(12);
      const overlay = document.getElementById('exit-overlay');
      if (overlay) overlay.classList.add('active');
      
      setTimeout(() => {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }, 900);

    } catch (err) {
      setError(err.response?.data?.error || 'El enlace de activación es inválido o ha expirado.');
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // ANIMATION EFFECTS FROM WELCOME.JSX
  // ----------------------------------------------------
  useEffect(() => {
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#040810';

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
      { text: 'Un', classes: [] },
      { text: 'espacio', classes: [] },
      { text: 'diseñado', classes: [] },
      { text: 'exclusivamente', classes: [] },
      { text: 'para', classes: [] },
      { text: 'ti.', classes: ['text-cyan-400'] },
      { text: 'Sigue', classes: [] },
      { text: 'el', classes: [] },
      { text: 'progreso', classes: [] },
      { text: 'de', classes: [] },
      { text: 'tu', classes: [] },
      { text: 'proyecto,', classes: ['text-purple-400'] },
      { text: 'revisa', classes: [] },
      { text: 'cada', classes: [] },
      { text: 'detalle', classes: [] },
      { text: 'y', classes: [] },
      { text: 'mantén', classes: [] },
      { text: 'el', classes: [] },
      { text: 'control', classes: ['text-blue-400'] },
      { text: 'total.', classes: [] }
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

    const TOTAL_SECTIONS = 6;
    const trackHeight = window.innerHeight * TOTAL_SECTIONS;
    const trackEl = document.getElementById('track');
    if (trackEl) trackEl.style.height = trackHeight + 'px';

    const panelHero  = document.getElementById('panel-hero');
    const panelCards = document.getElementById('panel-cards');
    const panelPlace = document.getElementById('panel-place');
    const finalSplash = document.getElementById('final-splash');
    const heroSub = document.getElementById('hero-sub');

    let splashShown = false;
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
      const progress = Math.max(0, Math.min(1, (secProgress - 2.2) / 0.8));
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

      if (sec < 2) {
        showPanel(panelHero);
        heroWordsNodes?.forEach((w, i) => {
          if (sec >= i * 0.18) w.classList.add('shown');
          else w.classList.remove('shown');
        });
        if (sec > 0.8 && heroSub) heroSub.classList.add('shown');
        else if (sec <= 0.8 && heroSub) heroSub.classList.remove('shown');
      }
      else if (sec < 4) {
        showPanel(panelCards);
        triggerCards(sec);
      }
      else if (sec < 5) {
        showPanel(panelPlace);
        triggerPlace();
        hideSplash(); // Ocultar si hacemos scroll hacia arriba
      }
      else {
        showPanel(null);
        showSplash();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (panelHero) panelHero.classList.add('active');

    WelcomeAudio.start();

    return () => {
      if (!hasEnteredRef.current) {
        WelcomeAudio.stopImmediately();
      }
      window.removeEventListener('scroll', onScroll);
      document.body.style.backgroundColor = originalBodyBg;
    };
  }, []);

  return (
    <div className="welcome-root">
      {/* Ambient Lights */}
      <div className="ambient">
        <div className="light light-purple" id="lp"></div>
        <div className="light light-cyan"   id="lc"></div>
        <div className="light light-blue"   id="lb"></div>
      </div>
      <div className="particles"></div>

      {/* Scrollable Track */}
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
          <p className="place-text" id="place-text">Tu panel ya está<br/>preparado.</p>
          <p className="place-sub"  id="place-sub">Sigue bajando para configurar tu acceso seguro.</p>
        </div>
      </div>

      <div id="final-splash">
        {/* Aquí va el formulario de activación integrado en el Splash Screen Final */}
        <div className="glass-card fade-in-up" style={{ padding: '40px 36px', maxWidth: '420px', width: '90%', margin: '0 auto', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img className="splash-logo" src={logoSrc} alt="HummingX BI" style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
            <h1 className="splash-title" style={{ fontSize: '24px', marginBottom: '8px', transform: 'none', opacity: 1 }}>
              Protege tu cuenta
            </h1>
            <p className="splash-sub" style={{ margin: 0, opacity: 1, transform: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: 1.5 }}>
              Crea una contraseña segura.<br/>
              <span style={{fontSize: '12px', color: 'rgba(255,255,255,0.5)'}}>En el futuro usarás tu correo y esta contraseña para iniciar sesión.</span>
            </p>
          </div>

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
                  style={{ paddingLeft: '42px', paddingRight: '42px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
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
                  style={{ paddingLeft: '42px', paddingRight: '42px', background: 'rgba(0,0,0,0.3)', color: 'white', borderColor: form.confirm && form.confirm !== form.password ? 'rgba(239,68,68,0.5)' : form.confirm && form.confirm === form.password ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.1)' }}
                  placeholder="Repite tu contraseña"
                  value={form.confirm}
                  onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={16} color="#22c55e" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="splash-enter-btn" style={{ width: '100%', marginTop: '16px', opacity: loading ? 0.7 : 1, pointerEvents: 'auto', transform: 'none', background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)', border: 'none', color: 'white', padding: '14px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 188, 212, 0.3)' }}>
              {loading ? 'Activando cuenta...' : 'Activar y Entrar →'}
            </button>
          </form>
        </div>
      </div>

      <div id="exit-overlay"></div>
    </div>
  );
}
