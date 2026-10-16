import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Share2, QrCode, X, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';

export default function TierHero({
  level = 1,
  convertedCount = 0,
  totalCredits = 0,
  referralCode = '00000',
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const referralUrl = `https://hummingxbi.com?ref=${referralCode}`;

  useEffect(() => {
    QRCode.toDataURL(referralUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#1B0C2E',
        light: '#FFFFFF',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(console.error);
  }, [referralUrl]);

  const tierConfig = {
    1: {
      name: 'HummingX Member',
      badge: 'Nivel 1 · Member',
      icon: '/member-icon.png',
      amount: '$1,500 MXN',
      perk: '$1,500 MXN en créditos por recomendación',
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
      perk: '$2,500 MXN en créditos por recomendación',
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
      perk: '$3,500 MXN en créditos por recomendación',
      nextGoal: 10,
      nextName: 'Nivel Máximo',
      needed: 0,
      color: '#C084FC',
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
    const text = `Hola, te comparto mi código de socio en HummingX BI: *${referralCode}*.\n\nAl registrarte o cotizar tu proyecto de software o BI con mi código, recibes trato preferencial y beneficios exclusivos en consultoría y desarrollo tecnológico:\n${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="hx-hero-card">
        <div className="hx-hero-glow-1"></div>
        <div className="hx-hero-glow-2"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          
          {/* Left: Level Insignia & Member Title (No company name, says HummingX Member) */}
          <div className="flex items-center gap-5">
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
            <div className="flex items-center gap-4">
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
            <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-5 flex flex-col gap-2 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Tu Código de Socio
              </span>
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
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  title="Compartir por WhatsApp"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Mostrar Código QR"
                >
                  <QrCode size={16} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#00C4CC]/10 text-[#00696E] flex items-center justify-center mb-3">
              <QrCode size={26} />
            </div>

            <h4 className="text-xl font-bold text-gray-900">
              Código QR de Socio
            </h4>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Muéstralo para que cualquier cliente o directivo lo escanee con su cámara.
            </p>

            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-inner">
                <img src={qrDataUrl} alt="Código QR de socio" className="w-56 h-56 rounded-lg" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-xl animate-pulse"></div>
            )}

            <div className="mt-5 w-full bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Tu código</span>
                <span className="font-mono text-lg font-black text-gray-800">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              >
                {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
