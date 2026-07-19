// Tutorial — ระบบสอนเล่นทีละขั้น (เล่นครั้งแรกที่ยังไม่มีเซฟ)

export const TUTORIAL_STEPS = [
  { title: 'ยินดีต้อนรับ 👨‍🌾', body: 'นี่คือฟาร์มนา 1 ไร่ของคุณ เป้าหมายคือวางแผนการผลิตให้มีรายได้มั่นคงและกู้เงินอย่างปลอดภัย' },
  { title: 'มิเตอร์ DSCR 📊', body: 'แถบขวาคือมิเตอร์ DSCR บอกว่ารายได้รองรับหนี้ได้แค่ไหน — 🟢 เขียว = สบาย, 🟡 เหลือง = ตึง, 🔴 แดง = เสี่ยง' },
  { title: 'เลือกกิจกรรม 🌱', body: 'กดปุ่มด้านล่างหรือแปลงนาเพื่อเลือกกิจกรรมการผลิต ระวังพื้นที่และแรงงานไม่ให้เกินโควตา' },
  { title: 'ภารกิจ & ตลาด 📋', body: 'ทำภารกิจรอบนี้เพื่อรับเงิน/เครดิต และดูราคาตลาดที่ผันผวนในการ์ดแต่ละกิจกรรม' },
  { title: 'จบรอบ ⚡', body: 'เมื่อพอใจแล้วกด "จบรอบ" ระบบจะจำลอง 4 เดือน คิดดอกเบี้ย สุ่มเหตุการณ์ และอัปเดตเครดิตสกอร์' },
];

export class Tutorial {
  constructor(state, modal) {
    this.state = state;
    this.modal = modal;
  }

  shouldRun() {
    return !this.state.tutorialDone;
  }

  start() {
    this.state.tutorialStep = 0;
    this._show();
  }

  _show() {
    const step = TUTORIAL_STEPS[this.state.tutorialStep];
    if (!step) return this.finish();
    const last = this.state.tutorialStep === TUTORIAL_STEPS.length - 1;
    this.modal.showTutorialStep(step, this.state.tutorialStep + 1, TUTORIAL_STEPS.length, last);
    return true;
  }

  /** ไปขั้นถัดไป — คืน true ถ้าจบ tutorial แล้ว */
  next() {
    this.state.tutorialStep++;
    if (this.state.tutorialStep >= TUTORIAL_STEPS.length) {
      this.finish();
      return true;
    }
    this._show();
    return false;
  }

  finish() {
    this.state.tutorialDone = true;
    this.modal.close();
  }
}
