'use strict';

// ===== Navigation =====
function goToSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('section-' + id).classList.add('active');
    document.querySelector(`[data-section="${id}"]`).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => goToSection(item.dataset.section));
});

// Set today's date as default
document.getElementById('analysisDate').valueAsDate = new Date();

// ===== Lens 1: Business =====
function saveLens1() {
    const position = document.querySelector('input[name="l1_position"]:checked')?.value;
    const concentration = document.querySelector('input[name="l1_concentration"]:checked')?.value;
    const supplier = document.querySelector('input[name="l1_supplier"]:checked')?.value;

    let score = 0;
    let issues = [];

    if (position === 'leader') score += 2;
    else if (position === 'mid') score += 1;
    else if (position === 'follower') issues.push('ไม่มีอำนาจต่อรองตลาด');

    if (concentration === 'low') score += 2;
    else if (concentration === 'mid') { score += 1; issues.push('Concentration Risk ปานกลาง'); }
    else if (concentration === 'high') issues.push('Concentration Risk สูง — ลูกค้ารายเดียวเกิน 50%');

    if (supplier === 'low') score += 2;
    else if (supplier === 'mid') score += 1;
    else if (supplier === 'high') issues.push('ซัพพลายเออร์ผูกขาดรายเดียว');

    renderStatus('lens1', score, 6, issues);
    updateNavBadge('badge-lens1', score, 6);
}

// ===== Lens 2: Financial =====
function calcTrend() {
    calcSingleTrend('rev_y2', 'rev_y1', 'rev_y0', 'rev_trend');
    calcSingleTrend('profit_y2', 'profit_y1', 'profit_y0', 'profit_trend');
    calcSingleTrend('ar_y2', 'ar_y1', 'ar_y0', 'ar_trend');

    // AR vs Revenue alert
    const rev0 = parseFloat(document.getElementById('rev_y0').value) || 0;
    const ar0  = parseFloat(document.getElementById('ar_y0').value)  || 0;
    const rev1 = parseFloat(document.getElementById('rev_y1').value) || 0;
    const ar1  = parseFloat(document.getElementById('ar_y1').value)  || 0;
    const alertEl = document.getElementById('ar_alert');

    if (rev0 > 0 && ar0 > 0 && rev1 > 0 && ar1 > 0) {
        const arRatio0 = ar0 / rev0;
        const arRatio1 = ar1 / rev1;
        if (arRatio0 > arRatio1 * 1.15) {
            alertEl.className = 'alert-box warning';
            alertEl.innerHTML = '⚠️ <strong>AR Warning:</strong> สัดส่วนลูกหนี้/ยอดขายปีล่าสุดสูงกว่าปีก่อนมากกว่า 15% — ยอดขายอาจโตเพราะลูกหนี้ค้างจ่าย (AR บวม) ควรตรวจสอบเพิ่มเติม';
            alertEl.style.display = '';
        } else {
            alertEl.style.display = 'none';
        }
    }
}

function calcSingleTrend(y2Id, y1Id, y0Id, trendId) {
    const y2 = parseFloat(document.getElementById(y2Id).value);
    const y1 = parseFloat(document.getElementById(y1Id).value);
    const y0 = parseFloat(document.getElementById(y0Id).value);
    const el = document.getElementById(trendId);

    if (!isNaN(y2) && !isNaN(y1) && !isNaN(y0) && y2 !== 0) {
        const cagr = ((y0 / y2) ** (1/2) - 1) * 100;
        const arrow = cagr > 2 ? '↑' : cagr < -2 ? '↓' : '→';
        el.innerHTML = `<span class="${cagr > 2 ? 'trend-up' : cagr < -2 ? 'trend-down' : 'trend-flat'}">${arrow} ${cagr.toFixed(1)}%</span>`;
    } else {
        el.textContent = '-';
    }
}

function calcDE() {
    const debt   = parseFloat(document.getElementById('l2_debt').value)   || 0;
    const equity = parseFloat(document.getElementById('l2_equity').value) || 0;
    const el = document.getElementById('de_ratio');

    if (equity > 0) {
        const de = debt / equity;
        el.textContent = de.toFixed(2) + 'x';
        const bench = parseFloat(document.getElementById('l2_de_bench').value) || 0;
        if (bench > 0) {
            el.style.color = de > bench ? '#9b2c2c' : '#276749';
        }
    } else if (equity < 0) {
        el.textContent = 'ทุนติดลบ ⚠️';
        el.style.color = '#9b2c2c';
    } else {
        el.textContent = '-';
    }
}

function saveLens2() {
    const profitQ = document.querySelector('input[name="l2_profit_q"]:checked')?.value;
    const rev0    = parseFloat(document.getElementById('rev_y0').value)   || 0;
    const rev1    = parseFloat(document.getElementById('rev_y1').value)   || 0;
    const debt    = parseFloat(document.getElementById('l2_debt').value)  || 0;
    const equity  = parseFloat(document.getElementById('l2_equity').value) || 0;
    const bench   = parseFloat(document.getElementById('l2_de_bench').value) || 0;

    let score = 0;
    let issues = [];

    if (rev0 > rev1) score += 2; else { score += 0; issues.push('ยอดขายลดลงหรือทรงตัว'); }
    if (profitQ === 'core') score += 2;
    else if (profitQ === 'mixed') { score += 1; issues.push('กำไรบางส่วนจาก One-time gain'); }
    else if (profitQ === 'oneoff') issues.push('กำไรส่วนใหญ่มาจาก One-time gain');

    if (equity > 0 && bench > 0) {
        const de = debt / equity;
        if (de <= bench) score += 2;
        else issues.push(`D/E ${de.toFixed(2)}x เกินเกณฑ์ ${bench}x`);
    }

    renderStatus('lens2', score, 6, issues);
    updateNavBadge('badge-lens2', score, 6);
}

// ===== Lens 3: Cashflow =====
function calcDSCR() {
    const ebitda    = parseFloat(document.getElementById('ebitda').value)            || 0;
    const principal = parseFloat(document.getElementById('annual_principal').value)  || 0;
    const interest  = parseFloat(document.getElementById('annual_interest').value)   || 0;
    const debtSvc   = principal + interest;

    if (debtSvc > 0) {
        const dscr = ebitda / debtSvc;
        renderDSCRCard('dscr_base_val', 'dscr_base_val', 'dscr_base_status', 'dscr-base', dscr);

        // Revenue-based stress: reduce EBITDA proportionally
        const rev0 = parseFloat(document.getElementById('rev_y0').value) || 0;
        if (rev0 > 0) {
            const rev1stress = rev0 * 0.9;
            const rev2stress = rev0 * 0.8;
            const ebitdaMargin = ebitda / rev0;
            renderDSCRCard('dscr_10_val', 'dscr_10_val', 'dscr_10_status', 'dscr-stress10', (rev1stress * ebitdaMargin) / debtSvc);
            renderDSCRCard('dscr_20_val', 'dscr_20_val', 'dscr_20_status', 'dscr-stress20', (rev2stress * ebitdaMargin) / debtSvc);
        } else {
            // Simple stress: reduce EBITDA directly
            renderDSCRCard('dscr_10_val', 'dscr_10_val', 'dscr_10_status', 'dscr-stress10', (ebitda * 0.9) / debtSvc);
            renderDSCRCard('dscr_20_val', 'dscr_20_val', 'dscr_20_status', 'dscr-stress20', (ebitda * 0.8) / debtSvc);
        }
    } else {
        ['dscr_base_val','dscr_10_val','dscr_20_val'].forEach(id => {
            document.getElementById(id).textContent = '-';
        });
        ['dscr_base_status','dscr_10_status','dscr_20_status'].forEach(id => {
            document.getElementById(id).textContent = '';
        });
        ['dscr-base','dscr-stress10','dscr-stress20'].forEach(id => {
            document.getElementById(id).className = 'dscr-card';
        });
    }
    calcRateStress();
}

function renderDSCRCard(valId, _v, statusId, cardId, dscr) {
    const valEl    = document.getElementById(valId);
    const statusEl = document.getElementById(statusId);
    const cardEl   = document.getElementById(cardId);

    valEl.textContent = dscr.toFixed(2) + 'x';

    if (dscr >= 1.5) {
        cardEl.className = 'dscr-card good';
        statusEl.textContent = '✅ ดีมาก';
    } else if (dscr >= 1.2) {
        cardEl.className = 'dscr-card warn';
        statusEl.textContent = '⚠️ ผ่าน (ระวัง)';
    } else {
        cardEl.className = 'dscr-card fail';
        statusEl.textContent = '❌ ' + (dscr < 1 ? 'ไม่ผ่าน' : 'ต่ำมาก');
    }
}

function calcRateStress() {
    const principal  = parseFloat(document.getElementById('annual_principal').value) || 0;
    const interest   = parseFloat(document.getElementById('annual_interest').value)  || 0;
    const ebitda     = parseFloat(document.getElementById('ebitda').value)           || 0;
    const rate       = parseFloat(document.getElementById('rate_current').value)     || 0;
    const loanAmount = parseFloat(document.getElementById('loanAmount')?.value)      || 0;
    const el         = document.getElementById('dscr_rate_stress');

    if (interest > 0 && ebitda > 0 && rate > 0) {
        const newInterest = interest * (1 + 2 / rate);
        const newDebtSvc  = principal + newInterest;
        const dscr        = ebitda / newDebtSvc;
        el.textContent    = dscr.toFixed(2) + 'x';
        el.style.color    = dscr >= 1.2 ? '#276749' : dscr >= 1 ? '#c05621' : '#9b2c2c';
    } else {
        el.textContent = '-';
        el.style.color = '';
    }
}

function saveLens3() {
    const ebitda    = parseFloat(document.getElementById('ebitda').value)           || 0;
    const principal = parseFloat(document.getElementById('annual_principal').value) || 0;
    const interest  = parseFloat(document.getElementById('annual_interest').value)  || 0;
    const ocf       = parseFloat(document.getElementById('ocf').value);
    const debtSvc   = principal + interest;
    let score = 0;
    let issues = [];

    if (debtSvc > 0) {
        const dscr = ebitda / debtSvc;
        if (dscr >= 1.5)       score += 3;
        else if (dscr >= 1.2)  score += 2;
        else if (dscr >= 1.0)  { score += 1; issues.push(`DSCR ${dscr.toFixed(2)}x ต่ำ ควรระวัง`); }
        else                   issues.push(`DSCR ${dscr.toFixed(2)}x < 1 ไม่สามารถชำระหนี้ได้`);
    }

    if (!isNaN(ocf)) {
        if (ocf > 0) score += 2;
        else         issues.push('OCF ติดลบ — อันตราย');
    }

    renderStatus('lens3', score, 5, issues);
    updateNavBadge('badge-lens3', score, 5);
}

// ===== Lens 4: Collateral =====
function calcLTV() {
    const val     = parseFloat(document.getElementById('l4_collateral_val').value) || 0;
    const ltvPct  = parseFloat(document.getElementById('l4_ltv_allowed').value)    || 0;
    const el      = document.getElementById('ltv_max_loan');
    const loanAmt = parseFloat(document.getElementById('loanAmount')?.value)       || 0;

    if (val > 0 && ltvPct > 0) {
        const maxLoan = val * (ltvPct / 100);
        el.textContent = maxLoan.toFixed(2) + ' ล้านบาท';
        if (loanAmt > 0) {
            el.style.color = maxLoan >= loanAmt ? '#276749' : '#9b2c2c';
            if (maxLoan < loanAmt) {
                el.textContent += ` ⚠️ (ขาด ${(loanAmt - maxLoan).toFixed(2)} ล้าน)`;
            }
        }
    } else {
        el.textContent = '-';
        el.style.color = '';
    }
}

function saveLens4() {
    const ltv    = parseFloat(document.getElementById('l4_ltv_allowed').value)    || 0;
    const val    = parseFloat(document.getElementById('l4_collateral_val').value) || 0;
    const loan   = parseFloat(document.getElementById('loanAmount')?.value)       || 0;
    const liquid = document.querySelector('input[name="l4_liquidity"]:checked')?.value;
    const ltlOk  = document.getElementById('l4_ltl_ok').value;
    const wcOk   = document.getElementById('l4_wc_ok').value;

    let score = 0;
    let issues = [];

    if (val > 0 && ltv > 0 && loan > 0) {
        if (val * (ltv/100) >= loan) score += 2;
        else issues.push('มูลค่าหลักประกันไม่เพียงพอ (LTV ต่ำกว่าวงเงิน)');
    }

    if (liquid === 'high') score += 2;
    else if (liquid === 'mid') { score += 1; }
    else if (liquid === 'low') issues.push('หลักประกันสภาพคล่องต่ำ ขายยาก');

    if (ltlOk === 'ok') score += 1;
    else if (ltlOk === 'issue') issues.push('โครงสร้าง LTL ไม่ถูกต้อง');

    if (wcOk === 'ok') score += 1;
    else if (wcOk === 'issue') issues.push('โครงสร้าง Working Capital ไม่ถูกต้อง');

    renderStatus('lens4', score, 6, issues);
    updateNavBadge('badge-lens4', score, 6);
}

// ===== Lens 5: Conditions =====
function addCovenant() {
    const list = document.getElementById('covenant-list');
    const div = document.createElement('div');
    div.className = 'covenant-item';
    div.innerHTML = `<input type="text" class="covenant-input" placeholder="ระบุเงื่อนไข / Covenant...">
                     <button class="btn-del-covenant" onclick="removeCovenant(this)">✕</button>`;
    list.appendChild(div);
}

function removeCovenant(btn) {
    btn.closest('.covenant-item').remove();
}

function saveLens5() {
    const exp = document.querySelector('input[name="l5_exp"]:checked')?.value;
    const de  = document.querySelector('input[name="l5_de"]:checked')?.value;
    const ncb = document.querySelector('input[name="l5_ncb"]:checked')?.value;

    let score = 0;
    let issues = [];

    const mapScore = (val, label) => {
        if (val === 'pass') { score += 2; }
        else if (val === 'warn') { score += 1; issues.push(`${label}: ต้องระวัง`); }
        else if (val === 'fail') { issues.push(`${label}: ไม่ผ่านเกณฑ์`); }
    };

    mapScore(exp, 'ประสบการณ์');
    mapScore(de,  'D/E Ratio');
    mapScore(ncb, 'ประวัติเครดิต');

    const covenants = document.querySelectorAll('.covenant-input');
    const filled = [...covenants].filter(c => c.value.trim()).length;
    if (filled >= 2) score += 2;
    else if (filled >= 1) { score += 1; issues.push('ระบุ Covenant น้อยมาก'); }
    else issues.push('ยังไม่ได้กำหนด Covenant');

    renderStatus('lens5', score, 8, issues);
    updateNavBadge('badge-lens5', score, 8);
}

// ===== Lens 6: NPL View =====
function addRisk() {
    const list = document.getElementById('risk-list');
    const div = document.createElement('div');
    div.className = 'risk-item';
    div.innerHTML = `<div class="risk-row">
        <div class="form-group flex-1">
            <input type="text" placeholder="สาเหตุ (Cause)">
        </div>
        <div class="form-group flex-1">
            <input type="text" placeholder="มาตรการป้องกัน (Defense)">
        </div>
        <div class="form-group" style="width:140px">
            <select>
                <option value="low">ต่ำ</option>
                <option value="mid" selected>ปานกลาง</option>
                <option value="high">สูง</option>
            </select>
        </div>
        <button class="btn-del-covenant" onclick="removeRisk(this)" style="margin-top:0.2rem">✕</button>
    </div>`;
    list.appendChild(div);
}

function removeRisk(btn) {
    btn.closest('.risk-item').remove();
}

function saveLens6() {
    const defChecks = ['def_insurance','def_hedge','def_collateral_cover','def_monitoring','def_covenant_trip'];
    const checkedCount = defChecks.filter(id => document.getElementById(id).checked).length;
    let issues = [];

    if (checkedCount < 3) issues.push('Defense Checklist ผ่านน้อยกว่า 3/5 รายการ');

    const risks = document.querySelectorAll('#risk-list .risk-item');
    const highRisks = [...risks].filter(r => r.querySelector('select')?.value === 'high').length;
    if (highRisks > 0) issues.push(`มีความเสี่ยงระดับสูง ${highRisks} รายการ — ต้องระบุ Mitigant ชัดเจน`);

    renderStatus('lens6', checkedCount, 5, issues);
    updateNavBadge('badge-lens6', checkedCount, 5);
}

// ===== Helpers =====
function renderStatus(lensId, score, max, issues) {
    const el = document.getElementById('status-' + lensId);
    const pct = max > 0 ? score / max : 0;

    if (issues.length === 0 || pct >= 0.8) {
        el.className = 'status-bar pass';
        el.textContent = `✅ ผ่าน — คะแนน ${score}/${max}` + (issues.length ? ` (ข้อสังเกต: ${issues.join(', ')})` : '');
    } else if (pct >= 0.5) {
        el.className = 'status-bar warn';
        el.textContent = `⚠️ ระวัง — คะแนน ${score}/${max}: ${issues.join(' | ')}`;
    } else {
        el.className = 'status-bar fail';
        el.textContent = `❌ ไม่ผ่าน — คะแนน ${score}/${max}: ${issues.join(' | ')}`;
    }
}

function updateNavBadge(badgeId, score, max) {
    const el = document.getElementById(badgeId);
    const pct = max > 0 ? score / max : 0;
    if (pct >= 0.8)       { el.className = 'nav-badge pass'; el.textContent = 'Pass'; }
    else if (pct >= 0.5)  { el.className = 'nav-badge warn'; el.textContent = 'Warn'; }
    else                  { el.className = 'nav-badge fail'; el.textContent = 'Fail'; }
}

// ===== Memo Generator =====
function generateMemo() {
    const customer = document.getElementById('customerName').value || '(ยังไม่ได้ระบุ)';
    const rm       = document.getElementById('rmName').value       || '(ยังไม่ได้ระบุ)';
    const date     = document.getElementById('analysisDate').value  || new Date().toISOString().slice(0,10);
    const loanAmt  = document.getElementById('loanAmount').value    || '-';
    const loanType = document.getElementById('loanType').selectedOptions[0]?.text || '-';
    const purpose  = document.getElementById('loanPurpose').value   || '-';

    const ebitda    = document.getElementById('ebitda').value;
    const principal = document.getElementById('annual_principal').value;
    const interest  = document.getElementById('annual_interest').value;
    let dscrText = '-';
    let dscrStress10Text = '-';
    let dscrStress20Text = '-';
    if (ebitda && principal && interest) {
        const ds = parseFloat(principal) + parseFloat(interest);
        const base = parseFloat(ebitda) / ds;
        dscrText = base.toFixed(2) + 'x';
        dscrStress10Text = (base * 0.9).toFixed(2) + 'x';
        dscrStress20Text = (base * 0.8).toFixed(2) + 'x';
    }

    const l1c = document.getElementById('l1_comment').value || '(ไม่ได้ระบุ)';
    const l2c = document.getElementById('l2_comment').value || '(ไม่ได้ระบุ)';
    const l3c = document.getElementById('l3_comment').value || '(ไม่ได้ระบุ)';
    const l4c = document.getElementById('l4_comment').value || '(ไม่ได้ระบุ)';
    const l5c = document.getElementById('l5_comment').value || '(ไม่ได้ระบุ)';
    const l6c = document.getElementById('l6_comment').value || '(ไม่ได้ระบุ)';

    const covenants = [...document.querySelectorAll('.covenant-input')]
        .map(c => c.value.trim()).filter(Boolean)
        .map((c, i) => `• ${c}`).join('\n') || '• (ไม่ได้ระบุ)';

    // Collect risks
    const riskItems = [...document.querySelectorAll('#risk-list .risk-item')];
    const riskText = riskItems.map(item => {
        const inputs = item.querySelectorAll('input[type="text"]');
        const sel = item.querySelector('select');
        const cause = inputs[0]?.value || '?';
        const defense = inputs[1]?.value || '?';
        const level = sel?.value === 'high' ? 'สูง' : sel?.value === 'mid' ? 'ปานกลาง' : 'ต่ำ';
        return `• [${level}] ${cause} → มาตรการ: ${defense}`;
    }).join('\n') || '• (ไม่ได้ระบุ)';

    const defLabels = {
        def_insurance: 'ประกันภัยทรัพย์สิน',
        def_hedge: 'Hedging/สัญญาล่วงหน้า',
        def_collateral_cover: 'หลักประกันครอบคลุมดอกเบี้ยค้าง',
        def_monitoring: 'แผน Monitoring รายไตรมาส',
        def_covenant_trip: 'Covenant Tripwire'
    };
    const defChecked = Object.keys(defLabels).filter(id => document.getElementById(id)?.checked)
        .map(id => `✅ ${defLabels[id]}`).join('\n') || '(ไม่ได้ระบุ)';

    // Overall score
    const badges = ['badge-lens1','badge-lens2','badge-lens3','badge-lens4','badge-lens5','badge-lens6'];
    const results = badges.map(id => document.getElementById(id)?.textContent || '');
    const fails  = results.filter(r => r === 'Fail').length;
    const warns  = results.filter(r => r === 'Warn').length;
    let overallCls, overallText;
    if (fails === 0 && warns <= 1) { overallCls = 'overall-pass'; overallText = '✅ เห็นควรอนุมัติ'; }
    else if (fails === 0)           { overallCls = 'overall-warn'; overallText = '⚠️ อนุมัติโดยมีเงื่อนไขเพิ่มเติม'; }
    else                            { overallCls = 'overall-fail'; overallText = '❌ เห็นควรปฏิเสธ / ขอข้อมูลเพิ่มเติม'; }

    const html = `
<div class="memo-section">
    <p class="memo-meta">
        <strong>ลูกค้า:</strong> ${escHtml(customer)} &nbsp;|&nbsp;
        <strong>RM:</strong> ${escHtml(rm)} &nbsp;|&nbsp;
        <strong>วันที่:</strong> ${date}<br>
        <strong>วงเงิน:</strong> ${loanAmt} ล้านบาท &nbsp;|&nbsp;
        <strong>ประเภท:</strong> ${escHtml(loanType)} &nbsp;|&nbsp;
        <strong>วัตถุประสงค์:</strong> ${escHtml(purpose)}
    </p>
    <p class="${overallCls}"><strong>Opinion: ${overallText}</strong></p>
</div>

<div class="memo-section">
    <h3>🔍 Rationales using DeepLens 5C+1</h3>

    <p><strong>1. Business (Lens 1) — ธุรกิจและความจริง</strong><br>${escHtml(l1c)}</p><br>

    <p><strong>2. Financial Quality (Lens 2) — คุณภาพงบการเงิน</strong><br>${escHtml(l2c)}</p><br>

    <p><strong>3. Cashflow (Lens 3) — กระแสเงินสดและความสามารถชำระหนี้</strong><br>
    DSCR ปัจจุบัน: <strong>${dscrText}</strong> &nbsp;|&nbsp;
    Stress -10%: <strong>${dscrStress10Text}</strong> &nbsp;|&nbsp;
    Stress -20%: <strong>${dscrStress20Text}</strong><br>
    ${escHtml(l3c)}</p><br>

    <p><strong>4. Collateral & Structure (Lens 4) — หลักประกันและโครงสร้างสินเชื่อ</strong><br>${escHtml(l4c)}</p><br>

    <p><strong>5. Conditions & UWS (Lens 5) — เงื่อนไขและนโยบาย</strong><br>${escHtml(l5c)}<br>
    <em>Covenants ที่กำหนด:</em><br><pre style="margin:0.3rem 0 0 1rem;font-family:inherit">${escHtml(covenants)}</pre></p><br>

    <p><strong>6. +1 NPL View — Worst-Case Analysis</strong><br>
    <em>ความเสี่ยงและมาตรการ:</em><br><pre style="margin:0.3rem 0;font-family:inherit">${escHtml(riskText)}</pre>
    <em>Defense ที่มี:</em><br><pre style="margin:0.3rem 0;font-family:inherit">${escHtml(defChecked)}</pre>
    ${escHtml(l6c)}</p>
</div>

<div class="memo-section" style="border-top:2px solid #e2e8f0;padding-top:1rem">
    <p style="color:#718096;font-size:0.8rem">สร้างโดย DeepLens 5C+1 Credit Framework &nbsp;|&nbsp; ${new Date().toLocaleString('th-TH')}</p>
</div>`;

    document.getElementById('memo-output').innerHTML = html;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

function printMemo() {
    window.print();
}

function copyMemo() {
    const el = document.getElementById('memo-output');
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('คัดลอก Memo แล้ว!');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('คัดลอก Memo แล้ว!');
    });
}

function resetAll() {
    if (!confirm('รีเซ็ตข้อมูลทั้งหมด? ข้อมูลที่กรอกจะหายทั้งหมด')) return;
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el => el.value = '');
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => el.checked = false);
    document.getElementById('analysisDate').valueAsDate = new Date();
    ['dscr_base_val','dscr_10_val','dscr_20_val'].forEach(id => document.getElementById(id).textContent = '-');
    ['dscr_base_status','dscr_10_status','dscr_20_status'].forEach(id => document.getElementById(id).textContent = '');
    ['dscr-base','dscr-stress10','dscr-stress20'].forEach(id => document.getElementById(id).className = 'dscr-card');
    ['de_ratio','ltv_max_loan','dscr_rate_stress'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = '-'; });
    ['rev_trend','profit_trend','ar_trend'].forEach(id => document.getElementById(id).textContent = '-');
    document.getElementById('ar_alert').style.display = 'none';
    document.getElementById('memo-output').innerHTML = '<p class="memo-placeholder">กดปุ่ม "สร้าง Memo ใหม่" เพื่อสร้างสรุป หรือกรอกข้อมูลในแต่ละ Lens ให้ครบก่อนค่ะ</p>';
    ['badge-lens1','badge-lens2','badge-lens3','badge-lens4','badge-lens5','badge-lens6'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'nav-badge';
        el.textContent = '';
    });
    ['status-lens1','status-lens2','status-lens3','status-lens4','status-lens5','status-lens6'].forEach(id => {
        document.getElementById(id).className = 'status-bar';
    });
    goToSection('customer');
}
