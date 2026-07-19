// Game — ตัวประสานหลัก ควบคุม lifecycle และเชื่อมทุกโมดูลผ่าน GameState
// เป็นคนเดียวที่เรียก TurnManager.executeTurn และสั่ง UI ให้ render

import { GameState, createInitialState } from './GameState.js';
import { executeTurn } from './TurnManager.js';
import { generateDailyQuests, checkProgress, claimReward } from './QuestManager.js';
import { saveGame, loadGame, deleteSave } from './SaveLoad.js';
import { getActivityById } from './Activities.js';
import { simulateTurn } from './Simulation.js';
import { TOTAL_AREA, MAX_LABOR } from './constants.js';
import { UIManager } from '../ui/UIManager.js';
import { Tutorial } from '../ui/Tutorial.js';
import { AudioManager } from '../audio/AudioManager.js';

const EVENT_CHANCE = 0.15; // โอกาสเกิดเหตุการณ์ต่อเดือน

export class Game {
  constructor({ root, overlay, modalEl }) {
    this.audio = new AudioManager();

    const saved = loadGame();
    this.gs = new GameState(saved || createInitialState());
    this.state = this.gs.get();
    this.audio.setMuted(!!this.state.muted);

    this.ui = new UIManager({
      root,
      overlay,
      modalEl,
      onAction: (a, d, e) => this.handle(a, d, e),
    });
    this.tutorial = new Tutorial(this.state, this.ui.modal);

    this.eventQueue = [];
    this.gameOverPending = false;

    // เมื่อ state เปลี่ยน -> re-render
    this.gs.subscribe((s) => this.ui.render(s));
  }

  init() {
    if (!this.state.quests || this.state.quests.length === 0) {
      this.state.quests = generateDailyQuests();
    }
    checkProgress(this.state);
    this.gs.emit(); // render ครั้งแรก

    if (this.tutorial.shouldRun()) this.tutorial.start();

    // เริ่ม BGM หลังการโต้ตอบครั้งแรก (นโยบาย autoplay ของเบราว์เซอร์)
    window.addEventListener('pointerdown', () => this.audio.playBGM(), { once: true });
  }

  /** อัปเดตความคืบหน้าเควสต์ + auto-save + แจ้ง UI ให้ re-render */
  commit() {
    checkProgress(this.state);
    saveGame(this.state);
    this.gs.emit();
  }

  handle(action, data) {
    // เสียงคลิกทั่วไป (ยกเว้นปุ่มปิด/เปิดเสียงจัดการเอง)
    if (action !== 'toggle-mute') this.audio.playSFX('click');

    switch (action) {
      case 'activities': this.ui.modal.showActivityModal(this.state); break;
      case 'loan': this.ui.modal.showLoanModal(this.state); break;
      case 'npc': this.ui.modal.showNPCDialog(data.npc); break;
      case 'close': this.ui.modal.close(); break;
      case 'toggle-mute': this.toggleMute(); break;
      case 'count': this.count(data.id, Number(data.delta)); break;
      case 'reset-sel':
        this.state.sel = {};
        this.commit();
        this.ui.modal.showActivityModal(this.state);
        break;
      case 'claim-quest': this.claim(data.key); break;
      case 'run': this.runTurn(); break;
      case 'tutorial-next': if (this.tutorial.next()) this.commit(); break;
      case 'event-next': this.showNextEventOrEnd(); break;
      case 'restart': this.restart(); break;
      default: break;
    }
  }

  count(id, delta) {
    const a = getActivityById(id);
    if (!a) return;
    const n = (this.state.sel[id] || 0) + delta;
    if (n < 0 || n > a.maxUnits) return;
    if (delta > 0) {
      const r = simulateTurn(this.state);
      if (r.area + a.area > TOTAL_AREA || r.labor + a.labor > MAX_LABOR) return;
    }
    if (n) this.state.sel[id] = n;
    else delete this.state.sel[id];
    this.commit();
    this.ui.modal.showActivityModal(this.state); // อัปเดตโมดัลที่เปิดอยู่
  }

  claim(key) {
    const reward = claimReward(this.state, key);
    if (reward) this.audio.playSFX('coin');
    this.commit();
  }

  toggleMute() {
    this.state.muted = !this.state.muted;
    this.audio.setMuted(this.state.muted);
    if (!this.state.muted) this.audio.playBGM();
    this.commit();
  }

  runTurn() {
    const result = executeTurn(this.state, { eventChance: EVENT_CHANCE });

    if (!result.ok) {
      this.audio.playSFX('warning');
      this._showBlocked(result);
      return;
    }

    this.audio.playSFX('coin');
    this.state.quests = generateDailyQuests(); // เควสต์ชุดใหม่สำหรับรอบถัดไป
    this.commit();

    this.eventQueue = [...(result.events || [])];
    this.gameOverPending = result.gameOver;
    this.showNextEventOrEnd();
  }

  showNextEventOrEnd() {
    if (this.eventQueue.length) {
      this.ui.modal.showEventPopup(this.eventQueue.shift());
    } else if (this.gameOverPending) {
      this.gameOverPending = false;
      this.audio.playSFX('warning');
      this.ui.modal.showGameOver();
    } else {
      this.ui.modal.close();
    }
  }

  _showBlocked(result) {
    if (result.reason === 'dscr-low') {
      this.ui.modal.showMessage('⚠️ DSCR ต่ำเกินไป', `DSCR = ${result.dscr.toFixed(2)} ต่ำกว่า 1.10 จึงยังอนุมัติสินเชื่อรอบนี้ไม่ได้ ลองเพิ่มรายได้หรือลดการกู้`);
    } else if (result.reason === 'capex-locked') {
      this.ui.modal.showMessage('🔒 ยังกู้ CapEx ไม่ได้', 'สินเชื่อลงทุน (เมล่อน) ต้องมีคะแนนเครดิต 70+ ก่อน');
    } else if (result.reason === 'errors') {
      this.ui.modal.showMessage('❌ วางแผนไม่สำเร็จ', (result.errors || []).join(', '));
    }
  }

  restart() {
    deleteSave();
    const fresh = createInitialState();
    fresh.tutorialDone = true; // ข้าม tutorial เมื่อกดเริ่มใหม่เอง
    fresh.quests = generateDailyQuests();
    this.gs.replace(fresh);
    this.state = this.gs.get();
    this.tutorial = new Tutorial(this.state, this.ui.modal);
    this.eventQueue = [];
    this.gameOverPending = false;
    saveGame(this.state);
    this.ui.modal.close();
  }
}
