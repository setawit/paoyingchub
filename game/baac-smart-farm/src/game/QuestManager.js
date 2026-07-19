// QuestManager — สร้าง/ติดตาม/รับรางวัลเควสต์ประจำรอบ
// แทนที่ quest panel แบบ hardcode เดิม ด้วยระบบเควสต์ที่คำนวณจาก state จริง

import { randomInt, clamp } from '../utils/helpers.js';
import { simulateTurn } from './Simulation.js';
import { calcDSCR } from './LoanEngine.js';

// นิยามเควสต์: progress(state, sim, dscr) -> ค่าปัจจุบัน, goal = เป้าหมาย, reward = รางวัล
export const QUEST_POOL = [
  {
    key: 'plant2',
    label: 'เลือกกิจกรรม ≥ 2 อย่าง',
    goal: 2,
    reward: { cash: 500 },
    progress: (s) => Object.keys(s.sel).length,
  },
  {
    key: 'income3000',
    label: 'วางแผนรายได้ ≥ 3,000฿/เดือน',
    goal: 3000,
    reward: { cash: 800 },
    progress: (s, sim) => Math.round(sim.income),
  },
  {
    key: 'dscr15',
    label: 'รักษา DSCR ≥ 1.50',
    goal: 150,
    reward: { score: 3 },
    progress: (s, sim, d) => (d >= 999 ? 150 : Math.round(d * 100)),
  },
  {
    key: 'area800',
    label: 'ใช้พื้นที่ ≥ 800 ตร.ม.',
    goal: 800,
    reward: { cash: 600 },
    progress: (s, sim) => Math.round(sim.area),
  },
  {
    key: 'nodebt',
    label: 'ไม่มียอดค้างสินเชื่อหมุนเวียน',
    goal: 1,
    reward: { score: 2 },
    progress: (s) => (s.wc ? 0 : 1),
  },
];

/** สุ่มเควสต์ 3-5 อย่างสำหรับรอบใหม่ */
export function generateDailyQuests(count = 3, rng = Math.random) {
  const pool = [...QUEST_POOL];
  const n = clamp(count, 3, 5);
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length);
    const def = pool.splice(idx, 1)[0];
    out.push({ key: def.key, label: def.label, goal: def.goal, progressValue: 0, done: false, claimed: false });
  }
  return out;
}

/** อัปเดตความคืบหน้าเควสต์จาก state ปัจจุบัน (idempotent) */
export function checkProgress(state) {
  const sim = simulateTurn(state);
  const d = calcDSCR(state, sim);
  for (const q of state.quests) {
    const def = QUEST_POOL.find((x) => x.key === q.key);
    if (!def) continue;
    q.progressValue = def.progress(state, sim, d);
    if (q.progressValue >= q.goal) q.done = true;
  }
  return state.quests;
}

/** รับรางวัลเควสต์ที่ทำสำเร็จแล้ว — คืน reward ที่ได้ หรือ null ถ้ารับไม่ได้ */
export function claimReward(state, key) {
  const q = state.quests.find((x) => x.key === key);
  if (!q || !q.done || q.claimed) return null;
  const def = QUEST_POOL.find((x) => x.key === key);
  q.claimed = true;
  if (def.reward.cash) state.cash += def.reward.cash;
  if (def.reward.score) state.score = clamp(state.score + def.reward.score, 0, 100);
  return def.reward;
}
