// portal/src/pages/admin/client-detail/useClientDetail.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import { useToast } from '../../../lib/useToast';
import { useAuth } from '../../../context/AuthContext';

export { parseSafeLocalDate, formatSafeDate } from './dateUtils';
import { uploadLogoToCloudinary } from './uploadUtils';
import { normalizeProject } from './projectUtils';

export function useClientDetail(id) {
  const navigate = useNavigate();
  const toast = useToast();
  const { impersonate } = useAuth();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client profile form state
  const [clientData, setClientData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    logoUrl: '',
    level: 1,
  });
  const [savingClient, setSavingClient] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Active Project & form state
  const [activeProject, setActiveProject] = useState(null);
  const [projectData, setProjectData] = useState({});
  const [initialProjectData, setInitialProjectData] = useState(null);
  const [savingProject, setSavingProject] = useState(false);

  // Modals & sub-state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });
  const [creatingProject, setCreatingProject] = useState(false);
  const [newActivity, setNewActivity] = useState('');
  const [activityType, setActivityType] = useState('update');
  const [addingActivity, setAddingActivity] = useState(false);
  const [payments, setPayments] = useState([]);
  const [adjustingCredits, setAdjustingCredits] = useState(false);
  const [showAdjustCreditsModal, setShowAdjustCreditsModal] = useState(false);
  const [creditAdjustmentForm, setCreditAdjustmentForm] = useState({ amount: '', reason: '', type: 'credit_adjustment' });
  const [submittingReward, setSubmittingReward] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  // Fetch client details
  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/clients/${id}`);
      const data = res.data;
      setClient(data);
      setClientData({
        name: data.name || '',
        companyName: data.companyName || '',
        email: data.email || '',
        phone: data.phone || '',
        logoUrl: data.logoUrl || '',
        level: data.level || 1,
      });

      const proj = data.projects?.find(p => p.status === 'active') || data.projects?.[0] || null;
      if (proj) {
        setActiveProject(proj);
        setPayments(proj.payments || []);
        const pData = normalizeProject(proj);
        setProjectData(pData);
        setInitialProjectData(pData);
      } else {
        setActiveProject(null);
        setPayments([]);
        setInitialProjectData(null);
      }
    } catch (err) {
      console.error('[ADMIN] Error fetching client:', err);
      setError('Cliente no encontrado o error al cargar sus datos.');
      toast.error('Error al cargar la información del cliente.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  // Dirty state tracking for project
  const isProjectDirty = useMemo(() => {
    if (!initialProjectData || !projectData) return false;
    return JSON.stringify(projectData) !== JSON.stringify(initialProjectData);
  }, [projectData, initialProjectData]);

  const resetProjectForm = () => {
    if (initialProjectData) {
      setProjectData({ ...initialProjectData });
    }
  };

  // Actions
  const handleUpdateClient = async (overrides = {}) => {
    setSavingClient(true);
    try {
      const payload = { ...clientData, ...overrides };
      const res = await api.put(`/admin/clients/${id}`, payload);
      setClient(prev => ({ ...prev, ...res.data }));
      toast.success('Perfil del cliente actualizado correctamente.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar cliente.');
      return false;
    } finally {
      setSavingClient(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!client) return;
    try {
      await api.put(`/admin/clients/${id}/suspend`, { active: !client.active });
      setClient(prev => ({ ...prev, active: !prev.active }));
      toast.success(client.active ? 'Cliente suspendido.' : 'Cliente reactivado.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar estado.');
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    try {
      await api.delete(`/admin/clients/${id}`);
      toast.success('Cliente eliminado correctamente.');
      navigate('/admin/clientes');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar cliente.');
    }
  };

  const handleResendInvitation = async () => {
    if (!client) return;
    try {
      const res = await api.post(`/admin/clients/${id}/resend-invitation`);
      toast.success(res.data.message || 'Invitación procesada.');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al reenviar invitación.');
    }
  };

  const handleNotifyPhase = async (phase = null) => {
    if (!activeProject) return;
    try {
      const body = phase !== null ? { phase } : {};
      const res = await api.post(`/admin/projects/${activeProject.id}/notify-phase`, body);
      toast.success(res.data.message || 'Notificación de fase enviada.');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al enviar notificación de fase.');
    }
  };

  const handleUpdateProject = async () => {
    if (!activeProject) return;
    setSavingProject(true);
    try {
      const res = await api.put(`/admin/projects/${activeProject.id}`, projectData);
      setActiveProject(res.data);
      const updatedForm = normalizeProject(res.data);
      setProjectData(updatedForm);
      setInitialProjectData(updatedForm);
      toast.success('Cambios del proyecto guardados exitosamente.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar cambios del proyecto.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) {
      toast.error('El nombre del proyecto es obligatorio.');
      return;
    }
    setCreatingProject(true);
    try {
      const res = await api.post('/admin/projects', {
        clientId: id,
        name: newProjectData.name,
        description: newProjectData.description,
        currentPhase: 1,
        progressPercent: 10,
      });
      toast.success('Nuevo proyecto creado.');
      setShowNewProjectModal(false);
      setNewProjectData({ name: '', description: '' });
      await fetchClient();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear proyecto.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim() || !activeProject) return;
    setAddingActivity(true);
    try {
      await api.post(`/admin/projects/${activeProject.id}/activities`, {
        description: newActivity.trim(),
        type: activityType,
      });
      setNewActivity('');
      toast.success('Actividad registrada en la bitácora.');
      await fetchClient();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar actividad.');
    } finally {
      setAddingActivity(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!activeProject) return;
    try {
      await api.delete(`/admin/projects/${activeProject.id}/activities/${activityId}`);
      toast.success('Actividad eliminada.');
      await fetchClient();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar actividad.');
    }
  };

  const handleImpersonate = async () => {
    if (!client) return;
    setImpersonating(true);
    try {
      await impersonate(client.id);
      navigate('/client/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión como cliente.');
    } finally {
      setImpersonating(false);
    }
  };

  const handleAdjustCredits = async () => {
    const val = parseInt(creditAdjustmentForm.amount, 10);
    if (isNaN(val) || val === 0) {
      toast.error('Ingresa un monto numérico distinto de 0.');
      return;
    }
    if (!creditAdjustmentForm.reason.trim()) {
      toast.error('Indica el motivo del ajuste.');
      return;
    }
    setAdjustingCredits(true);
    try {
      await api.post(`/admin/clients/${id}/credit-movements`, {
        amount: val,
        description: creditAdjustmentForm.reason.trim(),
        type: creditAdjustmentForm.type || 'credit_adjustment',
      });
      toast.success(`Ajuste de $${val.toLocaleString('es-MX')} créditos registrado.`);
      setShowAdjustCreditsModal(false);
      setCreditAdjustmentForm({ amount: '', reason: '', type: 'credit_adjustment' });
      await fetchClient();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al ajustar créditos.');
    } finally {
      setAdjustingCredits(false);
    }
  };

  const handleAwardReward = async (referralId, amount) => {
    setSubmittingReward(true);
    try {
      await api.post(`/admin/referrals/${referralId}/award-credits`, { amount });
      toast.success(`Se abonaron $${amount.toLocaleString('es-MX')} Créditos HX al cliente.`);
      setRewardModalData(null);
      await fetchClient();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al abonar recompensa.');
    } finally {
      setSubmittingReward(false);
    }
  };

  // Payment quick status change
  const handleQuickStatusChange = async (paymentId, newStatus) => {
    try {
      const res = await api.put(`/payments/${paymentId}`, { status: newStatus });
      setPayments(prev => prev.map(p => p.id === paymentId ? res.data : p));
      toast.success(`Estado actualizado a ${newStatus}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar pago.');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await api.delete(`/payments/${paymentId}`);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      toast.success('Pago eliminado.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al eliminar pago.');
    }
  };



  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadLogoToCloudinary(file);
      if (url) {
        await handleUpdateClient({ logoUrl: url });
        toast.success('Logo actualizado en la nube.');
      } else {
        toast.error('Error al subir el logo.');
      }
    } catch {
      toast.error('Error de red al subir logotipo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  return {
    id,
    client,
    loading,
    error,
    fetchClient,
    // Client profile
    clientData,
    setClientData,
    savingClient,
    uploadingLogo,
    handleUpdateClient,
    handleToggleSuspend,
    handleDeleteClient,
    handleResendInvitation,
    handleLogoUpload,
    // Project
    activeProject,
    projectData,
    setProjectData,
    isProjectDirty,
    savingProject,
    handleUpdateProject,
    resetProjectForm,
    handleNotifyPhase,
    showNewProjectModal,
    setShowNewProjectModal,
    newProjectData,
    setNewProjectData,
    creatingProject,
    handleCreateProject,
    // Bitácora
    newActivity,
    setNewActivity,
    activityType,
    setActivityType,
    addingActivity,
    handleAddActivity,
    handleDeleteActivity,
    // Impersonate
    impersonating,
    handleImpersonate,
    // Credits
    adjustingCredits,
    showAdjustCreditsModal,
    setShowAdjustCreditsModal,
    creditAdjustmentForm,
    setCreditAdjustmentForm,
    handleAdjustCredits,
    submittingReward,
    handleAwardReward,
    // Payments
    payments,
    handleDeletePayment,
    handleQuickStatusChange,
  };
}
