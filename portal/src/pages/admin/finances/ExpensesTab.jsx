import { useState, useMemo } from 'react';
import {
  TrendingDown,
  Plus,
  Server,
  Code2,
  Cpu,
  Megaphone,
  Briefcase,
  HelpCircle,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  DollarSign,
  User,
} from 'lucide-react';
import api from '../../../lib/api';

const CATEGORY_CONFIG = {
  infrastructure: { label: 'Infraestructura & Servidores', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', icon: Server },
  software: { label: 'Software, APIs & IA', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', icon: Code2 },
  hardware: { label: 'Hardware & Tarjetas NFC', color: '#0D9488', bg: '#F0FDFA', border: '#CCFBF1', icon: Cpu },
  marketing: { label: 'Marketing & Publicidad', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: Megaphone },
  operations: { label: 'Operaciones & Viáticos', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB', icon: Briefcase },
  other: { label: 'Otros Gastos', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: HelpCircle },
};

const FREQUENCY_LABELS = {
  monthly: 'Mensual',
  annual: 'Anual',
  one_time: 'Pago Único',
};

const PAID_BY_LABELS = {
  company: { label: 'Cuenta Empresa', color: '#374151', bg: '#F3F4F6' },
  emmanuel: { label: 'Emmanuel (Reembolsable)', color: '#0E7490', bg: '#F0FDFA' },
  juan_pablo: { label: 'Juan Pablo (Reembolsable)', color: '#1D4ED8', bg: '#EFF6FF' },
  curiel: { label: 'Curiel (Reembolsable)', color: '#7C3AED', bg: '#F5F3FF' },
};

export default function ExpensesTab({
  expenses = [],
  onOpenNewExpense,
  onOpenEditExpense,
  onRefresh,
  onShowToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paidByFilter, setPaidByFilter] = useState('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (paidByFilter !== 'all' && e.paidBy !== paidByFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(q);
        const matchNotes = e.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes) return false;
      }
      return true;
    });
  }, [expenses, searchTerm, categoryFilter, paidByFilter]);

  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el gasto "${title}"?`)) return;
    try {
      await api.delete(`/admin/expenses/${id}`);
      onShowToast(`Gasto "${title}" eliminado.`);
      onRefresh();
    } catch (err) {
      console.error('Error deleting expense:', err);
      if (onShowToast) onShowToast('Error al eliminar gasto.');
    }
  };

  const handleToggleActive = async (expense) => {
    try {
      await api.put(`/admin/expenses/${expense.id}`, { active: !expense.active });
      onShowToast(
        !expense.active ? `"${expense.title}" reactivado.` : `"${expense.title}" marcado como inactivo.`
      );
      onRefresh();
    } catch (err) {
      console.error('Error toggling active:', err);
      if (onShowToast) onShowToast('Error al actualizar estado.');
    }
  };

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Top Header Strip ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Gastos Operativos & Costos Recurrentes
          </h2>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Servidores, hosting, APIs de IA, herramientas y gastos pagados por los socios.
          </span>
        </div>

        <button
          onClick={onOpenNewExpense}
          className="btn-accent"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0, 196, 204, 0.25)',
          }}
        >
          <Plus size={15} />
          Registrar Gasto Operativo
        </button>
      </div>

      {/* ── Summary KPI Cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Total Gastos Registrados</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626' }}>
            ${Math.round(expenses.reduce((s, e) => s + (e.amount || 0), 0)).toLocaleString('es-MX')}{' '}
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>MXN</span>
          </span>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Costo Fijo Mensual</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>
            ${Math.round(expenses.filter(e => e.active).reduce((s, e) => {
              if (e.frequency === 'monthly') return s + e.amount;
              if (e.frequency === 'annual') return s + (e.amount / 12);
              return s;
            }, 0)).toLocaleString('es-MX')}{' '}
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>/ mes</span>
          </span>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Aportado por Socios (Reembolso)</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F766E' }}>
            ${Math.round(expenses.filter(e => e.paidBy !== 'company').reduce((s, e) => s + (e.amount || 0), 0)).toLocaleString('es-MX')}{' '}
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>MXN</span>
          </span>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Servicios Activos</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0284C7' }}>
            {expenses.filter(e => e.active).length}{' '}
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>de {expenses.length}</span>
          </span>
        </div>
      </div>

      {/* ── Filtros y Buscador ───────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '7px 12px',
            width: '260px',
          }}
        >
          <Search size={14} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Buscar concepto o nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '12.5px',
              width: '100%',
              background: 'transparent',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#374151',
              outline: 'none',
            }}
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => (
              <option key={k} value={k}>
                {cfg.label}
              </option>
            ))}
          </select>

          <select
            value={paidByFilter}
            onChange={(e) => setPaidByFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#374151',
              outline: 'none',
            }}
          >
            <option value="all">Todos los pagadores</option>
            <option value="company">Cuenta de la Empresa</option>
            <option value="emmanuel">Emmanuel (Reembolsable)</option>
            <option value="juan_pablo">Juan Pablo (Reembolsable)</option>
            <option value="curiel">Curiel (Reembolsable)</option>
          </select>

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginLeft: '6px' }}>
            Total: ${Math.round(totalFiltered).toLocaleString('es-MX')} MXN
          </span>
        </div>
      </div>

      {/* ── Tabla de Gastos ──────────────────────────────────────── */}
      <div
        className="card"
        style={{
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          background: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  background: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  color: '#6B7280',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Concepto & Descripción</th>
                <th style={{ padding: '12px 16px' }}>Categoría</th>
                <th style={{ padding: '12px 16px' }}>Frecuencia</th>
                <th style={{ padding: '12px 16px' }}>Pagado Por</th>
                <th style={{ padding: '12px 16px' }}>Próx. Corte</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Monto</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No se encontraron gastos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const catCfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.other;
                  const paidCfg = PAID_BY_LABELS[exp.paidBy] || PAID_BY_LABELS.company;
                  const Icon = catCfg.icon;

                  const dateFormatted = exp.dueDate
                    ? new Date(exp.dueDate).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={exp.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        opacity: exp.active ? 1 : 0.6,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Concepto */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: catCfg.bg,
                              color: catCfg.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={15} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#111827', display: 'block' }}>
                              {exp.title}
                            </span>
                            {exp.notes && (
                              <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                                {exp.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: catCfg.bg,
                            color: catCfg.color,
                            border: `1px solid ${catCfg.border}`,
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {catCfg.label}
                        </span>
                      </td>

                      {/* Frecuencia */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#4B5563',
                          }}
                        >
                          {FREQUENCY_LABELS[exp.frequency] || exp.frequency}
                        </span>
                      </td>

                      {/* Pagado Por */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: paidCfg.bg,
                            color: paidCfg.color,
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {paidCfg.label}
                        </span>
                      </td>

                      {/* Próximo Corte */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7280' }}>
                        {dateFormatted}
                      </td>

                      {/* Monto */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#DC2626' }}>
                        ${exp.amount.toLocaleString('es-MX')} MXN
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleToggleActive(exp)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              color: exp.active ? '#047857' : '#9CA3AF',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                            title={exp.active ? 'Marcar inactivo' : 'Reactivar gasto'}
                          >
                            {exp.active ? 'Activo' : 'Pausado'}
                          </button>

                          <button
                            onClick={() => onOpenEditExpense(exp)}
                            style={{
                              padding: '5px',
                              borderRadius: '6px',
                              border: '1px solid #E5E7EB',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              color: '#4B5563',
                            }}
                            title="Editar"
                          >
                            <Edit size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteExpense(exp.id, exp.title)}
                            style={{
                              padding: '5px',
                              borderRadius: '6px',
                              border: '1px solid #FEE2E2',
                              background: '#FEF2F2',
                              cursor: 'pointer',
                              color: '#DC2626',
                            }}
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
