import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { SkeletonTableRow } from '../../components/Skeleton';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Building2, ChevronRight, UserPlus, FileText, X, Users, FolderKanban, TrendingUp, CreditCard, Mail, AlertTriangle, CheckCircle2, Trash2, Eye } from 'lucide-react';

export default function AdminClientsPage() {
  const navigate = useNavigate();
  const { impersonate } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [showPendingDesigns, setShowPendingDesigns] = useState(false);
  const [showApprovedDesigns, setShowApprovedDesigns] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', companyName: '', logoUrl: '', phone: '', projectName: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [impersonatingClientId, setImpersonatingClientId] = useState(null);
  const [createdReminder, setCreatedReminder] = useState(null);

  const handleImpersonate = async (clientId) => {
    setImpersonatingClientId(clientId);
    try {
      await impersonate(clientId);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al iniciar sesión como cliente.');
    } finally {
      setImpersonatingClientId(null);
    }
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente "${clientName}" y todos sus proyectos, actividades y pagos? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeletingClientId(clientId);
    try {
      await api.delete(`/admin/clients/${clientId}`);
      setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      alert(err.response?.data?.error || err.response?.data?.details || 'Error al eliminar cliente.');
    } finally {
      setDeletingClientId(null);
    }
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => { setShowModal(false); setClosingModal(false); }, 180);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'hummingx_unsigned');
    formData.append('cloud_name', 'mzqtikab');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/mzqtikab/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setNewClientData({ ...newClientData, logoUrl: data.secure_url });
      }
    } catch (err) {
      console.error('Error uploading to Cloudinary', err);
      alert('Error subiendo imagen a Cloudinary');
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = () => {
    setLoading(true);
    api.get('/admin/clients')
      .then(res => setClients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setSavingClient(true);
    setErrorMsg('');
    try {
      const res = await api.post('/admin/clients', newClientData);
      closeModal();
      setNewClientData({ name: '', email: '', companyName: '', logoUrl: '', phone: '', projectName: '' });
      fetchClients();
      if (res.data?.id) {
        setCreatedReminder({
          id: res.data.id,
          name: res.data.name,
          companyName: res.data.companyName || res.data.name,
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al crear el cliente.');
    } finally { setSavingClient(false); }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalClients = clients.length;
  const activeProjects = clients.reduce((n, c) => n + (c.projects?.filter(p => p.status === 'active').length || 0), 0);

  const totalCreditsEmitted = clients.reduce((sum, client) => sum + (client.creditMovements?.reduce((s, m) => s + (m.amount > 0 ? m.amount : 0), 0) || 0), 0);

  const pendingDesignProjects = clients.flatMap(c => 
    (c.projects || []).filter(p => p.designStatus === 'modifications_requested').map(p => ({
      ...p,
      clientName: c.companyName || c.name,
      clientId: c.id
    }))
  );

  const approvedDesignProjects = clients.flatMap(c => 
    (c.projects || []).filter(p => p.designStatus === 'approved').map(p => ({
      ...p,
      clientName: c.companyName || c.name,
      clientId: c.id
    }))
  );

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', margin: '0 0 4px' }}>
              Dashboard Administrativo
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Gestiona clientes, proyectos y seguimiento desde aquí.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: '10px 20px' }}>
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>

        {/* Post-Creation Admin Reminder Banner */}
        {createdReminder && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 196, 204, 0.08) 0%, rgba(14, 116, 144, 0.05) 100%)',
            border: '1px solid #00C4CC',
            borderRadius: '12px',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0, 196, 204, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #00C4CC 0%, #0E7490 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  ¡Cliente "{createdReminder.companyName}" creado con éxito!
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
                  <strong>Recordatorio para el Admin:</strong> Su proyecto se inició automáticamente en etapa de <strong>Análisis (10%)</strong>. Recuerda configurar su <strong>Plan de Pagos</strong> en su perfil para que en su portal no aparezca "Por definir".
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to={`/admin/clients/${createdReminder.id}`}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Configurar Pagos y Proyecto →
              </Link>
              <button
                onClick={() => setCreatedReminder(null)}
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
                title="Cerrar recordatorio"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 5 KPI Cards */}
        {loading ? (
          <div className="stagger-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="stat-card" style={{ height: '104px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: '100px', height: '16px', background: '#F3F4F6', borderRadius: '4px' }}></div>
                <div style={{ width: '40px', height: '32px', background: '#E5E7EB', borderRadius: '6px' }}></div>
                <div style={{ width: '120px', height: '12px', background: '#F3F4F6', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stagger-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="stat-card">
              <div className="stat-label"><Users size={16} color="#6B7280" /> Total Clientes</div>
              <div className="stat-value">{totalClients}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Cuentas registradas</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><FolderKanban size={16} color="#6B7280" /> Proyectos Activos</div>
              <div className="stat-value">{activeProjects}</div>
              <div className="stat-trend up"><TrendingUp size={14} /> En desarrollo</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><CreditCard size={16} color="#6B7280" /> Créditos Emitidos</div>
              <div className="stat-value">${totalCreditsEmitted.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Total acumulado</div>
            </div>
            <div 
              className="stat-card"
              onClick={() => { setShowPendingDesigns(!showPendingDesigns); setShowApprovedDesigns(false); }}
              style={{ 
                cursor: 'pointer', border: showPendingDesigns ? '2px solid #D97706' : '1px solid #E5E7EB',
                background: showPendingDesigns ? '#FEF3C7' : '#FFFFFF', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}
            >
              <div className="stat-label" style={{ color: showPendingDesigns ? '#92400E' : '#6B7280' }}><AlertTriangle size={16} /> Solics. de Diseño</div>
              <div className="stat-value" style={{ color: '#92400E' }}>{pendingDesignProjects.length}</div>
              <div style={{ fontSize: '12px', color: '#B45309' }}>Pendientes de ajuste</div>
            </div>
            <div 
              className="stat-card"
              onClick={() => { setShowApprovedDesigns(!showApprovedDesigns); setShowPendingDesigns(false); }}
              style={{ 
                cursor: 'pointer', border: showApprovedDesigns ? '2px solid #059669' : '1px solid #E5E7EB',
                background: showApprovedDesigns ? '#D1FAE5' : '#FFFFFF', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}
            >
              <div className="stat-label" style={{ color: showApprovedDesigns ? '#065F46' : '#6B7280' }}><CheckCircle2 size={16} /> Diseños Aprobados</div>
              <div className="stat-value" style={{ color: '#065F46' }}>{approvedDesignProjects.length}</div>
              <div style={{ fontSize: '12px', color: '#047857' }}>Listos para desarrollo</div>
            </div>
          </div>
        )}

        {/* Expandable List for Design Requests */}
        {showPendingDesigns && (
          <div className="card fade-in-up" style={{ padding: '24px', background: '#FEF3C7', border: '1px solid #FCD34D' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#92400E', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> Clientes esperando modificaciones de diseño
            </h3>
            {pendingDesignProjects.length === 0 ? (
              <p style={{ color: '#B45309', fontSize: '14px', margin: 0 }}>No hay solicitudes de diseño pendientes.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {pendingDesignProjects.map(p => (
                  <Link key={p.id} to={`/admin/clients/${p.clientId}`} style={{ background: '#FFFBEB', padding: '16px', borderRadius: '8px', border: '1px solid #FDE68A', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>{p.clientName}</div>
                    <div style={{ fontSize: '13px', color: '#B45309' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#D97706', marginTop: '4px' }}>Ver cliente →</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expandable List for Approved Designs */}
        {showApprovedDesigns && (
          <div className="card fade-in-up" style={{ padding: '24px', background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#065F46', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> Clientes que aprobaron el diseño
            </h3>
            {approvedDesignProjects.length === 0 ? (
              <p style={{ color: '#047857', fontSize: '14px', margin: 0 }}>No hay diseños aprobados recientemente.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {approvedDesignProjects.map(p => (
                  <Link key={p.id} to={`/admin/clients/${p.clientId}`} style={{ background: '#F0FDF4', padding: '16px', borderRadius: '8px', border: '1px solid #A7F3D0', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#065F46' }}>{p.clientName}</div>
                    <div style={{ fontSize: '13px', color: '#047857' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#059669', marginTop: '4px' }}>Ver cliente →</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar por empresa, nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hx-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {/* Client Table */}
        {loading ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="hx-table">
              <thead><tr><th>Cliente / Empresa</th><th>Contacto</th><th>Proyectos</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
              <tbody>
                <SkeletonTableRow cols={4} />
                <SkeletonTableRow cols={4} />
                <SkeletonTableRow cols={4} />
              </tbody>
            </table>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <UserPlus size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>No hay clientes encontrados</h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Crea un nuevo cliente o ajusta los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="hx-table">
              <thead>
                <tr>
                  <th>Cliente / Empresa</th>
                  <th>Contacto</th>
                  <th>Proyectos</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody className="stagger-list">
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {client.logoUrl ? (
                          <img src={client.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: 'transparent', border: 'none', padding: 0 }} />
                        ) : (
                          <div className="avatar avatar-md" style={{ background: '#DBEAFE', color: '#1D4ED8', borderRadius: '8px', width: '40px', height: '40px' }}>
                            {(client.companyName || client.name).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                            {client.companyName || client.name}
                          </div>
                          {client.companyName && (
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>Rep: {client.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{client.email}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{client.phone || 'Sin teléfono'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} color="#9CA3AF" />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                          {client.projects?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleImpersonate(client.id)}
                          disabled={impersonatingClientId === client.id}
                          title="Entrar al portal y verificar cómo lo ve este cliente"
                          className="btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#0284C7',
                            borderColor: '#BAE6FD',
                            background: '#F0F9FF',
                            cursor: impersonatingClientId === client.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Eye size={14} /> Ver portal
                        </button>
                        <Link to={`/admin/clients/${client.id}`} style={{ textDecoration: 'none' }}>
                          <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                            Administrar <ChevronRight size={14} />
                          </button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(client.id, client.companyName || client.name)}
                          disabled={deletingClientId === client.id}
                          title="Eliminar cliente"
                          style={{
                            padding: '6px 10px',
                            fontSize: '13px',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            cursor: deletingClientId === client.id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            opacity: deletingClientId === client.id ? 0.5 : 1,
                            transition: 'all 0.15s'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showModal && createPortal(
        <div className={`modal-overlay${closingModal ? ' closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal-content">
            <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', transition: 'color 150ms, transform 150ms' }} onMouseEnter={e => { e.currentTarget.style.color = '#111827'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#111827' }}>Crear Nuevo Cliente</h2>
            <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre del Representante *</label>
                <input type="text" className="hx-input" required
                  value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Correo Electrónico *</label>
                <input type="email" className="hx-input" required
                  value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} placeholder="juan@empresa.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre de la Empresa</label>
                <input type="text" className="hx-input"
                  value={newClientData.companyName} onChange={e => setNewClientData({...newClientData, companyName: e.target.value})} placeholder="Ej. Empresa SA de CV" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Foto de Perfil / Logo de la Empresa (Opcional)</label>
                {!newClientData.logoUrl ? (
                  <div style={{ position: 'relative', border: '1px dashed #D1D5DB', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#F9FAFB', cursor: 'pointer' }}>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} disabled={uploadingLogo} />
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {uploadingLogo ? 'Subiendo imagen...' : 'Arrastra un archivo .PNG o .JPG aquí para subir el logo'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F9FAFB' }}>
                    <img src={newClientData.logoUrl} alt="Logo subido" style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'transparent', borderRadius: '4px', border: 'none', padding: 0 }} />
                    <button type="button" onClick={() => setNewClientData({...newClientData, logoUrl: ''})} style={{ fontSize: '12px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Quitar Logo
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Teléfono (WhatsApp)</label>
                <input type="text" className="hx-input"
                  value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} placeholder="+52 55..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Nombre del Proyecto Inicial *</label>
                <input type="text" className="hx-input" required
                  value={newClientData.projectName} onChange={e => setNewClientData({...newClientData, projectName: e.target.value})} placeholder="Ej. Página Web + Menú Digital" />
              </div>
              {errorMsg && (
                <div className="msg-enter" style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>
                  {errorMsg}
                </div>
              )}
              
              <div style={{ padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', display: 'flex', gap: '10px', marginTop: '4px' }}>
                <Mail size={16} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                  <strong>Envío automático:</strong> Al crear el cliente, se le enviará un correo con un enlace para que configure su contraseña y acceda a su portal.
                </p>
              </div>

              <button type="submit" className="btn-primary" disabled={savingClient} style={{ marginTop: '4px', opacity: savingClient ? 0.8 : 1 }}>
                {savingClient ? (
                  <><span className="btn-spinner" /> Creando Cliente...</>
                ) : 'Crear y Enviar Invitación'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  );
}
