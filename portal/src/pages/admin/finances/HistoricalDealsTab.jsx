import { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
} from 'lucide-react';
import api from '../../../lib/api';

export default function HistoricalDealsTab({
  deals = [],
  onOpenNewDeal,
  onOpenEditDeal,
  onRefresh,
  onShowToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(['Business Intelligence', 'Desarrollo Web', 'Automatización', 'Tarjetas NFC', 'Consultoría']);
    deals.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchClient = d.clientName?.toLowerCase().includes(q);
        const matchProject = d.projectName?.toLowerCase().includes(q);
        const matchNotes = d.notes?.toLowerCase().includes(q);
        if (!matchClient && !matchProject && !matchNotes) return false;
      }
      return true;
    });
  }, [deals, searchTerm, categoryFilter]);

  const handleDeleteDeal = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el registro de "${name}"?`)) return;
    try {
      await api.delete(`/admin/finances/deals/${id}`);
      onShowToast(`Proyecto "${name}" eliminado.`);
      onRefresh();
    } catch (err) {
      console.error('Error deleting deal:', err);
      if (onShowToast) onShowToast('Error al eliminar proyecto.');
    }
  };

  const totalFiltered = filteredDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

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
            Proyectos Cerrados Históricos
          </h2>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Registro contable de soluciones entregadas y cobradas a lo largo de la historia de HummingX BI.
          </span>
        </div>

        <button
          onClick={onOpenNewDeal}
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
          Registrar Proyecto Cerrado
        </button>
      </div>

      {/* ── Summary KPI Cards ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Total Histórico Cobrado</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#047857' }}>
            ${Math.round(deals.reduce((s, d) => s + (d.amount || 0), 0)).toLocaleString('es-MX')}{' '}
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>MXN</span>
          </span>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ticket Promedio</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>
            ${deals.length > 0 ? Math.round(deals.reduce((s, d) => s + (d.amount || 0), 0) / deals.length).toLocaleString('es-MX') : '0'}{' '}
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>MXN</span>
          </span>
        </div>

        <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Proyectos Entregados</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#00C4CC' }}>
            {deals.length} deals
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
            placeholder="Buscar cliente o proyecto..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857', marginLeft: '6px' }}>
            Total: ${Math.round(totalFiltered).toLocaleString('es-MX')} MXN
          </span>
        </div>
      </div>

      {/* ── Tabla de Proyectos ───────────────────────────────────── */}
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
                <th style={{ padding: '12px 16px' }}>Cliente / Empresa</th>
                <th style={{ padding: '12px 16px' }}>Proyecto o Solución</th>
                <th style={{ padding: '12px 16px' }}>Categoría</th>
                <th style={{ padding: '12px 16px' }}>Fecha de Cierre</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Monto Cobrado</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    No se encontraron proyectos cerrados con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>
                      {deal.clientName}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: '#374151', display: 'block' }}>
                        {deal.projectName}
                      </span>
                      {deal.notes && (
                        <span style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px', display: 'block' }}>
                          {deal.notes}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          color: '#475569',
                          fontSize: '11.5px',
                          fontWeight: 600,
                        }}
                      >
                        {deal.category || 'General'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '12px' }}>
                      {deal.closedAt
                        ? new Date(deal.closedAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                      ${deal.amount.toLocaleString('es-MX')} MXN
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onOpenEditDeal(deal)}
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
                          onClick={() => handleDeleteDeal(deal.id, deal.clientName)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
