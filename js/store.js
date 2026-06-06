/* =============================================================================
 * KNOWLEDGE REUSE STORE — คลังเคส (Case Knowledge Base)
 * -----------------------------------------------------------------------------
 * Value Prop 6.4 : "Case 1 → asset, Case 100 → intelligence"
 * เปลี่ยนจาก knowledge ที่เสียทุกครั้ง → knowledge ที่สะสม
 *
 * Phase 1 : ใช้ localStorage (ของจริงจะต่อ DB ใน Phase 2-3)
 * =========================================================================== */

const STORE = (() => {
  const KEY = "loanBrainOS.cases";

  function _all() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }
  function _save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  // บันทึกเคส (พร้อมสถานะการอนุมัติของ RM)
  function saveCase(analysis, status) {
    const list = _all();
    const record = {
      id: "C" + Date.now(),
      refNo: analysis.case.refNo,
      borrowerName: analysis.case.borrowerName,
      loanAmount: analysis.case.loanAmount,
      decision: analysis.recommendation.decision,
      riskScore: analysis.risk.riskScore,
      status: status || "รอพิจารณา",       // RM approve flow
      savedAt: new Date().toISOString(),
      case: analysis.case,                  // เก็บ input เต็มเพื่อ regenerate ได้
    };
    list.unshift(record);
    _save(list);
    return record;
  }

  function list() { return _all(); }
  function remove(id) { _save(_all().filter((x) => x.id !== id)); }
  function clear() { _save([]); }

  // สถิติรวมสำหรับ dashboard
  function stats() {
    const all = _all();
    return {
      total: all.length,
      approved: all.filter((x) => x.status === "อนุมัติแล้ว").length,
      totalAmount: all.reduce((s, x) => s + (x.loanAmount || 0), 0),
      avgRisk: all.length
        ? Math.round(all.reduce((s, x) => s + (x.riskScore || 0), 0) / all.length)
        : 0,
    };
  }

  return { saveCase, list, remove, clear, stats };
})();

window.STORE = STORE;
