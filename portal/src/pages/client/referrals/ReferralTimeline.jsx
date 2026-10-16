import { Check } from 'lucide-react';

const STEPS = [
  { key: 'registered', label: 'Registrado', desc: 'Contacto recibido' },
  { key: 'contacted', label: 'Contactado', desc: 'Primer contacto' },
  { key: 'negotiating', label: 'En Negociación', desc: 'Propuesta / Demo' },
  { key: 'converted', label: 'Ganado', desc: 'Bono Acreditado' },
];

export default function ReferralTimeline({ status = 'registered', creditsGenerated = 0 }) {
  const getStepIndex = (st) => {
    switch (st) {
      case 'registered': return 0;
      case 'contacted': return 1;
      case 'negotiating': return 2;
      case 'converted': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full pt-3 pb-1">
      <div className="flex items-center justify-between w-full relative">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isConverted = status === 'converted' && idx === 3;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connecting line to previous */}
              {idx > 0 && (
                <div
                  className={`absolute top-3.5 right-1/2 left-[-50%] h-[3px] -z-0 transition-colors duration-300 ${
                    idx <= currentIndex ? 'bg-[#00C4CC]' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Step Circle */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isConverted
                    ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-110'
                    : isDone
                    ? 'bg-[#00C4CC] text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-[#00C4CC] text-[#00696E] shadow-sm'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {isDone || isConverted ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="text-center mt-2">
                <span
                  className={`block text-[11px] font-bold leading-tight ${
                    isCurrent || isConverted
                      ? 'text-gray-900'
                      : isDone
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="hidden sm:block text-[10px] text-gray-400 leading-none mt-0.5">
                  {isConverted && creditsGenerated > 0 ? (
                    <strong className="text-emerald-600 font-bold">+${creditsGenerated.toLocaleString()} MXN</strong>
                  ) : (
                    step.desc
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
