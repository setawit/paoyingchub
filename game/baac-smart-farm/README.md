# 🌾 BAAC Smart Farm RPG — สถาปัตยกรรมโมดูล

เกมวางแผนการผลิตเกษตร + สินเชื่อ ธ.ก.ส. (นา 1 ไร่) — refactor จากไฟล์ HTML เดียว
ให้เป็นสถาปัตยกรรมโมดูล **ES Modules + Vite** เพื่อให้พัฒนา บำรุงรักษา และต่อยอดง่าย

> โปรเจกต์นี้อยู่ใต้ `game/` แยกอิสระจากเอกสาร blueprint ของ FarmPlan OS (FPOS)
> ที่อยู่ราก repository — ไม่เกี่ยวข้องกับโครง `/core /api /ui` ของ FPOS

## เริ่มพัฒนา

```bash
cd game/baac-smart-farm
npm install
npm run dev      # dev server + hot reload
npm run build    # สร้าง static bundle ที่ dist/
npm run preview  # เปิดดู bundle ที่ build แล้ว
npm test         # unit tests (Vitest)
```

> ต้องรันผ่าน dev/preview server หรือ static server (ES Modules เปิดผ่าน `file://` ตรง ๆ ไม่ได้)
> `npm run build` จะได้ `dist/` ที่ deploy เป็น static site ได้

## โครงสร้าง

```
src/
  main.js                 ทางเข้าแอป (bootstrap Game)
  game/
    Game.js               ตัวประสานหลัก (lifecycle + เชื่อมทุก manager)
    GameState.js          state กลาง (single source of truth) + observer
    constants.js          ค่าคงที่กติกา (พื้นที่/แรงงาน/ดอกเบี้ย ฯลฯ)
    Activities.js         แคตตาล็อก 14 กิจกรรมการผลิต
    LoanEngine.js         คำนวณสินเชื่อ WC/CapEx + DSCR (pure functions)
    Simulation.js         จำลองผลรวมของแผน (preview)
    TurnManager.js        ดำเนินการจบรอบ 4 เดือน (ดอกเบี้ย/หนี้/เหตุการณ์)
    Market.js             ราคาผลผลิตผันผวนต่อรอบ
    EventManager.js       สุ่มเหตุการณ์ (ฝนแล้ง/ราคาพุ่ง/โรค/ช่วยเหลือรัฐ)
    QuestManager.js       เควสต์ประจำรอบ + รางวัล
    SaveLoad.js           บันทึก/โหลดผ่าน localStorage
  ui/
    UIManager.js          bridge Game ↔ DOM (event delegation ผ่าน data-action)
    Renderer.js           สร้าง HTML หลัก (sidebar/HUD/viewport/summary)
    HUD.js                แถบสถานะบน
    FarmMap.js            แปลงฟาร์ม isometric + panel ภารกิจ
    ModalManager.js       จัดการ modal ทั้งหมด
    Tutorial.js           สอนเล่นทีละขั้น (เล่นครั้งแรก)
  audio/
    AudioManager.js       เสียง SFX/BGM (สังเคราะห์ WebAudio + fallback ไฟล์จริง)
  utils/helpers.js        formatMoney, randomInt, clamp ฯลฯ
  styles/main.css         CSS หลัก
tests/                    unit tests (LoanEngine, Simulation, Market, TurnManager)
```

## หลักสถาปัตยกรรม

- **Single source of truth** — ทุกโมดูลอ่าน/เขียนผ่าน `GameState` ก้อนเดียว
- **Observer** — UI สมัครรับผ่าน `gameState.subscribe()` แล้ว re-render อัตโนมัติเมื่อ state เปลี่ยน
- **Event delegation** — ปุ่มใช้ `data-action` แทน inline `onclick` (รองรับ ES Modules)
- **Pure calc modules** — `LoanEngine`/`Simulation` ไม่มี state ภายใน ทดสอบง่าย
- **รักษาสมดุลเกมเดิม** — สูตรทั้งหมด (DSCR, ดอกเบี้ย 7%, WC/CapEx, เครดิตสกอร์)
  ยกมาจากเกมต้นฉบับ มี unit test regression เทียบผลแบบ 1:1

## เสียง

ต้นฉบับไม่มีไฟล์เสียง เกมจึง **สังเคราะห์ SFX ด้วย WebAudio** (คลิก/เหรียญ/เตือน)
หากต้องการเสียงจริง วางไฟล์ที่ `public/assets/audio/` ชื่อ
`click.mp3`, `coin.mp3`, `warning.mp3`, `bgm.mp3` แล้ว `AudioManager`
จะโหลดมาใช้แทนโดยอัตโนมัติ (ไม่มีไฟล์ก็เล่นเสียงสังเคราะห์ต่อได้)
