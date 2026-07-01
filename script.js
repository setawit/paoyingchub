const chapters = [
  { id: 'home', title: 'หน้าหลัก', file: null, part: null },
  { id: 'ch01', title: 'บท 1: เพลงคือหน้าที่ ไม่ใช่รสนิยม', file: 'chapters/part1/ch01.md', part: 'ภาค 1 — คิดแบบคนทำเพลง' },
  { id: 'ch02', title: 'บท 2: แผนที่อารมณ์ของงาน', file: 'chapters/part1/ch02.md', part: 'ภาค 1 — คิดแบบคนทำเพลง' },
  { id: 'ch03', title: 'บท 3: มนุษย์ + AI ทำงานด้วยกันยังไง', file: 'chapters/part1/ch03.md', part: 'ภาค 1 — คิดแบบคนทำเพลง' },
  { id: 'ch04', title: 'บท 4: STEP 1 หาโจทย์', file: 'chapters/part2/ch04.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch05', title: 'บท 5: STEP 2 เลือกแนวและมุมเล่า', file: 'chapters/part2/ch05.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch06', title: 'บท 6: STEP 2.5 จังหวะ อารมณ์ และพลังงาน', file: 'chapters/part2/ch06.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch07', title: 'บท 7: STEP 3 เขียนเนื้อให้คนร้องได้', file: 'chapters/part2/ch07.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch08', title: 'บท 8: STEP 4 เขียน Prompt แบบโปรดิวเซอร์', file: 'chapters/part2/ch08.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch09', title: 'บท 9: STEP 5-6 สร้าง คัด เลือก', file: 'chapters/part2/ch09.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch10', title: 'บท 10: STEP 7 นำไปใช้และทำให้พร้อมเวที', file: 'chapters/part2/ch10.md', part: 'ภาค 2 — กระบวนการ 7 ขั้น' },
  { id: 'ch11', title: 'บท 11: เมื่อไหร่ต้องเรียกนักดนตรีจริง', file: 'chapters/part3/ch11.md', part: 'ภาค 3 — ยกระดับสู่งานมืออาชีพ' },
  { id: 'ch12', title: 'บท 12: การกำกับเสียงร้องและอารมณ์', file: 'chapters/part3/ch12.md', part: 'ภาค 3 — ยกระดับสู่งานมืออาชีพ' },
  { id: 'ch13', title: 'บท 13: กรณีศึกษาฉบับเต็ม 3 งาน', file: 'chapters/part3/ch13.md', part: 'ภาค 3 — ยกระดับสู่งานมืออาชีพ' },
  { id: 'ch14', title: 'บท 14: คลังเครื่องมือ', file: 'chapters/part3/ch14.md', part: 'ภาค 3 — ยกระดับสู่งานมืออาชีพ' },
  { id: 'glossary', title: 'คำศัพท์โปรดิวเซอร์', file: 'appendix/glossary.md', part: 'ภาคผนวก' },
  { id: 'suno-rights', title: 'Checklist สิทธิ์ Suno 2026', file: 'appendix/suno-rights.md', part: 'ภาคผนวก' },
  { id: 'eval-form', title: 'แบบฟอร์มประเมินเพลง', file: 'appendix/eval-form.md', part: 'ภาคผนวก' },
];

let currentId = 'home';

function buildSidebar() {
  const sidebar = document.getElementById('sidebar');
  const logo = document.getElementById('sidebar-logo');

  let lastPart = null;
  chapters.forEach(ch => {
    if (ch.id === 'home') return;
    if (ch.part !== lastPart) {
      lastPart = ch.part;
      const sec = document.createElement('div');
      sec.className = 'sidebar-section';
      sec.textContent = ch.part;
      sidebar.appendChild(sec);
    }
    const item = document.createElement('div');
    item.className = 'sidebar-item';
    item.id = 'nav-' + ch.id;
    item.textContent = ch.title.replace(/บท \d+(\.\d+)?: /, '').replace(/STEP \d+(\.\d+)? /, '');
    item.addEventListener('click', () => navigate(ch.id));
    sidebar.appendChild(item);
  });
}

async function navigate(id) {
  currentId = id;

  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');

  document.getElementById('sidebar').classList.remove('open');

  if (id === 'home') {
    showHome();
    return;
  }

  const ch = chapters.find(c => c.id === id);
  if (!ch || !ch.file) return;

  document.getElementById('chapter-title').textContent = ch.title;
  document.getElementById('home').style.display = 'none';
  document.getElementById('content').style.display = 'block';

  document.getElementById('content').innerHTML = '<p style="color:#999;padding:2rem 0">กำลังโหลด...</p>';

  try {
    const res = await fetch(ch.file);
    const md = await res.text();
    document.getElementById('content').innerHTML = marked.parse(md);
    addNavButtons(id);
  } catch (e) {
    document.getElementById('content').innerHTML = '<p style="color:red">ไม่สามารถโหลดบทนี้ได้</p>';
  }

  window.scrollTo(0, 0);
}

function showHome() {
  document.getElementById('chapter-title').textContent = 'ตำราแต่งเพลงด้วย AI';
  document.getElementById('home').style.display = 'block';
  document.getElementById('content').style.display = 'none';
  window.scrollTo(0, 0);
}

function addNavButtons(currentId) {
  const idx = chapters.findIndex(c => c.id === currentId);
  const prev = idx > 1 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const div = document.createElement('div');
  div.id = 'nav-buttons';
  div.style.cssText = 'display:flex;justify-content:space-between;margin-top:4rem;padding-top:2rem;border-top:1px solid #e5e7eb;';

  if (prev) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn secondary';
    btn.textContent = '← ' + prev.title.split(':')[0];
    btn.addEventListener('click', () => navigate(prev.id));
    div.appendChild(btn);
  } else {
    div.appendChild(document.createElement('span'));
  }

  if (next) {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.textContent = next.title.split(':')[0] + ' →';
    btn.addEventListener('click', () => navigate(next.id));
    div.appendChild(btn);
  }

  document.getElementById('content').appendChild(div);
}

function buildTOC() {
  const toc = document.getElementById('toc');
  let lastPart = null;
  let partDiv = null;

  chapters.filter(c => c.id !== 'home').forEach(ch => {
    if (ch.part !== lastPart) {
      lastPart = ch.part;
      partDiv = document.createElement('div');
      partDiv.className = 'toc-part';
      const title = document.createElement('div');
      title.className = 'toc-part-title';
      title.textContent = ch.part;
      partDiv.appendChild(title);
      toc.appendChild(partDiv);
    }

    const item = document.createElement('div');
    item.className = 'toc-item';
    item.innerHTML = `<span class="toc-num">${ch.id.replace('ch', 'บท ').replace('glossary','ผ.1').replace('suno-rights','ผ.2').replace('eval-form','ผ.3')}</span><span class="toc-name">${ch.title.replace(/บท \d+(\.\d+)?: /, '').replace(/^STEP/, 'STEP')}</span>`;
    item.addEventListener('click', () => navigate(ch.id));
    partDiv.appendChild(item);
  });
}

document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

buildSidebar();
buildTOC();
navigate('home');
