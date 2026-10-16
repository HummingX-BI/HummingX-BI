import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import AppointmentDrawer from './appointments/AppointmentDrawer';
import AppointmentCompactList from './appointments/AppointmentCompactList';
import AppointmentKanban from './appointments/AppointmentKanban';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Edit,
  Trash2,
  LayoutList,
  Columns3,
  Calendar,
  AlertCircle,
  Building,
  User,
  Phone,
  Clock,
  MapPin,
  FileText,
} from 'lucide-react';

const TEAM_MEMBERS = {
  emmanuel: { label: 'Emmanuel', color: '#0E7490', bg: '#F0FDFA', border: '#CCFBF1' },
  juan_pablo: { label: 'Juan Pablo', color: '#1D4ED8', bg: '#EFF6FF', border: '#DBEAFE' },
  curiel: { label: 'Curiel', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  all: { label: 'Equipo Conjunto', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
};

const STATUS_CONFIG = {
  scheduled: { label: 'Programada', bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  completed: { label: 'Realizada', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  rescheduled: { label: 'Reprogramada', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  cancelled: { label: 'Cancelada', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

export default function AdminAppointmentsPage() {
  const [searchParams] = useSearchParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('compact'); // 'compact' | 'kanban'
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');

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

      if (selectedAppointment) {
        const updatedCurrent = data.find((a) => a.id === selectedAppointment.id);
        if (updatedCurrent) setSelectedAppointment(updatedCurrent);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Pre-fill from query params if coming from CRM
  useEffect(() => {
    const qCompany = searchParams.get('company');
    if (qCompany) {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(11, 0, 0, 0);
      const isoLocal = tomorrow.toISOString().slice(0, 16);

      setFormData({
        title: `Demostración en sitio — ${qCompany}`,
        companyName: qCompany,
        contactName: searchParams.get('contact') || '',
        contactPhone: searchParams.get('phone') || '',
        dateTime: isoLocal,
        location: '',
        mapsUrl: '',
        assignedTo: 'emmanuel',
        status: 'scheduled',
        summary: '',
      });
      setEditingAppointment(null);
      setShowModal(true);
    }
  }, [searchParams]);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const openNewModal = () => {
    setEditingAppointment(null);
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
      let saved;
      if (editingAppointment) {
        const res = await api.put(`/admin/appointments/${editingAppointment.id}`, formData);
        saved = res.data;
        showNotification(`Cita "${formData.title}" actualizada.`);
      } else {
        const res = await api.post('/admin/appointments', formData);
        saved = res.data;
        showNotification(`Cita con "${formData.companyName}" agendada.`);
      }
      closeModal();
      await fetchAppointments();
      if (saved && selectedAppointment?.id === saved.id) {
        setSelectedAppointment(saved);
      }
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
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
      }
      showNotification('Estado de la cita actualizado.');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado.');
    }
  };

  const handleUpdateSummary = async (appointmentId, summary) => {
    await api.put(`/admin/appointments/${appointmentId}`, { summary });
    fetchAppointments();
    showNotification('Minuta guardada correctamente.');
  };

  const handleDeleteAppointment = async (id, title) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la cita "${title}"?`)) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      showNotification('Cita eliminada correctamente.');
      if (selectedAppointment?.id === id) setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar cita.');
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
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
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '-12px', paddingBottom: '40px' }}>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: '12px',
              padding: '12px 18px',
              color: '#065F46',
              fontSize: '13.5px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
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
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.025em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Agenda de Citas & Visitas de Campo
            </h1>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: 0, maxWidth: '640px' }}>
              Organiza salidas de prospección presencial, demostraciones en sitio y registra los acuerdos de cada reunión.
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            <Plus size={16} />
            Agendar Visita / Cita
          </button>
        </div>

        {/* ── Controls Bar: Search, Filters, and View Switcher ─────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 14px', width: '100%' }}>
              <Search size={15} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Buscar por empresa, lugar o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
              />
            </div>

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
                whiteSpace: 'nowrap',
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
                whiteSpace: 'nowrap',
              }}
            >
              <option value="all">Todos los Estados ({appointments.length})</option>
              <option value="scheduled">Programadas</option>
              <option value="completed">Realizadas</option>
              <option value="rescheduled">Reprogramadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {/* View Toggle (Compact List vs Kanban) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F3F4F6',
              borderRadius: '10px',
              padding: '3px',
              gap: '3px',
            }}
          >
            <button
              onClick={() => setViewMode('compact')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'compact' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'compact' ? '#111827' : '#6B7280',
                fontWeight: viewMode === 'compact' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: viewMode === 'compact' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutList size={14} />
              <span>Lista</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'kanban' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'kanban' ? '#111827' : '#6B7280',
                fontWeight: viewMode === 'kanban' ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Columns3 size={14} />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* ── Content View ─────────────────────────────────────── */}
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
        ) : viewMode === 'compact' ? (
          <AppointmentCompactList
            appointments={filteredAppointments}
            onSelectAppointment={setSelectedAppointment}
            onChangeStatus={handleStatusChange}
            onEdit={openEditModal}
          />
        ) : (
          <AppointmentKanban
            appointments={filteredAppointments}
            onSelectAppointment={setSelectedAppointment}
            onChangeStatus={handleStatusChange}
          />
        )}

      </div>

      {/* ── Slide-over Lateral Drawer (Detalle de Cita) ─────────────── */}
      {selectedAppointment && (
        <AppointmentDrawer
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onEdit={openEditModal}
          onDelete={handleDeleteAppointment}
          onChangeStatus={handleStatusChange}
          onUpdateSummary={handleUpdateSummary}
        />
      )}

      {/* ── Modal: Crear / Editar Cita ─────────────────────────────── */}
      {showModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '580px', borderRadius: '16px', padding: '32px' }}>
            <button
              onClick={closeModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {editingAppointment ? 'Editar Cita' : 'Agendar Nueva Cita Presencial'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Programa la visita a prospecto o cliente y asígnala al responsable del equipo.
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
                  placeholder="Ej. Demo en vivo de la plataforma y cotización final"
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
                    placeholder="Ej. Tahara Café Roma Norte"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Responsable Asignado
                  </label>
                  <select
                    className="hx-input"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="emmanuel">Emmanuel</option>
                    <option value="juan_pablo">Juan Pablo</option>
                    <option value="curiel">Curiel</option>
                    <option value="all">Equipo Conjunto</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    className="hx-input"
                    placeholder="Ej. Lic. Fernando Robles"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    className="hx-input"
                    placeholder="+52 55..."
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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
                    Estado
                  </label>
                  <select
                    className="hx-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="scheduled">Programada</option>
                    <option value="completed">Realizada</option>
                    <option value="rescheduled">Reprogramada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Dirección Física de la Visita *
                </label>
                <input
                  type="text"
                  required
                  className="hx-input"
                  placeholder="Ej. Av. Álvaro Obregón 151, Roma Nte., Cuauhtémoc, CDMX"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Enlace de Google Maps (Opcional)
                </label>
                <input
                  type="url"
                  className="hx-input"
                  placeholder="https://maps.google.com/..."
                  value={formData.mapsUrl}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Minuta / Resumen de Acuerdos (Opcional)
                </label>
                <textarea
                  className="hx-input"
                  rows={2}
                  placeholder="Se puede llenar después de realizar la visita..."
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
