import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import QRCode from 'qrcode';
import {
  QrCode,
  Smartphone,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  MessageCircle,
  UtensilsCrossed,
  Globe,
  Download,
  Share2,
  TrendingUp,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';

function InstagramIcon({ size = 18, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const CARD_TYPES = {
  google_reviews: {
    label: 'Reseñas de Google',
    icon: Star,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    placeholder: 'https://maps.app.goo.gl/... o https://g.page/r/.../review',
    hint: 'Abre la ficha de Google Maps de tu negocio, dale en "Solicitar reseñas" y pega el link aquí.',
  },
  instagram: {
    label: 'Seguidores Instagram',
    icon: InstagramIcon,
    color: '#9333EA',
    bg: '#F3E8FF',
    border: '#E9D5FF',
    placeholder: 'https://instagram.com/tu_negocio',
    hint: 'Pega el perfil de Instagram del negocio para que lo sigan al instante.',
  },
  whatsapp: {
    label: 'WhatsApp Directo',
    icon: MessageCircle,
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    placeholder: 'https://wa.me/525512345678?text=Hola...',
    hint: 'Enlace directo a WhatsApp con o sin mensaje predefinido.',
  },
  menu: {
    label: 'Menú Digital / Catálogo',
    icon: UtensilsCrossed,
    color: '#EA580C',
    bg: '#FFEDD5',
    border: '#FED7AA',
    placeholder: 'https://menu.tunegocio.com o link de Google Drive al PDF',
    hint: 'Ideal para restaurantes, cafeterías o catálogos de productos.',
  },
  website: {
    label: 'Enlace Web Personalizado',
    icon: Globe,
    color: '#0284C7',
    bg: '#E0F2FE',
    border: '#BAE6FD',
    placeholder: 'https://www.tunegocio.com',
    hint: 'Cualquier página web, linktree o pasarela de tu cliente.',
  },
};

export default function AdminNfcCardsPage() {
  const [cards, setCards] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCards: 0,
    activeCards: 0,
    inactiveCards: 0,
    totalScans: 0,
    nextSuggestedCode: '001',
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeCardForQr, setActiveCardForQr] = useState(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState('');
  const [closingModal, setClosingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    code: '',
    clientName: '',
    type: 'google_reviews',
    targetUrl: '',
    active: true,
    notes: '',
  });

  const fetchCards = async () => {
    try {
      const res = await api.get('/admin/nfc-cards');
      setCards(res.data.cards || []);
      if (res.data.metrics) setMetrics(res.data.metrics);
    } catch (err) {
      console.error('Error al cargar tarjetas NFC/QR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openNewModal = () => {
    setEditingCard(null);
    setForm({
      code: metrics.nextSuggestedCode || '001',
      clientName: '',
      type: 'google_reviews',
      targetUrl: '',
      active: true,
      notes: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (card) => {
    setEditingCard(card);
    setForm({
      code: card.code,
      clientName: card.clientName,
      type: card.type || 'google_reviews',
      targetUrl: card.targetUrl,
      active: card.active,
      notes: card.notes || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setClosingModal(false);
      setEditingCard(null);
    }, 180);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.clientName.trim() || !form.targetUrl.trim()) {
      setFormError('El número de tarjeta, cliente y enlace de destino son obligatorios.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingCard) {
        await api.put(`/admin/nfc-cards/${editingCard.id}`, form);
        showNotification(`Tarjeta #${form.code} actualizada correctamente.`);
      } else {
        await api.post('/admin/nfc-cards', form);
        showNotification(`Tarjeta #${form.code} configurada y activada.`);
      }
      closeModal();
      fetchCards();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar tarjeta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (card) => {
    try {
      await api.put(`/admin/nfc-cards/${card.id}`, { active: !card.active });
      showNotification(`Tarjeta #${card.code} ${!card.active ? 'activada' : 'desactivada'}.`);
      fetchCards();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar estado.');
    }
  };

  const handleDeleteCard = async (card) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la tarjeta #${card.code} (${card.clientName})? Si alguien escanea el QR físico, dejará de funcionar.`)) return;
    try {
      await api.delete(`/admin/nfc-cards/${card.id}`);
      showNotification(`Tarjeta #${card.code} eliminada.`);
      fetchCards();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar tarjeta.');
    }
  };

  const openQrPreview = async (card) => {
    setActiveCardForQr(card);
    const redirectUrl = `https://hummingxbi.com/t/${card.code}`;
    try {
      const dataUrl = await QRCode.toDataURL(redirectUrl, {
        width: 600,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'Q',
      });
      setQrModalDataUrl(dataUrl);
      setShowQrModal(true);
    } catch (err) {
      console.error('Error generando QR:', err);
    }
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    setActiveCardForQr(null);
    setQrModalDataUrl('');
  };

  const downloadQrImage = () => {
    if (!qrModalDataUrl || !activeCardForQr) return;
    const a = document.createElement('a');
    a.href = qrModalDataUrl;
    a.download = `QR_HummingX_${activeCardForQr.code}_${activeCardForQr.clientName.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.targetUrl.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (statusFilter === 'active' && !c.active) return false;
      if (statusFilter === 'inactive' && c.active) return false;

      return true;
    });
  }, [cards, searchTerm, typeFilter, statusFilter]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #00C4CC 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 196, 204, 0.25)',
                }}
              >
                <QrCode size={18} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Tarjetas QR & NFC
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, maxWidth: '640px' }}>
              Configura y administra las tarjetas físicas con chip NFC y QR vendidos a clientes (Google Reviews, Instagram, WhatsApp o Menú).
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13.5px',
            }}
          >
            <Plus size={16} />
            Configurar Nueva Tarjeta
          </button>
        </div>

        {/* ── Top Metrics Bar ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Total Tarjetas Vendidas / Configuradas</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{metrics.totalCards}</span>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Tarjetas Activas</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#047857' }}>{metrics.activeCards}</span>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Escaneos & Taps Acumulados</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#00C4CC' }}>{metrics.totalScans}</span>
          </div>

          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Siguiente Número Disponible</span>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#7C3AED', fontFamily: 'monospace' }}>#{metrics.nextSuggestedCode}</span>
          </div>
        </div>

        {/* ── Search & Filter Bar ─────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '8px 14px', flex: '1 1 240px', maxWidth: '100%' }}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Buscar por código (#001), cliente o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', background: 'transparent' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Filter by Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
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
              }}
            >
              <option value="all">Todos los Tipos de Acción</option>
              {Object.entries(CARD_TYPES).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
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
              }}
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Solo Activas</option>
              <option value="inactive">Solo Inactivas</option>
            </select>
          </div>
        </div>

        {/* ── Cards Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
            <p>Cargando tarjetas NFC y códigos QR...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <QrCode size={36} color="#9CA3AF" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
              No hay tarjetas en este filtro
            </h3>
            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 20px' }}>
              Configura una tarjeta NFC para asignarle un destino de reseñas, Instagram o menú al cliente.
            </p>
            <button onClick={openNewModal} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              <Plus size={14} /> Configurar Primera Tarjeta
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
            {filteredCards.map((card) => {
              const typeCfg = CARD_TYPES[card.type] || CARD_TYPES.google_reviews;
              const TypeIcon = typeCfg.icon;
              const shortUrl = `https://hummingxbi.com/t/${card.code}`;

              return (
                <div
                  key={card.id}
                  className="card"
                  style={{
                    padding: '20px',
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
                  {/* Top Bar: Code Badge + Type Pill + Active Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#111827',
                          color: '#FFFFFF',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '13px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        #{card.code}
                      </span>

                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: typeCfg.bg,
                          color: typeCfg.color,
                          border: `1px solid ${typeCfg.border}`,
                          fontSize: '11.5px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <TypeIcon size={12} />
                        {typeCfg.label}
                      </span>
                    </div>

                    {/* Active toggle button */}
                    <button
                      onClick={() => handleToggleActive(card)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: card.active ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                        background: card.active ? '#ECFDF5' : '#F3F4F6',
                        color: card.active ? '#047857' : '#6B7280',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Haz clic para activar o desactivar la redirección"
                    >
                      {card.active ? 'Activa' : 'Pausada'}
                    </button>
                  </div>

                  {/* Client & Assigned Name */}
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                      {card.clientName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                      <span>Link físico del chip:</span>
                      <code style={{ background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', color: '#0F172A', fontWeight: 600 }}>
                        hummingxbi.com/t/{card.code}
                      </code>
                    </div>
                  </div>

                  {/* Destination URL Box */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Destino de Redirección
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: '#0284C7',
                          fontWeight: 500,
                          wordBreak: 'break-all',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                        title={card.targetUrl}
                      >
                        {card.targetUrl}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => copyToClipboard(card.targetUrl, card.id)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            cursor: 'pointer',
                            color: copiedId === card.id ? '#059669' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Copiar enlace"
                        >
                          {copiedId === card.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>

                        <a
                          href={card.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                          }}
                          title="Probar destino en nueva pestaña"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Notes if any */}
                  {card.notes && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                      Nota: {card.notes}
                    </p>
                  )}

                  {/* Bottom: Scan Counter + Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      borderTop: '1px solid #F1F5F9',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={14} color="#00C4CC" />
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#111827' }}>
                        {card.scanCount}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>escaneos</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => openQrPreview(card)}
                        className="btn-secondary"
                        style={{
                          fontSize: '12px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <QrCode size={13} color="#00C4CC" />
                        Ver QR
                      </button>

                      <button
                        onClick={() => openEditModal(card)}
                        className="btn-secondary"
                        style={{ padding: '6px 8px', borderRadius: '8px' }}
                        title="Editar configuración"
                      >
                        <Edit size={13} />
                      </button>

                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="btn-secondary"
                        style={{ padding: '6px 8px', borderRadius: '8px', color: '#DC2626' }}
                        title="Eliminar tarjeta"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── Modal: Configurar / Editar Tarjeta ─────────────────────────────── */}
      {showModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '540px', width: '100%', borderRadius: '16px', padding: '32px' }}>
            <button
              onClick={closeModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {editingCard ? `Editar Tarjeta #${editingCard.code}` : 'Configurar Tarjeta QR & NFC'}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Vincula el número de la tarjeta física al negocio del cliente y su enlace de destino.
            </p>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', fontSize: '12.5px', marginBottom: '16px' }}>
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCard} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Número Tarjeta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="001"
                    className="hx-input"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Cliente / Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tahara Café, Dr. Fernando Robles"
                    className="hx-input"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Tipo de Acción / Propósito *
                </label>
                <select
                  className="hx-input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {Object.entries(CARD_TYPES).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '11.5px', color: '#6B7280', display: 'block', marginTop: '4px' }}>
                  {CARD_TYPES[form.type]?.hint}
                </span>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Enlace de Destino (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder={CARD_TYPES[form.type]?.placeholder || 'https://...'}
                  className="hx-input"
                  value={form.targetUrl}
                  onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Notas de Entrega / Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej. En barra de cobro, acrílico mesa 4"
                  className="hx-input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Tarjeta activada (responder inmediatamente al escanear)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeModal} className="btn-secondary" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : editingCard ? 'Actualizar Tarjeta' : 'Activar y Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal: Ver & Descargar Código QR ──────────────────────────────── */}
      {showQrModal && activeCardForQr && createPortal(
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeQrModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '420px', width: '100%', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <button
              onClick={closeQrModal}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
            >
              <X size={20} />
            </button>

            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '8px',
                background: '#111827',
                color: '#FFFFFF',
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '14px',
                marginBottom: '10px',
              }}
            >
              Tarjeta #{activeCardForQr.code}
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {activeCardForQr.clientName}
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              {CARD_TYPES[activeCardForQr.type]?.label}
            </p>

            {/* QR Image Display */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                display: 'inline-block',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                marginBottom: '16px',
              }}
            >
              {qrModalDataUrl ? (
                <img
                  src={qrModalDataUrl}
                  alt={`QR Tarjeta ${activeCardForQr.code}`}
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Generando QR...
                </div>
              )}
            </div>

            <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>URL fija del chip y QR:</span>
              <code style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                https://hummingxbi.com/t/{activeCardForQr.code}
              </code>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={downloadQrImage}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  padding: '9px 16px',
                }}
              >
                <Download size={15} />
                Descargar PNG de Imprenta
              </button>

              <a
                href={`https://hummingxbi.com/t/${activeCardForQr.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '9px 14px',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} />
                Probar
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

    </Layout>
  );
}
