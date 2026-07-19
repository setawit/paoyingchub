// UIManager — ตัวกลางเชื่อม Game ↔ DOM
// render(state) สร้าง HTML หลักลง #app และ delegate การคลิก (data-action) กลับไปยัง Game

import { buildGame } from './Renderer.js';
import { ModalManager } from './ModalManager.js';

export class UIManager {
  constructor({ root, overlay, modalEl, onAction }) {
    this.root = root;
    this.modal = new ModalManager(overlay, modalEl, onAction);
    // event delegation: คลิกปุ่มใด ๆ ที่มี data-action -> เรียก onAction
    this.root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (el) onAction(el.dataset.action, el.dataset, e);
    });
  }

  render(state) {
    this.root.innerHTML = buildGame(state);
  }
}
