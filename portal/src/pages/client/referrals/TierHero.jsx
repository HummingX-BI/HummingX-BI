import { useState } from 'react';
import { Sparkles, Copy, Check, Share2 } from 'lucide-react';
import { HX_WHATSAPP_LABEL } from '../../../lib/contact';

export default function TierHero({
  level = 1,
  convertedCount = 0,
  totalCredits = 0,
  referralCode = '00000',
}) {
  const [copiedCode, setCopiedCode] = useState(false);

  const tierConfig = {
    1: {
      name: 'HummingX Member',
      badge: 'Nivel 1 · Member',
      icon: '/member-icon.png',
      amount: '$1,500 MXN',
      nextGoal: 5,
      nextName: 'Partner',
      needed: Math.max(0, 5 - convertedCount),
      color: '#00C4CC',
    },
    2: {
      name: 'HummingX Partner',
      badge: 'Nivel 2 · Partner',
      icon: '/partner-icon.png',
      amount: '$2,500 MXN',
      nextGoal: 10,
      nextName: 'VIP',
      needed: Math.max(0, 10 - convertedCount),
      color: '#00E5FF',
    },
    3: {
      name: 'HummingX VIP',
      badge: 'Nivel 3 · VIP',
      icon: '/vip-icon.png',
      amount: '$3,500 MXN',
      nextGoal: 10,
      nextName: 'Nivel Máximo',
      needed: 0,
      color: '#A855F7',
    },
  };

  const current = tierConfig[level] || tierConfig[1];

  // Radial progress calculations
  let progressPct = 100;
  if (level === 1) {
    progressPct = Math.min(100, Math.round((convertedCount / 5) * 100));
  } else if (level === 2) {
    progressPct = Math.min(100, Math.round(((convertedCount - 5) / 5) * 100));
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Hola, te recomiendo a HummingX BI (software e inteligencia de negocios para empresas). Cuando los contactes por WhatsApp al ${HX_WHATSAPP_LABEL}, menciona mi código de socio: *${referralCode}* y te darán trato preferente.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="hx-hero-card">
      <div className="hx-hero-glow-1"></div>
      <div className="hx-hero-glow-2"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
        
        {/* Left: Level Insignia & Member Title */}
        <div id="tour-referrals-tier" className="flex items-center gap-5">
          <div className="hx-tier-icon-wrap">
            <img
              src={current.icon}
              alt={current.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider border border-white/10">
                <Sparkles size={12} className="text-[#00E5FF]" />
                {current.badge}
              </span>
              <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider font-mono">
                Socio Activo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {current.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-md">
              Ganas <strong className="text-white font-bold">{current.amount}</strong> en Créditos HX por cada proyecto recomendado que concrete su servicio con nosotros.
            </p>
          </div>
        </div>

        {/* Right: Giant Credits Figure + Progress Ring + Quick Code */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          
          {/* Radial Progress Ring & Giant Balance */}
          <div id="tour-referrals-balance" className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="url(#hxProgressGradHero)"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="hxProgressGradHero" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C4CC" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-white font-mono leading-none">
                  {progressPct}%
                </span>
                <span className="text-[9px] text-gray-400 uppercase mt-0.5">
                  {current.needed > 0 ? `${convertedCount}/${current.nextGoal}` : 'VIP'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold block">
                Créditos HX Disponibles
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="hx-credits-huge">
                  ${totalCredits.toLocaleString('es-MX')}
                </span>
                <span className="text-xs font-mono text-[#00E5FF] font-bold">MXN</span>
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">
                {current.needed > 0
                  ? `Faltan ${current.needed} recomendaciones para ${current.nextName}`
                  : 'Nivel VIP máximo alcanzado'}
              </span>
            </div>
          </div>

          {/* Code Pill & Buttons */}
          <div id="tour-referrals-code" className="border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-5 flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Tu Código de Socio
              </span>
              <span className="text-[9px] text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full font-medium">
                Asignado de por vida
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-lg font-black text-[#00E5FF] tracking-widest">
                {referralCode}
              </div>
              <button
                onClick={handleCopyCode}
                className={`p-2 rounded-xl transition-all ${
                  copiedCode ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Copiar código"
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                title="Compartir por WhatsApp"
              >
                <Share2 size={15} />
                <span>Compartir</span>
              </button>
            </div>

            {/* Franja Cómo funciona (3 líneas cortas sin párrafos) */}
            <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-gray-300 leading-tight space-y-1">
              <div><strong className="text-[#00E5FF]">1</strong> Comparte tu código</div>
              <div><strong className="text-[#00E5FF]">2</strong> Tu contacto lo menciona al escribirnos</div>
              <div><strong className="text-[#00E5FF]">3</strong> Cuando cierra, recibes Créditos HX según tu nivel ($1,500 / $2,500 / $3,500)</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
