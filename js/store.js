/* =============================================================================
 * KNOWLEDGE REUSE STORE v2 — คลังเคส
 * localStorage ถ้าใช้ได้ มิฉะนั้น in-memory (รองรับ Claude artifact sandbox)
 * =========================================================================== */

const STORE = (() => {
  const KEY = "loanBrainOS.cases.v2";
  let mem = [], useLS = false;
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); useLS = true; } catch (e) { useLS = false; }

  function _all() {
    if (!useLS) return mem;
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function _save(list) {
    if (!useLS) { mem = list; return; }
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { useLS = false; mem = list; }
  }

  function saveCase(a, status) {
    const list = _all();
    const rec = {
      id: "C" + Date.now(), refNo: a.case.refNo, borrowerName: a.case.borrowerName,
      industry: a.case.industry, loanAmount: a.case.loanAmount,
      decision: a.recommendation.decision, tier: a.routing.tier,
      riskCount: a.risk.length, status: status || "รอพิจารณา",
      savedAt: new Date().toISOString(), case: a.case,
    };
    list.unshift(rec); _save(list); return rec;
  }
  function list() { return _all(); }
  function remove(id) { _save(_all().filter((x) => x.id !== id)); }
  function clear() { _save([]); }
  function stats() {
    const all = _all();
    return {
      total: all.length,
      approved: all.filter((x) => x.status === "อนุมัติแล้ว").length,
      totalAmount: all.reduce((s, x) => s + (x.loanAmount || 0), 0),
      industries: new Set(all.map((x) => x.industry)).size,
    };
  }
  return { saveCase, list, remove, clear, stats };
})();

window.STORE = STORE;
