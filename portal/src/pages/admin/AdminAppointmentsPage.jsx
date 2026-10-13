import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import {
  CalendarDays,
  Plus,
  MapPin,
  ExternalLink,
  User,
  Building,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  Navigation,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const TEAM_MEMBERS = {
  emmanuel: { label: 'Emmanuel', color: '#0E7490', bg: '#F0FDFA', border: '#CCFBF1', initial: 'E' },
  juan_pablo: { label: 'Juan Pablo', color: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE', initial: 'JP' },
  curiel: { label: 'Curiel', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', initial: 'C' },
  all: { label: 'Equipo Conjunto', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0', initial: 'HX' },
};

const STATUS_CONFIG = {
  scheduled: { label: 'Programada', bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  completed: { label: 'Realizada', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  rescheduled: { label: 'Reprogramada', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  cancelled: { label: 'Cancelada', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    contactName: '',
    contactPhone: '',
    dateTime: '',
    location: '',
    mapsUrl: '',
    assignedTo: 'emmanuel',
    status: 'scheduled',
    summary: '',
  });

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/admin/appointments');
      setAppointments(data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const openNewModal = () => {
    setEditingAppointment(null);
    // default datetime tomorrow 11:00 AM local
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(11, 0, 0, 0);
    const isoLocal = tomorrow.toISOString().slice(0, 16);

    setFormData({
      title: '',
      companyName: '',
      contactName: '',
      contactPhone: '',
      dateTime: isoLocal,
      location: '',
      mapsUrl: '',
      assignedTo: 'emmanuel',
      status: 'scheduled',
      summary: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (a) => {
    setEditingAppointment(a);
    const dateFormatted = new Date(a.dateTime).toISOString().slice(0, 16);
    setFormData({
      title: a.title || '',
      companyName: a.companyName || '',
      contactName: a.contactName || '',
      contactPhone: a.contactPhone || '',
      dateTime: dateFormatted,
      location: a.location || '',
      mapsUrl: a.mapsUrl || '',
      assignedTo: a.assignedTo || 'emmanuel',
      status: a.status || 'scheduled',
      summary: a.summary || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setClosingModal(false);
      setEditingAppointment(null);
    }, 180);
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.companyName.trim() || !formData.dateTime || !formData.location.trim()) {
      setFormError('Objetivo, empresa, fecha/hora y dirección física son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingAppointment) {
        await api.put(`/admin/appointments/${editingAppointment.id}`, formData);
        showNotification(`Cita "${formData.title}" actualizada.`);
      } else {
        await api.post('/admin/appointments', formData);
        showNotification(`Cita con "${formData.companyName}" agendada.`);
      }
      closeModal();
      fetchAppointments();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar cita.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/admin/appointments/${appointmentId}`, { status: newStatus });
      fetchAppointments();
      showNotification('Estado de la cita actualizado.');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado.');
    }
  };

  const handleDeleteAppointment = async (id, title) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la cita "${title}"?`)) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      showNotification('Cita eliminada correctamente.');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar cita.');
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch =
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (assignedFilter !== 'all' && a.assignedTo !== assignedFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, searchTerm, assignedFilter, statusFilter]);

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-12px', paddingBottom: '40px' }}>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1px solid #10B981',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#065F46',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.025em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Agenda de Citas & Visitas de Campo
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, maxWidth: '640px' }}>
              Organiza salidas de prospección presencial, demostraciones en sitio y registra los acuerdos de cada reunión entre Emmanuel, Juan Pablo y Curiel.
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <Plus size={16} />
            Agendar Visita / Cita
          </button>
        </div>

        {/* ── Search & Compact Filters Bar ───────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 14px', width: '300px' }}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Buscar por empresa, lugar o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Filter by Responsable */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#374151',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todos los Responsables</option>
              <option value="emmanuel">Emmanuel</option>
              <option value="juan_pablo">Juan Pablo</option>
              <option value="curiel">Curiel</option>
              <option value="all">Equipo Conjunto</option>
            </select>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#374151',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todos los Estados</option>
              <option value="scheduled">Programadas</option>
              <option value="completed">Realizadas</option>
              <option value="rescheduled">Reprogramadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>

        {/* ── Appointment Cards Grid ─────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <p>Cargando agenda de citas...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <CalendarDays size={36} color="#9CA3AF" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              No hay citas con estos filtros
            </h3>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 20px' }}>
              Registra una nueva cita presencial o ajusta los filtros de búsqueda.
            </p>
            <button onClick={openNewModal} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              <Plus size={14} /> Agendar Cita
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredAppointments.map((a) => {
              const memberCfg = TEAM_MEMBERS[a.assignedTo] || TEAM_MEMBERS.emmanuel;
              const statusCfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;
              const isExpanded = expandedIds.has(a.id);

              const dateObj = new Date(a.dateTime);
              const formattedDate = dateObj.toLocaleDateString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const formattedTime = dateObj.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={a.id}
                  className="card"
                  style={{
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top: DateTime Pill & Status Selector */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: '#F1F5F9',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Clock size={13} color="#00C4CC" />
                      <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span> • {formattedTime}
                    </div>

                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        border: `1px solid ${statusCfg.border}`,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Empresa a la que vamos */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Building2 size={18} color="#0284C7" style={{ flexShrink: 0 }} />
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>
                        {a.companyName}
                      </h3>
                    </div>

                    {/* Contact & Phone */}
                    {a.contactName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#4B5563', margin: '4px 0 2px 26px' }}>
                        <span style={{ fontWeight: 500 }}>{a.contactName}</span>
                        {a.contactPhone && (
                          <a
                            href={`https://wa.me/${a.contactPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '12px' }}
                          >
                            <Phone size={12} /> {a.contactPhone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ubicación física & Botón Maps */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F8FAFC',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                      <MapPin size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '12.5px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.location}
                      </span>
                    </div>

                    {a.mapsUrl && (
                      <a
                        href={a.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#0F172A',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          flexShrink: 0,
                        }}
                      >
                        <Navigation size={12} color="#00C4CC" />
                        Maps
                      </a>
                    )}
                  </div>

                  {/* Botón de Desglose interactivo */}
                  <button
                    onClick={() => toggleExpand(a.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: isExpanded ? '#F1F5F9' : '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{isExpanded ? 'Ocultar detalles' : 'Ver asunto y minuta'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Desglose Expandible */}
                  {isExpanded && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        animation: 'fadeIn 0.2s ease',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                          Asunto / Objetivo:
                        </span>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                          {a.title}
                        </p>
                      </div>

                      {a.summary && (
                        <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', color: '#92400E' }}>
                          <strong style={{ display: 'block', marginBottom: '2px' }}>Minuta / Acuerdos:</strong>
                          {a.summary}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: memberCfg.color,
                            color: '#FFFFFF',
                            fontSize: '9.5px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {memberCfg.initial}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: memberCfg.color }}>
                            {memberCfg.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditModal(a)}
                            className="btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '11.5px', borderRadius: '6px' }}
                          >
                            <Edit size={12} /> Editar
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(a.id, a.title)}
                            className="btn-secondary"
                            style={{ padding: '5px 8px', fontSize: '11.5px', borderRadius: '6px', color: '#DC2626' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Modal: Agendar / Editar Cita ─────────────────────────────────────── */}
      {showModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '540px', borderRadius: '16px', padding: '32px' }}>
            <button
              onClick={closeModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {editingAppointment ? 'Editar Cita Presencial' : 'Agendar Visita de Prospección'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Registra los detalles de la visita y asígnala al responsable correspondiente.
            </p>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '16px' }}>
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Objetivo / Asunto de la Cita *
                </label>
                <input
                  type="text"
                  required
                  className="hx-input"
                  placeholder="Ej. Demostración de Menú NFC y Comandera"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Empresa / Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    className="hx-input"
                    placeholder="Ej. Restaurante La Casona"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Contacto / Director
                  </label>
                  <input
                    type="text"
                    className="hx-input"
                    placeholder="Ej. Don Alberto Domínguez"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="hx-input"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Responsable Asignado *
                  </label>
                  <select
                    className="hx-input"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="emmanuel">Emmanuel</option>
                    <option value="juan_pablo">Juan Pablo</option>
                    <option value="curiel">Curiel</option>
                    <option value="all">Equipo Conjunto (Todos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Dirección Física (Ubicación) *
                </label>
                <input
                  type="text"
                  required
                  className="hx-input"
                  placeholder="Ej. Jardín Centenario 14, Coyoacán, CDMX"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Teléfono / WhatsApp de Contacto
                </label>
                <input
                  type="tel"
                  className="hx-input"
                  placeholder="+52 55..."
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Minuta / Acuerdos de la Reunión (Conclusiones)
                </label>
                <textarea
                  className="hx-input"
                  rows={2}
                  placeholder="¿Qué se acordó? Siguientes pasos, fecha de llamada de cierre..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeModal} className="btn-secondary" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : editingAppointment ? 'Actualizar Cita' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </Layout>
  );
}
