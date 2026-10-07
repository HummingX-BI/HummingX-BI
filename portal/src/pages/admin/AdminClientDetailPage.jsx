import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, User, Mail, Phone, Building, Save, FolderOpen, AlertCircle,
  ClipboardList, Paintbrush, Code2, Search, Rocket, CheckCircle, CheckCircle2, Activity,
  Plus, Trash2, Calendar, X, Users, DollarSign, Clock, Edit2, Sparkles, Check, Eye
} from 'lucide-react';

const PHASES = [
  { num: 1, label: 'Análisis', icon: ClipboardList },
  { num: 2, label: 'Diseño', icon: Paintbrush },
  { num: 3, label: 'Revisión', icon: Search },
  { num: 4, label: 'Desarrollo', icon: Code2 },
  { num: 5, label: 'Lanzamiento', icon: Rocket },
  { num: 6, label: 'Activo', icon: CheckCircle },
];

const parseSafeLocalDate = (dateVal) => {
  if (!dateVal) return new Date();
  const dateStr = typeof dateVal === 'string' ? dateVal.split('T')[0] : '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
  }
  return new Date(dateVal);
};

const formatSafeDate = (dateVal) => {
  if (!dateVal) return '—';
  const d = parseSafeLocalDate(dateVal);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({});
  const [savingClient, setSavingClient] = useState(false);
  const [clientMsg, setClientMsg] = useState('');
  const [activeProject, setActiveProject] = useState(null);
  const [projectData, setProjectData] = useState({});
  const [savingProject, setSavingProject] = useState(false);
  const [projectMsg, setProjectMsg] = useState('');
  const [initialProjectData, setInitialProjectData] = useState(null);
  const [newActivity, setNewActivity] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectErrorMsg, setProjectErrorMsg] = useState('');
  
  // Referrals and Credits
  const [creditAmount, setCreditAmount] = useState('');
  const { impersonate } = useAuth();
  const [impersonating, setImpersonating] = useState(false);

  const handleImpersonate = async () => {
    if (!client) return;
    setImpersonating(true);
    try {
      await impersonate(client.id);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al iniciar sesión como cliente.');
    } finally {
      setImpersonating(false);
    }
  };

  const [adjustingCredits, setAdjustingCredits] = useState(false);

  // Plan de Pagos por Cliente
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    title: '',
    description: '',
    amount: '',
    status: 'pending',
    dueDate: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Plan Wizard State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planTotalAmount, setPlanTotalAmount] = useState('15000');
  const [planInstallmentsCount, setPlanInstallmentsCount] = useState(5);
  const [planReplaceExisting, setPlanReplaceExisting] = useState(true);
  const [planInstallments, setPlanInstallments] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planError, setPlanError] = useState('');

  const [isEditingClient, setIsEditingClient] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => { 
    setClient(null);
    setActiveProject(null);
    fetchClient(); 
  }, [id]);

  const fetchClient = () => {
    setLoading(true);
    api.get(`/admin/clients/${id}`)
      .then(res => {
        setClient(res.data);
        setClientData({ name: res.data.name, companyName: res.data.companyName || '', logoUrl: res.data.logoUrl || '', email: res.data.email, phone: res.data.phone || '' });
        const proj = res.data.projects?.find(p => p.status === 'active') || res.data.projects?.[0];
        if (proj) {
          setActiveProject(proj);
          setPayments(proj.payments || []);
          const pData = { 
            name: proj.name, 
            description: proj.description || '', 
            currentPhase: proj.currentPhase, 
            progressPercent: proj.progressPercent, 
            estimatedDelivery: proj.estimatedDelivery ? proj.estimatedDelivery.split('T')[0] : '',
            quoteLink: proj.quoteLink || '',
            contractLink: proj.contractLink || '',
            previewUrl: proj.previewUrl || '',
            designStatus: proj.designStatus || 'pending_review'
          };
          setProjectData(pData);
          setInitialProjectData(pData);
        } else {
          setActiveProject(null);
          setPayments([]);
          setInitialProjectData(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    setSavingClient(true);
    try {
      await api.put(`/admin/clients/${id}`, clientData);
      setClientMsg('Datos guardados correctamente.');
      setIsEditingClient(false);
      setTimeout(() => setClientMsg(''), 3000);
      fetchClient();
    } catch { setClientMsg('Error al guardar datos.'); }
    finally { setSavingClient(false); }
  };

  const handleDeleteThisClient = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar permanentemente a este cliente ("${client.companyName || client.name}") y todos sus proyectos, pagos y registros asociados?`)) {
      return;
    }
    try {
      await api.delete(`/admin/clients/${id}`);
      navigate('/admin/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Error al eliminar cliente.');
    }
  };

  const handleToggleSuspend = async () => {
    const action = client.active ? 'suspender temporalmente' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de ${action} el acceso de este cliente?`)) return;
    
    try {
      await api.put(`/admin/clients/${id}/suspend`, { active: !client.active });
      fetchClient();
    } catch (err) {
      alert('Error al cambiar el estado del cliente.');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setClientMsg('');
    const formData = new FormData();
    formData.append('file', file);
    
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setClientMsg('Error: Configura VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env');
      setUploadingLogo(false);
      return;
    }

    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setClientData({ ...clientData, logoUrl: data.secure_url });
        setClientMsg('Logo subido a Cloudinary. Guarda los datos para aplicar.');
      } else {
        setClientMsg('Error de Cloudinary: ' + (data.error?.message || 'Revisa tu Preset/Cloud Name.'));
      }
    } catch (err) {
      setClientMsg('Error de red al subir logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!activeProject) return;

    if (projectData.currentPhase === 3 && !projectData.previewUrl?.trim()) {
      setProjectMsg({ type: 'error', text: 'Recuerda agregar el enlace para que el cliente lo revise.' });
      setTimeout(() => setProjectMsg(null), 4000);
      return;
    }

    setSavingProject(true);
    try {
      const d = { ...projectData };
      d.estimatedDelivery = d.estimatedDelivery ? new Date(d.estimatedDelivery).toISOString() : null;
      await api.put(`/admin/projects/${activeProject.id}`, d);
      setProjectMsg({ type: 'success', text: 'Proyecto actualizado correctamente.' });
      setInitialProjectData({ ...projectData });
      setTimeout(() => setProjectMsg(null), 3000);
      fetchClient();
    } catch { 
      setProjectMsg({ type: 'error', text: 'Error al actualizar el proyecto.' }); 
    }
    finally { setSavingProject(false); }
  };

  const isProjectDirty = useMemo(() => {
    if (!initialProjectData || !projectData) return false;
    return (
      projectData.name !== initialProjectData.name ||
      (projectData.description || '') !== (initialProjectData.description || '') ||
      projectData.currentPhase !== initialProjectData.currentPhase ||
      projectData.progressPercent !== initialProjectData.progressPercent ||
      (projectData.estimatedDelivery || '') !== (initialProjectData.estimatedDelivery || '') ||
      (projectData.quoteLink || '') !== (initialProjectData.quoteLink || '') ||
      (projectData.contractLink || '') !== (initialProjectData.contractLink || '') ||
      (projectData.previewUrl || '') !== (initialProjectData.previewUrl || '')
    );
  }, [projectData, initialProjectData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProjectDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProjectDirty]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);
    setProjectErrorMsg('');
    try {
      await api.post(`/admin/projects`, { ...newProjectData, clientId: id });
      setShowProjectModal(false);
      setNewProjectData({ name: '', description: '' });
      fetchClient();
    } catch (err) { setProjectErrorMsg(err.response?.data?.error || 'Error al crear.'); }
    finally { setCreatingProject(false); }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim() || !activeProject) return;
    setAddingActivity(true);
    try {
      await api.post(`/admin/projects/${activeProject.id}/activities`, { description: newActivity });
      setNewActivity('');
      fetchClient();
    } catch (err) { console.error(err); }
    finally { setAddingActivity(false); }
  };

  const handleAdjustCredits = async (e) => {
    e.preventDefault();
    if (!creditAmount) return;
    setAdjustingCredits(true);
    try {
      await api.post(`/admin/credits`, { 
        clientId: id, 
        amount: parseInt(creditAmount), 
        description: 'Ajuste manual de administrador',
        type: 'adjustment'
      });
      setCreditAmount('');
      fetchClient();
    } catch (err) { console.error('Error adjusting credits', err); }
    finally { setAdjustingCredits(false); }
  };

  const handleUpdateReferral = async (referralId, newStatus) => {
    try {
      await api.put(`/admin/referrals/${referralId}`, { status: newStatus });
      fetchClient();
    } catch (err) { console.error('Error updating referral', err); }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!activeProject || !confirm('¿Eliminar esta actividad?')) return;
    try {
      await api.delete(`/admin/projects/${activeProject.id}/activities/${activityId}`);
      fetchClient();
    } catch (err) { console.error(err); }
  };

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setPaymentForm({
      title: '',
      description: '',
      amount: '',
      status: 'pending',
      dueDate: `${year}-${month}-${day}`,
    });
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const handleOpenAddAnnuity = () => {
    setEditingPayment(null);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const year = nextYear.getFullYear();
    const month = String(nextYear.getMonth() + 1).padStart(2, '0');
    const day = String(nextYear.getDate()).padStart(2, '0');
    setPaymentForm({
      title: 'Anualidad de Mantenimiento',
      description: 'Pago por renovación anual y mantenimiento.',
      amount: '',
      status: 'upcoming',
      dueDate: `${year}-${month}-${day}`,
    });
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (p) => {
    setEditingPayment(p);
    setPaymentForm({
      title: p.title,
      description: p.description || '',
      amount: p.amount,
      status: p.status,
      dueDate: p.dueDate ? (typeof p.dueDate === 'string' ? p.dueDate.split('T')[0] : '') : '',
    });
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const generateInstallments = (total, count, existingList = []) => {
    const num = Math.max(1, parseInt(count) || 1);
    const tot = Math.max(0, parseFloat(total) || 0);
    const baseAmount = tot > 0 ? Math.floor((tot / num) * 100) / 100 : 0;
    const remainder = tot > 0 ? parseFloat((tot - (baseAmount * (num - 1))).toFixed(2)) : 0;

    const today = new Date();
    const items = [];
    for (let i = 0; i < num; i++) {
      const isFirst = i === 0;
      const isLast = i === num - 1;
      
      let defaultTitle = `Pago ${i + 1} de ${num}`;
      if (num === 1) defaultTitle = 'Pago Único / Total';
      else if (isFirst) defaultTitle = `Pago 1 de ${num} (Anticipo)`;
      else if (isLast) defaultTitle = `Pago ${num} de ${num} (Liquidación)`;

      // Date: staggered weekly by default if not set
      const d = new Date(today);
      d.setDate(today.getDate() + (i * 7));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const defaultDateStr = `${year}-${month}-${day}`;

      const existing = existingList[i];

      items.push({
        title: existing?.title || defaultTitle,
        amount: existing?.amount !== undefined ? existing.amount : (isLast ? remainder : baseAmount),
        dueDate: existing?.dueDate ? (typeof existing.dueDate === 'string' ? existing.dueDate.split('T')[0] : defaultDateStr) : defaultDateStr,
        status: existing?.status || 'pending',
      });
    }
    return items;
  };

  const handleOpenPlanWizard = () => {
    setPlanError('');
    const existingTotal = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const initialTotal = existingTotal > 0 ? String(existingTotal) : '15000';
    const initialCount = payments.length > 0 ? payments.length : 5;
    
    setPlanTotalAmount(initialTotal);
    setPlanInstallmentsCount(initialCount);
    setPlanReplaceExisting(true);
    setPlanInstallments(generateInstallments(initialTotal, initialCount, payments));
    setShowPlanModal(true);
  };

  const handlePlanTotalChange = (newTotal) => {
    setPlanTotalAmount(newTotal);
    setPlanInstallments(generateInstallments(newTotal, planInstallmentsCount));
  };

  const handlePlanCountChange = (newCount) => {
    const count = Math.max(1, Math.min(24, parseInt(newCount) || 1));
    setPlanInstallmentsCount(count);
    setPlanInstallments(generateInstallments(planTotalAmount, count));
  };

  const handleInstallmentChange = (index, field, value) => {
    setPlanInstallments(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAutoBalanceInstallments = () => {
    const tot = parseFloat(planTotalAmount) || 0;
    const num = planInstallments.length;
    if (num === 0 || tot <= 0) return;
    const baseAmount = Math.floor((tot / num) * 100) / 100;
    const remainder = parseFloat((tot - (baseAmount * (num - 1))).toFixed(2));
    setPlanInstallments(prev => prev.map((inst, i) => ({
      ...inst,
      amount: i === num - 1 ? remainder : baseAmount
    })));
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!activeProject) {
      setPlanError('Se requiere un proyecto asignado para registrar el plan de pagos.');
      return;
    }
    if (!planInstallments || planInstallments.length === 0) {
      setPlanError('Debe haber al menos 1 pago en el plan.');
      return;
    }
    for (let i = 0; i < planInstallments.length; i++) {
      const inst = planInstallments[i];
      if (!inst.dueDate) {
        setPlanError(`Por favor selecciona la fecha para el ${inst.title || `Pago ${i + 1}`}.`);
        return;
      }
      if (inst.amount === '' || isNaN(parseFloat(inst.amount))) {
        setPlanError(`Por favor ingresa un monto válido para el ${inst.title || `Pago ${i + 1}`}.`);
        return;
      }
    }

    setSavingPlan(true);
    setPlanError('');
    try {
      await api.post('/payments/plan', {
        projectId: activeProject.id,
        replaceExisting: planReplaceExisting,
        payments: planInstallments.map(inst => ({
          title: inst.title,
          amount: parseFloat(inst.amount),
          dueDate: inst.dueDate,
          status: inst.status || 'pending',
          description: inst.status === 'completed' ? 'Pagado' : 'Programado'
        }))
      });
      setShowPlanModal(false);
      fetchClient();
    } catch (err) {
      console.error('Error saving payment plan:', err);
      setPlanError(err.response?.data?.error || 'Error al guardar el plan de pagos.');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!activeProject) {
      setPaymentError('Se requiere un proyecto asignado para registrar pagos.');
      return;
    }
    setSavingPayment(true);
    setPaymentError('');
    try {
      if (editingPayment) {
        await api.put(`/payments/${editingPayment.id}`, {
          ...paymentForm,
          amount: parseFloat(paymentForm.amount),
        });
      } else {
        await api.post(`/payments`, {
          ...paymentForm,
          projectId: activeProject.id,
          amount: parseFloat(paymentForm.amount),
        });
      }
      setShowPaymentModal(false);
      fetchClient();
    } catch (err) {
      setPaymentError(err.response?.data?.error || 'Error al guardar el pago.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('¿Estás seguro de eliminar este pago? Se removerá del calendario.')) return;
    try {
      await api.delete(`/payments/${paymentId}`);
      fetchClient();
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('Error al eliminar el pago.');
    }
  };

  const handleQuickStatusChange = async (paymentId, newStatus) => {
    try {
      await api.put(`/payments/${paymentId}`, { status: newStatus });
      fetchClient();
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="bars-loader"><div></div><div></div><div></div></div>
      </div>
    </Layout>
  );

  if (!client) return (
    <Layout>
      <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ color: '#111827' }}>Cliente no encontrado</h3>
        <Link to="/admin/clients"><button className="btn-secondary" style={{ marginTop: '16px' }}>Regresar</button></Link>
      </div>
    </Layout>
  );

  return (
    <Layout fullWidth={true} customBreadcrumbLabel={client.companyName || client.name}>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div className="admin-detail-header">
          <div className="admin-detail-header-info">
            <Link to="/admin/clients" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
                <ArrowLeft size={18} />
              </button>
            </Link>
            {client.logoUrl ? (
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', border: 'none', background: 'transparent', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={client.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, flexShrink: 0 }}>
                {(client.companyName || client.name).charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: '#111827', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {client.companyName || client.name}
              </h1>
              {client.companyName && client.companyName !== client.name && (
                <p style={{ color: '#4B5563', fontSize: '15px', margin: '0 0 2px', fontWeight: 500 }}>
                  {client.name}
                </p>
              )}
              <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
                Gestión de cuenta y proyecto activo
                {client.invitationAccepted && client.activatedAt && (
                  <span style={{ marginLeft: '8px', color: '#9CA3AF' }}>
                    (Activado: {new Date(client.activatedAt).toLocaleDateString()})
                  </span>
                )}
              </p>
              {client.loginCount !== undefined && (
                <p style={{ color: '#4B5563', fontSize: '13px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: client.lastLoginAt && new Date() - new Date(client.lastLoginAt) < 7*24*60*60*1000 ? '#10B981' : '#9CA3AF' }}></span>
                  <strong>{client.loginCount}</strong> {client.loginCount === 1 ? 'visita' : 'visitas'}
                  {client.lastLoginAt && (
                    <span style={{ color: '#9CA3AF' }}>
                      • Último acceso: {new Date(client.lastLoginAt).toLocaleDateString()} a las {new Date(client.lastLoginAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {client.loginEvents?.[0]?.deviceType ? ` (${client.loginEvents[0].deviceType})` : ''}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="admin-detail-header-actions">
            {(() => {
              if (client.active === false) {
                return <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#FFEDD5', color: '#C2410C', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Suspendido</span>;
              }
              if (client.invitationAccepted) {
                return <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#D1FAE5', color: '#065F46', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Activo</span>;
              }
              const isExpired = client.invitationExpires && new Date(client.invitationExpires) < new Date();
              if (isExpired) {
                return <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Invitación Vencida</span>;
              }
              return <span style={{ padding: '6px 12px', borderRadius: '6px', background: '#FEF3C7', color: '#92400E', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>Invitación Enviada</span>;
            })()}
            <button
              type="button"
              onClick={handleImpersonate}
              disabled={impersonating}
              title="Entrar al portal y verificar cómo lo ve este cliente"
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0284C7',
                borderColor: '#BAE6FD',
                background: '#F0F9FF',
                cursor: impersonating ? 'not-allowed' : 'pointer',
                borderRadius: '8px'
              }}
            >
              <Eye size={16} /> Ver portal como este cliente
            </button>
          </div>
        </div>

        <div className="admin-detail-grid-3">

          {/* Client Details Form */}
          <div className="card responsive-card-p" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="#6B7280" /> Datos del Cliente
            </h3>
            <form onSubmit={handleUpdateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre Empresa</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" className="hx-input" style={{ paddingLeft: '40px' }}
                    value={clientData.companyName} onChange={e => setClientData({...clientData, companyName: e.target.value})} placeholder="HummingX BI" disabled={!isEditingClient} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Foto de Perfil / Logo (Cloudinary)</label>
                {isEditingClient ? (
                  <div style={{ position: 'relative', border: '1px dashed #D1D5DB', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#F9FAFB', cursor: 'pointer' }}>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} disabled={uploadingLogo} />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {uploadingLogo ? 'Subiendo imagen...' : 'Arrastra un archivo .PNG o .JPG aquí'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {clientData.logoUrl ? (
                      <img src={clientData.logoUrl} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'contain', background: 'transparent', border: 'none', padding: 0 }} />
                    ) : (
                      <span style={{ fontSize: '13px', color: '#6B7280' }}>Sin logo</span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre Representante</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" className="hx-input" style={{ paddingLeft: '40px' }}
                    value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} required disabled={!isEditingClient} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="email" className="hx-input" style={{ paddingLeft: '40px' }} value={clientData.email} disabled />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Teléfono WhatsApp</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input type="text" className="hx-input" style={{ paddingLeft: '40px' }}
                    value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} placeholder="+52 55..." disabled={!isEditingClient} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                {isEditingClient ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn-primary" disabled={savingClient || uploadingLogo} style={{ padding: '8px 16px', fontSize: '13px' }}>
                      <Save size={16} /> {savingClient ? 'Guardando...' : 'Guardar Datos'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setIsEditingClient(false)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button type="button" className="btn-secondary" onClick={() => setIsEditingClient(true)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Editar Datos
                  </button>
                )}
                {clientMsg && <span style={{ fontSize: '13px', color: '#059669', fontWeight: 500 }}>{clientMsg}</span>}
              </div>
            </form>
          </div>

          {/* Project Control */}
          <div className="card responsive-card-p" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#6B7280" /> Control de Proyecto
            </h3>

              {!activeProject ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <FolderOpen size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>No tiene proyecto activo.</p>
                  <button onClick={() => setShowProjectModal(true)} className="btn-secondary">Asignar Proyecto</button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {activeProject.designStatus === 'approved' && activeProject.currentPhase < 4 && (
                      <div style={{ padding: '16px', background: '#D1FAE5', border: '1px solid #34D399', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065F46', fontSize: '14px', fontWeight: 600 }}>
                          <CheckCircle2 size={18} color="#059669" /> El cliente ha aprobado el diseño.
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                          El siguiente paso es cambiar la Fase del Proyecto a <strong>Desarrollo</strong> en el formulario de abajo y guardar los cambios.
                        </p>
                      </div>
                    )}
                    
                    {activeProject.designStatus === 'modifications_requested' && (
                      <div style={{ padding: '16px', background: '#FEF3C7', border: '1px solid #FBBF24', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontSize: '14px', fontWeight: 600 }}>
                          <Clock size={18} color="#D97706" /> El cliente solicitó modificaciones.
                        </div>
                        <button type="button" onClick={async () => {
                          if (window.confirm('¿Estás seguro de que quieres marcar las modificaciones como resueltas? Se enviará un correo automáticamente al cliente para notificarle.')) {
                            await api.put(`/admin/projects/${activeProject.id}`, { designStatus: 'modifications_resolved' });
                            fetchClient();
                            alert('Estado actualizado. El cliente ha sido notificado.');
                          }
                        }} style={{ background: '#D97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                          Marcar como resuelto (Enviar correo)
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre del Proyecto</label>
                      <input type="text" className="hx-input" value={projectData.name} onChange={e => setProjectData({...projectData, name: e.target.value})} required />
                    </div>

                    <div className="admin-form-row-2">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Avance (%)</label>
                        <input type="number" min="0" max="100" className="hx-input" value={projectData.progressPercent} onChange={e => setProjectData({...projectData, progressPercent: parseInt(e.target.value)})} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Entrega Estimada</label>
                        <div style={{ position: 'relative' }}>
                          <Calendar size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                          <input type="date" className="hx-input" style={{ paddingLeft: '40px' }} value={projectData.estimatedDelivery} onChange={e => setProjectData({...projectData, estimatedDelivery: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div className="admin-form-row-2">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Enlace Cotización (Drive)</label>
                        <input type="url" className="hx-input" placeholder="https://docs.google.com/..." value={projectData.quoteLink || ''} onChange={e => setProjectData({...projectData, quoteLink: e.target.value})} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Enlace Contrato (Drive)</label>
                        <input type="url" className="hx-input" placeholder="https://docs.google.com/..." value={projectData.contractLink || ''} onChange={e => setProjectData({...projectData, contractLink: e.target.value})} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Enlace de Revisión (Netlify / Vercel)</label>
                      <input type="url" className="hx-input" placeholder="https://mi-proyecto.netlify.app" value={projectData.previewUrl || ''} onChange={e => setProjectData({...projectData, previewUrl: e.target.value})} />
                    </div>
                    {/* Phase Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Fase Actual</label>
                      <div className="admin-phase-grid">
                        {PHASES.map(phase => (
                          <button
                            type="button"
                            key={phase.num}
                            onClick={() => {
                              const progressMap = { 1: 10, 2: 30, 3: 50, 4: 80, 5: 90, 6: 100 };
                              setProjectData({...projectData, currentPhase: phase.num, progressPercent: progressMap[phase.num]});
                            }}
                            style={{
                              padding: '10px', borderRadius: '8px',
                              border: `1px solid ${projectData.currentPhase === phase.num ? '#1D4ED8' : '#E5E7EB'}`,
                              background: projectData.currentPhase === phase.num ? '#DBEAFE' : '#FFFFFF',
                              color: projectData.currentPhase === phase.num ? '#1D4ED8' : '#6B7280',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                              cursor: 'pointer', transition: 'all 0.15s', fontSize: '11px', fontWeight: 600
                            }}
                          >
                            <phase.icon size={16} />
                            {phase.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                      {projectMsg && (
                        <div style={{
                          padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                          background: projectMsg.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                          color: projectMsg.type === 'error' ? '#DC2626' : '#166534',
                          border: `1px solid ${projectMsg.type === 'error' ? '#FECACA' : '#BBF7D0'}`
                        }}>
                          {projectMsg.text}
                        </div>
                      )}

                      {isProjectDirty && (
                        <div style={{
                          padding: '12px 14px',
                          background: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: '#991B1B',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                          <span>Modificaste datos del proyecto. Haz clic en <strong>"Guardar Cambios Pendientes"</strong> para aplicarlos.</span>
                        </div>
                      )}

                      <div>
                        <button 
                          type="submit" 
                          disabled={savingProject} 
                          style={{ 
                            padding: '11px 22px',
                            fontSize: '13.5px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: 'none',
                            color: '#FFFFFF',
                            background: isProjectDirty 
                              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' 
                              : '#00C4CC',
                            boxShadow: isProjectDirty 
                              ? '0 4px 14px rgba(239, 68, 68, 0.45)' 
                              : '0 4px 14px rgba(0, 196, 204, 0.25)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Save size={16} /> 
                          {savingProject 
                            ? 'Actualizando...' 
                            : isProjectDirty 
                              ? '● Guardar Cambios Pendientes' 
                              : 'Actualizar Proyecto'}
                        </button>
                      </div>
                    </div>
                  </form>


                </>
              )}
            </div>

          {/* Referrals & Credits Control */}
          <div className="card responsive-card-p" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#6B7280" /> Desempeño y Referidos
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Créditos Actuales</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>${client.totalCredits?.toLocaleString() || 0}</span>
              </div>
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Referidos</span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{client.referralsMade?.length || 0}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 12px' }}>Ajustar Saldo (Créditos)</h4>
            <form onSubmit={handleAdjustCredits} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input type="number" className="hx-input" placeholder="Monto (ej. 500 o -500)" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} style={{ flex: 1 }} required />
              <button type="submit" className="btn-secondary" style={{ padding: '0 16px' }} disabled={adjustingCredits}>
                {adjustingCredits ? '...' : 'Aplicar'}
              </button>
            </form>

            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 12px' }}>Lista de Referidos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!client.referralsMade || client.referralsMade.length === 0) ? (
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>No ha recomendado a nadie aún.</p>
              ) : (
                client.referralsMade.map(ref => (
                  <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#111827', display: 'block' }}>{ref.companyName}</span>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{ref.contactName || 'Sin contacto'}</span>
                    </div>
                    <select 
                      className="hx-input" 
                      style={{ padding: '4px 8px', fontSize: '11px', height: 'auto', width: 'auto' }}
                      value={ref.status}
                      onChange={(e) => handleUpdateReferral(ref.id, e.target.value)}
                    >
                      <option value="registered">Registrado</option>
                      <option value="contacted">Contactado</option>
                      <option value="negotiating">En Negociación</option>
                      <option value="converted">Convertido</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Plan de Pagos Card (Full Width) */}
        <div className="card responsive-card-p" style={{ padding: '28px', marginTop: '4px' }}>
          <div className="admin-payments-header">
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} color="#00C4CC" /> Plan de Pagos del Cliente
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                {activeProject ? `Proyecto: ${activeProject.name} — Los cambios se actualizan automáticamente en el calendario.` : 'Registra y administra los abonos programados para este cliente.'}
              </p>
            </div>

            <div className="admin-payments-header-actions">
              <div className="admin-payments-kpis">
                <div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Total Proyecto</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                      payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                    )}
                  </div>
                </div>
                <div style={{ width: '1px', background: '#E5E7EB' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 500 }}>Cobrado</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#059669' }}>
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                      payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                    )}
                  </div>
                </div>
                <div style={{ width: '1px', background: '#E5E7EB' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 500 }}>Por Cobrar</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#D97706' }}>
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                      payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) -
                      payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleOpenPlanWizard} 
                className="btn-primary" 
                style={{ 
                  padding: '9px 16px', 
                  fontSize: '13px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)' 
                }}
                disabled={!activeProject}
              >
                <Sparkles size={16} /> Configurar Plan de Pagos
              </button>

              <button 
                type="button" 
                onClick={handleOpenAddAnnuity} 
                className="btn-secondary" 
                style={{ padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', borderColor: '#059669', background: '#ECFDF5' }}
                disabled={!activeProject}
              >
                <Calendar size={16} /> Configurar Anualidad
              </button>

              <button 
                type="button" 
                onClick={handleOpenAddPayment} 
                className="btn-secondary" 
                style={{ padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                disabled={!activeProject}
              >
                <Plus size={16} /> Pago Individual
              </button>
            </div>
          </div>

          {!activeProject ? (
            <div style={{ padding: '30px', textAlign: 'center', background: '#F9FAFB', borderRadius: '10px', border: '1px dashed #D1D5DB' }}>
              <AlertCircle size={24} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
              <p style={{ color: '#4B5563', fontSize: '14px', margin: '0 0 12px 0' }}>El cliente no tiene un proyecto activo asignado aún.</p>
              <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(true)}>
                Asignar Proyecto Primero
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#F9FAFB', borderRadius: '10px', border: '1px dashed #D1D5DB' }}>
              <Calendar size={28} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
              <p style={{ color: '#374151', fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>No hay abonos ni pagos registrados para este cliente</p>
              <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 16px 0' }}>Configura el plan de pagos completo o agrega abonos individuales para sincronizarlos en el calendario.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleOpenPlanWizard}
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}
                >
                  <Sparkles size={15} /> Configurar Plan de Pagos
                </button>
                <button type="button" className="btn-secondary" onClick={handleOpenAddAnnuity} style={{ color: '#059669', borderColor: '#059669', background: '#ECFDF5' }}>
                  <Calendar size={15} /> Configurar Anualidad
                </button>
                <button type="button" className="btn-secondary" onClick={handleOpenAddPayment}>
                  <Plus size={15} /> Pago Individual
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Concepto / Título</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Fecha Programada</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Monto</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Estado</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '13.5px' }}>
                  {payments.map((p) => {
                    const formattedDate = formatSafeDate(p.dueDate);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{p.title}</div>
                          {p.description && <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{p.description}</div>}
                        </td>
                        <td style={{ padding: '14px', color: '#4B5563', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#6B7280" />
                            {formattedDate}
                          </div>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                          {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(p.amount)}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <select
                            className="hx-input"
                            value={p.status}
                            onChange={(e) => handleQuickStatusChange(p.id, e.target.value)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              height: 'auto',
                              width: 'auto',
                              borderRadius: '6px',
                              border: '1px solid',
                              borderColor: p.status === 'completed' ? '#BBF7D0' : p.status === 'upcoming' ? '#FED7AA' : p.status === 'overdue' ? '#FECACA' : '#E5E7EB',
                              background: p.status === 'completed' ? '#F0FDF4' : p.status === 'upcoming' ? '#FFFBEB' : p.status === 'overdue' ? '#FEF2F2' : '#F9FAFB',
                              color: p.status === 'completed' ? '#15803D' : p.status === 'upcoming' ? '#B45309' : p.status === 'overdue' ? '#B91C1C' : '#374151',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="upcoming">Próximo</option>
                            <option value="completed">Completado</option>
                            <option value="overdue">Vencido</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPayment(p)}
                              title="Editar Pago"
                              style={{
                                background: '#F3F4F6',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                color: '#374151',
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(p.id)}
                              title="Eliminar Pago"
                              style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                color: '#DC2626',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bitácora / Activities for Admin (Horizontal Full Width) */}
        {activeProject && activeProject.activities && activeProject.activities.length > 0 && (
          <div className="card responsive-card-p" style={{ padding: '28px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#6B7280" /> Bitácora Reciente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '16px' }}>
              <div style={{ position: 'absolute', left: '4px', top: '8px', bottom: '8px', width: '2px', background: '#E5E7EB' }} />
              {activeProject.activities.map(act => {
                const dateObj = new Date(act.createdAt);
                const dayStr = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
                const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={act.id} style={{ position: 'relative', padding: '16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', marginLeft: '16px' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '20px', width: '12px', height: '12px', borderRadius: '50%', background: '#1D4ED8', border: '2px solid #fff', boxShadow: '0 0 0 1px #E5E7EB' }} />
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '6px' }}>{act.description}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {dayStr}, {timeStr} hrs.
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="card responsive-card-p" style={{ padding: '28px', marginTop: '32px', border: '1px solid #FECACA' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#DC2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} /> Zona de Peligro
          </h3>
          <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px' }}>
            Acciones críticas que afectan el acceso y los datos de este cliente en el sistema. Ambas opciones requerirán una confirmación de seguridad antes de ejecutarse.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Suspend Action */}
            <div className="admin-danger-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                  {client.active ? 'Suspender Acceso del Cliente' : 'Reactivar Acceso del Cliente'}
                </h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#6B7280', lineHeight: '1.5' }}>
                  {client.active 
                    ? 'Bloquea temporalmente el acceso del cliente a su portal. Útil en caso de impagos, comportamientos sospechosos o por mantenimiento. No elimina ninguno de sus datos ni proyectos.' 
                    : 'Restaura el acceso del cliente a su portal de manera inmediata. El cliente podrá volver a iniciar sesión con sus mismas credenciales.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleSuspend}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: client.active ? '#FFFBEB' : '#ECFDF5',
                  color: client.active ? '#D97706' : '#059669',
                  border: `1px solid ${client.active ? '#FDE68A' : '#A7F3D0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => e.currentTarget.style.background = client.active ? '#FEF3C7' : '#D1FAE5'}
                onMouseLeave={e => e.currentTarget.style.background = client.active ? '#FFFBEB' : '#ECFDF5'}
              >
                {client.active ? <><AlertCircle size={18} /> Suspender Acceso</> : <><CheckCircle2 size={18} /> Reactivar Acceso</>}
              </button>
            </div>

            {/* Delete Action */}
            <div className="admin-danger-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 600, color: '#991B1B' }}>
                  Eliminar Cliente Permanentemente
                </h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#B91C1C', lineHeight: '1.5' }}>
                  Elimina permanentemente la cuenta de este cliente, incluyendo todos sus proyectos, planes de pago, referidos y bitácoras. Esta acción es <strong>absolutamente irreversible</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteThisClient}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#B91C1C'}
                onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
              >
                <Trash2 size={18} /> Eliminar Cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showProjectModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowProjectModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>Asignar Nuevo Proyecto</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre del Proyecto *</label>
                <input type="text" className="hx-input" required value={newProjectData.name} onChange={e => setNewProjectData({...newProjectData, name: e.target.value})} placeholder="Ej. Implementación PowerBI" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Descripción</label>
                <textarea className="hx-input" value={newProjectData.description} onChange={e => setNewProjectData({...newProjectData, description: e.target.value})} placeholder="Dashboard financiero interactivo..." />
              </div>
              {projectErrorMsg && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>{projectErrorMsg}</div>
              )}
              <button type="submit" className="btn-primary" disabled={creatingProject}>
                {creatingProject ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Payment Create / Edit Modal */}
      {showPaymentModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <button 
              onClick={() => setShowPaymentModal(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>
              {editingPayment ? 'Editar Pago Programado' : 'Registrar Nuevo Pago'}
            </h2>
            <form onSubmit={handleSavePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Concepto / Título *</label>
                <input 
                  type="text" 
                  className="hx-input" 
                  required 
                  placeholder="Ej. Anticipo 50% o Finiquito" 
                  value={paymentForm.title} 
                  onChange={e => setPaymentForm({...paymentForm, title: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Monto (MXN) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    className="hx-input" 
                    required 
                    placeholder="2500" 
                    value={paymentForm.amount} 
                    onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Fecha Programada *</label>
                  <input 
                    type="date" 
                    className="hx-input" 
                    required 
                    value={paymentForm.dueDate} 
                    onChange={e => setPaymentForm({...paymentForm, dueDate: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Estado del Pago</label>
                <select 
                  className="hx-input" 
                  value={paymentForm.status} 
                  onChange={e => setPaymentForm({...paymentForm, status: e.target.value})}
                >
                  <option value="pending">Pendiente</option>
                  <option value="upcoming">Próximo</option>
                  <option value="completed">Completado</option>
                  <option value="overdue">Vencido</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Descripción o Notas (Opcional)</label>
                <textarea 
                  className="hx-input" 
                  rows={2} 
                  placeholder="Detalles sobre entregables o método de pago..." 
                  value={paymentForm.description} 
                  onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} 
                />
              </div>

              {paymentError && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>
                  {paymentError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={savingPayment}>
                  {savingPayment ? 'Guardando...' : editingPayment ? 'Actualizar Pago' : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Plan Wizard Modal */}
      {showPlanModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setShowPlanModal(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                <Sparkles size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Configurar Plan de Pagos
                </h2>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
                  {activeProject ? activeProject.name : client?.name} — Divide el monto total en las cuotas deseadas y programa sus fechas.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px', marginTop: '10px' }}>
              {/* Parameters Row */}
              <div className="admin-plan-params-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Monto Total del Proyecto (MXN) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontWeight: 600, fontSize: '14px' }}>$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="1" 
                      className="hx-input" 
                      required 
                      placeholder="15000" 
                      value={planTotalAmount} 
                      onChange={e => handlePlanTotalChange(e.target.value)} 
                      style={{ paddingLeft: '28px', fontWeight: 700, fontSize: '15px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                      ¿En cuántos pagos se divide? *
                    </label>
                    <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                      {planInstallmentsCount} {planInstallmentsCount === 1 ? 'pago' : 'pagos'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max="24" 
                      className="hx-input" 
                      required 
                      value={planInstallmentsCount} 
                      onChange={e => handlePlanCountChange(e.target.value)} 
                      style={{ width: '70px', textAlign: 'center', fontWeight: 700 }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      {[2, 3, 4, 5].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => handlePlanCountChange(cnt)}
                          style={{
                            flex: 1,
                            padding: '6px 2px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: planInstallmentsCount === cnt ? '1px solid #2563EB' : '1px solid #E5E7EB',
                            background: planInstallmentsCount === cnt ? '#EFF6FF' : '#fff',
                            color: planInstallmentsCount === cnt ? '#1D4ED8' : '#4B5563',
                            cursor: 'pointer',
                          }}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Installments Table / List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Cuotas Programadas ({planInstallments.length})
                  </span>
                  <button 
                    type="button" 
                    onClick={handleAutoBalanceInstallments}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    ↺ Dividir partes iguales
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '270px', overflowY: 'auto', paddingRight: '4px' }}>
                  {planInstallments.map((inst, idx) => {
                    const isCompleted = inst.status === 'completed';
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '28px 1.4fr 1.1fr 1.2fr 105px', 
                          gap: '8px', 
                          alignItems: 'center',
                          padding: '10px 12px',
                          background: isCompleted ? '#F0FDF4' : '#FFFFFF',
                          border: isCompleted ? '1px solid #BBF7D0' : '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ 
                          width: '26px', height: '26px', borderRadius: '50%', 
                          background: isCompleted ? '#16A34A' : '#EFF6FF', 
                          color: isCompleted ? '#fff' : '#2563EB', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontSize: '12px', fontWeight: 700 
                        }}>
                          {isCompleted ? <Check size={14} /> : idx + 1}
                        </div>

                        <div>
                          <input 
                            type="text" 
                            className="hx-input" 
                            required 
                            placeholder={`Pago ${idx + 1}`}
                            value={inst.title} 
                            onChange={e => handleInstallmentChange(idx, 'title', e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '12.5px' }}
                          />
                        </div>

                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '12px' }}>$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            className="hx-input" 
                            required 
                            placeholder="Monto"
                            value={inst.amount} 
                            onChange={e => handleInstallmentChange(idx, 'amount', e.target.value)}
                            style={{ padding: '6px 8px 6px 18px', fontSize: '12.5px', fontWeight: 600 }}
                          />
                        </div>

                        <div>
                          <input 
                            type="date" 
                            className="hx-input" 
                            required 
                            value={inst.dueDate} 
                            onChange={e => handleInstallmentChange(idx, 'dueDate', e.target.value)}
                            style={{ padding: '6px 8px', fontSize: '12px' }}
                          />
                        </div>

                        <div>
                          <select
                            className="hx-input"
                            value={inst.status || 'pending'}
                            onChange={e => handleInstallmentChange(idx, 'status', e.target.value)}
                            style={{ 
                              padding: '6px 6px', 
                              fontSize: '11.5px', 
                              fontWeight: 600,
                              background: isCompleted ? '#DCFCE7' : '#F9FAFB',
                              color: isCompleted ? '#15803D' : '#374151'
                            }}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="completed">Pagado</option>
                            <option value="upcoming">Próximo</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Balance Summary & Options */}
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    Suma cuotas: <strong style={{ color: '#0F172A' }}>
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
                        planInstallments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
                      )}
                    </strong>
                    {' '} de <strong style={{ color: '#0F172A' }}>
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(planTotalAmount) || 0)}
                    </strong>
                  </div>

                  {(() => {
                    const sum = planInstallments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
                    const tot = parseFloat(planTotalAmount) || 0;
                    const diff = Math.abs(sum - tot);
                    if (diff < 0.01) {
                      return (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> 100% distribuido
                        </span>
                      );
                    }
                    return (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#B45309', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
                        Diferencia: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(sum - tot)}
                      </span>
                    );
                  })()}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={planReplaceExisting} 
                    onChange={e => setPlanReplaceExisting(e.target.checked)} 
                    style={{ accentColor: '#2563EB', width: '15px', height: '15px' }}
                  />
                  <span>Reemplazar pagos anteriores de este proyecto (recomendado)</span>
                </label>
              </div>

              {planError && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>
                  {planError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPlanModal(false)}>
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={savingPlan} 
                  style={{ 
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)' 
                  }}
                >
                  {savingPlan ? 'Guardando Plan...' : 'Crear y Guardar Plan de Pagos'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Floating Sticky Reminder if project has unsaved changes */}
      {isProjectDirty && (
        <div className="admin-floating-dirty-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 8px #EF4444' }}></span>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              Tienes cambios sin guardar en el proyecto
            </span>
          </div>
          <button
            type="button"
            onClick={handleUpdateProject}
            disabled={savingProject}
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)'
            }}
          >
            <Save size={14} /> {savingProject ? 'Guardando...' : 'Guardar ahora'}
          </button>
        </div>
      )}
    </Layout>
  );
}
