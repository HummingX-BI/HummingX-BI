class WelcomeAudioController {
  constructor() {
    this.audio = new Audio('/Welcome.mp3');
    this.audio.loop = false;
    this.fadeInterval = null;
  }

  start() {
    this.audio.currentTime = 0;
    this.audio.volume = 1;
    this.audio.play().catch(e => console.warn('Welcome audio play prevented:', e));
  }

  stopImmediately() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  startDashboardFadeOut(seconds) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    const steps = 20;
    const intervalTime = (seconds * 1000) / steps;
    const volumeStep = this.audio.volume / steps;
    
    this.fadeInterval = setInterval(() => {
      if (this.audio.volume - volumeStep > 0) {
        this.audio.volume -= volumeStep;
      } else {
        this.audio.volume = 0;
        this.stopImmediately();
      }
    }, intervalTime);
  }
}

export const WelcomeAudio = new WelcomeAudioController();
