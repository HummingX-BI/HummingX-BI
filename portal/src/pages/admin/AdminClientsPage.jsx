import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Search, Plus, Building2, ChevronRight, UserPlus, FileText, X } from 'lucide-react';

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Client Modal State
  const [showModal, setShowModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', email: '', companyName: '', phone: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

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
      setShowModal(false);
      setNewClientData({ name: '', email: '', companyName: '', phone: '' });
      fetchClients();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Error al crear el cliente.');
    } finally {
      setSavingClient(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase())) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} /> Panel Administrativo
              </span>
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '32px', letterSpacing: '-0.02em' }}>
              Directorio de Clientes
            </h1>
          </div>
          
          <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
            <Plus size={18} /> Nuevo Cliente
          </button>
        </div>

        {/* Toolbar */}
        <div className="midnight-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
            <Search size={18} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar por empresa, nombre o email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hx-input"
              style={{ width: '100%', padding: '12px 16px 12px 44px', fontSize: '14px', borderRadius: '10px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="bars-loader">
              <div></div><div></div><div></div>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="midnight-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
            <UserPlus size={64} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No hay clientes encontrados</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>
              Crea un nuevo cliente o ajusta los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="midnight-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente / Empresa</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proyectos</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,196,204,0.1)', border: '1px solid rgba(0,196,204,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#00C4CC', fontWeight: 700, fontSize: '16px' }}>
                          {(client.companyName || client.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                            {client.companyName || client.name}
                          </div>
                          {client.companyName && (
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                              Rep: {client.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>{client.email}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{client.phone || 'Sin teléfono'}</div>
                    </td>

                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="rgba(255,255,255,0.5)" />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {client.projects?.length || 0}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <Link to={`/admin/clients/${client.id}`} style={{ textDecoration: 'none', display: 'inline-block' }}>
                        <button className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="midnight-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Crear Nuevo Cliente</h2>
            <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Nombre del Representante *</label>
                <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }} required 
                  value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Correo Electrónico *</label>
                <input type="email" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }} required 
                  value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} placeholder="juan@empresa.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Nombre de la Empresa</label>
                <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }} 
                  value={newClientData.companyName} onChange={e => setNewClientData({...newClientData, companyName: e.target.value})} placeholder="Ej. Empresa SA de CV" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Teléfono (WhatsApp)</label>
                <input type="text" className="hx-input" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px' }} 
                  value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} placeholder="+52 55..." />
              </div>
              {errorMsg && (
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', borderRadius: '8px', fontSize: '14px' }}>
                  {errorMsg}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={savingClient} style={{ padding: '12px', marginTop: '8px' }}>
                {savingClient ? 'Creando Cliente...' : 'Crear y Enviar Invitación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
