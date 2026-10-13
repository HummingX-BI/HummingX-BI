import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  DollarSign,
  FileText,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle2,
  TrendingUp,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  AlertCircle,
  Tag,
  Clock,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STAGE_CONFIG = {
  lead: { label: 'Contacto Inicial', bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
  contacted: { label: 'Contactado', bg: '#EFF6FF', color: '#1D4ED8', border: '#DBEAFE' },
  meeting: { label: 'Cita / Demo', bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  proposal_sent: { label: 'Propuesta Enviada', bg: '#EFF6FF', color: '#0284C7', border: '#BAE6FD' },
  negotiating: { label: 'En Negociación', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  won: { label: 'Cliente Ganado', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  lost: { label: 'No Concretado', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
};

const DOC_TYPES = {
  quote: { label: 'Cotización', color: '#0284C7' },
  proposal: { label: 'Propuesta Técnica', color: '#7C3AED' },
  roi: { label: 'Análisis de ROI', color: '#059669' },
  contract: { label: 'Borrador Contrato', color: '#B45309' },
  specs: { label: 'Especificaciones', color: '#4B5563' },
  other: { label: 'Documento', color: '#6B7280' },
};

export default function AdminProspectsPage() {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedStageFilter, setExpandedStageFilter] = useState(false);
  const [expandedDocsIds, setExpandedDocsIds] = useState(new Set());

  const toggleDocs = (id) => {
    setExpandedDocsIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Modal states
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [activeProspectForDoc, setActiveProspectForDoc] = useState(null);
  const [closingModal, setClosingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [convertingId, setConvertingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Form state for Prospect
  const [prospectForm, setProspectForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    estimatedValue: '',
    status: 'lead',
    source: '',
    notes: '',
  });

  // Form state for Document
  const [docForm, setDocForm] = useState({
    title: '',
    type: 'quote',
    version: 'v1.0',
    url: '',
    notes: '',
  });

  const fetchProspects = async () => {
    try {
      const { data } = await api.get('/admin/prospects');
      setProspects(data);
    } catch (err) {
      console.error('Error al cargar prospectos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const openNewProspectModal = () => {
    setEditingProspect(null);
    setProspectForm({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      industry: '',
      estimatedValue: '',
      status: 'lead',
      source: 'Prospección directa',
      notes: '',
    });
    setFormError('');
    setShowProspectModal(true);
  };

  const openEditProspectModal = (p) => {
    setEditingProspect(p);
    setProspectForm({
      companyName: p.companyName || '',
      contactName: p.contactName || '',
      email: p.email || '',
      phone: p.phone || '',
      industry: p.industry || '',
      estimatedValue: p.estimatedValue ? String(p.estimatedValue) : '',
      status: p.status || 'lead',
      source: p.source || '',
      notes: p.notes || '',
    });
    setFormError('');
    setShowProspectModal(true);
  };

  const closeProspectModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowProspectModal(false);
      setClosingModal(false);
      setEditingProspect(null);
    }, 180);
  };

  const handleSaveProspect = async (e) => {
    e.preventDefault();
    if (!prospectForm.companyName.trim()) {
      setFormError('El nombre de la empresa es obligatorio.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingProspect) {
        await api.put(`/admin/prospects/${editingProspect.id}`, prospectForm);
        showNotification(`Prospecto ${prospectForm.companyName} actualizado correctamente.`);
      } else {
        await api.post('/admin/prospects', prospectForm);
        showNotification(`Prospecto ${prospectForm.companyName} creado exitosamente.`);
      }
      closeProspectModal();
      fetchProspects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar prospecto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProspect = async (id, companyName) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al prospecto "${companyName}" y todo su historial de documentos?`)) return;
    try {
      await api.delete(`/admin/prospects/${id}`);
      showNotification(`Prospecto "${companyName}" eliminado.`);
      fetchProspects();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar prospecto.');
    }
  };

  const openAddDocModal = (prospect) => {
    setActiveProspectForDoc(prospect);
    // Suggest next version if previous exists
    let nextVer = 'v1.0';
    if (prospect.documents && prospect.documents.length > 0) {
      const lastVer = prospect.documents[0].version; // e.g. v1.0
      const match = lastVer.match(/v?(\d+)(\.(\d+))?/);
      if (match) {
        const major = parseInt(match[1]) || 1;
        nextVer = `v${major + 1}.0`;
      } else {
        nextVer = `v${prospect.documents.length + 1}.0`;
      }
    }

    setDocForm({
      title: `Cotización — ${prospect.companyName}`,
      type: 'quote',
      version: nextVer,
      url: '',
      notes: '',
    });
    setFormError('');
    setShowDocModal(true);
  };

  const closeDocModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowDocModal(false);
      setClosingModal(false);
      setActiveProspectForDoc(null);
    }, 180);
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!docForm.title.trim() || !docForm.url.trim()) {
      setFormError('El título y el enlace son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await api.post(`/admin/prospects/${activeProspectForDoc.id}/documents`, docForm);
      showNotification(`Documento ${docForm.version} agregado a ${activeProspectForDoc.companyName}.`);
      closeDocModal();
      fetchProspects();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar documento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoc = async (prospectId, docId, version) => {
    if (!window.confirm(`¿Eliminar la versión ${version} de este documento?`)) return;
    try {
      await api.delete(`/admin/prospects/${prospectId}/documents/${docId}`);
      showNotification(`Versión ${version} eliminada.`);
      fetchProspects();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar documento.');
    }
  };

  const handleConvertProspect = async (prospect) => {
    if (!window.confirm(`¿Convertir a "${prospect.companyName}" en Cliente Activo del portal? Esto creará su cuenta de cliente e iniciará su proyecto formal.`)) return;

    setConvertingId(prospect.id);
    try {
      const { data } = await api.post(`/admin/prospects/${prospect.id}/convert`);
      showNotification(`¡Felicidades! "${prospect.companyName}" ahora es un cliente activo.`);
      await fetchProspects();
      if (data.client?.id) {
        navigate(`/admin/clients/${data.client.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error al convertir prospecto.');
    } finally {
      setConvertingId(null);
    }
  };

  // Pipeline Metrics
  const metrics = useMemo(() => {
    const total = prospects.length;
    const totalPipelineValue = prospects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
    const wonCount = prospects.filter(p => p.status === 'won').length;
    const negotiatingCount = prospects.filter(p => ['meeting', 'proposal_sent', 'negotiating'].includes(p.status)).length;
    return { total, totalPipelineValue, wonCount, negotiatingCount };
  }, [prospects]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const matchSearch =
        p.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter === 'all') return true;
      return p.status === statusFilter;
    });
  }, [prospects, searchTerm, statusFilter]);

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
              CRM de Prospectos & Cotizaciones
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, maxWidth: '640px' }}>
              Administra empresas en proceso de cierre, gestiona versiones de propuestas técnicas (v1, v2...) y conviértelas en clientes con 1 clic.
            </p>
          </div>

          <button
            onClick={openNewProspectModal}
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
            Nuevo Prospecto
          </button>
        </div>

        {/* ── Top Metrics Bar ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Total Prospectos</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{metrics.total}</span>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Valor Pipeline Estimado</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#00C4CC' }}>
              ${metrics.totalPipelineValue.toLocaleString('es-MX')} <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>MXN</span>
            </span>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>En Negociación / Propuesta</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#B45309' }}>{metrics.negotiatingCount}</span>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Ganados / Convertidos</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#047857' }}>{metrics.wonCount}</span>
          </div>
        </div>

        {/* ── Filters & Search ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 14px', width: '280px' }}>
              <Search size={15} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Buscar por empresa o contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
              />
            </div>

            {/* Single filter pill with breakdown toggle */}
            <button
              onClick={() => setExpandedStageFilter(!expandedStageFilter)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid #E5E7EB',
                background: statusFilter !== 'all' ? '#111827' : '#FFFFFF',
                color: statusFilter !== 'all' ? '#FFFFFF' : '#374151',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <Filter size={14} color={statusFilter !== 'all' ? '#00C4CC' : '#6B7280'} />
              <span>
                {statusFilter === 'all'
                  ? `Etapa: Todos (${metrics.total})`
                  : `Etapa: ${STAGE_CONFIG[statusFilter]?.label || statusFilter} (${prospects.filter(p => p.status === statusFilter).length})`}
              </span>
              <ChevronDown
                size={14}
                style={{
                  transform: expandedStageFilter ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: statusFilter !== 'all' ? '#FFFFFF' : '#6B7280',
                }}
              />
            </button>
          </div>

          {/* Animated breakdown (desglose) of stages */}
          <div style={{
            maxHeight: expandedStageFilter ? '160px' : '0px',
            opacity: expandedStageFilter ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: expandedStageFilter ? '6px' : '0px',
            paddingBottom: expandedStageFilter ? '4px' : '0px',
          }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                border: statusFilter === 'all' ? '1px solid #111827' : '1px solid #E5E7EB',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#111827' : '#FFFFFF',
                color: statusFilter === 'all' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease',
              }}
            >
              Todos ({metrics.total})
            </button>
            {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
              const count = prospects.filter(p => p.status === key).length;
              const isSelected = statusFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: isSelected ? '1px solid #111827' : `1px solid ${cfg.border}`,
                    cursor: 'pointer',
                    background: isSelected ? '#111827' : cfg.bg,
                    color: isSelected ? '#FFFFFF' : cfg.color,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Prospects List / Cards ─────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <p>Cargando prospectos del pipeline...</p>
          </div>
        ) : filteredProspects.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <Briefcase size={36} color="#9CA3AF" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              No hay prospectos en este filtro
            </h3>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 20px' }}>
              Agrega una empresa prospecto para iniciar el seguimiento y registrar propuestas enviadas.
            </p>
            <button onClick={openNewProspectModal} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              <Plus size={14} /> Crear Primer Prospecto
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredProspects.map((p) => {
              const stageCfg = STAGE_CONFIG[p.status] || STAGE_CONFIG.lead;
              const docs = p.documents || [];
              const latestDoc = docs.length > 0 ? docs[0] : null;
              const isDocsExpanded = expandedDocsIds.has(p.id);

              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    padding: '22px 24px',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  {/* Top Row: Company, Status Badge & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
                          {p.companyName}
                        </span>

                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: stageCfg.bg,
                          color: stageCfg.color,
                          border: `1px solid ${stageCfg.border}`,
                        }}>
                          {stageCfg.label}
                        </span>

                        {p.industry && (
                          <span style={{ fontSize: '11.5px', color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '6px', fontWeight: 500 }}>
                            {p.industry}
                          </span>
                        )}
                      </div>

                      {/* Contact row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12.5px', color: '#4B5563' }}>
                        {p.contactName && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={13} color="#9CA3AF" /> {p.contactName}
                          </span>
                        )}
                        {p.phone && (
                          <a
                            href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#0284C7', textDecoration: 'none', fontWeight: 500 }}
                          >
                            <Phone size={13} /> {p.phone}
                          </a>
                        )}
                        {p.email && (
                          <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4B5563', textDecoration: 'none' }}>
                            <Mail size={13} color="#9CA3AF" /> {p.email}
                          </a>
                        )}
                        {p.source && (
                          <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                            • Origen: {p.source}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right action group */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.estimatedValue && (
                        <div style={{ textAlign: 'right', marginRight: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block' }}>Presupuesto Estimado</span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                            ${p.estimatedValue.toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                      )}

                      {/* 1-Click Convert to Client */}
                      {p.status !== 'won' ? (
                        <button
                          onClick={() => handleConvertProspect(p)}
                          disabled={convertingId === p.id}
                          className="btn-accent"
                          style={{
                            fontSize: '12.5px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(0, 196, 204, 0.2)',
                          }}
                        >
                          <Sparkles size={14} />
                          {convertingId === p.id ? 'Convirtiendo...' : 'Convertir a Cliente'}
                        </button>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#047857',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}>
                          <CheckCircle2 size={14} /> Cliente Activo
                        </span>
                      )}

                      <button
                        onClick={() => openEditProspectModal(p)}
                        className="btn-secondary"
                        style={{ padding: '8px', borderRadius: '8px' }}
                        title="Editar datos del prospecto"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteProspect(p.id, p.companyName)}
                        className="btn-secondary"
                        style={{ padding: '8px', borderRadius: '8px', color: '#DC2626' }}
                        title="Eliminar prospecto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {p.notes && (
                    <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F3F4F6', fontSize: '12.5px', color: '#4B5563' }}>
                      <strong style={{ color: '#111827' }}>Notas:</strong> {p.notes}
                    </div>
                  )}

                  {/* ── Document Versions Section (Clearly separated & collapsible) ── */}
                  <div style={{
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    background: '#F9FAFB',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isDocsExpanded && docs.length > 0 ? '12px' : '0px',
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Header Strip */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <FileText size={15} color="#00C4CC" />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                          Documentos & Propuestas ({docs.length})
                        </span>
                        {latestDoc && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#374151',
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}>
                            Último: {latestDoc.version} ({DOC_TYPES[latestDoc.type]?.label || latestDoc.type})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {docs.length > 0 && (
                          <button
                            onClick={() => toggleDocs(p.id)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #D1D5DB',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#374151',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span>{isDocsExpanded ? 'Ocultar historial' : `Ver versiones (${docs.length})`}</span>
                            <ChevronDown
                              size={13}
                              style={{
                                transform: isDocsExpanded ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s ease',
                              }}
                            />
                          </button>
                        )}

                        <button
                          onClick={() => openAddDocModal(p)}
                          style={{
                            background: '#111827',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Plus size={13} />
                          {docs.length === 0 ? 'Adjuntar Propuesta' : 'Nueva Versión'}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Document Versions List */}
                    {isDocsExpanded && docs.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #E5E7EB',
                      }}>
                        {docs.map((doc) => {
                          const docTypeCfg = DOC_TYPES[doc.type] || DOC_TYPES.quote;
                          const docDate = new Date(doc.createdAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          });

                          return (
                            <div
                              key={doc.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                background: '#FFFFFF',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <span style={{
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  background: '#111827',
                                  color: '#FFFFFF',
                                  fontFamily: 'monospace',
                                }}>
                                  {doc.version}
                                </span>

                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  background: '#F9FAFB',
                                  border: '1px solid #E5E7EB',
                                  color: docTypeCfg.color,
                                }}>
                                  {docTypeCfg.label}
                                </span>

                                <div>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', display: 'block' }}>
                                    {doc.title}
                                  </span>
                                  {doc.notes && (
                                    <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                                      Cambios: {doc.notes}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{docDate}</span>

                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    background: '#F3F4F6',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    color: '#111827',
                                    textDecoration: 'none',
                                  }}
                                >
                                  Abrir Archivo <ExternalLink size={12} />
                                </a>

                                <button
                                  onClick={() => handleDeleteDoc(p.id, doc.id, doc.version)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
                                  title="Eliminar versión"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Modal: Crear / Editar Prospecto ─────────────────────────────────────── */}
      {showProspectModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeProspectModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '580px', borderRadius: '16px', padding: '32px' }}>
            <button
              onClick={closeProspectModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {editingProspect ? 'Editar Prospecto' : 'Nuevo Prospecto Comercial'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Registra la empresa y sus datos de contacto para iniciar el proceso de seguimiento y cotización.
            </p>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '16px' }}>
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProspect} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  className="hx-input"
                  placeholder="Ej. Distribuidora Médica del Centro SA de CV"
                  value={prospectForm.companyName}
                  onChange={(e) => setProspectForm({ ...prospectForm, companyName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Contacto / Decisor
                  </label>
                  <input
                    type="text"
                    className="hx-input"
                    placeholder="Ej. Lic. Fernando Robles"
                    value={prospectForm.contactName}
                    onChange={(e) => setProspectForm({ ...prospectForm, contactName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Giro / Industria
                  </label>
                  <input
                    type="text"
                    className="hx-input"
                    placeholder="Ej. Salud, Gastronómico, Logística"
                    value={prospectForm.industry}
                    onChange={(e) => setProspectForm({ ...prospectForm, industry: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    className="hx-input"
                    placeholder="+52 55..."
                    value={prospectForm.phone}
                    onChange={(e) => setProspectForm({ ...prospectForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="hx-input"
                    placeholder="contacto@empresa.com"
                    value={prospectForm.email}
                    onChange={(e) => setProspectForm({ ...prospectForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Presupuesto Estimado (MXN)
                  </label>
                  <input
                    type="number"
                    className="hx-input"
                    placeholder="Ej. 45000"
                    value={prospectForm.estimatedValue}
                    onChange={(e) => setProspectForm({ ...prospectForm, estimatedValue: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Etapa en el Pipeline
                  </label>
                  <select
                    className="hx-input"
                    value={prospectForm.status}
                    onChange={(e) => setProspectForm({ ...prospectForm, status: e.target.value })}
                  >
                    {Object.entries(STAGE_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Origen del Lead
                </label>
                <input
                  type="text"
                  className="hx-input"
                  placeholder="Ej. Visita en frío Coyoacán, Recomendación, Formulario Web"
                  value={prospectForm.source}
                  onChange={(e) => setProspectForm({ ...prospectForm, source: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Notas de Necesidades
                </label>
                <textarea
                  className="hx-input"
                  rows={2}
                  placeholder="¿Qué problema técnico o de negocio buscan resolver?"
                  value={prospectForm.notes}
                  onChange={(e) => setProspectForm({ ...prospectForm, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeProspectModal} className="btn-secondary" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : editingProspect ? 'Actualizar Prospecto' : 'Crear Prospecto'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal: Agregar Documento / Versión ─────────────────────────────────────── */}
      {showDocModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeDocModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '16px', padding: '32px' }}>
            <button
              onClick={closeDocModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Agregar Documento o Versión
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Para <strong>{activeProspectForDoc?.companyName}</strong>. Registra la versión y el enlace directo al archivo.
            </p>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '16px' }}>
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Título del Documento *
                </label>
                <input
                  type="text"
                  required
                  className="hx-input"
                  placeholder="Ej. Cotización Plataforma Web + Módulo NFC"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Tipo de Documento
                  </label>
                  <select
                    className="hx-input"
                    value={docForm.type}
                    onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                  >
                    {Object.entries(DOC_TYPES).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Etiqueta de Versión *
                  </label>
                  <input
                    type="text"
                    required
                    className="hx-input"
                    placeholder="Ej. v1.0, v1.1, v2.0"
                    value={docForm.version}
                    onChange={(e) => setDocForm({ ...docForm, version: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Enlace al Documento (Google Drive, PDF en la nube) *
                </label>
                <input
                  type="url"
                  required
                  className="hx-input"
                  placeholder="https://drive.google.com/..."
                  value={docForm.url}
                  onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Notas de Cambios en esta Versión
                </label>
                <textarea
                  className="hx-input"
                  rows={2}
                  placeholder="Ej. Se ajustó el presupuesto tras reunión presencial. Se agregó pasarela de pagos."
                  value={docForm.notes}
                  onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeDocModal} className="btn-secondary" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar Versión'}
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
