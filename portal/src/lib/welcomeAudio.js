// Música de bienvenida con fade-out real.
// En iOS/Safari `audio.volume` es de solo lectura (siempre 1), por eso el fade
// anterior no hacía nada en iPhone. Usamos Web Audio (GainNode), que sí funciona
// en todos los navegadores; si no está disponible, caemos al fade por volumen.
class WelcomeAudioController {
  constructor() {
    this.audio = null;
    this.ctx = null;
    this.gain = null;
    this.fadeTimer = null;
    this.stopTimer = null;
  }

  // Llamar dentro del gesto del usuario (click en "Activar Cuenta"): iOS solo
  // permite iniciar audio / AudioContext durante un toque real.
  prime() {
    this.ensureAudio();
    this.ensureGraph();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    // Desbloquea el elemento <audio> en iOS con un play/pause silencioso
    if (this.gain && this.ctx) this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.audio.muted = true;
    const p = this.audio.play();
    if (p && p.then) p.then(() => { if (!this.started) this.audio.pause(); }).catch(() => {});
  }

  ensureAudio() {
    if (!this.audio) {
      this.audio = new Audio('/Welcome.mp3');
      this.audio.loop = false;
      this.audio.preload = 'auto';
    }
  }

  ensureGraph() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      this.ctx = new Ctx();
      const source = this.ctx.createMediaElementSource(this.audio);
      this.gain = this.ctx.createGain();
      source.connect(this.gain).connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio no disponible, usando volumen:', e);
      this.ctx = null;
      this.gain = null;
    }
  }

  clearTimers() {
    if (this.fadeTimer) { clearInterval(this.fadeTimer); this.fadeTimer = null; }
    if (this.stopTimer) { clearTimeout(this.stopTimer); this.stopTimer = null; }
  }

  start() {
    this.clearTimers();
    this.ensureAudio(); // el grafo Web Audio solo se crea en prime() (dentro del gesto)
    this.started = true;
    this.audio.currentTime = 0;
    this.audio.muted = false;
    this.audio.volume = 1;
    if (this.gain && this.ctx) {
      this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gain.gain.setValueAtTime(1, this.ctx.currentTime);
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    }
    this.audio.play().catch((e) => console.warn('Welcome audio play prevented:', e));
  }

  stopImmediately() {
    this.clearTimers();
    this.started = false;
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  // Desvanece la música en `seconds` segundos y luego la detiene.
  startDashboardFadeOut(seconds = 4) {
    if (!this.audio || this.audio.paused) return;
    this.clearTimers();

    if (this.gain && this.ctx) {
      const now = this.ctx.currentTime;
      const g = this.gain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value || 1, now);
      // Curva tipo "ease-out" (más natural al oído que una línea recta)
      g.setTargetAtTime(0, now, seconds / 4);
    } else {
      // Respaldo: fade por volumen (~30 pasos por segundo)
      const steps = Math.max(1, Math.round(seconds * 30));
      let i = 0;
      const startVol = this.audio.volume;
      this.fadeTimer = setInterval(() => {
        i++;
        const t = i / steps;
        this.audio.volume = Math.max(0, startVol * Math.pow(1 - t, 2));
        if (i >= steps) { clearInterval(this.fadeTimer); this.fadeTimer = null; }
      }, 1000 / 30);
    }

    this.stopTimer = setTimeout(() => this.stopImmediately(), seconds * 1000 + 300);
  }
}

export const WelcomeAudio = new WelcomeAudioController();
