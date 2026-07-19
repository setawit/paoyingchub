// main.js — ทางเข้าแอปพลิเคชัน: bootstrap เกม
import './styles/main.css';
import { Game } from './game/Game.js';

const game = new Game({
  root: document.getElementById('app'),
  overlay: document.getElementById('overlay'),
  modalEl: document.getElementById('modal'),
});
game.init();

// เผื่อ debug ใน console
window.__game = game;
