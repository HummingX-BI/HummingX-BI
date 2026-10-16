import { useState, useMemo } from 'react';
import { Search, Plus, Building2, User, Phone, Mail, CheckCircle, Clock } from 'lucide-react';
import ReferralTimeline from './ReferralTimeline';

export default function ReferralList({ referrals = [], onOpenRecommendModal }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    return {
      all: referrals.length,
      converted: referrals.filter(r => r.status === 'converted').length,
      active: referrals.filter(r => r.status === 'contacted' || r.status === 'negotiating').length,
      registered: referrals.filter(r => r.status === 'registered').length,
    };
  }, [referrals]);

  const filtered = useMemo(() => {
    return referrals.filter(r => {
      // Filter by status tab
      if (filter === 'converted' && r.status !== 'converted') return false;
      if (filter === 'active' && r.status !== 'contacted' && r.status !== 'negotiating') return false;
      if (filter === 'registered' && r.status !== 'registered') return false;

      // Filter by search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesComp = r.companyName?.toLowerCase().includes(query);
        const matchesContact = r.contactName?.toLowerCase().includes(query);
        return matchesComp || matchesContact;
      }

      return true;
    });
  }, [referrals, filter, search]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Tus Recomendaciones ({referrals.length})
          </h3>
          <p className="text-xs text-gray-500">
            Sigue en tiempo real la evolución y los créditos generados de cada empresa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#00C4CC] focus:bg-white transition-all text-gray-900 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={onOpenRecommendModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00C4CC] hover:bg-[#00b0b8] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Recomendar</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto text-xs font-medium text-gray-600">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'all' ? 'bg-white text-gray-900 font-bold shadow-sm' : 'hover:text-gray-900'
          }`}
        >
          Todos ({counts.all})
        </button>
        <button
          onClick={() => setFilter('converted')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'converted' ? 'bg-white text-emerald-600 font-bold shadow-sm' : 'hover:text-gray-900'
          }`}
        >
          Ganados ({counts.converted})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'active' ? 'bg-white text-blue-600 font-bold shadow-sm' : 'hover:text-gray-900'
          }`}
        >
          En Proceso ({counts.active})
        </button>
        <button
          onClick={() => setFilter('registered')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            filter === 'registered' ? 'bg-white text-gray-800 font-bold shadow-sm' : 'hover:text-gray-900'
          }`}
        >
          Registrados ({counts.registered})
        </button>
      </div>

      {/* List or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
            <Building2 size={28} />
          </div>
          <h4 className="text-sm font-bold text-gray-900">No hay recomendaciones que coincidan</h4>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
            {search.trim()
              ? 'Prueba con otro término de búsqueda o limpia el filtro actual.'
              : 'Empieza recomendando empresas de tu círculo para sumar Créditos HX a tu cuenta.'}
          </p>
          <button
            onClick={onOpenRecommendModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors"
          >
            <Plus size={14} />
            <span>Recomendar primera empresa</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ref => {
            const isConverted = ref.status === 'converted';

            return (
              <div
                key={ref.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isConverted
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Header row: Company name & status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isConverted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight">
                        {ref.companyName}
                      </h4>
                      <span className="text-[11px] text-gray-400 font-medium">
                        Registrado el {new Date(ref.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {isConverted ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black self-start sm:self-auto">
                      <CheckCircle size={14} className="text-emerald-600" />
                      <span>Ganado · +${(ref.creditsGenerated || 1500).toLocaleString('es-MX')} HX</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold self-start sm:self-auto">
                      <Clock size={12} className="text-gray-500" />
                      <span>{ref.status === 'negotiating' ? 'En Negociación' : ref.status === 'contacted' ? 'Contactado' : 'Registrado'}</span>
                    </div>
                  )}
                </div>

                {/* Contact and Notes info */}
                {(ref.contactName || ref.contactPhone || ref.contactEmail || ref.notes) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-4 bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                    {ref.contactName && (
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-gray-400" />
                        <strong className="text-gray-800">{ref.contactName}</strong>
                      </span>
                    )}
                    {ref.contactPhone && (
                      <a
                        href={`https://wa.me/${ref.contactPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-700 hover:underline"
                      >
                        <Phone size={13} />
                        <span>{ref.contactPhone}</span>
                      </a>
                    )}
                    {ref.contactEmail && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Mail size={13} />
                        <span>{ref.contactEmail}</span>
                      </span>
                    )}
                    {ref.notes && (
                      <span className="w-full text-gray-500 italic mt-1 text-[11px]">
                        "{ref.notes}"
                      </span>
                    )}
                  </div>
                )}

                {/* Timeline Step Progression */}
                <ReferralTimeline status={ref.status} creditsGenerated={ref.creditsGenerated} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
