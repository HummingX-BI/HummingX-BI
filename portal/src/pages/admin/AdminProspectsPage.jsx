import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import ProspectDrawer from './prospects/ProspectDrawer';
import ProspectCompactList from './prospects/ProspectCompactList';
import ProspectKanban from './prospects/ProspectKanban';
import PartnersProgramTab from './prospects/PartnersProgramTab';
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
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  Award,
  Coins,
  Loader2,
  LayoutList,
  Columns3,
  Users,
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
  const [searchParams] = useSearchParams();

  // Navigation tabs & views
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'partners'
  const [viewMode, setViewMode] = useState('compact'); // 'compact' | 'kanban'
  const [selectedProspect, setSelectedProspect] = useState(null);

  // Prospects state
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);

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

  // Referral code live validation state
  const [referralValidation, setReferralValidation] = useState({
    checking: false,
    valid: null,
    data: null,
    message: '',
  });

  // Announcement modal for awarding referral credits
  const [rewardModalData, setRewardModalData] = useState({
    isOpen: false,
    prospectId: '',
    companyName: '',
    referrerId: '',
    referrerName: '',
    level: 1,
    tierName: '',
    amount: 1500,
    submitting: false,
  });

  // Modal para solicitar email real antes de convertir
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    prospect: null,
    email: '',
    error: '',
    submitting: false,
  });

  // Form state for Prospect
  const [prospectForm, setProspectForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    estimatedValue: '',
    status: 'lead',
    source: 'Prospección directa',
    referralCode: '',
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

      // Keep selected prospect in sync if drawer is open
      setSelectedProspect((prev) => {
        if (!prev) return null;
        const updatedCurrent = data.find((p) => p.id === prev.id);
        return updatedCurrent ? { ...prev, ...updatedCurrent } : prev;
      });
    } catch (err) {
      console.error('Error al cargar prospectos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  useEffect(() => {
    const hl = searchParams.get('highlight');
    if (hl && prospects.length > 0) {
      setStatusFilter('all');
      setSearchTerm('');
      setHighlightedId(hl);
      const timer = setTimeout(() => {
        const el = document.getElementById(`prospect-${hl}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      const clearTimer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [searchParams, prospects]);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Live validation for referral code
  useEffect(() => {
    if (!showProspectModal) return;
    const rawCode = prospectForm.referralCode?.trim();
    if (!rawCode) {
      setReferralValidation({ checking: false, valid: null, data: null, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setReferralValidation((prev) => ({ ...prev, checking: true, message: '' }));
      try {
        const res = await api.get(`/admin/referrals/validate-code/${encodeURIComponent(rawCode)}`);
        if (res.data?.valid) {
          setReferralValidation({
            checking: false,
            valid: true,
            data: res.data.referrer,
            message: `Viene recomendado por ${res.data.referrer.displayName} (${res.data.referrer.tierName})`,
          });
          setProspectForm((prev) => {
            if (!prev.source || prev.source === 'Prospección directa' || prev.source.startsWith('Recomendado por')) {
              return { ...prev, source: `Recomendado por ${res.data.referrer.displayName} (Código: ${res.data.referrer.referralCode || rawCode})` };
            }
            return prev;
          });
        } else {
          setReferralValidation({
            checking: false,
            valid: false,
            data: null,
            message: res.data.message || 'Código no encontrado en el sistema de socios.',
          });
        }
      } catch (err) {
        setReferralValidation({
          checking: false,
          valid: false,
          data: null,
          message: 'Error al validar código.',
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [prospectForm.referralCode, showProspectModal]);

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
      referralCode: '',
      notes: '',
    });
    setReferralValidation({ checking: false, valid: null, data: null, message: '' });
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
      referralCode: p.referralCode || '',
      notes: p.notes || '',
    });
    setReferralValidation({
      checking: false,
      valid: p.referralInfo ? true : null,
      data: p.referralInfo ? { displayName: p.referralInfo.referrerName, tierName: p.referralInfo.tierName, creditAmount: p.referralInfo.creditAmount } : null,
      message: p.referralInfo ? `Recomendado por ${p.referralInfo.referrerName}` : '',
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
      let res;
      if (editingProspect) {
        res = await api.put(`/admin/prospects/${editingProspect.id}`, prospectForm);
        showNotification(`Prospecto "${prospectForm.companyName}" actualizado.`);
        if (selectedProspect?.id === editingProspect.id && res.data) {
          setSelectedProspect(res.data);
        }
      } else {
        res = await api.post('/admin/prospects', prospectForm);
        showNotification(`Prospecto "${prospectForm.companyName}" creado exitosamente.`);
      }
      closeProspectModal();
      await fetchProspects();

      if (res.data?.referralReward?.needsAward) {
        const rew = res.data.referralReward;
        setRewardModalData({
          isOpen: true,
          prospectId: rew.prospectId,
          companyName: rew.prospectName,
          referrerId: rew.referrerId,
          referrerName: rew.referrerName,
          level: rew.level,
          tierName: rew.tierName,
          amount: rew.creditAmount,
          submitting: false,
        });
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar prospecto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStage = async (prospectId, newStatus) => {
    // 1. Optimistic update: UI responds immediately
    setSelectedProspect((prev) => (prev && prev.id === prospectId ? { ...prev, status: newStatus } : prev));
    setProspects((prev) => prev.map((p) => (p.id === prospectId ? { ...p, status: newStatus } : p)));

    try {
      const res = await api.put(`/admin/prospects/${prospectId}`, { status: newStatus });
      showNotification('Etapa actualizada con éxito.');

      if (res.data) {
        setSelectedProspect((prev) => (prev && prev.id === prospectId ? { ...prev, ...res.data } : prev));
        setProspects((prev) => prev.map((p) => (p.id === prospectId ? { ...p, ...res.data } : p)));

        if (res.data.referralReward?.needsAward) {
          const rew = res.data.referralReward;
          setRewardModalData({
            isOpen: true,
            prospectId: rew.prospectId,
            companyName: rew.prospectName,
            referrerId: rew.referrerId,
            referrerName: rew.referrerName,
            level: rew.level,
            tierName: rew.tierName,
            amount: rew.creditAmount,
            submitting: false,
          });
        }
      }
    } catch (err) {
      console.error('Error al actualizar etapa:', err);
      showNotification('Error al actualizar etapa.');
      fetchProspects();
    }
  };

  const handleAwardCredits = async () => {
    if (!rewardModalData.prospectId) return;
    setRewardModalData((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.post(`/admin/prospects/${rewardModalData.prospectId}/award-referral-credits`, {
        amount: rewardModalData.amount,
      });
      showNotification(res.data.message || 'Créditos abonados con éxito al socio.');
      setRewardModalData((prev) => ({ ...prev, isOpen: false, submitting: false }));
      await fetchProspects();
    } catch (err) {
      console.error('Error al abonar créditos:', err);
      alert(err.response?.data?.error || 'Error al abonar créditos al socio.');
      setRewardModalData((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleDeleteProspect = async (id, companyName) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al prospecto "${companyName}" y todo su historial de documentos?`)) return;
    try {
      await api.delete(`/admin/prospects/${id}`);
      showNotification(`Prospecto "${companyName}" eliminado.`);
      if (selectedProspect?.id === id) setSelectedProspect(null);
      fetchProspects();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar prospecto.');
    }
  };

  const openAddDocModal = (prospect) => {
    setActiveProspectForDoc(prospect);
    let nextVer = 'v1.0';
    if (prospect.documents && prospect.documents.length > 0) {
      const lastVer = prospect.documents[0].version;
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

  const executeConvert = async (prospect, emailOverride = null, linkExisting = false) => {
    setConvertingId(prospect.id);
    try {
      const payload = {};
      if (emailOverride) payload.email = emailOverride.trim().toLowerCase();
      if (linkExisting) payload.linkExisting = true;

      const { data } = await api.post(`/admin/prospects/${prospect.id}/convert`, payload);
      showNotification(data.message || 'Cliente creado.');
      await fetchProspects();
      setEmailModal({ isOpen: false, prospect: null, email: '', error: '', submitting: false });

      if (data.referralReward?.needsAward) {
        const rew = data.referralReward;
        setRewardModalData({
          isOpen: true,
          prospectId: rew.prospectId,
          companyName: rew.prospectName,
          referrerId: rew.referrerId,
          referrerName: rew.referrerName,
          level: rew.level,
          tierName: rew.tierName,
          amount: rew.creditAmount,
          submitting: false,
        });
      } else if (data.client?.id) {
        navigate(`/admin/clients/${data.client.id}`);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409 && err.response?.data?.existingClient) {
        const ec = err.response.data.existingClient;
        const confirmLink = window.confirm(
          `Ya existe un cliente con ese correo ("${ec.companyName || ec.name}"). ¿Deseas vincular este prospecto y crear un nuevo proyecto para él?`
        );
        if (confirmLink) {
          return await executeConvert(prospect, emailOverride, true);
        }
      } else if (err.response?.status === 400 && (!prospect.email || !emailOverride)) {
        setEmailModal({
          isOpen: true,
          prospect,
          email: '',
          error: 'Este prospecto no tiene correo registrado. Ingrésalo para continuar.',
          submitting: false,
        });
      } else {
        alert(err.response?.data?.error || 'Error al convertir prospecto.');
      }
    } finally {
      setConvertingId(null);
    }
  };

  const handleConvertProspect = async (prospect) => {
    if (!prospect.email) {
      setEmailModal({
        isOpen: true,
        prospect,
        email: '',
        error: '',
        submitting: false,
      });
      return;
    }

    if (!window.confirm(`¿Convertir a "${prospect.companyName}" en Cliente Activo del portal? Esto creará su cuenta de cliente e iniciará su proyecto formal.`)) return;

    await executeConvert(prospect);
  };

  const handleOpenNewAppointment = (prospect) => {
    navigate(`/admin/citas?company=${encodeURIComponent(prospect.companyName)}&contact=${encodeURIComponent(prospect.contactName || '')}&phone=${encodeURIComponent(prospect.phone || '')}`);
  };

  // Pipeline Metrics
  const metrics = useMemo(() => {
    const total = prospects.length;
    const totalPipelineValue = prospects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
    const wonCount = prospects.filter((p) => p.status === 'won').length;
    const negotiatingCount = prospects.filter((p) => ['meeting', 'proposal_sent', 'negotiating'].includes(p.status)).length;
    return { total, totalPipelineValue, wonCount, negotiatingCount };
  }, [prospects]);

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
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

        {/* ── Top Header Strip ─────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.025em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              CRM Comercial & Programa de Socios
            </h1>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: 0, maxWidth: '640px' }}>
              Administra el embudo de ventas, cotizaciones versionadas y el programa de incentivos para clientes socios.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={openNewProspectModal}
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
              Nuevo Prospecto
            </button>
          </div>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E5E7EB', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'pipeline' ? '2.5px solid #00C4CC' : '2.5px solid transparent',
              color: activeTab === 'pipeline' ? '#111827' : '#6B7280',
              fontWeight: activeTab === 'pipeline' ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Briefcase size={16} color={activeTab === 'pipeline' ? '#00C4CC' : '#9CA3AF'} />
            <span>Embudo Comercial</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '9999px',
                background: activeTab === 'pipeline' ? '#F0FDFA' : '#F3F4F6',
                color: activeTab === 'pipeline' ? '#0D9488' : '#6B7280',
              }}
            >
              {metrics.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'partners' ? '2.5px solid #00C4CC' : '2.5px solid transparent',
              color: activeTab === 'partners' ? '#111827' : '#6B7280',
              fontWeight: activeTab === 'partners' ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Award size={16} color={activeTab === 'partners' ? '#00C4CC' : '#9CA3AF'} />
            <span>Programa de Socios</span>
          </button>
        </div>

        {/* ── TAB CONTENT: PROGRAMA DE SOCIOS ────────────────────────────────── */}
        {activeTab === 'partners' && (
          <PartnersProgramTab onAwardCreditsSuccess={fetchProspects} />
        )}

        {/* ── TAB CONTENT: EMBUDO COMERCIAL (PIPELINE) ──────────────────────── */}
        {activeTab === 'pipeline' && (
          <>
            {/* Top Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
              <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Total Prospectos</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{metrics.total}</span>
              </div>

              <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pipeline Estimado</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#00C4CC' }}>
                  ${metrics.totalPipelineValue.toLocaleString('es-MX')}{' '}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>MXN</span>
                </span>
              </div>

              <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>En Negociación / Cita</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#B45309' }}>{metrics.negotiatingCount}</span>
              </div>

              <div className="card" style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
                <span style={{ fontSize: '11.5px', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Ganados / Convertidos</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#047857' }}>{metrics.wonCount}</span>
              </div>
            </div>

            {/* Controls Bar: Search, Filters, and View Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 14px', width: '100%' }}>
                  <Search size={15} color="#9CA3AF" />
                  <input
                    type="text"
                    placeholder="Buscar por empresa, contacto o giro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
                  />
                </div>

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
                  <option value="all">Todas las Etapas ({metrics.total})</option>
                  {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
                    const count = prospects.filter((p) => p.status === key).length;
                    return (
                      <option key={key} value={key}>
                        {cfg.label} ({count})
                      </option>
                    );
                  })}
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

            {/* Views Content */}
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
            ) : viewMode === 'compact' ? (
              <ProspectCompactList
                prospects={filteredProspects}
                onSelectProspect={setSelectedProspect}
                onConvert={handleConvertProspect}
                convertingId={convertingId}
                onEdit={openEditProspectModal}
                onDelete={handleDeleteProspect}
                highlightedId={highlightedId}
              />
            ) : (
              <ProspectKanban
                prospects={filteredProspects}
                onSelectProspect={setSelectedProspect}
                onChangeStage={handleChangeStage}
                highlightedId={highlightedId}
              />
            )}
          </>
        )}

      </div>

      {/* ── Slide-over Lateral Drawer (Detalle del Prospecto) ───────────── */}
      {selectedProspect && (
        <ProspectDrawer
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onEdit={openEditProspectModal}
          onDelete={handleDeleteProspect}
          onConvert={handleConvertProspect}
          convertingId={convertingId}
          onAddDoc={openAddDocModal}
          onDeleteDoc={handleDeleteDoc}
          onAwardCredits={(p) => {
            setRewardModalData({
              isOpen: true,
              prospectId: p.id,
              companyName: p.companyName,
              referrerId: p.referralInfo?.referrerId || '',
              referrerName: p.referralInfo?.referrerName || '',
              level: p.referralInfo?.level || 1,
              tierName: p.referralInfo?.tierName || '',
              amount: p.referralInfo?.creditAmount || 1500,
              submitting: false,
            });
          }}
          onChangeStage={handleChangeStage}
          onOpenNewAppointment={handleOpenNewAppointment}
        />
      )}

      {/* ── Modal: Crear / Editar Prospecto ──────────────────────────── */}
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
                  Código de Socio / Recomendación (Opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="hx-input"
                    placeholder="Ej. 58291"
                    value={prospectForm.referralCode}
                    onChange={(e) => setProspectForm({ ...prospectForm, referralCode: e.target.value.toUpperCase() })}
                    style={{
                      borderColor: referralValidation.valid === true ? '#10B981' : referralValidation.valid === false ? '#F59E0B' : undefined,
                      paddingRight: referralValidation.checking ? '36px' : undefined,
                    }}
                  />
                  {referralValidation.checking && (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                      <Loader2 className="animate-spin" size={15} color="#00C4CC" />
                    </div>
                  )}
                </div>

                {referralValidation.valid === true && referralValidation.data && (
                  <div style={{
                    marginTop: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#065F46',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} color="#10B981" />
                      <span>
                        Viene recomendado por: <strong>{referralValidation.data.displayName}</strong> ({referralValidation.data.tierName})
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#047857' }}>
                      +${referralValidation.data.creditAmount?.toLocaleString('es-MX')} HX al cerrar
                    </span>
                  </div>
                )}

                {referralValidation.valid === false && (
                  <div style={{
                    marginTop: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#92400E',
                  }}>
                    <AlertCircle size={14} color="#D97706" />
                    <span>{referralValidation.message}</span>
                  </div>
                )}
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

      {/* ── Modal: Agregar Documento / Versión ──────────────────────── */}
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

      {/* ── Modal: Anuncio / Abono de Créditos por Referido ───────────── */}
      {rewardModalData.isOpen && createPortal(
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !rewardModalData.submitting) setRewardModalData((prev) => ({ ...prev, isOpen: false })); }}
        >
          <div className="modal-content" style={{ maxWidth: '500px', borderRadius: '20px', padding: '32px', textAlign: 'center', position: 'relative' }}>
            <button
              onClick={() => setRewardModalData((prev) => ({ ...prev, isOpen: false }))}
              disabled={rewardModalData.submitting}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
            >
              <X size={20} />
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ECFDF5 0%, #CCFBF1 100%)',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px -4px rgba(0, 196, 204, 0.25)',
            }}>
              <Coins size={30} color="#00C4CC" />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ¡Prospecto Cerrado con Éxito!
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.5 }}>
              Este cliente vino recomendado por un socio activo de HummingX BI. Es momento de abonar su recompensa de créditos.
            </p>

            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '18px 20px',
              textAlign: 'left',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Empresa formalizada:</span>
                <strong style={{ color: '#111827' }}>{rewardModalData.companyName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Socio recomendador:</span>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#111827', display: 'block' }}>{rewardModalData.referrerName}</strong>
                  <span style={{ fontSize: '11px', color: '#00C4CC', fontWeight: 700 }}>{rewardModalData.tierName}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginTop: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Monto a abonar en Créditos HX:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#6B7280' }}>$</span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      className="hx-input"
                      style={{ paddingLeft: '28px', fontWeight: 800, fontSize: '16px', color: '#047857' }}
                      value={rewardModalData.amount}
                      onChange={(e) => setRewardModalData((prev) => ({ ...prev, amount: parseInt(e.target.value, 10) || 0 }))}
                    />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#00C4CC', whiteSpace: 'nowrap' }}>
                    Créditos HX
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleAwardCredits}
                disabled={rewardModalData.submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #00C4CC 0%, #0099AA 100%)',
                }}
              >
                {rewardModalData.submitting ? 'Abonando créditos...' : `Abonar $${rewardModalData.amount?.toLocaleString('es-MX')} Créditos HX`}
              </button>
              <button
                onClick={() => setRewardModalData((prev) => ({ ...prev, isOpen: false }))}
                disabled={rewardModalData.submitting}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px' }}
              >
                Hacerlo más tarde
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal para ingresar correo real del prospecto antes de convertir */}
      {emailModal.isOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Correo del Cliente Requerido
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Para convertir a <strong>{emailModal.prospect?.companyName}</strong> en cliente formal, ingresa su correo electrónico real.
            </p>

            {emailModal.error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                {emailModal.error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Correo electrónico institucional o de contacto *
              </label>
              <input
                type="email"
                placeholder="ejemplo@empresa.com"
                className="hx-input"
                style={{ width: '100%' }}
                value={emailModal.email}
                onChange={(e) => setEmailModal(prev => ({ ...prev, email: e.target.value, error: '' }))}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEmailModal({ isOpen: false, prospect: null, email: '', error: '', submitting: false })}
                className="btn-secondary"
                style={{ flex: 1, padding: '12px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={emailModal.submitting || !emailModal.email.trim()}
                onClick={() => {
                  const val = emailModal.email.trim();
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    setEmailModal(prev => ({ ...prev, error: 'Por favor ingresa un correo con formato válido.' }));
                    return;
                  }
                  executeConvert(emailModal.prospect, val);
                }}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00C4CC 0%, #0099AA 100%)' }}
              >
                {emailModal.submitting ? 'Convirtiendo...' : 'Convertir Cliente'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </Layout>
  );
}
