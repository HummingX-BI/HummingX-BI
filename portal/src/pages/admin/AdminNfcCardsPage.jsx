import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import Confetti from 'react-confetti';
import { Player } from '@lottiefiles/react-lottie-player';
import trophyAnimation from '../../assets/lottie/Trophy.json';
import NfcCardsMap from './nfc/NfcCardsMap';
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
  Terminal,
  Package,
  Loader2,
  Lock,
  Unlock,
  MapPin,
  Camera,
  Navigation,
  Compass,
  Zap,
  Flame,
  ArrowRight,
  CreditCard,
  Link2
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

export function cleanPlaceId(input) {
  if (!input) return '';
  let str = String(input).trim();
  const match = str.match(/place_?id=([a-zA-Z0-9_\-]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  if (str.includes('writereview?placeid=')) {
    return str.split('writereview?placeid=')[1].split('&')[0].trim();
  }
  return str.replace(/['"\s]/g, '');
}

export function buildGoogleReviewUrl(placeId) {
  const cleaned = cleanPlaceId(placeId);
  if (!cleaned) return '';
  return `https://search.google.com/local/writereview?placeid=${cleaned}`;
}

export function cleanInstagramHandle(input) {
  if (!input) return '';
  let str = String(input).trim();
  str = str.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  str = str.split('?')[0].split('/')[0].replace(/^@+/, '').trim();
  return str;
}

export function buildInstagramUrl(handle) {
  const cleaned = cleanInstagramHandle(handle);
  if (!cleaned) return '';
  return `https://www.instagram.com/${cleaned}/`;
}

const CARD_TYPES = {
  google_reviews: {
    label: 'Reseñas de Google',
    icon: Star,
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    placeholder: 'Ej. ChIJd34kTQD90YURJqg9LdnTMiA',
    hint: 'Ingresa el Place ID del negocio. El panel construirá el link directo de calificación de 5 estrellas.',
  },
  instagram: {
    label: 'Seguidores Instagram',
    icon: InstagramIcon,
    color: '#9333EA',
    bg: '#F3E8FF',
    border: '#E9D5FF',
    placeholder: 'Ej. kikiselcamaron (sin @)',
    hint: 'Escribe solo el usuario de Instagram (sin @). El panel agregará la URL completa automáticamente.',
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

  // Main navigation tab: 'inventory' | 'map'
  const [activeTab, setActiveTab] = useState('inventory');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isLocked, setIsLocked] = useState(true); // Security Lock Mode for active cards
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeCardForQr, setActiveCardForQr] = useState(null);
  const [qrModalDataUrl, setQrModalDataUrl] = useState('');
  const [closingModal, setClosingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [locatingGps, setLocatingGps] = useState(false);

  // File input ref for camera capture
  const fileInputRef = useRef(null);

  // Celebration Modal State (Serpentina / Confetti con trofeo en loop)
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebratedCard, setCelebratedCard] = useState(null);

  // Batch Generation Modal State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [closingBatchModal, setClosingBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    startCode: '001',
    count: 15,
    type: 'google_reviews',
    syncDb: true,
    downloadZip: true,
  });
  const [batchProgress, setBatchProgress] = useState(null);

  // Form State
  const [form, setForm] = useState({
    code: '',
    clientName: '',
    type: 'google_reviews',
    targetUrl: '',
    active: true,
    notes: '',
    latitude: '',
    longitude: '',
    locationName: '',
    photoUrl: '',
  });

  // Dedicated inputs for Google Place ID and Instagram Handle
  const [placeIdInput, setPlaceIdInput] = useState('');
  const [instagramHandleInput, setInstagramHandleInput] = useState('');

  // Computed final URL preview
  const computedFinalUrl = useMemo(() => {
    if (form.type === 'google_reviews') {
      return buildGoogleReviewUrl(placeIdInput);
    }
    if (form.type === 'instagram') {
      return buildInstagramUrl(instagramHandleInput);
    }
    return form.targetUrl?.trim() || '';
  }, [form.type, form.targetUrl, placeIdInput, instagramHandleInput]);

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

  const [compressingPhoto, setCompressingPhoto] = useState(false);

  // Helper de compresión de imágenes en el cliente mediante Canvas (evita 413 Payload Too Large)
  const compressImage = (file, maxWidth = 900, maxHeight = 900, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('El archivo seleccionado no es una imagen válida.'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Error al procesar la imagen.'));
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target.result);
          }
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const copyToClipboard = (text, id) => {
    const onDone = () => {
      setCopiedId(id);
      showNotification('Enlace copiado al portapapeles.');
      setTimeout(() => setCopiedId(null), 2000);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopy(text, onDone));
    } else {
      fallbackCopy(text, onDone);
    }
  };

  const fallbackCopy = (text, callback) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (callback) callback();
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Quick Toggle Active / Paused state for field operations
  const handleToggleActive = async (card, e) => {
    e?.stopPropagation();
    const willPause = card.active;
    const actionText = willPause ? 'pausar temporalmente' : 'reactivar';
    if (!window.confirm(`¿Deseas ${actionText} la tarjeta #${card.code} (${card.clientName})?`)) {
      return;
    }
    try {
      await api.put(`/admin/nfc-cards/${card.id}`, { active: !willPause });
      showNotification(`Tarjeta #${card.code} ${willPause ? 'pausada' : 'reactivada'} con éxito.`);
      fetchCards();
    } catch (err) {
      console.error('Error al cambiar estado de tarjeta:', err);
      showNotification('Error al cambiar el estado de la tarjeta.');
    }
  };

  // Open modal in Read-Only Security Mode for Active cards
  const openViewCardModal = (card) => {
    setEditingCard(card);
    setIsLocked(true); // Locked by default for security
    const cardType = card.type || 'google_reviews';
    setForm({
      code: card.code,
      clientName: card.clientName,
      type: cardType,
      targetUrl: card.targetUrl,
      active: card.active,
      notes: card.notes || '',
      latitude: card.latitude || '',
      longitude: card.longitude || '',
      locationName: card.locationName || '',
      photoUrl: card.photoUrl || '',
    });
    if (cardType === 'google_reviews') {
      setPlaceIdInput(cleanPlaceId(card.targetUrl));
      setInstagramHandleInput('');
    } else if (cardType === 'instagram') {
      setInstagramHandleInput(cleanInstagramHandle(card.targetUrl));
      setPlaceIdInput('');
    } else {
      setPlaceIdInput('');
      setInstagramHandleInput('');
    }
    setFormError('');
    setShowModal(true);
  };

  // Open modal in Direct In-Situ Binding Mode for Inactive/Available cards
  const openBindInSituModal = (card) => {
    setEditingCard(card);
    setIsLocked(false); // Unlocked directly to fill in business info
    const num = parseInt(card.code, 10);
    const defaultType = card.type || (num >= 11 && num <= 15 ? 'instagram' : 'google_reviews');
    const isGenericUrl = !card.targetUrl || card.targetUrl === 'https://hummingxbi.com';
    const isBlank = !card.clientName || card.clientName.includes('Disponible');
    setForm({
      code: card.code,
      clientName: isBlank ? '' : card.clientName,
      type: defaultType,
      targetUrl: isGenericUrl ? '' : card.targetUrl,
      active: true,
      notes: isBlank ? '' : (card.notes || ''),
      latitude: isBlank ? '' : (card.latitude || ''),
      longitude: isBlank ? '' : (card.longitude || ''),
      locationName: isBlank ? '' : (card.locationName || ''),
      photoUrl: isBlank ? '' : (card.photoUrl || ''),
    });
    if (defaultType === 'google_reviews') {
      setPlaceIdInput(isGenericUrl ? '' : cleanPlaceId(card.targetUrl));
      setInstagramHandleInput('');
    } else if (defaultType === 'instagram') {
      setInstagramHandleInput(isGenericUrl ? '' : cleanInstagramHandle(card.targetUrl));
      setPlaceIdInput('');
    } else {
      setPlaceIdInput('');
      setInstagramHandleInput('');
    }
    setFormError('');
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingCard(null);
    setIsLocked(false);
    setForm({
      code: metrics.nextSuggestedCode || '001',
      clientName: '',
      type: 'google_reviews',
      targetUrl: '',
      active: true,
      notes: '',
      latitude: '',
      longitude: '',
      locationName: '',
      photoUrl: '',
    });
    setPlaceIdInput('');
    setInstagramHandleInput('');
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setEditingCard(null);
      setClosingModal(false);
      setFormError('');
    }, 180);
  };

  // Handle GPS location acquisition
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setForm(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locationName: prev.locationName || `Ubicación GPS (${lat}, ${lng})`
        }));
        setLocatingGps(false);
        showNotification('Ubicación GPS obtenida exitosamente.');
      },
      (err) => {
        console.error('Error obteniendo GPS:', err);
        setLocatingGps(false);
        showNotification('No se pudo obtener la ubicación GPS: ' + (err.message || 'Permiso denegado'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Handle evidence photo upload / camera snapshot with automatic client-side canvas compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setFormError('La fotografía seleccionada supera los 20MB. Por favor selecciona otra.');
      return;
    }

    setCompressingPhoto(true);
    setFormError('');
    try {
      // Comprimir imagen a resolución optimizada (máx 900x900px, JPEG 0.75)
      const compressedDataUrl = await compressImage(file, 900, 900, 0.75);
      const estKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setForm(prev => ({ ...prev, photoUrl: compressedDataUrl }));
      showNotification(`Foto de soporte optimizada (${estKb} KB) cargada con éxito.`);
    } catch (err) {
      console.error('Error al procesar foto:', err);
      setFormError('No se pudo procesar la imagen seleccionada.');
    } finally {
      setCompressingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  // Unlink card action
  const handleUnlinkCard = async () => {
    if (!editingCard) return;
    if (!window.confirm(`¿Seguro que deseas desvincular la tarjeta #${editingCard.code} (${editingCard.clientName})?\n\nVolverá a estar libre ("Disponible para vincular"), se resetearán sus escaneos a 0 y quedará lista para otro cliente.`)) {
      return;
    }

    setUnlinking(true);
    try {
      await api.post(`/admin/nfc-cards/${editingCard.id}/unlink`);
      showNotification(`Tarjeta #${editingCard.code} desvinculada y reiniciada.`);
      closeModal();
      fetchCards();
    } catch (err) {
      console.error('Error al desvincular tarjeta:', err);
      setFormError('Error al desvincular tarjeta.');
    } finally {
      setUnlinking(false);
    }
  };

  // Helper to convert human text address (e.g. "Roma Norte", "Polanco") to map coordinates
  const geocodeAddress = async (text) => {
    if (!text || !text.trim()) return null;
    try {
      const clean = text.trim();
      const hasMexico = /méxico|mexico|cdmx/i.test(clean);
      const query = encodeURIComponent(clean + (hasMexico ? '' : ', CDMX, México'));
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'Accept-Language': 'es' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (err) {
      console.warn('Geocodificación no disponible:', err);
    }
    return null;
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.code || !/^[0-9]{3,6}$/.test(form.code.trim())) {
      setFormError('El código debe ser de 3 a 6 dígitos numéricos (ej. 001, 002).');
      return;
    }
    if (!form.clientName.trim()) {
      setFormError('Ingresa el nombre del cliente o empresa.');
      return;
    }

    let finalTargetUrl = computedFinalUrl;

    if (form.type === 'google_reviews') {
      if (!placeIdInput.trim()) {
        setFormError('Ingresa el Place ID del negocio en Google Maps.');
        return;
      }
      finalTargetUrl = buildGoogleReviewUrl(placeIdInput);
    } else if (form.type === 'instagram') {
      if (!instagramHandleInput.trim()) {
        setFormError('Ingresa el usuario de Instagram del negocio.');
        return;
      }
      finalTargetUrl = buildInstagramUrl(instagramHandleInput);
    } else {
      if (!form.targetUrl.trim()) {
        setFormError('Ingresa el enlace de destino.');
        return;
      }
      if (!/^https?:\/\//i.test(finalTargetUrl)) {
        finalTargetUrl = 'https://' + finalTargetUrl;
      }
    }

    setSubmitting(true);
    try {
      let lat = form.latitude !== '' && form.latitude !== null ? parseFloat(form.latitude) : null;
      let lng = form.longitude !== '' && form.longitude !== null ? parseFloat(form.longitude) : null;

      // Auto-geocoding from text address if coordinates are missing
      if ((!lat || !lng) && form.locationName && form.locationName.trim()) {
        const geo = await geocodeAddress(form.locationName.trim());
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      }

      const payload = {
        code: form.code.trim(),
        clientName: form.clientName.trim(),
        type: form.type,
        targetUrl: finalTargetUrl,
        active: form.active,
        notes: form.notes.trim() || null,
        latitude: lat,
        longitude: lng,
        locationName: form.locationName.trim() || null,
        photoUrl: form.photoUrl || null,
      };

      // Identificar si es una vinculación genuinamente nueva con un cliente (para celebrar en campo)
      const wasNewBinding = !editingCard || (!editingCard.active && (!editingCard.clientName || editingCard.clientName.includes('Disponible')));
      let savedCardData = null;

      if (editingCard) {
        const res = await api.put(`/admin/nfc-cards/${editingCard.id}`, payload);
        savedCardData = res.data;
        showNotification(`Tarjeta #${form.code} actualizada correctamente.`);
      } else {
        const res = await api.post('/admin/nfc-cards', payload);
        savedCardData = res.data;
        showNotification(`Tarjeta #${form.code} vinculada exitosamente.`);
      }

      closeModal();
      await fetchCards();

      // Disparar modal de celebración ÚNICAMENTE si fue una vinculación nueva en el lugar
      if (payload.active && wasNewBinding && savedCardData) {
        setCelebratedCard(savedCardData);
        setShowCelebrationModal(true);
      }
    } catch (err) {
      console.error('Error al guardar tarjeta NFC/QR:', err);
      if (err.response?.status === 413) {
        setFormError('La fotografía o datos exceden el límite de tamaño permitido en el servidor. Selecciona una imagen más ligera.');
      } else {
        setFormError(err.response?.data?.error || 'Error al guardar tarjeta. Revisa los datos.');
      }
    } finally {
      setSubmitting(false);
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

  const downloadQrSvg = async (card) => {
    const redirectUrl = `https://hummingxbi.com/t/${card.code}`;
    try {
      const svgString = await QRCode.toString(redirectUrl, {
        type: 'svg',
        margin: 0,
        errorCorrectionLevel: 'Q',
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HummingX_QR_${card.code}_SinMargen.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(`Código QR #${card.code} descargado (.svg sin margen).`);
    } catch (err) {
      console.error('Error al descargar SVG:', err);
      alert('No se pudo descargar el SVG sin margen.');
    }
  };

  const downloadQrPng = (card, dataUrl) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `HummingX_QR_${card.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Código QR #${card.code} descargado (.png).`);
  };

  // Filter Cards for Inventory Tab
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.notes && card.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.locationName && card.locationName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || card.type === typeFilter;

      const isAvailable = !card.clientName || card.clientName.includes('Disponible');
      const isSuspended = !card.active && !isAvailable;
      const isActive = card.active;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'suspended' && isSuspended) ||
        (statusFilter === 'available' && isAvailable) ||
        (statusFilter === 'inactive' && !card.active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [cards, searchTerm, typeFilter, statusFilter]);

  return (
    <Layout>
      <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '-12px', paddingBottom: '40px', width: '100%' }}>
        
        {/* ── Notification Toast ─────────────────────────────────────────── */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              background: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid rgba(0, 196, 204, 0.4)',
              borderRadius: '12px',
              padding: '14px 20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13.5px',
              fontWeight: 600,
              animation: 'hxSlideIn 0.25s ease-out',
            }}
          >
            <CheckCircle2 size={18} color="#00C4CC" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Top Header ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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
        </div>

        {/* ── KPI Metric Cards ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
          <div className="card" style={{ padding: '18px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Total Tarjetas Asignadas</span>
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

        {/* ── Segmented Control: Pestañas Principales (Pill Bar) ─────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            padding: '5px',
            borderRadius: '12px',
            width: 'fit-content',
          }}
        >
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              border: 'none',
              borderRadius: '9px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeTab === 'inventory' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'inventory' ? '#0F172A' : '#64748B',
              boxShadow: activeTab === 'inventory' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <CreditCard size={15} color={activeTab === 'inventory' ? '#00C4CC' : '#64748B'} />
            <span>Inventario de Tarjetas</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '999px',
                background: activeTab === 'inventory' ? '#ECFEFF' : '#E2E8F0',
                color: activeTab === 'inventory' ? '#0891B2' : '#64748B',
              }}
            >
              {cards.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            style={{
              border: 'none',
              borderRadius: '9px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: activeTab === 'map' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'map' ? '#0F172A' : '#64748B',
              boxShadow: activeTab === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <MapPin size={15} color={activeTab === 'map' ? '#00C4CC' : '#64748B'} />
            <span>Mapa de Territorio HummingX</span>
            {metrics.activeCards > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: activeTab === 'map' ? '#ECFDF5' : '#E2E8F0',
                  color: activeTab === 'map' ? '#047857' : '#64748B',
                }}
              >
                {metrics.activeCards}
              </span>
            )}
          </button>
        </div>

        {/* ── TAB 2: MAPA DE TERRITORIO HUMMINGX ─────────────────────────── */}
        {activeTab === 'map' && (
          <NfcCardsMap
            cards={cards}
            onCardClick={(card) => openViewCardModal(card)}
          />
        )}

        {/* ── TAB 1: INVENTARIO DE TARJETAS ──────────────────────────────── */}
        {activeTab === 'inventory' && (
          <>
            {/* Filter and Search Bar (Responsive flex-wrap layout for mobile & desktop) */}
            <div
              className="card"
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                marginBottom: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* Search input (Expands to fill remaining width) */}
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
                <Search
                  size={15}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                />
                <input
                  type="text"
                  placeholder="Buscar por # número o nombre de negocio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="hx-input"
                  style={{ paddingLeft: '34px', height: '38px', fontSize: '13px', width: '100%' }}
                />
              </div>

              {/* Type Filter */}
              <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="hx-input"
                  style={{ height: '38px', fontSize: '12.5px', paddingRight: '24px', width: '100%' }}
                >
                  <option value="all">Todos los Tipos</option>
                  <option value="google_reviews">Google Reviews</option>
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="menu">Menú Digital</option>
                  <option value="website">Sitio Web</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ flex: '1 1 140px', minWidth: '130px' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="hx-input"
                  style={{ height: '38px', fontSize: '12.5px', paddingRight: '24px', width: '100%' }}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activas (En Cliente)</option>
                  <option value="suspended">Pausadas / Suspendidas</option>
                  <option value="available">Disponibles / Libres</option>
                </select>
              </div>
            </div>

            {/* Micro-Cards Grid for Field & Mobile */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" size={32} color="#00C4CC" />
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <QrCode size={48} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  No se encontraron tarjetas
                </h3>
                <p style={{ fontSize: '13.5px', color: '#6B7280', margin: 0 }}>
                  Intenta cambiar los filtros de búsqueda o registra una nueva tarjeta.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '16px',
                }}
              >
                {filteredCards.map((card) => {
                  const num = parseInt(card.code, 10);
                  const isInstagram = card.type === 'instagram' || (num >= 11 && num <= 15);
                  const isGoogle = card.type === 'google_reviews' || (!card.type && num >= 1 && num <= 10) || (!isInstagram && card.type !== 'whatsapp' && card.type !== 'menu' && card.type !== 'website');
                  
                  const isAvailable = !card.clientName || card.clientName.includes('Disponible');
                  const isSuspended = !card.active && !isAvailable;
                  const isActive = card.active;

                  return (
                    <div
                      key={card.id}
                      className="card"
                      style={{
                        padding: '16px 18px',
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isActive
                          ? '1.5px solid #E2E8F0'
                          : isSuspended
                          ? '1.5px solid #FCD34D'
                          : '1.5px dashed #CBD5E1',
                        background: isActive
                          ? '#FFFFFF'
                          : isSuspended
                          ? '#FFFDF5'
                          : '#FAFAFA',
                        boxShadow: isActive
                          ? '0 2px 8px rgba(0,0,0,0.04)'
                          : isSuspended
                          ? '0 2px 8px rgba(245, 158, 11, 0.08)'
                          : 'none',
                        position: 'relative',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      {/* Top Row: Serial # + Platform Logo Badge + Status Pill */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '12px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: '#F1F5F9',
                              color: '#0F172A',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            #{card.code}
                          </span>

                          {/* Visual Logo Badge */}
                          {isGoogle ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '999px',
                                padding: '2px 8px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              }}
                            >
                              <img src="/google-logo.png" alt="Google" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>Google</span>
                            </div>
                          ) : isInstagram ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#FDF2F8',
                                border: '1px solid #FCE7F3',
                                borderRadius: '999px',
                                padding: '2px 8px',
                              }}
                            >
                              <img src="/instagram-logo.png" alt="Instagram" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#BE185D' }}>Instagram</span>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                borderRadius: '999px',
                                padding: '2px 8px',
                              }}
                            >
                              <Globe size={13} color="#0284C7" />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369A1' }}>Web</span>
                            </div>
                          )}
                        </div>

                        {/* Status indicator */}
                        {isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#047857',
                              background: '#ECFDF5',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid #A7F3D0',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                            <span>Activa</span>
                          </span>
                        ) : isSuspended ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#B45309',
                              background: '#FEF3C7',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid #FDE68A',
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                            <span>Pausada</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#64748B',
                              background: '#F1F5F9',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            <span>Disponible</span>
                          </span>
                        )}
                      </div>

                      {/* Middle: Prominent Restaurant / Business info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        {card.photoUrl ? (
                          <img
                            src={card.photoUrl}
                            alt={card.clientName}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                              border: '1.5px solid #CBD5E1',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '12px',
                              background: isActive ? '#F8FAFC' : isSuspended ? '#FEF3C7' : '#F1F5F9',
                              border: `1.5px solid ${isActive ? '#E2E8F0' : isSuspended ? '#FDE68A' : '#CBD5E1'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isActive ? (
                              isGoogle ? (
                                <img src="/google-logo.png" alt="Google" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                              ) : isInstagram ? (
                                <img src="/instagram-logo.png" alt="Instagram" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                              ) : (
                                <QrCode size={22} color="#00C4CC" />
                              )
                            ) : isSuspended ? (
                              isGoogle ? (
                                <img src="/google-logo.png" alt="Google" style={{ width: '22px', height: '22px', objectFit: 'contain', opacity: 0.7 }} />
                              ) : (
                                <QrCode size={22} color="#D97706" />
                              )
                            ) : (
                              <QrCode size={22} color="#94A3B8" />
                            )}
                          </div>
                        )}

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h3
                            style={{
                              fontSize: '15px',
                              fontWeight: 800,
                              color: (isActive || isSuspended) ? '#111827' : '#64748B',
                              margin: '0 0 3px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {!isAvailable ? card.clientName : 'Disponible para vincular'}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280' }}>
                            {card.locationName ? (
                              <>
                                <MapPin size={11} color="#0284C7" />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {card.locationName}
                                </span>
                              </>
                            ) : isSuspended ? (
                              <span style={{ color: '#D97706', fontWeight: 600 }}>Pausada temporalmente</span>
                            ) : isActive ? (
                              <span style={{ color: '#059669', fontWeight: 500 }}>Vinculada con cliente</span>
                            ) : (
                              <span>Sin cliente asignado</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer: Scans & Primary Action Button */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #F1F5F9',
                          gap: '10px',
                        }}
                      >
                        {/* Scans Metric */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6B7280' }}>
                          <Flame size={14} color={card.scanCount > 0 ? '#F59E0B' : '#9CA3AF'} />
                          <span style={{ fontWeight: card.scanCount > 0 ? 700 : 500, color: card.scanCount > 0 ? '#111827' : '#9CA3AF' }}>
                            {card.scanCount} {card.scanCount === 1 ? 'escaneo' : 'escaneos'}
                          </span>
                        </div>

                        {/* Action Buttons: Responsive & Clear */}
                        {isActive ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={(e) => handleToggleActive(card, e)}
                              className="btn-secondary"
                              style={{
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: '#64748B',
                              }}
                              title="Pausar temporalmente esta tarjeta"
                            >
                              Pausar
                            </button>
                            <button
                              onClick={() => openViewCardModal(card)}
                              className="btn-secondary"
                              style={{
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Lock size={12} color="#64748B" />
                              <span>Ver / Editar</span>
                            </button>
                          </div>
                        ) : isSuspended ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={(e) => handleToggleActive(card, e)}
                              style={{
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#065F46',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                              title="Reactivar tarjeta para responder inmediatamente al escanear"
                            >
                              <CheckCircle2 size={13} color="#059669" />
                              <span>Reactivar</span>
                            </button>
                            <button
                              onClick={() => openViewCardModal(card)}
                              className="btn-secondary"
                              style={{
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <span>Editar</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openBindInSituModal(card)}
                            className="btn-primary"
                            style={{
                              borderRadius: '8px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Link2 size={13} />
                            <span>Vincular tarjeta</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Modal Inteligente: Ver / Editar / Vincular Tarjeta ─────────────── */}
      {showModal && createPortal(
        <div
          className={`modal-overlay${closingModal ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '560px',
              width: '100%',
              borderRadius: '20px',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '13px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#1E293B',
                      color: '#00C4CC',
                      border: '1px solid rgba(0, 196, 204, 0.3)',
                    }}
                  >
                    Tarjeta #{form.code}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: form.active ? '#10B981' : (form.clientName && !form.clientName.includes('Disponible') ? '#D97706' : '#64748B'),
                    }}
                  >
                    {form.active
                      ? '● Tarjeta Activa'
                      : (form.clientName && !form.clientName.includes('Disponible')
                          ? '● Tarjeta Pausada'
                          : '○ Tarjeta Disponible')}
                  </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {editingCard
                    ? (isLocked
                        ? (form.active ? 'Detalles de Tarjeta Activa' : 'Detalles de Tarjeta Pausada')
                        : 'Modificar Tarjeta')
                    : 'Vincular Nueva Tarjeta'}
                </h2>
              </div>

              {/* Close Button & Security Lock Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {editingCard && form.active && (
                  <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    style={{
                      border: '1px solid',
                      borderColor: isLocked ? '#FDE68A' : '#A7F3D0',
                      background: isLocked ? '#FEF3C7' : '#ECFDF5',
                      color: isLocked ? '#92400E' : '#065F46',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                    title={isLocked ? 'Desbloquear campos para editar' : 'Bloquear campos'}
                  >
                    {isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                    <span>{isLocked ? 'Desbloquear edición' : 'Bloquear'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openQrPreview({ code: form.code, clientName: form.clientName })}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  title="Ver código QR"
                >
                  <QrCode size={12} color="#00C4CC" />
                  <span>Ver QR</span>
                </button>

                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6B7280',
                    padding: '4px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Read-Only Safety Banner */}
            {isLocked && editingCard && form.active && (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  color: '#475569',
                }}
              >
                <Lock size={16} color="#64748B" style={{ flexShrink: 0 }} />
                <span>
                  <b>Modo Seguro Activado:</b> Los campos están protegidos contra cambios accidentales. Haz clic en <b>Desbloquear edición</b> arriba si necesitas reasignar o desvincular.
                </span>
              </div>
            )}

            {/* Form Error Alert */}
            {formError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991B1B',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Client Name */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Nombre del Cliente o Negocio *
                </label>
                <input
                  type="text"
                  required
                  disabled={isLocked}
                  placeholder="Ej. Kikis el Camarón, Valhalla Gym, Tahara Café"
                  className="hx-input"
                  style={{ opacity: isLocked ? 0.75 : 1, fontWeight: 700 }}
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>

              {/* Type Selector */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                  Objetivo del Soporte *
                </label>
                <select
                  disabled={isLocked}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="hx-input"
                  style={{ opacity: isLocked ? 0.75 : 1, fontWeight: 600 }}
                >
                  <option value="google_reviews">Reseñas de Google (Calificación 5 estrellas)</option>
                  <option value="instagram">Seguidores de Instagram</option>
                  <option value="whatsapp">WhatsApp Directo</option>
                  <option value="menu">Menú Digital / Carta</option>
                  <option value="website">Enlace Web Personalizado</option>
                </select>
              </div>

              {/* Smart Destination Fields */}
              {form.type === 'google_reviews' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/google-logo.png" alt="Google" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', margin: 0 }}>
                        Place ID de Google Maps *
                      </label>
                    </div>
                    <a
                      href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#0284C7',
                        textDecoration: 'none',
                        background: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                      title="Abrir buscador oficial de Place IDs de Google en nueva pestaña"
                    >
                      <span>Buscar Place ID</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>

                  <input
                    type="text"
                    required
                    disabled={isLocked}
                    placeholder="Ej. ChIJd34kTQD90YURJqg9LdnTMiA"
                    className="hx-input"
                    style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '13px', opacity: isLocked ? 0.75 : 1 }}
                    value={placeIdInput}
                    onChange={(e) => setPlaceIdInput(e.target.value)}
                  />

                  {cleanPlaceId(placeIdInput) && (
                    <div style={{ marginTop: '8px', padding: '10px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                          Enlace autogenerado:
                        </span>
                        <a
                          href={computedFinalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '11.5px', fontWeight: 700, color: '#B45309', textDecoration: 'none' }}
                        >
                          Probar enlace ↗
                        </a>
                      </div>
                      <code style={{ fontSize: '11.5px', color: '#78350F', wordBreak: 'break-all', display: 'block', fontWeight: 600 }}>
                        {computedFinalUrl}
                      </code>
                    </div>
                  )}
                </div>
              ) : form.type === 'instagram' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/instagram-logo.png" alt="Instagram" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', margin: 0 }}>
                        Usuario de Instagram *
                      </label>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9333EA', fontWeight: 600 }}>
                      Sin @ ni URLs largas
                    </span>
                  </div>

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: '#9CA3AF', fontWeight: 700, fontSize: '14px', pointerEvents: 'none' }}>
                      @
                    </span>
                    <input
                      type="text"
                      required
                      disabled={isLocked}
                      placeholder="Ej. kikiselcamaron"
                      className="hx-input"
                      style={{ paddingLeft: '28px', fontWeight: 600, opacity: isLocked ? 0.75 : 1 }}
                      value={instagramHandleInput}
                      onChange={(e) => setInstagramHandleInput(e.target.value)}
                    />
                  </div>

                  {cleanInstagramHandle(instagramHandleInput) && (
                    <div style={{ marginTop: '8px', padding: '10px 12px', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#7E22CE', textTransform: 'uppercase' }}>
                          Perfil que se abrirá:
                        </span>
                        <a
                          href={computedFinalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '11.5px', fontWeight: 700, color: '#9333EA', textDecoration: 'none' }}
                        >
                          Probar enlace ↗
                        </a>
                      </div>
                      <code style={{ fontSize: '11.5px', color: '#581C87', wordBreak: 'break-all', display: 'block', fontWeight: 600 }}>
                        {computedFinalUrl}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                    Enlace de Destino *
                  </label>
                  <input
                    type="url"
                    required
                    disabled={isLocked}
                    placeholder="https://..."
                    className="hx-input"
                    style={{ opacity: isLocked ? 0.75 : 1 }}
                    value={form.targetUrl}
                    onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                  />
                </div>
              )}

              {/* ── Nuevos Campos Clave: GPS y Foto de Evidencia ───────────── */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Field 1: Ubicación en texto o GPS */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color="#00C4CC" />
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', margin: 0 }}>
                        Ubicación o Sucursal (Texto o GPS)
                      </label>
                    </div>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={locatingGps}
                        style={{
                          background: '#ECFEFF',
                          border: '1px solid #A5F3FC',
                          color: '#0891B2',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Navigation size={11} />
                        <span>{locatingGps ? 'Obteniendo GPS...' : 'Usar mi GPS actual'}</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    disabled={isLocked}
                    placeholder="Ej. Roma Norte, Polanco, Condesa, Av. Insurgentes 450, etc."
                    className="hx-input"
                    style={{ opacity: isLocked ? 0.75 : 1, fontSize: '12.5px' }}
                    value={form.locationName}
                    onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      Escribe la colonia o calle. Se posicionará automáticamente en el Mapa.
                    </span>
                    {(form.latitude || form.longitude) && (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={11} /> Coordenadas listas
                      </span>
                    )}
                  </div>
                </div>

                {/* Field 2: Foto de Evidencia del Soporte */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                    <Camera size={13} color="#00C4CC" />
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', margin: 0 }}>
                      Foto del Soporte Instalado
                    </label>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />

                  {compressingPhoto ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '16px',
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        color: '#0284C7',
                        fontSize: '12.5px',
                        fontWeight: 600,
                      }}
                    >
                      <Loader2 className="animate-spin" size={16} />
                      <span>Optimizando y comprimiendo imagen en alta calidad...</span>
                    </div>
                  ) : form.photoUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '12px' }}>
                      <img
                        src={form.photoUrl}
                        alt="Evidencia"
                        style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #CBD5E1' }}
                      />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                          Foto de soporte cargada
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          Optimizada (~{Math.round((form.photoUrl.length * 3) / 4 / 1024)} KB). Se mostrará en el Pin del Mapa y avatar.
                        </span>
                      </div>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, photoUrl: '' }))}
                          style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '6px' }}
                          title="Quitar foto"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    !isLocked && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px dashed #CBD5E1',
                          borderRadius: '12px',
                          background: '#F8FAFC',
                          color: '#475569',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Camera size={16} color="#00C4CC" />
                        <span>Tomar foto con cámara o subir archivo</span>
                      </button>
                    )
                  )}
                </div>

              </div>

              {/* Active Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  disabled={isLocked}
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                  Tarjeta activada (responder inmediatamente al escanear)
                </label>
              </div>

              {/* Modal Action Buttons (Sticky on mobile scroll) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '14px',
                  borderTop: '1px solid #E2E8F0',
                  position: 'sticky',
                  bottom: '-28px',
                  background: '#FFFFFF',
                  paddingBottom: '8px',
                  zIndex: 10,
                  gap: '8px',
                }}
              >
                <div>
                  {!isLocked && editingCard && (
                    <button
                      type="button"
                      onClick={handleUnlinkCard}
                      disabled={unlinking || submitting}
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        color: '#DC2626',
                        borderRadius: '10px',
                        padding: '9px 14px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      title="Volver a poner la tarjeta en estado Disponible para vincular"
                    >
                      <Trash2 size={13} />
                      <span>{unlinking ? 'Desvinculando...' : 'Desvincular Tarjeta'}</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={closeModal} className="btn-secondary" disabled={submitting}>
                    {isLocked ? 'Cerrar' : 'Cancelar'}
                  </button>

                  {!isLocked && (
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Guardando...' : editingCard ? 'Actualizar Tarjeta' : 'Activar y Guardar'}
                    </button>
                  )}
                </div>
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

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
              {activeCardForQr.clientName || 'HummingX QR'}
            </h3>

            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
              Código vectorial de alta resolución listo para grabado láser o serigrafía en tarjetas físicas.
            </p>

            {qrModalDataUrl && (
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'inline-block',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  marginBottom: '20px',
                }}
              >
                <img
                  src={qrModalDataUrl}
                  alt={`QR ${activeCardForQr.code}`}
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              </div>
            )}

            <div
              style={{
                background: '#F9FAFB',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#6B7280',
                fontFamily: 'monospace',
                marginBottom: '20px',
                wordBreak: 'break-all',
              }}
            >
              https://hummingxbi.com/t/{activeCardForQr.code}
            </div>

            {/* Quick action buttons in modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => downloadQrSvg(activeCardForQr)}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00C4CC 0%, #0E7490 100%)',
                  fontWeight: 700,
                }}
              >
                <Download size={16} />
                <span>Descargar Código QR sin margen (.svg)</span>
              </button>

              <button
                onClick={() => downloadQrPng(activeCardForQr, qrModalDataUrl)}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                <Download size={15} />
                <span>Descargar Imagen PNG (.png)</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal de Presentación al Cliente (Soporte Vinculado) ─────────── */}
      {showCelebrationModal && celebratedCard && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 15, 25, 0.88)',
            backdropFilter: 'blur(16px)',
            padding: '20px',
            animation: 'hxFadeIn 0.3s ease-out',
          }}
        >
          {/* Confetti Explosion */}
          <Confetti
            recycle={false}
            numberOfPieces={300}
            gravity={0.16}
            colors={['#00C4CC', '#F59E0B', '#38BDF8', '#10B981', '#EC4899', '#8B5CF6']}
          />

          <div
            style={{
              maxWidth: '470px',
              width: '100%',
              background: '#0B0F19',
              border: '1.5px solid rgba(0, 196, 204, 0.45)',
              borderRadius: '24px',
              padding: '32px 26px',
              textAlign: 'center',
              boxShadow: '0 25px 60px -15px rgba(0, 196, 204, 0.35), 0 0 50px rgba(0, 0, 0, 0.8)',
              position: 'relative',
              animation: 'hxPopUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => { setShowCelebrationModal(false); setCelebratedCard(null); }}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {/* Lottie Trophy in continuous Celebratory LOOP */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 6px' }}>
              <Player
                autoplay
                loop={true}
                src={trophyAnimation}
                style={{ height: '140px', width: '140px' }}
              />
            </div>

            {/* Official Badge */}
            <div style={{ marginBottom: '14px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(0, 196, 204, 0.12)',
                  border: '1px solid rgba(0, 196, 204, 0.4)',
                  color: '#00C4CC',
                  padding: '5px 14px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                Soporte Físico Conectado
              </span>
            </div>

            {/* Presentation Card for Client */}
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '24px 20px',
                marginBottom: '22px',
                textAlign: 'center',
                boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
              }}
            >
              {/* Official Brand Logo (Google or Instagram) */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.9)',
                }}
              >
                <img
                  src={celebratedCard.type === 'instagram' ? '/instagram-logo.png' : '/google-logo.png'}
                  alt={celebratedCard.type}
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
              </div>

              {/* Client Business Name */}
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                }}
              >
                {celebratedCard.clientName}
              </h2>

              {/* Series & Live indicator */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94A3B8',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Soporte #{celebratedCard.code}
                </span>
                <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                  Conexión en vivo
                </span>
              </div>

              {/* Client-Facing Value Proposition */}
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#CBD5E1',
                  margin: 0,
                  lineHeight: 1.55,
                  fontWeight: 500,
                }}
              >
                {celebratedCard.type === 'google_reviews'
                  ? 'Tu soporte físico ya está activo. Cualquier cliente que acerque su celular o escanee el código irá directo a calificar tu negocio con 5 estrellas en Google.'
                  : celebratedCard.type === 'instagram'
                  ? 'Tu soporte físico ya está activo. Cualquier cliente que acerque su celular o escanee el código irá directo a seguir tu perfil oficial de Instagram.'
                  : 'Tu soporte físico HummingX está conectado y listo para recibir clientes en tiempo real.'}
              </p>

              {/* Photo Evidence Thumbnail if uploaded */}
              {celebratedCard.photoUrl && (
                <div style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={celebratedCard.photoUrl} alt="Soporte" style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }} />
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Foto de soporte registrada</span>
                </div>
              )}
            </div>

            {/* Action Buttons (Strictly Styled for High Contrast - No White-on-White) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Primary Demo Button */}
              <a
                href={celebratedCard.targetUrl || `https://hummingxbi.com/t/${celebratedCard.code}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  background: '#00C4CC',
                  color: '#0B0F19',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 196, 204, 0.4)',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'opacity 0.15s ease',
                }}
              >
                <span>Probar con mi celular ahora</span>
                <ExternalLink size={15} />
              </a>

              {/* Secondary Close Button (Crisp dark button with bright white text) */}
              <button
                type="button"
                onClick={() => { setShowCelebrationModal(false); setCelebratedCard(null); }}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                Listo, soporte configurado
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes hxSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes hxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hxPopUp {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </Layout>
  );
}
