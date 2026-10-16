import { Coins, ArrowDownLeft, ArrowUpRight, Clock, Sparkles } from 'lucide-react';

export default function CreditHistory({ creditMovements = [], totalCredits = 0 }) {
  const getTypeLabel = (type) => {
    switch (type) {
      case 'referral_converted': return { text: 'Bono por Recomendación', color: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'welcome_bonus': return { text: 'Bono de Bienvenida', color: 'text-cyan-700', bg: 'bg-cyan-50' };
      case 'redeemed': return { text: 'Crédito Aplicado / Canjeado', color: 'text-purple-700', bg: 'bg-purple-50' };
      case 'adjustment': return { text: 'Ajuste Administrativo', color: 'text-amber-700', bg: 'bg-amber-50' };
      default: return { text: 'Movimiento', color: 'text-gray-700', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Historial de Créditos HX
          </h3>
          <p className="text-xs text-gray-500">
            Registro auditable de abonos y canjes realizados en tu cuenta.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#230E38] text-white px-4 py-2 rounded-xl shadow-sm self-start sm:self-auto">
          <Coins size={18} className="text-[#00E5FF]" />
          <span className="text-xs text-gray-300 font-medium">Saldo Disponible:</span>
          <span className="font-mono font-black text-sm text-[#00E5FF]">
            ${totalCredits.toLocaleString('es-MX')} MXN
          </span>
        </div>
      </div>

      {creditMovements.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-xs">
          Aún no tienes movimientos de crédito registrados. Tus bonos se acreditarán aquí en cuanto se concreten tus recomendaciones.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {creditMovements.map(m => {
            const isPositive = m.amount > 0;
            const typeInfo = getTypeLabel(m.type);

            return (
              <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {m.description || typeInfo.text}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                        {typeInfo.text}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(m.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-base ${
                      isPositive ? 'text-emerald-600' : 'text-purple-600'
                    }`}
                  >
                    {isPositive ? '+' : ''}${m.amount.toLocaleString('es-MX')}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-mono">HX</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
