// AudioManager — เล่นเสียงประกอบ
// ZIP ต้นฉบับไม่มีไฟล์เสียง จึง "สังเคราะห์" SFX ด้วย WebAudio เป็นค่าเริ่มต้น
// ถ้าผู้ใช้วางไฟล์จริงใน public/assets/audio/ (click.mp3, coin.mp3, warning.mp3, bgm.mp3)
// AudioManager จะโหลดไฟล์นั้นมาใช้แทนโดยอัตโนมัติ (graceful fallback — ไม่มีไฟล์ก็ไม่ error)

const SFX_FILES = { click: 'click.mp3', coin: 'coin.mp3', warning: 'warning.mp3' };

// พารามิเตอร์เสียงสังเคราะห์แต่ละชนิด
const BEEP = {
  click: { freq: 520, type: 'square', dur: 0.05, gain: 0.05 },
  coin: { freq: 880, type: 'triangle', dur: 0.14, gain: 0.06 },
  warning: { freq: 180, type: 'sawtooth', dur: 0.25, gain: 0.06 },
};

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgm = null;
    this.files = {}; // ชื่อ -> HTMLAudioElement (ถ้ามีไฟล์จริง)
    this._bgmFile = null;
    this._probeFiles();
  }

  _ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  // ลองโหลดไฟล์เสียงจริง ถ้ามีก็เก็บไว้ใช้แทนเสียงสังเคราะห์
  _probeFiles() {
    if (typeof Audio === 'undefined') return;
    for (const [name, file] of Object.entries(SFX_FILES)) {
      const a = new Audio(`assets/audio/${file}`);
      a.addEventListener('canplaythrough', () => { this.files[name] = a; }, { once: true });
      a.addEventListener('error', () => {}, { once: true }); // เงียบถ้าไม่มีไฟล์
    }
    const bgm = new Audio('assets/audio/bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.4;
    bgm.addEventListener('canplaythrough', () => { this._bgmFile = bgm; }, { once: true });
    bgm.addEventListener('error', () => {}, { once: true });
  }

  setMuted(m) {
    this.muted = m;
    if (m) this.stopBGM();
  }

  playSFX(name) {
    if (this.muted) return;
    if (this.files[name]) {
      const a = this.files[name].cloneNode();
      a.play().catch(() => {});
      return;
    }
    this._beep(name);
  }

  _beep(name) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const p = BEEP[name] || BEEP.click;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = p.freq;
    g.gain.value = p.gain;
    osc.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime;
    osc.start(t);
    if (name === 'coin') osc.frequency.setValueAtTime(1180, t + 0.07); // เสียงเหรียญ 2 โน้ต
    g.gain.exponentialRampToValueAtTime(0.0001, t + p.dur);
    osc.stop(t + p.dur);
  }

  playBGM() {
    if (this.muted || this.bgm) return;
    if (this._bgmFile) {
      this._bgmFile.play().catch(() => {});
      this.bgm = { file: this._bgmFile };
      return;
    }
    // BGM สังเคราะห์: drone เบา ๆ
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 110;
    g.gain.value = 0.012;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    this.bgm = { osc, g };
  }

  stopBGM() {
    if (!this.bgm) return;
    if (this.bgm.file) {
      this.bgm.file.pause();
    } else if (this.bgm.osc) {
      try { this.bgm.osc.stop(); } catch { /* ignore */ }
    }
    this.bgm = null;
  }
}
