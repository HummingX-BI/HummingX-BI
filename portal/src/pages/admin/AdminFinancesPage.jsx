import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  Building2,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Wallet,
  Sparkles,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  AlertCircle,
  FileText,
  ChevronRight,
  Briefcase,
} from 'lucide-react';

export default function AdminFinancesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    amount: '',
    closedAt: new Date().toISOString().split('T')[0],
    category: 'Business Intelligence',
    notes: '',
  });

  const fetchFinances = async () => {
    try {
      const res = await api.get('/admin/finances/overview');
      setData(res.data);
    } catch (err) {
      console.error('Error al cargar finanzas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const openNewDealModal = () => {
    setEditingDeal(null);
    setFormData({
      clientName: '',
      projectName: '',
      amount: '',
      closedAt: new Date().toISOString().split('T')[0],
      category: 'Business Intelligence',
      notes: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditDealModal = (deal) => {
    setEditingDeal(deal);
    setFormData({
      clientName: deal.clientName,
      projectName: deal.projectName,
      amount: String(deal.amount),
      closedAt: deal.closedAt ? deal.closedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      category: deal.category || 'Business Intelligence',
      notes: deal.notes || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setClosingModal(false);
      setEditingDeal(null);
    }, 180);
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.projectName.trim() || !formData.amount) {
      setFormError('Cliente, proyecto y monto son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        clientName: formData.clientName.trim(),
        projectName: formData.projectName.trim(),
        amount: parseFloat(formData.amount),
        closedAt: formData.closedAt,
        category: formData.category.trim(),
        notes: formData.notes.trim() || null,
      };

      if (editingDeal) {
        await api.put(`/admin/finances/deals/${editingDeal.id}`, payload);
        showToast('Proyecto histórico actualizado.');
      } else {
        await api.post('/admin/finances/deals', payload);
        showToast('Proyecto cerrado registrado exitosamente.');
      }

      closeModal();
      fetchFinances();
    } catch (err) {
      console.error('Error al guardar proyecto histórico:', err);
      setFormError(err.response?.data?.error || 'Error al guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDeal = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el registro de "${name}"?`)) return;
    try {
      await api.delete(`/admin/finances/deals/${id}`);
      showToast('Registro eliminado.');
      fetchFinances();
    } catch (err) {
      console.error('Error al eliminar proyecto histórico:', err);
    }
  };

  // Filtered historical deals
  const filteredDeals = useMemo(() => {
    if (!data?.historicalDeals) return [];
    return data.historicalDeals.filter((d) => {
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
  }, [data?.historicalDeals, searchTerm, categoryFilter]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(['Business Intelligence', 'Desarrollo Web', 'Automatización', 'Consultoría']);
    data?.historicalDeals?.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return Array.from(set);
  }, [data?.historicalDeals]);

  // Days remaining helper
  const getDaysRemainingText = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Vencido hace ${Math.abs(diffDays)} días`;
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    return `En ${diffDays} días`;
  };

  return (
    <Layout>
      <div
        className="fade-in-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginTop: '-12px',
          paddingBottom: '60px',
        }}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: '#111827',
              color: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              fontSize: '13.5px',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} color="#00C4CC" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                <DollarSign size={18} />
              </div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Finanzas & Flujo de Ingresos
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Control del total ganado por la empresa, calendario de cuándo cae dinero y registro de proyectos cerrados.
            </p>
          </div>

          <button
            onClick={openNewDealModal}
            className="btn-accent"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(0, 196, 204, 0.25)',
            }}
          >
            <Plus size={16} />
            Registrar Proyecto Cerrado
          </button>
        </div>

        {/* ── Métricas Principales (Executive Overview) ───────────────────── */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Calculando análisis financiero...</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Card 1: Total Histórico Ganado */}
              <div
                className="card"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#6B7280' }}>Total Histórico Cobrado</span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#047857',
                    }}
                  >
                    <TrendingUp size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                    ${Math.round(data?.totalHistoricalRevenue || 0).toLocaleString('es-MX')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>MXN</span>
                </div>

                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  De {data?.totalDealsCount || 0} proyectos históricos y pagos cerrados.
                </span>
              </div>

              {/* Card 2: Próximo Ingreso (Cuándo cae dinero) */}
              <div
                className="card"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  border: data?.nextPayment ? '1px solid #BAE6FD' : '1px solid #E5E7EB',
                  background: data?.nextPayment ? 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)' : '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0284C7' }}>Próximo Pago Programado</span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1D4ED8',
                    }}
                  >
                    <Clock size={16} />
                  </div>
                </div>

                {data?.nextPayment ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '32px', fontWeight: 800, color: '#0369A1', letterSpacing: '-0.02em' }}>
                        ${Math.round(data.nextPayment.amount).toLocaleString('es-MX')}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284C7' }}>MXN</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                        {data.nextPayment.project?.client?.companyName || data.nextPayment.project?.client?.name || 'Cliente'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: '#E0F2FE',
                          color: '#0369A1',
                        }}
                      >
                        {getDaysRemainingText(data.nextPayment.dueDate)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#9CA3AF' }}>Sin cobros pendientes programados.</p>
                )}
              </div>

              {/* Card 3: Por Cobrar en el Pipeline Activo */}
              <div
                className="card"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#6B7280' }}>Ingresos por Cobrar (Flujo)</span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#FFFBEB',
                      border: '1px solid #FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#B45309',
                    }}
                  >
                    <Wallet size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#B45309', letterSpacing: '-0.02em' }}>
                    ${Math.round(data?.totalUpcomingRevenue || 0).toLocaleString('es-MX')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#B45309' }}>MXN</span>
                </div>

                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  {data?.upcomingPayments?.length || 0} pagos en calendario de cobro.
                </span>
              </div>

              {/* Card 4: Ticket Promedio */}
              <div
                className="card"
                style={{
                  padding: '22px',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#6B7280' }}>Ticket Promedio</span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#374151',
                    }}
                  >
                    <Briefcase size={16} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                    ${Math.round(data?.averageTicket || 0).toLocaleString('es-MX')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>MXN</span>
                </div>

                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  Promedio por solución y contrato cerrado.
                </span>
              </div>
            </div>

            {/* ── CUÁNDO CAE DINERO: CRONOGRAMA DE PRÓXIMOS COBROS ─────────── */}
            <div
              className="card"
              style={{
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#F0F9FF',
                      border: '1px solid #BAE6FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284C7',
                    }}
                  >
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                      Próximos Cobros Programados
                    </h3>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      Fechas exactas en que entran pagos de clientes activos
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284C7' }}>
                  {data?.upcomingPayments?.length || 0} pendientes
                </span>
              </div>

              {(!data?.upcomingPayments || data.upcomingPayments.length === 0) ? (
                <p style={{ margin: 0, padding: '20px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                  No hay cobros pendientes programados en este momento.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.upcomingPayments.map((payment) => {
                    const client = payment.project?.client;
                    const daysRemaining = getDaysRemainingText(payment.dueDate);
                    const formattedDate = new Date(payment.dueDate).toLocaleDateString('es-MX', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={payment.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              color: '#0284C7',
                              fontSize: '14px',
                            }}
                          >
                            {(client?.companyName || client?.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', display: 'block' }}>
                              {client?.companyName || client?.name}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                              {payment.title} • {payment.project?.name || 'General'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                              {formattedDate}
                            </span>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: '#E0F2FE',
                                color: '#0369A1',
                                marginTop: '2px',
                              }}
                            >
                              {daysRemaining}
                            </span>
                          </div>

                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                              ${payment.amount.toLocaleString('es-MX')}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>MXN</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── PROYECTOS CERRADOS HISTÓRICOS ────────────────────────────── */}
            <div
              className="card"
              style={{
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                    Registro de Proyectos Cerrados Históricos
                  </h3>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    Proyectos pasados cerrados y cobrados (para control interno de ingresos, sin enviar correos)
                  </span>
                </div>

                <button
                  onClick={openNewDealModal}
                  className="btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                  }}
                >
                  <Plus size={14} />
                  Agregar Proyecto Cerrado
                </button>
              </div>

              {/* Filtros de la tabla */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                </div>
              </div>

              {/* Tabla de Proyectos Cerrados */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr
                      style={{
                        background: '#F9FAFB',
                        borderBottom: '1px solid #E5E7EB',
                        color: '#6B7280',
                        fontSize: '11.5px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <th style={{ padding: '10px 14px' }}>Cliente / Empresa</th>
                      <th style={{ padding: '10px 14px' }}>Proyecto</th>
                      <th style={{ padding: '10px 14px' }}>Categoría</th>
                      <th style={{ padding: '10px 14px' }}>Fecha de Cierre</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Monto Cobrado</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#9CA3AF' }}>
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
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#111827' }}>
                            {deal.clientName}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, color: '#374151' }}>{deal.projectName}</span>
                              {deal.notes && (
                                <span style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>
                                  {deal.notes}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
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
                          <td style={{ padding: '12px 14px', color: '#6B7280', fontSize: '12px' }}>
                            {deal.closedAt
                              ? new Date(deal.closedAt).toLocaleDateString('es-MX', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                            ${deal.amount.toLocaleString('es-MX')} MXN
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => openEditDealModal(deal)}
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
          </>
        )}

        {/* ── MODAL: REGISTRAR / EDITAR PROYECTO HISTÓRICO CERRADO ───────── */}
        {showModal &&
          createPortal(
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(17, 24, 39, 0.65)',
                backdropFilter: 'blur(6px)',
                animation: closingModal ? 'fadeOut 0.2s ease forwards' : 'fadeIn 0.2s ease forwards',
              }}
              onClick={closeModal}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '540px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #E5E7EB',
                  animation: closingModal ? 'scaleDown 0.2s ease forwards' : 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#047857',
                      }}
                    >
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                        {editingDeal ? 'Editar Proyecto Cerrado' : 'Registrar Proyecto Histórico Cerrado'}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        Registro interno para control del total facturado
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '8px',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveDeal} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertCircle size={16} />
                      {formError}
                    </div>
                  )}

                  {/* Cliente / Empresa */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Cliente / Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="ej. Café Punta del Cielo, Grupo Alsea"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Nombre del Proyecto */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Nombre del Proyecto o Servicio *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="ej. Dashboard de Ventas & Ticket Promedio en Power BI"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Monto & Fecha */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Monto Cobrado (MXN) *
                      </label>
                      <input
                        type="number"
                        required
                        step="any"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="ej. 45000"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Fecha de Cierre / Cobro
                      </label>
                      <input
                        type="date"
                        value={formData.closedAt}
                        onChange={(e) => setFormData({ ...formData, closedAt: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #D1D5DB',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="ej. Business Intelligence, Desarrollo Web, Automatización"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Notas o Entregables (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="ej. Modelo de datos, conexión SQL Server y reporte ejecutivo..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#4B5563',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-accent"
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                      }}
                    >
                      {submitting ? 'Guardando...' : editingDeal ? 'Actualizar Registro' : 'Registrar Proyecto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>
    </Layout>
  );
}
