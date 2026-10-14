import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Sparkles, 
  Star, 
  ExternalLink, 
  Lock, 
  Maximize2, 
  Compass, 
  Flame, 
  Camera, 
  Eye, 
  Layers,
  CheckCircle2
} from 'lucide-react';

// Default mock coordinates across CDMX neighborhoods for cards that don't have exact GPS saved yet
const CDMX_DEFAULT_COORDS = [
  { lat: 19.4195, lng: -99.1601, zone: 'Roma Norte, CDMX' },
  { lat: 19.4128, lng: -99.1712, zone: 'Condesa, CDMX' },
  { lat: 19.4326, lng: -99.1925, zone: 'Polanco, CDMX' },
  { lat: 19.3892, lng: -99.1754, zone: 'Nápoles, CDMX' },
  { lat: 19.3734, lng: -99.1627, zone: 'Del Valle, CDMX' },
  { lat: 19.3503, lng: -99.1622, zone: 'Coyoacán Centro, CDMX' },
  { lat: 19.4326, lng: -99.1332, zone: 'Centro Histórico, CDMX' },
  { lat: 19.3622, lng: -99.2625, zone: 'Santa Fe, CDMX' },
  { lat: 19.3142, lng: -99.1824, zone: 'San Ángel, CDMX' },
  { lat: 19.4385, lng: -99.1578, zone: 'San Rafael, CDMX' },
  { lat: 19.4001, lng: -99.1554, zone: 'Narvarte, CDMX' },
  { lat: 19.3375, lng: -99.1985, zone: 'Pedregal, CDMX' },
  { lat: 19.4452, lng: -99.1784, zone: 'Anzures, CDMX' },
  { lat: 19.3955, lng: -99.1685, zone: 'Benito Juárez, CDMX' },
  { lat: 19.4270, lng: -99.1677, zone: 'Juárez, CDMX' }
];

export default function NfcCardsMap({ cards = [], onCardClick = () => {} }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [filterType, setFilterType] = useState('all'); // 'all' | 'google_reviews' | 'instagram'
  const [selectedCard, setSelectedCard] = useState(null);
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'voyager'

  // Filter only active cards
  const activeCards = useMemo(() => {
    return cards.filter(c => c.active);
  }, [cards]);

  const totalCards = cards.length || 15;
  const activeCount = activeCards.length;
  const progressPct = Math.round((activeCount / totalCards) * 100);

  const googleCount = activeCards.filter(c => c.type === 'google_reviews').length;
  const instagramCount = activeCards.filter(c => c.type === 'instagram').length;

  const filteredCards = useMemo(() => {
    if (filterType === 'all') return activeCards;
    return activeCards.filter(c => c.type === filterType);
  }, [activeCards, filterType]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.4050, -99.1650], // Center of CDMX central zone
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected tile layer
    const tileUrl = mapTheme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Invalidate size after layout mounts
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep instance intact across renders unless unmounted
    };
  }, [mapTheme]);

  // Update Markers when cards or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    if (filteredCards.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredCards.forEach((card, index) => {
      // Determine lat/lng
      let lat = card.latitude;
      let lng = card.longitude;
      let isFallback = false;

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        isFallback = true;
        const codeNum = parseInt(card.code, 10) || 1;
        const fallback = CDMX_DEFAULT_COORDS[(codeNum - 1) % CDMX_DEFAULT_COORDS.length];
        lat = fallback.lat;
        lng = fallback.lng;
      }

      const isGoogle = card.type === 'google_reviews';
      const mainColor = isGoogle ? '#F59E0B' : '#EC4899';
      const secondaryColor = isGoogle ? '#B45309' : '#8B5CF6';
      const badgeIcon = isGoogle ? '⭐' : '📸';

      // Custom HTML Pin with glowing radar effect
      const pinHtml = `
        <div class="hx-map-marker" style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <!-- Pulsing Radar Ring -->
          <div style="
            position: absolute;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: ${mainColor};
            opacity: 0.35;
            animation: hxRadarPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>

          <!-- Outer Pin Bubble -->
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${mainColor} 0%, ${secondaryColor} 100%);
            box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 16px ${mainColor}88;
            border: 2.5px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #FFFFFF;
            font-weight: 800;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          ">
            <span>${badgeIcon}</span>
          </div>

          <!-- Serial number badge -->
          <div style="
            position: absolute;
            top: -6px;
            right: -4px;
            background: #0F172A;
            color: #38BDF8;
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 999px;
            padding: 1px 5px;
            font-size: 9px;
            font-family: monospace;
            font-weight: 800;
            letter-spacing: 0.04em;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">
            #${card.code}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'hx-div-icon',
        html: pinHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedCard({
          ...card,
          computedLat: lat,
          computedLng: lng,
          isFallback
        });
      });

      marker.addTo(layer);
      bounds.extend([lat, lng]);
    });

    if (filteredCards.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [filteredCards]);

  const handleCenterCdmx = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([19.4050, -99.1650], 12, { animate: true });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* ── Progress & Gamification Banner ─────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '20px 24px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 196, 204, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '18px' }}>🚀</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                Soportes HummingX Conquistando la Ciudad
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
              Red en tiempo real de códigos QR y chips NFC instalados en locales y negocios.
            </p>
          </div>

          {/* Metric Stats Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#FBBF24',
                fontSize: '12.5px',
                fontWeight: 700
              }}
            >
              <span>⭐</span>
              <span>{googleCount} Google Reviews</span>
            </div>

            <div
              style={{
                background: 'rgba(236, 72, 153, 0.12)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                borderRadius: '10px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#F472B6',
                fontSize: '12.5px',
                fontWeight: 700
              }}
            >
              <span>📸</span>
              <span>{instagramCount} Instagram</span>
            </div>

            <div
              style={{
                background: 'rgba(0, 196, 204, 0.15)',
                border: '1px solid rgba(0, 196, 204, 0.35)',
                borderRadius: '10px',
                padding: '6px 14px',
                color: '#00C4CC',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{activeCount} de {totalCards} activos</span>
              <span style={{ opacity: 0.6 }}>({progressPct}%)</span>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              height: '8px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.max(progressPct, 4)}%`,
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #00C4CC 0%, #38BDF8 50%, #818CF8 100%)',
                boxShadow: '0 0 12px rgba(0, 196, 204, 0.6)',
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Interactive Map Container ──────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
          background: '#0B0F19'
        }}
      >
        {/* Floating Top Controls Bar */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            pointerEvents: 'none'
          }}
        >
          {/* Filter Pills (Pointer events enabled on buttons) */}
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              gap: '4px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}
          >
            <button
              onClick={() => setFilterType('all')}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterType === 'all' ? '#00C4CC' : 'transparent',
                color: filterType === 'all' ? '#0B0F19' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              Todos ({activeCards.length})
            </button>
            <button
              onClick={() => setFilterType('google_reviews')}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterType === 'google_reviews' ? '#F59E0B' : 'transparent',
                color: filterType === 'google_reviews' ? '#0B0F19' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              ⭐ Google ({googleCount})
            </button>
            <button
              onClick={() => setFilterType('instagram')}
              style={{
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: filterType === 'instagram' ? '#EC4899' : 'transparent',
                color: filterType === 'instagram' ? '#FFFFFF' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
            >
              📸 Instagram ({instagramCount})
            </button>
          </div>

          {/* Quick Actions (Theme & Center) */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              gap: '8px'
            }}
          >
            <button
              onClick={() => setMapTheme(mapTheme === 'dark' ? 'voyager' : 'dark')}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '7px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}
              title="Alternar entre modo oscuro y vista clásica"
            >
              <Layers size={13} color="#38BDF8" />
              <span>{mapTheme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </button>

            <button
              onClick={handleCenterCdmx}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '7px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}
              title="Centrar mapa en CDMX"
            >
              <Compass size={13} color="#00C4CC" />
              <span>Centrar CDMX</span>
            </button>
          </div>
        </div>

        {/* Actual Map Canvas */}
        <div
          ref={mapContainerRef}
          style={{
            height: '560px',
            width: '100%',
            background: '#0B0F19'
          }}
        />

        {/* Empty state if 0 active cards */}
        {activeCards.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '28px 32px',
              textAlign: 'center',
              maxWidth: '360px',
              zIndex: 1000,
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(0, 196, 204, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: '#00C4CC'
              }}
            >
              <MapPin size={24} />
            </div>
            <h4 style={{ margin: '0 0 6px', color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>
              No hay tarjetas activas aún
            </h4>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '13px', lineHeight: 1.5 }}>
              Vincula una tarjeta en la pestaña "Inventario" con la opción ⚡ <b>Vincular en el Lugar</b> para verla reflejada aquí en el mapa con su foto y ubicación.
            </p>
          </div>
        )}

        {/* ── Selected Card Popover / Floating Detail Card ────────────── */}
        {selectedCard && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              maxWidth: '360px',
              width: 'calc(100% - 48px)',
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '18px',
              padding: '18px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              animation: 'hxSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header: Photo + Name + Close */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
              {/* Evidence photo or icon */}
              {selectedCard.photoUrl ? (
                <img
                  src={selectedCard.photoUrl}
                  alt={selectedCard.clientName}
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: '2px solid rgba(0, 196, 204, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    background: selectedCard.type === 'google_reviews' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                    border: `1.5px solid ${selectedCard.type === 'google_reviews' ? '#F59E0B' : '#EC4899'}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0
                  }}
                >
                  {selectedCard.type === 'google_reviews' ? '⭐' : '📸'}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '11px',
                      color: '#00C4CC',
                      background: 'rgba(0, 196, 204, 0.12)',
                      padding: '2px 6px',
                      borderRadius: '5px'
                    }}
                  >
                    #{selectedCard.code}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: selectedCard.type === 'google_reviews' ? '#FBBF24' : '#F472B6'
                    }}
                  >
                    {selectedCard.type === 'google_reviews' ? 'Google Reviews' : 'Instagram'}
                  </span>
                </div>

                <h4
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {selectedCard.clientName}
                </h4>

                <p
                  style={{
                    margin: '3px 0 0',
                    fontSize: '11.5px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <MapPin size={11} color="#38BDF8" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedCard.locationName || (selectedCard.isFallback ? 'CDMX (Ubicación referencial)' : 'Coordenadas GPS registradas')}
                  </span>
                </p>
              </div>

              {/* Close Popover button */}
              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Metric pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '8px 12px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame size={14} color="#F59E0B" />
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Impacto acumulado:</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8' }}>
                {selectedCard.scanCount || 0} escaneos
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedCard.targetUrl && (
                <a
                  href={selectedCard.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #00C4CC 0%, #0284C7 100%)',
                    color: '#0B0F19',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(0, 196, 204, 0.3)'
                  }}
                >
                  <span>Abrir destino</span>
                  <ExternalLink size={12} />
                </a>
              )}

              <button
                onClick={() => {
                  const card = selectedCard;
                  setSelectedCard(null);
                  onCardClick(card);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <Lock size={12} color="#94A3B8" />
                <span>Ver / Editar</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Embedded Radar Animation Keyframe */}
      <style>{`
        @keyframes hxRadarPulse {
          0% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @keyframes hxSlideUp {
          from {
            transform: translateY(12px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .hx-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
