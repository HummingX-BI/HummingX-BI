import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { 
  ArrowLeft, User, Mail, Phone, Building, Save, FolderOpen, AlertCircle,
  ClipboardList, Paintbrush, Code2, Search, Rocket, CheckCircle, Activity,
  Plus, Trash2, Calendar, X
} from 'lucide-react';

const PHASES = [
  { num: 1, label: 'Análisis', icon: ClipboardList },
  { num: 2, label: 'Diseño', icon: Paintbrush },
  { num: 3, label: 'Desarrollo', icon: Code2 },
  { num: 4, label: 'Revisión', icon: Search },
  { num: 5, label: 'Lanzamiento', icon: Rocket },
  { num: 6, label: 'Activo', icon: CheckCircle },
];

export default function AdminClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Client Info State
  const [clientData, setClientData] = useState({});
  const [savingClient, setSavingClient] = useState(false);
  const [clientMsg, setClientMsg] = useState('');

  // Active Project State
  const [activeProject, setActiveProject] = useState(null);
  const [projectData, setProjectData] = useState({});
  const [savingProject, setSavingProject] = useState(false);
  const [projectMsg, setProjectMsg] = useState('');
  
  // New Activity State
  const [newActivity, setNewActivity] = useState('');
  const [addingActivity, setAddingActivity] = useState(false);

  // New Project State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '' });
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectErrorMsg, setProjectErrorMsg] = useState('');

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = () => {
    setLoading(true);
    api.get(`/admin/clients/${id}`)
      .then(res => {
        setClient(res.data);
        setClientData({
          name: res.data.name,
          companyName: res.data.companyName || '',
          email: res.data.email,
          phone: res.data.phone || '',
        });
        const proj = res.data.projects?.find(p => p.status === 'active');
        if (proj) {
          setActiveProject(proj);
          setProjectData({
            name: proj.name,
            description: proj.description || '',
            currentPhase: proj.currentPhase,
            progressPercent: proj.progressPercent,
            estimatedDelivery: proj.estimatedDelivery ? proj.estimatedDelivery.split('T')[0] : '',
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
      setTimeout(() => setClientMsg(''), 3000);
      fetchClient();
    } catch (err) {
      console.error(err);
      setClientMsg('Error al guardar datos.');
    } finally {
      setSavingClient(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    setSavingProject(true);
    try {
      const dataToSubmit = { ...projectData };
      if (!dataToSubmit.estimatedDelivery) {
        dataToSubmit.estimatedDelivery = null; // Fix empty date handling
      } else {
        dataToSubmit.estimatedDelivery = new Date(dataToSubmit.estimatedDelivery).toISOString();
      }

      await api.put(`/admin/projects/${activeProject.id}`, dataToSubmit);
      setProjectMsg('Proyecto actualizado correctamente.');
      setTimeout(() => setProjectMsg(''), 3000);
      fetchClient();
    } catch (err) {
      console.error(err);
      setProjectMsg('Error al actualizar el proyecto.');
    } finally {
      setSavingProject(false);
    }
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
    } catch (err) {
      console.error(err);
      setProjectErrorMsg(err.response?.data?.error || 'Error al crear el proyecto.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim() || !activeProject) return;
    setAddingActivity(true);
    try {
      await api.post(`/admin/projects/${activeProject.id}/activities`, { description: newActivity });
      setNewActivity('');
      fetchClient();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingActivity(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!activeProject || !confirm('¿Eliminar esta actividad?')) return;
    try {
      await api.delete(`/admin/projects/${activeProject.id}/activities/${activityId}`);
      fetchClient();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="bars-loader">
          <div></div><div></div><div></div>
        </div>
      </div>
    </Layout>
  );

  if (!client) return (
    <Layout>
      <div className="midnight-card" style={{ padding: '60px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
        <h3>Cliente no encontrado</h3>
        <Link to="/admin/clients"><button className="btn-secondary" style={{ marginTop: '16px' }}>Regresar</button></Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/admin/clients" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '28px', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Expediente: {client.companyName || client.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Gestión de cuenta y proyecto activo</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* Client Details Form */}
          <div className="midnight-card" style={{ padding: '32px' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#00C4CC" /> Datos del Cliente
            </h3>
            <form onSubmit={handleUpdateClient} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre Empresa</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px' }}
                    value={clientData.companyName} onChange={e => setClientData({...clientData, companyName: e.target.value})} placeholder="HummingX BI" />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre Representante</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px' }}
                    value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} placeholder="Juan Pérez" required />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo Electrónico (No editable)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input type="email" className="hx-input" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                    value={clientData.email} disabled />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono WhatsApp</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px' }}
                    value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} placeholder="+52 55..." />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" disabled={savingClient} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
                  <Save size={16} /> {savingClient ? 'Guardando...' : 'Guardar Datos'}
                </button>
                {clientMsg && <span style={{ fontSize: '13px', color: '#166534', fontWeight: 500 }}>{clientMsg}</span>}
              </div>
            </form>
          </div>

          {/* Active Project Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="midnight-card" style={{ padding: '32px' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#00C4CC" /> Control de Proyecto
              </h3>

              {!activeProject ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <FolderOpen size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '16px' }}>El cliente no tiene un proyecto activo.</p>
                  <button onClick={() => setShowProjectModal(true)} type="button" className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Asignar Proyecto</button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre del Proyecto</label>
                    <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                      value={projectData.name} onChange={e => setProjectData({...projectData, name: e.target.value})} required />
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avance (%)</label>
                      <input type="number" min="0" max="100" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }}
                        value={projectData.progressPercent} onChange={e => setProjectData({...projectData, progressPercent: parseInt(e.target.value)})} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entrega Estimada</label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={16} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                        <input type="date" className="hx-input" style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px' }}
                          value={projectData.estimatedDelivery} onChange={e => setProjectData({...projectData, estimatedDelivery: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fase Actual</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {PHASES.map(phase => (
                        <button
                          type="button"
                          key={phase.num}
                          onClick={() => setProjectData({...projectData, currentPhase: phase.num})}
                          style={{
                            padding: '10px', borderRadius: '8px', border: '1px solid',
                            borderColor: projectData.currentPhase === phase.num ? '#00C4CC' : 'rgba(255,255,255,0.1)',
                            background: projectData.currentPhase === phase.num ? 'rgba(0,196,204,0.1)' : 'rgba(255,255,255,0.02)',
                            color: projectData.currentPhase === phase.num ? '#00C4CC' : 'rgba(255,255,255,0.7)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            cursor: 'pointer', transition: 'all 0.2s', fontSize: '11px', fontWeight: 600
                          }}
                        >
                          <phase.icon size={16} />
                          {phase.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <button type="submit" className="btn-primary" disabled={savingProject} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
                      <Save size={16} /> {savingProject ? 'Actualizando...' : 'Actualizar Proyecto'}
                    </button>
                    {projectMsg && <span style={{ fontSize: '13px', color: '#166534', fontWeight: 500 }}>{projectMsg}</span>}
                  </div>
                </form>
              )}
            </div>

            {/* Activity Logger */}
            {activeProject && (
              <div className="midnight-card" style={{ padding: '32px' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '18px', marginBottom: '24px' }}>
                  Bitácora de Desarrollo
                </h3>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <input type="text" className="hx-input" style={{ flex: 1, padding: '10px 12px', borderRadius: '8px' }}
                    placeholder="Escribir nuevo avance o nota..." 
                    value={newActivity} onChange={e => setNewActivity(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddActivity()}
                  />
                  <button onClick={handleAddActivity} disabled={addingActivity || !newActivity.trim()} className="btn-secondary" style={{ padding: '0 16px', borderRadius: '8px' }}>
                    <Plus size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeProject.activities?.length === 0 && (
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>No hay actividad registrada aún.</p>
                  )}
                  {activeProject.activities?.map((activity) => (
                    <div key={activity.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <div>
                        <p style={{ fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>{activity.description}</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{new Date(activity.createdAt).toLocaleString('es-MX', {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                      <button onClick={() => handleDeleteActivity(activity.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', opacity: 0.7, padding: '4px' }} className="hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* New Project Modal */}
      {showProjectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="midnight-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowProjectModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Asignar Nuevo Proyecto</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Nombre del Proyecto *</label>
                <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }} required 
                  value={newProjectData.name} onChange={e => setNewProjectData({...newProjectData, name: e.target.value})} placeholder="Ej. Implementación PowerBI" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Descripción Corta</label>
                <textarea className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} 
                  value={newProjectData.description} onChange={e => setNewProjectData({...newProjectData, description: e.target.value})} placeholder="Dashboard financiero interactivo..." />
              </div>
              {projectErrorMsg && (
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', borderRadius: '8px', fontSize: '14px' }}>
                  {projectErrorMsg}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={creatingProject} style={{ padding: '12px', marginTop: '8px' }}>
                {creatingProject ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
