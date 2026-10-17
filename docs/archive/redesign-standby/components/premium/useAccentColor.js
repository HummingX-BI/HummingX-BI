import { useState, useEffect } from 'react';

const FALLBACK_COLOR = '#00C4CC';

function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function useAccentColor(logoUrl) {
  const [accent, setAccent] = useState(FALLBACK_COLOR);

  useEffect(() => {
    if (!logoUrl) {
      setAccent(FALLBACK_COLOR);
      applyColor(FALLBACK_COLOR);
      return;
    }

    const cacheKey = `hx_accent_${logoUrl}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached && /^#[0-9A-Fa-f]{6}$/.test(cached)) {
        setAccent(cached);
        applyColor(cached);
        return;
      }
    } catch (_) {}

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 32, 32);
        const { data } = ctx.getImageData(0, 0, 32, 32);

        const colorScores = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Discard transparent pixels
          if (a < 128) continue;

          // Discard near-white and near-black
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lightness = (max + min) / 510;

          if (lightness > 0.88 || lightness < 0.12) continue;

          // Saturation
          const saturation = max === 0 ? 0 : delta / max;
          if (saturation < 0.25) continue;

          // Score: high saturation and moderate lightness
          const score = saturation * (1 - Math.abs(lightness - 0.5));
          colorScores.push({ r, g, b, score });
        }

        if (colorScores.length === 0) {
          setAccent(FALLBACK_COLOR);
          applyColor(FALLBACK_COLOR);
          return;
        }

        colorScores.sort((a, b) => b.score - a.score);
        let best = colorScores[0];

        // Ensure minimum contrast against dark background (#0B0B0E)
        let lum = getLuminance(best.r, best.g, best.b);
        if (lum < 0.18) {
          // Brighten up to guarantee AA contrast
          const factor = 1.35;
          best.r = Math.min(255, Math.round(best.r * factor));
          best.g = Math.min(255, Math.round(best.g * factor));
          best.b = Math.min(255, Math.round(best.b * factor));
        }

        const hex = rgbToHex(best.r, best.g, best.b);
        try {
          localStorage.setItem(cacheKey, hex);
        } catch (_) {}

        setAccent(hex);
        applyColor(hex);
      } catch (err) {
        // Fallback on CORS or canvas errors
        setAccent(FALLBACK_COLOR);
        applyColor(FALLBACK_COLOR);
      }
    };

    img.onerror = () => {
      setAccent(FALLBACK_COLOR);
      applyColor(FALLBACK_COLOR);
    };
  }, [logoUrl]);

  function applyColor(hex) {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--px-accent', hex);
      const rgb = hexToRgb(hex);
      document.documentElement.style.setProperty('--px-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }

  return accent;
}
