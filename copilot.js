/* ============================================================
   DeepLens AI Copilot
   Frontend-only chat assistant for the 5C+1 Credit Framework.
   Streams directly from the browser to the Anthropic Messages API.
   The user supplies their own API key (kept in localStorage only).
   ============================================================ */
(function () {
    'use strict';

    /* ---------- Config ---------- */
    var CONFIG = {
        MODEL: 'claude-sonnet-4-6',
        API_URL: 'https://api.anthropic.com/v1/messages',
        API_VERSION: '2023-06-01',
        LS_KEY: 'deeplens_copilot_apikey',
        MAX_TOKENS: 4096
    };

    /* ---------- API key manager ----------
       The key lives in localStorage and is read only immediately before
       a fetch. It is never logged and never sent anywhere except directly
       to api.anthropic.com. */
    var ApiKeyManager = {
        get: function () {
            try { return localStorage.getItem(CONFIG.LS_KEY) || ''; }
            catch (e) { return ''; }
        },
        set: function (key) {
            try { localStorage.setItem(CONFIG.LS_KEY, key); return true; }
            catch (e) { return false; }
        },
        clear: function () {
            try { localStorage.removeItem(CONFIG.LS_KEY); } catch (e) {}
        },
        has: function () { return !!this.get(); },
        masked: function () {
            var k = this.get();
            if (!k) return '';
            if (k.length <= 12) return k;
            return k.slice(0, 8) + '…' + k.slice(-4);
        }
    };

    /* ---------- Chat state ---------- */
    var ChatState = {
        messages: [],          // [{role:'user'|'assistant', content:'...'}]
        abortController: null,
        streaming: false,
        contextSent: false,    // whether the form snapshot was injected yet
        clear: function () {
            this.messages = [];
            this.contextSent = false;
        }
    };

    /* ---------- Form state collector ----------
       Reads every field of the DeepLens form into a plain object so it can
       be handed to the model as context. Uses parseFloat (=> null) rather
       than ||0 so "blank" is distinguishable from a real zero. */
    var FormStateCollector = {
        num: function (id) {
            var el = document.getElementById(id);
            if (!el) return null;
            var v = parseFloat(el.value);
            return isNaN(v) ? null : v;
        },
        txt: function (id) {
            var el = document.getElementById(id);
            return el && el.value ? el.value.trim() : null;
        },
        selText: function (id) {
            var el = document.getElementById(id);
            if (!el || el.selectedIndex < 0) return null;
            var opt = el.options[el.selectedIndex];
            return opt && opt.value ? opt.text : null;
        },
        radio: function (name) {
            var el = document.querySelector('input[name="' + name + '"]:checked');
            if (!el) return null;
            var label = el.closest('label');
            return label ? label.textContent.trim() : el.value;
        },
        check: function (id) {
            var el = document.getElementById(id);
            return el ? !!el.checked : false;
        },
        disp: function (id) {
            var el = document.getElementById(id);
            if (!el) return null;
            var t = (el.textContent || '').trim();
            return (t === '' || t === '-') ? null : t;
        },
        covenants: function () {
            var out = [];
            document.querySelectorAll('#covenant-list .covenant-input').forEach(function (inp) {
                if (inp.value && inp.value.trim()) out.push(inp.value.trim());
            });
            return out;
        },
        risks: function () {
            var out = [];
            document.querySelectorAll('#risk-list .risk-item').forEach(function (item) {
                var inputs = item.querySelectorAll('input[type="text"]');
                var sel = item.querySelector('select');
                var cause = inputs[0] && inputs[0].value ? inputs[0].value.trim() : '';
                var defense = inputs[1] && inputs[1].value ? inputs[1].value.trim() : '';
                if (!cause && !defense) return;
                var levelText = '';
                if (sel && sel.selectedIndex >= 0) levelText = sel.options[sel.selectedIndex].text;
                out.push({ cause: cause, defense: defense, level: levelText });
            });
            return out;
        },
        collect: function () {
            return {
                meta: {
                    customerName: this.txt('customerName'),
                    rmName: this.txt('rmName'),
                    analysisDate: this.txt('analysisDate'),
                    loanType: this.selText('loanType'),
                    loanAmount: this.num('loanAmount'),
                    loanPurpose: this.txt('loanPurpose')
                },
                lens1_business: {
                    businessDescription: this.txt('l1_business'),
                    businessType: this.selText('l1_btype'),
                    paymentTerms: this.selText('l1_payment'),
                    marketPosition: this.radio('l1_position'),
                    customerConcentration: this.radio('l1_concentration'),
                    supplierConcentration: this.radio('l1_supplier'),
                    comment: this.txt('l1_comment')
                },
                lens2_financial: {
                    revenue: { y2: this.num('rev_y2'), y1: this.num('rev_y1'), y0: this.num('rev_y0') },
                    netProfit: { y2: this.num('profit_y2'), y1: this.num('profit_y1'), y0: this.num('profit_y0') },
                    accountsReceivable: { y2: this.num('ar_y2'), y1: this.num('ar_y1'), y0: this.num('ar_y0') },
                    profitQuality: this.radio('l2_profit_q'),
                    totalDebt: this.num('l2_debt'),
                    totalEquity: this.num('l2_equity'),
                    deRatio: this.disp('de_ratio'),
                    deBenchmark: this.num('l2_de_bench'),
                    comment: this.txt('l2_comment')
                },
                lens3_cashflow: {
                    ebitda: this.num('ebitda'),
                    annualPrincipal: this.num('annual_principal'),
                    annualInterest: this.num('annual_interest'),
                    operatingCashFlow: this.num('ocf'),
                    dscrBase: this.disp('dscr_base_val'),
                    dscrStress10: this.disp('dscr_10_val'),
                    dscrStress20: this.disp('dscr_20_val'),
                    currentRate: this.num('rate_current'),
                    comment: this.txt('l3_comment')
                },
                lens4_collateral: {
                    collateralType: this.selText('l4_collateral_type'),
                    collateralValue: this.num('l4_collateral_val'),
                    ltvAllowedPct: this.num('l4_ltv_allowed'),
                    maxLoanByLtv: this.disp('ltv_max_loan'),
                    liquidity: this.radio('l4_liquidity'),
                    ltlStructureOk: this.selText('l4_ltl_ok'),
                    workingCapOk: this.selText('l4_wc_ok'),
                    comment: this.txt('l4_comment')
                },
                lens5_conditions: {
                    experience: this.radio('l5_exp'),
                    deCompliance: this.radio('l5_de'),
                    ncbHistory: this.radio('l5_ncb'),
                    covenants: this.covenants(),
                    comment: this.txt('l5_comment')
                },
                lens6_nplView: {
                    risks: this.risks(),
                    defenses: {
                        insurance: this.check('def_insurance'),
                        hedging: this.check('def_hedge'),
                        collateralCoversInterest: this.check('def_collateral_cover'),
                        quarterlyMonitoring: this.check('def_monitoring'),
                        covenantTripwire: this.check('def_covenant_trip')
                    },
                    rationale: this.txt('l6_comment')
                }
            };
        }
    };

    /* ---------- Prompt builder ---------- */
    var PromptBuilder = {
        SYSTEM_PROMPT: [
            'คุณคือ "DeepLens Copilot" ผู้ช่วย AI สำหรับเจ้าหน้าที่สินเชื่อธุรกิจ (Relationship Manager) ของธนาคาร',
            'คุณมีประสบการณ์วิเคราะห์สินเชื่อธุรกิจมากว่า 20 ปี เชี่ยวชาญการมองความเสี่ยงเชิงลึก',
            'คุณทำงานบนกรอบการวิเคราะห์ "DeepLens 5C+1 Credit Framework" ซึ่งประกอบด้วย:',
            '- Lens 1 (Character/Business): เข้าใจตัวธุรกิจ โมเดลรายได้ อำนาจต่อรอง Concentration Risk',
            '- Lens 2 (Capacity/Financial Quality): คุณภาพงบการเงิน แนวโน้มรายได้/กำไร/ลูกหนี้ คุณภาพกำไร D/E',
            '- Lens 3 (Cashflow/DSCR): ความสามารถชำระหนี้จริง DSCR และ Stress Test (DSCR ≥ 1.2x ผ่าน, ≥ 1.5x ดี)',
            '- Lens 4 (Collateral): หลักประกัน LTV สภาพคล่อง โครงสร้างสินเชื่อให้ตรงวัตถุประสงค์',
            '- Lens 5 (Conditions): เงื่อนไขคุณสมบัติ (UWS) ประสบการณ์ ประวัติ NCB และ Covenant',
            '- +1 (NPL View): จินตนาการ Worst-Case ว่าถ้าลูกค้าเป็น NPL ใน 2 ปี เรามีมาตรการป้องกันพอหรือไม่',
            '',
            'หลักการตอบ:',
            '1. ตอบเป็นภาษาไทยที่กระชับ เป็นมืออาชีพ ตรงประเด็น เหมือนพี่เลี้ยงสินเชื่อที่เก่งและตรงไปตรงมา',
            '2. เน้นการมองหา "ความเสี่ยงที่ซ่อนอยู่" (Red Flags) และตั้งคำถามที่ RM ควรถามลูกค้า',
            '3. อ้างอิงตัวเลขจากข้อมูลฟอร์มที่ได้รับเสมอ ถ้าข้อมูลไม่ครบให้ระบุว่าขาดอะไรและทำไมมันสำคัญ',
            '4. ห้ามแต่งตัวเลขขึ้นเอง ใช้เฉพาะข้อมูลที่ผู้ใช้กรอกหรือให้มา',
            '5. ตัดสินบนพื้นฐานความเสี่ยง ไม่เอนเอียงไปทาง "อนุมัติ" หรือ "ปฏิเสธ" โดยไม่มีเหตุผลรองรับ',
            '6. ใช้หัวข้อ bullet และ emoji ที่เหมาะสมเพื่อให้อ่านง่ายในหน้าจอแชทแคบ'
        ].join('\n'),

        formContextBlock: function (state) {
            return [
                'ต่อไปนี้คือข้อมูลที่ RM กรอกไว้ในฟอร์ม DeepLens (รูปแบบ JSON, ค่า null คือยังไม่ได้กรอก):',
                '```json',
                JSON.stringify(state, null, 2),
                '```'
            ].join('\n');
        },

        quickAction: function (action, state) {
            var ctx = this.formContextBlock(state);
            var task;
            if (action === 'analyze') {
                task = [
                    'งาน: วิเคราะห์ข้อมูลลูกค้ารายนี้ตามกรอบ DeepLens 5C+1',
                    'โปรด:',
                    '1. สรุปภาพรวมความน่าเชื่อถือสั้นๆ',
                    '2. ชี้ "Red Flags" หรือจุดที่น่ากังวลในแต่ละ Lens (เฉพาะที่มีข้อมูล)',
                    '3. ระบุข้อมูลสำคัญที่ยังขาดและควรเก็บเพิ่ม',
                    '4. ให้ความเห็นเบื้องต้นว่าเคสนี้ความเสี่ยงระดับใด พร้อมเหตุผล'
                ].join('\n');
            } else if (action === 'premortem') {
                task = [
                    'งาน: ทำ Pre-mortem (มอง +1 NPL View)',
                    'สมมติว่าอนุมัติสินเชื่อรายนี้ไปแล้ว และอีก 2 ปีลูกค้ากลายเป็น NPL',
                    'โปรดสร้างชุด "คำถามเชิงท้าทาย" ที่เฉียบคมที่ RM ต้องตอบให้ได้ก่อนอนุมัติ',
                    'จัดกลุ่มคำถามตามสาเหตุที่อาจทำให้เป็น NPL (เช่น ตลาด/ลูกหนี้/กระแสเงินสด/หลักประกัน)',
                    'และสำหรับแต่ละความเสี่ยงให้แนะนำมาตรการป้องกัน (Defense) ที่ควรมี'
                ].join('\n');
            } else if (action === 'memo') {
                task = [
                    'งาน: เขียน "Credit Memo" ฉบับมืออาชีพเป็นภาษาไทย จากข้อมูลในฟอร์ม',
                    'โครงสร้าง Memo:',
                    '1. ข้อมูลลูกค้าและวงเงินที่ขอ',
                    '2. สรุปแต่ละ Lens (1-5) พร้อมตัวเลขสำคัญ (D/E, DSCR, LTV, แนวโน้ม)',
                    '3. การวิเคราะห์ +1 NPL View และมาตรการป้องกัน',
                    '4. ความเห็นและข้อเสนอแนะการอนุมัติ พร้อมเงื่อนไข (Covenants)',
                    'ใช้ภาษาทางการแบบเอกสารสินเชื่อ อ้างอิงเฉพาะตัวเลขที่มีจริง'
                ].join('\n');
            } else if (action === 'extract') {
                task = [
                    'งาน: ช่วยสกัดตัวเลขทางการเงินจากข้อความดิบ',
                    'ผู้ใช้จะวางข้อความ (เช่น งบการเงิน, Bank Statement, ข้อความจากลูกค้า) ในข้อความถัดไป',
                    'ให้คุณสกัดตัวเลขสำคัญ แล้วจับคู่กับช่องในฟอร์ม DeepLens โดยตอบเป็นตารางที่มีคอลัมน์:',
                    '| ช่องในฟอร์ม | ค่าที่พบ | หมายเหตุ/ความมั่นใจ |',
                    'ช่องที่เกี่ยวข้อง เช่น รายได้ 3 ปี (rev_y2/y1/y0), กำไรสุทธิ (profit_*), ลูกหนี้ (ar_*),',
                    'หนี้สินรวม (l2_debt), ส่วนของเจ้าของ (l2_equity), EBITDA, เงินต้น/ดอกเบี้ยต่อปี, OCF, มูลค่าหลักประกัน',
                    'ถ้าตัวเลขไหนไม่แน่ใจหรือไม่พบ ให้ระบุชัดเจน อย่าเดา',
                    '',
                    'ตอนนี้ยังไม่มีข้อความดิบ — โปรดบอกผู้ใช้ให้วางข้อความที่ต้องการสกัดได้เลย'
                ].join('\n');
            }
            // extract starts a fresh conversation that asks the user to paste raw text,
            // so it does not need the form JSON appended.
            if (action === 'extract') return task;
            return ctx + '\n\n' + task;
        },

        // For free-form chat: prepend the form context only on the first message.
        userMessage: function (text, state, includeContext) {
            if (includeContext) {
                return this.formContextBlock(state) + '\n\n---\n\nคำถามจาก RM: ' + text;
            }
            return text;
        }
    };

    /* ---------- Error messages (Thai, friendly) ---------- */
    var ERRORS = {
        NO_KEY: 'ยังไม่ได้ตั้งค่า API Key — กรุณากดไอคอนกุญแจเพื่อใส่ Anthropic API Key ก่อนค่ะ',
        '401': 'API Key ไม่ถูกต้องหรือหมดอายุ (401) — กรุณาตรวจสอบและใส่ใหม่อีกครั้ง',
        '403': 'ไม่มีสิทธิ์เข้าถึง (403) — กรุณาตรวจสอบสิทธิ์ของ API Key',
        '429': 'มีการเรียกใช้งานถี่เกินไป (429 Rate limit) — กรุณารอสักครู่แล้วลองใหม่',
        '500': 'เซิร์ฟเวอร์ Anthropic ขัดข้องชั่วคราว (500) — กรุณาลองใหม่อีกครั้ง',
        '529': 'ระบบ Anthropic กำลังมีผู้ใช้งานหนาแน่น (529 Overloaded) — กรุณาลองใหม่ในอีกสักครู่',
        NETWORK_ERROR: 'เชื่อมต่อเครือข่ายไม่สำเร็จ — กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
        STREAM_ERROR: 'เกิดข้อผิดพลาดระหว่างรับข้อมูล — กรุณาลองใหม่อีกครั้ง',
        API_ERROR: 'เกิดข้อผิดพลาดจาก API — กรุณาลองใหม่อีกครั้ง'
    };
    function errMsg(code, detail) {
        var base = ERRORS[code] || ERRORS.API_ERROR;
        return detail ? base + '\n(' + detail + ')' : base;
    }

    /* ---------- Anthropic client (SSE streaming) ---------- */
    var AnthropicClient = {
        streamMessage: function (messages, handlers) {
            var key = ApiKeyManager.get();
            if (!key) { handlers.onError(errMsg('NO_KEY')); return; }

            var controller = new AbortController();
            ChatState.abortController = controller;

            var body = {
                model: CONFIG.MODEL,
                max_tokens: CONFIG.MAX_TOKENS,
                system: PromptBuilder.SYSTEM_PROMPT,
                stream: true,
                messages: messages
            };

            fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': key,
                    'anthropic-version': CONFIG.API_VERSION,
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify(body),
                signal: controller.signal
            }).then(function (resp) {
                if (!resp.ok) {
                    return resp.text().then(function (t) {
                        var detail = '';
                        try { var j = JSON.parse(t); detail = j.error && j.error.message ? j.error.message : ''; }
                        catch (e) {}
                        handlers.onError(errMsg(String(resp.status), detail));
                    });
                }
                return AnthropicClient._readStream(resp, handlers);
            }).catch(function (err) {
                if (err && err.name === 'AbortError') {
                    handlers.onDone(true);
                } else {
                    handlers.onError(errMsg('NETWORK_ERROR', err && err.message));
                }
            });
        },

        _readStream: function (resp, handlers) {
            var reader = resp.body.getReader();
            // streaming decoder — keep {stream:true} so multi-byte Thai UTF-8
            // chars split across chunks are not corrupted.
            var decoder = new TextDecoder('utf-8');
            var buffer = '';

            function pump() {
                return reader.read().then(function (res) {
                    if (res.done) { handlers.onDone(false); return; }
                    buffer += decoder.decode(res.value, { stream: true });
                    var lines = buffer.split('\n');
                    buffer = lines.pop();
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        if (line.indexOf('data:') !== 0) continue;
                        var data = line.slice(5).trim();
                        if (!data || data === '[DONE]') continue;
                        var parsed;
                        try { parsed = JSON.parse(data); } catch (e) { continue; }
                        if (parsed.type === 'content_block_delta' &&
                            parsed.delta && parsed.delta.type === 'text_delta') {
                            handlers.onDelta(parsed.delta.text);
                        } else if (parsed.type === 'message_stop') {
                            handlers.onDone(false);
                            return;
                        } else if (parsed.type === 'error') {
                            var m = parsed.error && parsed.error.message ? parsed.error.message : '';
                            handlers.onError(errMsg('STREAM_ERROR', m));
                            return;
                        }
                    }
                    return pump();
                }).catch(function (err) {
                    if (err && err.name === 'AbortError') { handlers.onDone(true); }
                    else { handlers.onError(errMsg('STREAM_ERROR', err && err.message)); }
                });
            }
            return pump();
        }
    };

    /* ---------- UI helpers ---------- */
    var UI = {
        el: {},
        cacheEls: function () {
            this.el.toggle = document.getElementById('copilot-toggle');
            this.el.panel = document.getElementById('copilot-panel');
            this.el.closeBtn = document.getElementById('copilot-close');
            this.el.keyBtn = document.getElementById('copilot-key-btn');
            this.el.clearBtn = document.getElementById('copilot-clear-btn');
            this.el.messages = document.getElementById('copilot-messages');
            this.el.input = document.getElementById('copilot-input');
            this.el.send = document.getElementById('copilot-send');
            this.el.quick = document.querySelectorAll('.copilot-quick-btn');
            // modal
            this.el.modal = document.getElementById('copilot-modal');
            this.el.keyInput = document.getElementById('copilot-key-input');
            this.el.keyStatus = document.getElementById('copilot-key-status');
            this.el.keySave = document.getElementById('copilot-key-save');
            this.el.keyCancel = document.getElementById('copilot-key-cancel');
            this.el.keyClear = document.getElementById('copilot-key-clear');
        },
        scrollDown: function () {
            this.el.messages.scrollTop = this.el.messages.scrollHeight;
        },
        clearWelcome: function () {
            var w = this.el.messages.querySelector('.copilot-welcome');
            if (w) w.remove();
        },
        addUser: function (text) {
            this.clearWelcome();
            var d = document.createElement('div');
            d.className = 'copilot-msg copilot-msg-user';
            d.textContent = text; // textContent — no HTML injection
            this.el.messages.appendChild(d);
            this.scrollDown();
        },
        addSystem: function (text) {
            var d = document.createElement('div');
            d.className = 'copilot-msg copilot-msg-system';
            d.textContent = text;
            this.el.messages.appendChild(d);
            this.scrollDown();
        },
        // returns the AI bubble element to stream into
        startAi: function () {
            this.clearWelcome();
            var d = document.createElement('div');
            d.className = 'copilot-msg copilot-msg-ai copilot-cursor';
            d.textContent = '';
            this.el.messages.appendChild(d);
            this.scrollDown();
            return d;
        },
        appendAi: function (bubble, text) {
            bubble.textContent += text; // textContent guards against XSS
            this.scrollDown();
        },
        finishAi: function (bubble) {
            bubble.classList.remove('copilot-cursor');
        },
        addError: function (text) {
            this.clearWelcome();
            var d = document.createElement('div');
            d.className = 'copilot-msg copilot-msg-error';
            d.textContent = '⚠️ ' + text;
            this.el.messages.appendChild(d);
            this.scrollDown();
        },
        setSending: function (sending) {
            ChatState.streaming = sending;
            if (sending) {
                this.el.send.textContent = '■';
                this.el.send.classList.add('copilot-stop');
                this.el.quick.forEach(function (b) { b.disabled = true; });
            } else {
                this.el.send.textContent = '➤';
                this.el.send.classList.remove('copilot-stop');
                this.el.quick.forEach(function (b) { b.disabled = false; });
            }
        }
    };

    /* ---------- App wiring ---------- */
    var CopilotApp = {
        init: function () {
            UI.cacheEls();
            this.bind();
            this.refreshKeyModal();
        },

        bind: function () {
            var self = this;

            UI.el.toggle.addEventListener('click', function () { self.openPanel(); });
            UI.el.closeBtn.addEventListener('click', function () { self.closePanel(); });
            UI.el.keyBtn.addEventListener('click', function () { self.openModal(); });
            UI.el.clearBtn.addEventListener('click', function () { self.clearChat(); });

            UI.el.send.addEventListener('click', function () {
                if (ChatState.streaming) { self.stop(); }
                else { self.sendFromInput(); }
            });
            UI.el.input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!ChatState.streaming) self.sendFromInput();
                }
            });
            UI.el.input.addEventListener('input', function () {
                UI.el.input.style.height = 'auto';
                UI.el.input.style.height = Math.min(UI.el.input.scrollHeight, 120) + 'px';
            });

            UI.el.quick.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    self.runQuickAction(btn.getAttribute('data-action'));
                });
            });

            // modal
            UI.el.keySave.addEventListener('click', function () { self.saveKey(); });
            UI.el.keyCancel.addEventListener('click', function () { self.closeModal(); });
            UI.el.keyClear.addEventListener('click', function () { self.clearKey(); });
        },

        openPanel: function () {
            UI.el.panel.classList.add('copilot-open');
            UI.el.toggle.classList.add('copilot-hidden');
            if (!ApiKeyManager.has()) this.openModal();
            else UI.el.input.focus();
        },
        closePanel: function () {
            UI.el.panel.classList.remove('copilot-open');
            UI.el.toggle.classList.remove('copilot-hidden');
        },

        openModal: function () {
            UI.el.keyInput.value = ApiKeyManager.get();
            UI.el.keyStatus.textContent = '';
            UI.el.keyStatus.className = 'copilot-modal-status';
            UI.el.modal.classList.add('copilot-open');
            UI.el.keyInput.focus();
        },
        closeModal: function () {
            UI.el.modal.classList.remove('copilot-open');
        },
        refreshKeyModal: function () {
            // nothing persisted to show beyond the input on open
        },
        saveKey: function () {
            var v = UI.el.keyInput.value.trim();
            if (!v) {
                UI.el.keyStatus.textContent = 'กรุณาใส่ API Key';
                UI.el.keyStatus.className = 'copilot-modal-status copilot-err';
                return;
            }
            if (v.indexOf('sk-ant-') !== 0) {
                UI.el.keyStatus.textContent = 'รูปแบบ Key ดูไม่ถูกต้อง (ควรขึ้นต้นด้วย sk-ant-) — บันทึกแล้วแต่โปรดตรวจสอบ';
                UI.el.keyStatus.className = 'copilot-modal-status copilot-err';
            } else {
                UI.el.keyStatus.textContent = 'บันทึกเรียบร้อย ✓';
                UI.el.keyStatus.className = 'copilot-modal-status copilot-ok';
            }
            ApiKeyManager.set(v);
            var self = this;
            setTimeout(function () { self.closeModal(); UI.el.input.focus(); }, 700);
        },
        clearKey: function () {
            ApiKeyManager.clear();
            UI.el.keyInput.value = '';
            UI.el.keyStatus.textContent = 'ลบ API Key ออกจากเครื่องแล้ว';
            UI.el.keyStatus.className = 'copilot-modal-status copilot-ok';
        },

        clearChat: function () {
            ChatState.clear();
            UI.el.messages.innerHTML =
                '<div class="copilot-welcome">' +
                '<div class="copilot-welcome-icon">🔍</div>' +
                '<h4>DeepLens Copilot</h4>' +
                '<p>เริ่มต้นด้วยปุ่มด้านบน หรือพิมพ์คำถามเกี่ยวกับเคสนี้ได้เลยค่ะ</p>' +
                '</div>';
        },

        stop: function () {
            if (ChatState.abortController) {
                try { ChatState.abortController.abort(); } catch (e) {}
            }
        },

        sendFromInput: function () {
            var text = UI.el.input.value.trim();
            if (!text) return;
            if (!ApiKeyManager.has()) { this.openModal(); return; }
            UI.el.input.value = '';
            UI.el.input.style.height = 'auto';

            var state = FormStateCollector.collect();
            var includeContext = !ChatState.contextSent;
            var promptText = PromptBuilder.userMessage(text, state, includeContext);
            ChatState.contextSent = true;

            UI.addUser(text); // show the raw text the user typed (not the injected context)
            ChatState.messages.push({ role: 'user', content: promptText });
            this.runTurn();
        },

        runQuickAction: function (action) {
            if (!ApiKeyManager.has()) { this.openPanel(); this.openModal(); return; }
            if (ChatState.streaming) return;

            var labels = {
                analyze: '🔎 วิเคราะห์ข้อมูลลูกค้ารายนี้',
                premortem: '⚠️ Pre-mortem: ถ้าเคสนี้กลายเป็น NPL',
                memo: '📝 เขียน Credit Memo',
                extract: '🔢 สกัดตัวเลขจากข้อความดิบ'
            };
            // quick actions start a fresh conversation
            ChatState.clear();
            ChatState.contextSent = true; // context is embedded in the quick-action prompt
            var state = FormStateCollector.collect();
            var prompt = PromptBuilder.quickAction(action, state);

            UI.addUser(labels[action] || action);
            ChatState.messages.push({ role: 'user', content: prompt });
            this.runTurn();
        },

        runTurn: function () {
            var bubble = UI.startAi();
            var acc = '';
            UI.setSending(true);

            AnthropicClient.streamMessage(ChatState.messages, {
                onDelta: function (t) { acc += t; UI.appendAi(bubble, t); },
                onDone: function (aborted) {
                    UI.finishAi(bubble);
                    UI.setSending(false);
                    ChatState.abortController = null;
                    if (acc) {
                        ChatState.messages.push({ role: 'assistant', content: acc });
                    } else {
                        bubble.remove();
                        if (aborted) UI.addSystem('— หยุดการตอบแล้ว —');
                    }
                },
                onError: function (msg) {
                    UI.finishAi(bubble);
                    if (!acc) bubble.remove();
                    else ChatState.messages.push({ role: 'assistant', content: acc });
                    UI.setSending(false);
                    ChatState.abortController = null;
                    UI.addError(msg);
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { CopilotApp.init(); });
    } else {
        CopilotApp.init();
    }
})();
