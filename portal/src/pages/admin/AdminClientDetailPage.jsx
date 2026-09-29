import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  ArrowLeft, User, Mail, Phone, Building, Save, FolderOpen, AlertCircle,
  ClipboardList, Paintbrush, Code2, Search, Rocket, CheckCircle, Activity,
  Plus, Trash2, Calendar, X, Users, DollarSign
} from 'lucide-react';

const PHASES = [
  { num: 1, label: 'Análisis', icon: ClipboardList },
  { num: 2, label: 'Diseño', icon: Paintbrush },
  { num: 3, label: 'Revisión', icon: Search },
  { num: 4, label: 'Desarrollo', icon: Code2 },
  { num: 5, label: 'Lanzamiento', icon: Rocket },
  { num: 6, label: 'Activo', icon: CheckCircle },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState({});
  const [savingClient, setSavingClient] = useState(false);
  const [clientMsg, setClientMsg] = useState('');
  const [activeProject, setActiveProject] = useState(null);
  const [projectData, setProjectData] = useState({});
  const [savingProject, setSavingProject] = useState(false);
  const [projectMsg, setProjectMsg] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectErrorMsg, setProjectErrorMsg] = useState('');
  
  // Referrals and Credits
  const [creditAmount, setCreditAmount] = useState('');
  const [adjustingCredits, setAdjustingCredits] = useState(false);

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
        const proj = res.data.projects?.find(p => p.status === 'active');
        if (proj) {
          setActiveProject(proj);
          setProjectData({ 
            name: proj.name, 
            description: proj.description || '', 
            currentPhase: proj.currentPhase, 
            progressPercent: proj.progressPercent, 
            estimatedDelivery: proj.estimatedDelivery ? proj.estimatedDelivery.split('T')[0] : '',
            quoteLink: proj.quoteLink || '',
            contractLink: proj.contractLink || '',
            previewUrl: proj.previewUrl || ''
          });
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
      setTimeout(() => setProjectMsg(null), 3000);
      fetchClient();
    } catch { 
      setProjectMsg({ type: 'error', text: 'Error al actualizar el proyecto.' }); 
    }
    finally { setSavingProject(false); }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/admin/clients" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          {client.logoUrl ? (
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={client.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700 }}>
              {(client.companyName || client.name).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
              {client.companyName || client.name}
            </h1>
            {client.companyName && client.companyName !== client.name && (
              <p style={{ color: '#4B5563', fontSize: '15px', margin: '0 0 2px', fontWeight: 500 }}>
                {client.name}
              </p>
            )}
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Gestión de cuenta y proyecto activo</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' }}>

          {/* Client Details Form */}
          <div className="card" style={{ padding: '28px' }}>
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
                      <img src={clientData.logoUrl} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain', background: '#fff', border: '1px solid #E5E7EB', padding: '2px' }} />
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
          <div className="card" style={{ padding: '28px' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre del Proyecto</label>
                      <input type="text" className="hx-input" value={projectData.name} onChange={e => setProjectData({...projectData, name: e.target.value})} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
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
                      <div>
                        <button type="submit" className="btn-primary" disabled={savingProject} style={{ padding: '10px 20px' }}>
                          <Save size={16} /> {savingProject ? 'Actualizando...' : 'Actualizar Proyecto'}
                        </button>
                      </div>
                    </div>
                  </form>


                </>
              )}
            </div>

          {/* Referrals & Credits Control */}
          <div className="card" style={{ padding: '28px' }}>
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

        {/* Bitácora / Activities for Admin (Horizontal Full Width) */}
        {activeProject && activeProject.activities && activeProject.activities.length > 0 && (
          <div className="card" style={{ padding: '28px', marginTop: '8px' }}>
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
      </div>

      {/* New Project Modal */}
      {showProjectModal && (
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
        </div>
      )}
    </Layout>
  );
}
