import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Player } from '@lottiefiles/react-lottie-player';
import conversationAnimation from '../../assets/lottie/Conversation.json';
import trophyAnimation from '../../assets/lottie/Trophy.json';
import {
  Users,
  Sparkles,
  Copy,
  Check,
  Plus,
  Clock,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Coins,
  Building2,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  Search,
  X,
  ArrowRight,
  TrendingUp,
  History,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const STATUS_CONFIG = {
  registered: {
    label: 'Registrado',
    bg: '#F3F4F6',
    color: '#4B5563',
    border: '#E5E7EB',
    dot: '#9CA3AF',
    desc: 'Contacto recibido y en cola de análisis',
  },
  contacted: {
    label: 'Contactado',
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#DBEAFE',
    dot: '#3B82F6',
    desc: 'Primer acercamiento realizado con el equipo directivo',
  },
  negotiating: {
    label: 'En Negociación',
    bg: '#FFFBEB',
    color: '#B45309',
    border: '#FDE68A',
    dot: '#F59E0B',
    desc: 'Propuesta de arquitectura y cotización en evaluación',
  },
  converted: {
    label: 'Proyecto Concretado',
    bg: '#ECFDF5',
    color: '#047857',
    border: '#A7F3D0',
    dot: '#10B981',
    desc: 'Proyecto formalizado — Créditos HX acreditados',
  },
  inactive: {
    label: 'Inactivo',
    bg: '#F9FAFB',
    color: '#6B7280',
    border: '#E5E7EB',
    dot: '#D1D5DB',
    desc: 'No se concretó propuesta en este periodo',
  },
};

export default function ReferralsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [creditMovements, setCreditMovements] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  
  // UI states
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('referrals'); // 'referrals' | 'credits'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  });

  const fetchReferralData = async () => {
    try {
      const { data } = await api.get('/referrals/my');
      setReferrals(data.referrals || []);
      setCreditMovements(data.creditMovements || []);
      setTotalCredits(data.totalCredits || 0);
      setReferralCode(data.referralCode || user?.referralCode || '');
    } catch (err) {
      console.error('Error al cargar datos de referidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const referralLink = referralCode 
    ? `https://hummingxbi.com/ref/${referralCode}` 
    : 'https://hummingxbi.com/afiliate';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Hola! Te comparto la información de HummingX BI, la firma que desarrolla soluciones de tecnología, software e inteligencia de negocios a la medida. Puedes revisar su propuesta aquí: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleContactFounderForCredits = () => {
    const clientName = user?.companyName || user?.name || 'Cliente';
    const text = `Hola equipo fundador de HummingX BI, soy ${clientName}. Me gustaría consultar cómo aplicar mis $${totalCredits.toLocaleString('es-MX')} Créditos HX en la siguiente fase o mejoras de mi proyecto.`;
    window.open(`https://wa.me/5215579975762?text=${encodeURIComponent(text)}`, '_blank');
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setClosingModal(false);
      setFormError('');
      setFormData({
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        notes: '',
      });
    }, 180);
  };

  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setFormError('El nombre de la empresa es obligatorio.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/referrals', formData);
      closeModal();
      setSuccessToast(`¡Recomendación registrada para ${formData.companyName}! Nuestro equipo se pondrá en contacto pronto.`);
      setTimeout(() => setSuccessToast(''), 5000);
      await fetchReferralData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al registrar la recomendación. Intenta de nuevo.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const convertedCount = useMemo(() => referrals.filter(r => r.status === 'converted').length, [referrals]);
  const inProgressCount = useMemo(() => referrals.filter(r => ['registered', 'contacted', 'negotiating'].includes(r.status)).length, [referrals]);
  const totalCount = referrals.length;

  // Filtered referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(ref => {
      const matchesSearch =
        ref.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'converted') return ref.status === 'converted';
      if (statusFilter === 'in_progress') return ['registered', 'contacted', 'negotiating'].includes(ref.status);
      if (statusFilter === 'inactive') return ref.status === 'inactive';
      return true;
    });
  }, [referrals, searchTerm, statusFilter]);

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '-12px', paddingBottom: '40px' }}>
        
        {/* Toast Notification */}
        {successToast && (
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
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Header ─────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '9999px', marginBottom: '8px' }}>
              <Sparkles size={13} color="#00C4CC" />
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#0E7490', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Programa de Afiliados & Recomendaciones
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.025em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Mis Referidos & Créditos HX
            </h1>
            <p style={{ fontSize: '14.5px', color: '#6B7280', margin: 0, maxWidth: '620px', lineHeight: 1.5 }}>
              Recomienda empresas a <strong>HummingX BI</strong> y acumula Créditos HX directamente canjeables para el desarrollo, evolución y consultoría de tu propio sistema.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setShowModal(true)}
              className="btn-accent"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 4px 14px rgba(0, 196, 204, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <Plus size={16} />
              Recomendar una Empresa
            </button>
          </div>
        </div>

        {/* ── Top Hero Metrics Grid ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Balance de Créditos HX */}
          <div className="card" style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '130px', height: '130px', background: 'radial-gradient(circle, rgba(0,196,204,0.12) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F0FDFA', border: '1px solid #CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} color="#00C4CC" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Saldo Disponible</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0' }}>
                  1 Crédito HX = $1.00 MXN
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '38px', fontWeight: 800, color: '#111827', letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ${totalCredits.toLocaleString('es-MX')}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#00C4CC' }}>Créditos HX</span>
              </div>

              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5 }}>
                Tus créditos se aplican directamente en horas de consultoría, nuevas funciones o mantenimiento en conjunto con los fundadores.
              </p>
            </div>

            <div style={{ paddingTop: '14px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleContactFounderForCredits}
                className="btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '12.5px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  color: '#111827',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MessageCircle size={14} color="#00C4CC" />
                Coordinar canje con fundadores
              </button>
            </div>
          </div>

          {/* Card 2: Tu Enlace Único de Referido */}
          <div className="card" style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#F5F3FF', border: '1px solid #EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Share2 size={18} color="#6D28D9" />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block' }}>Tu Enlace de Socio</span>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Comparte con directores y empresarios</span>
                </div>
              </div>

              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '0 0 14px', lineHeight: 1.5 }}>
                Cualquier empresa que agende o contacte mediante tu enlace quedará enlazada automáticamente a tu cuenta.
              </p>

              {/* Link Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '8px 12px',
                marginBottom: '14px',
              }}>
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12.5px',
                    color: '#374151',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    width: '100%',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: copied ? '#ECFDF5' : '#111827',
                    color: copied ? '#047857' : '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={12} color="#047857" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={handleShareWhatsApp}
                className="btn-secondary"
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                }}
              >
                <MessageCircle size={14} color="#25D366" />
                WhatsApp
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn-secondary"
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                }}
              >
                <Plus size={14} color="#00C4CC" />
                Ingresar Datos
              </button>
            </div>
          </div>

          {/* Card 3: Resumen Ejecutivo de Desempeño */}
          <div className="card" style={{
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} color="#059669" />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block' }}>Métricas de Referidos</span>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Monitoreo en tiempo real</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '16px 0' }}>
                <div style={{ padding: '12px 10px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6', textAlign: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827', display: 'block' }}>{totalCount}</span>
                  <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>Total</span>
                </div>

                <div style={{ padding: '12px 10px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FEF3C7', textAlign: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#B45309', display: 'block' }}>{inProgressCount}</span>
                  <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 500 }}>En Proceso</span>
                </div>

                <div style={{ padding: '12px 10px', background: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0', textAlign: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#047857', display: 'block' }}>{convertedCount}</span>
                  <span style={{ fontSize: '11px', color: '#065F46', fontWeight: 500 }}>Concretadas</span>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#00C4CC" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: 1.4 }}>
                Resguardo bajo <strong>Acuerdo de Confidencialidad</strong> (NDA).
              </span>
            </div>
          </div>

        </div>

        {/* ── Mecanismo de 3 Pasos (Visual Step Roadmap) ─────────────────────────────────────── */}
        <div className="card" style={{
          padding: '28px 24px',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          background: '#FFFFFF',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              ¿Cómo funciona el Programa de Recomendaciones?
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              Un proceso transparente y profesional diseñado para generar valor mutuo sin fricciones.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* Step 1 */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#111827',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>1</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Recomiendas</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Comparte tu enlace exclusivo o registra directamente el nombre del contacto o empresa que requiere consultoría o software.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#00C4CC',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>2</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Evaluamos y Cotizamos</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                El equipo de ingeniería de HummingX BI analiza sus requerimientos técnicos y elabora una solución a la medida con estricta confidencialidad.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>3</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Recibes Créditos HX</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                Al concretarse el contrato, se acreditan los Créditos HX correspondientes a tu balance para aplicar en tu propio ecosistema tecnológico.
              </p>
            </div>

          </div>
        </div>

        {/* ── Main Section: Tabs & Data Table ─────────────────────────────────────── */}
        <div className="card" style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          background: '#FFFFFF',
        }}>
          
          {/* Tabs bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('referrals')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'referrals' ? '#111827' : 'transparent',
                  color: activeTab === 'referrals' ? '#FFFFFF' : '#6B7280',
                  transition: 'all 0.15s ease',
                }}
              >
                <Building2 size={15} />
                Empresas Recomendadas ({totalCount})
              </button>

              <button
                onClick={() => setActiveTab('credits')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'credits' ? '#111827' : 'transparent',
                  color: activeTab === 'credits' ? '#FFFFFF' : '#6B7280',
                  transition: 'all 0.15s ease',
                }}
              >
                <History size={15} />
                Bitácora de Créditos ({creditMovements.length})
              </button>
            </div>

            {/* Search & Filters (only for referrals tab) */}
            {activeTab === 'referrals' && totalCount > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  width: '200px',
                }}>
                  <Search size={14} color="#9CA3AF" />
                  <input
                    type="text"
                    placeholder="Buscar empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '12.5px',
                      color: '#111827',
                      width: '100%',
                    }}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="hx-input"
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    height: 'auto',
                    borderRadius: '8px',
                    color: '#374151',
                    width: 'auto',
                  }}
                >
                  <option value="all">Todos los estados</option>
                  <option value="in_progress">En proceso</option>
                  <option value="converted">Concretados</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: REFERRALS LIST */}
          {activeTab === 'referrals' && (
            <div>
              {loading ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
                  <p style={{ fontSize: '14px', margin: 0 }}>Cargando recomendaciones...</p>
                </div>
              ) : totalCount === 0 ? (
                /* Empty state */
                <div style={{
                  padding: '50px 20px 40px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ width: '150px', height: '150px', marginBottom: '8px' }}>
                    <Player autoplay loop src={conversationAnimation} style={{ width: '100%', height: '100%' }} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                    Aún no tienes recomendaciones registradas
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 24px', maxWidth: '440px', lineHeight: 1.6 }}>
                    Comparte tu enlace de socio con empresas que busquen automatización, software a la medida o Business Intelligence y comienza a acumular Créditos HX.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-accent"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                    }}
                  >
                    <Plus size={16} />
                    Hacer mi primera recomendación
                  </button>
                </div>
              ) : filteredReferrals.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
                  <p style={{ fontSize: '14px', margin: '0 0 12px' }}>No se encontraron empresas con los filtros aplicados.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    className="btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                /* Referrals Table / Cards */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Empresa & Contacto
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Fecha Registro
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Estatus de Seguimiento
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                          Créditos HX
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReferrals.map((ref) => {
                        const statusCfg = STATUS_CONFIG[ref.status] || STATUS_CONFIG.registered;
                        const dateFormatted = new Date(ref.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        });

                        return (
                          <tr
                            key={ref.id}
                            style={{
                              borderBottom: '1px solid #F3F4F6',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {/* Empresa */}
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '10px',
                                  background: '#F3F4F6',
                                  border: '1px solid #E5E7EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '14px',
                                  color: '#374151',
                                  flexShrink: 0,
                                }}>
                                  {ref.companyName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827', display: 'block' }}>
                                    {ref.companyName}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                    {ref.contactName && (
                                      <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 500 }}>
                                        {ref.contactName}
                                      </span>
                                    )}
                                    {ref.contactPhone && (
                                      <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                                        • {ref.contactPhone}
                                      </span>
                                    )}
                                    {ref.contactEmail && (
                                      <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                                        • {ref.contactEmail}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Fecha */}
                            <td style={{ padding: '16px', fontSize: '13px', color: '#4B5563' }}>
                              {dateFormatted}
                            </td>

                            {/* Status */}
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '9999px', background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusCfg.dot }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: statusCfg.color }}>
                                  {statusCfg.label}
                                </span>
                              </div>
                              <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
                                {statusCfg.desc}
                              </span>
                            </td>

                            {/* Créditos */}
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              {ref.creditsGenerated > 0 ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: '#ECFDF5',
                                  border: '1px solid #A7F3D0',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  color: '#047857',
                                }}>
                                  +${ref.creditsGenerated.toLocaleString('es-MX')} HX
                                </span>
                              ) : ref.status === 'converted' ? (
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>
                                  En acreditación
                                </span>
                              ) : (
                                <span style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic' }}>
                                  En evaluación
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREDIT MOVEMENTS HISTORY */}
          {activeTab === 'credits' && (
            <div>
              {creditMovements.length === 0 ? (
                <div style={{ padding: '50px 20px', textAlign: 'center', color: '#6B7280' }}>
                  <Coins size={36} color="#9CA3AF" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                    Sin movimientos registrados aún
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                    Aquí verás el historial cronológico de créditos acumulados o aplicados en tus proyectos.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {creditMovements.map((m) => {
                    const isPositive = m.amount > 0;
                    const dateFormatted = new Date(m.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1px solid #E5E7EB',
                          background: '#F9FAFB',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isPositive ? '#ECFDF5' : '#FEF2F2',
                            border: isPositive ? '1px solid #A7F3D0' : '1px solid #FECACA',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Coins size={16} color={isPositive ? '#059669' : '#DC2626'} />
                          </div>
                          <div>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827', display: 'block' }}>
                              {m.description}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#6B7280' }}>
                              {dateFormatted}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            color: isPositive ? '#047857' : '#DC2626',
                          }}>
                            {isPositive ? `+${m.amount.toLocaleString('es-MX')}` : m.amount.toLocaleString('es-MX')} HX
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ── Modal: Recomendar una Empresa ─────────────────────────────────────── */}
      {showModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '16px', padding: '32px' }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#111827'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDFA', border: '1px solid #CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} color="#00C4CC" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Recomendar una Empresa
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.5 }}>
              Ingresa los datos del contacto o empresa. Nuestro equipo se pondrá en comunicación para brindarles un diagnóstico tecnológico de cortesía.
            </p>

            {formError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                color: '#B91C1C',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}>
                <AlertCircle size={15} color="#DC2626" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReferral} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  className="hx-input"
                  placeholder="Ej. Comercializadora del Norte SA de CV"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Nombre del Contacto / Director
                </label>
                <input
                  type="text"
                  className="hx-input"
                  placeholder="Ej. Ing. Roberto Sánchez"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    className="hx-input"
                    placeholder="+52 55..."
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Notas o Necesidades (Opcional)
                </label>
                <textarea
                  className="hx-input"
                  rows={2}
                  placeholder="Ej. Tienen 3 sucursales y buscan automatizar reportes o renovar su app web..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary"
                  disabled={submitting}
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-accent"
                  disabled={submitting}
                  style={{
                    padding: '10px 22px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {submitting ? 'Registrando...' : 'Registrar Recomendación'}
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
