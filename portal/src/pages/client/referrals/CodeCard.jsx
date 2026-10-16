import { useState, useEffect } from 'react';
import { Copy, Check, Share2, QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';

export default function CodeCard({ referralCode = '00000' }) {
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Hola, te comparto mi código de socio en HummingX BI: *${referralCode}*.\n\nAl registrarte o cotizar tu proyecto con mi código, recibes trato preferencial y beneficios exclusivos en consultoría y desarrollo tecnológico:\n${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-[#CCFBF1] px-2.5 py-0.5 rounded-full">
              Tu Código de Socio
            </span>
            <span className="text-xs text-gray-500 font-medium">Asignado de por vida</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-1">
            Comparte tu código personal con empresarios o directivos
          </h3>
          <p className="text-sm text-gray-500">
            Cada vez que una empresa mencione tu código de 5 dígitos al cotizar o contratar, se acreditarán automáticamente tus Créditos HX.
          </p>
        </div>

        {/* Code & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
            <span className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Cód.</span>
            <span className="font-mono text-2xl font-black text-gray-900 tracking-widest">
              {referralCode}
            </span>
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="Copiar código"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all hover:shadow"
            >
              <Share2 size={16} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center justify-center p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Mostrar Código QR"
            >
              <QrCode size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
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
              Muéstralo para que cualquier cliente o socio lo escanee con su cámara.
            </p>

            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-inner">
                <img src={qrDataUrl} alt="Código QR de referido" className="w-56 h-56 rounded-lg" />
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
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
