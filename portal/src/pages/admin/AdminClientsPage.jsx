import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { SkeletonTableRow } from '../../components/Skeleton';
import api from '../../lib/api';
import { Search, Plus, Building2, ChevronRight, UserPlus, FileText, X, Users, FolderKanban, TrendingUp, CreditCard, Mail } from 'lucide-react';

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', companyName: '', logoUrl: '', phone: '', projectName: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
      await api.post('/admin/clients', newClientData);
      closeModal();
      setNewClientData({ name: '', email: '', companyName: '', phone: '', projectName: '' });
      fetchClients();
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

        {/* 3 KPI Cards — stagger-list for sequential entrance */}
        <div className="stagger-list stats-grid-3">
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
        </div>

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
                          <img src={client.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain', background: '#fff', border: '1px solid #E5E7EB', padding: '2px' }} />
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
                      <Link to={`/admin/clients/${client.id}`} style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                          Administrar <ChevronRight size={14} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showModal && (
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
                    <img src={newClientData.logoUrl} alt="Logo subido" style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#fff', borderRadius: '4px', border: '1px solid #E5E7EB', padding: '2px' }} />
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
        </div>
      )}
    </Layout>
  );
}
