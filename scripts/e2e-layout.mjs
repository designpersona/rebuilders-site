// 레이아웃: 393/375/320 폭에서 모든 페이지·시트·상세의 카드 안 요소가 카드 밖으로 안 튀어나옴(장식 ::before/::after 포함),
// 페이지 좌우 여백 28px·카드 사이 12px·카드 안쪽 16px, 글자 크기·굵기는 공용 단계만, 버튼 규칙.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9365, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-layout-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=430,900', ...(process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const errors = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const page = list.find(t => t.type === 'page'); if (page) return page.webSocketDebuggerUrl; } catch {}
    await sleep(200);
  }
  throw new Error('chrome not reachable');
}
function send(method, params = {}) { return new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); }); }
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}
async function load(url = null) {
  if (url) await send('Page.navigate', { url }); else await send('Page.reload', { ignoreCache: true });
  for (let i = 0; i < 100; i++) { await sleep(150); try { if (await evaluate(`return document.body?.classList.contains('app-ready')`)) return; } catch {} }
  throw new Error('app not ready');
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
const touch = (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
const panelX = view => evaluate(`const m = (document.getElementById('${view}').style.transform || '').match(/translate(?:X|3d)\\((-?[\\d.]+)px/); return m ? parseFloat(m[1]) : 0;`);
try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();
  const LIB = "window.__overflowCheck = () => {\n  const vis = e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };\n  const clips = s => s.overflowX !== 'visible' || s.overflowY !== 'visible' || (s.clipPath && s.clipPath !== 'none') || s.clip !== 'auto';\n  const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase()) + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\\s+/).slice(0, 3).join('.') : '');\n  const inVp = b => b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth;\n  const hiddenUp = e => { for (let a = e; a && a !== document.body; a = a.parentElement) { if (a.hidden || a.getAttribute('aria-hidden') === 'true' && a.closest('[inert]')) return true; const s = getComputedStyle(a); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return true; } return false; };\n  const out = [];\n  for (const card of document.querySelectorAll('body *')) {\n    if (!vis(card) || hiddenUp(card)) continue;\n    const cs = getComputedStyle(card); const rad = parseFloat(cs.borderTopLeftRadius) || 0;\n    const bg = (cs.backgroundColor.match(/[\\d.]+/g) || []).map(Number); const a = bg.length > 3 ? bg[3] : (bg.length ? 1 : 0);\n    if (!(a > 0.5 && bg[0] > 235 && bg[1] > 235 && bg[2] > 235 && rad >= 8)) continue;\n    const cb = card.getBoundingClientRect(); if (cb.width < 60 || cb.height < 30 || cb.width >= innerWidth - 2 || !inVp(cb)) continue;\n    if (clips(cs)) continue; // 카드가 잘라주면 튀어나와도 안 보임\n    const walk = (el) => { for (const d of el.children) { const s = getComputedStyle(d); if (s.display === 'none' || s.visibility === 'hidden' || s.position === 'fixed' || d.classList.contains('sr-only') || d.classList.contains('timeline-time-control')) continue; // 시간 라벨은 카드 왼쪽 시간 줄에 두는 디자인\n      const b = d.getBoundingClientRect(); if (b.width > 0 && b.height > 0 && +s.opacity > 0 && (b.left < cb.left - 1 || b.right > cb.right + 1 || b.top < cb.top - 1 || b.bottom > cb.bottom + 1)) out.push(`${name(d)} in ${name(card)} [${Math.round(b.left - cb.left)},${Math.round(cb.right - b.right)},${Math.round(b.top - cb.top)},${Math.round(cb.bottom - b.bottom)}]`);\n      for (const ps of ['::before', '::after']) { const q = getComputedStyle(d, ps); if (q.content === 'none' || q.content === 'normal' || q.display === 'none' || q.position !== 'absolute' || +q.opacity === 0) continue; const w = parseFloat(q.width), h = parseFloat(q.height); if (!(w > 0 && h > 0) || q.backgroundColor === 'rgba(0, 0, 0, 0)' && q.boxShadow === 'none' && q.backgroundImage === 'none') continue;\n        const L = q.left !== 'auto' ? b.left + parseFloat(s.borderLeftWidth) + parseFloat(q.left) : b.right - parseFloat(s.borderRightWidth) - parseFloat(q.right) - w; const T = q.top !== 'auto' ? b.top + parseFloat(s.borderTopWidth) + parseFloat(q.top) : b.bottom - parseFloat(s.borderBottomWidth) - parseFloat(q.bottom) - h;\n        if (!clips(s) && (L < cb.left - 1 || L + w > cb.right + 1 || T < cb.top - 1 || T + h > cb.bottom + 1)) out.push(`${name(d)}${ps} in ${name(card)} [${Math.round(L - cb.left)},${Math.round(cb.right - L - w)},${Math.round(T - cb.top)},${Math.round(cb.bottom - T - h)}]`); }\n      if (!clips(s)) walk(d); } };\n    { const b = cb, s = cs, d = card; for (const ps of ['::before', '::after']) { const q = getComputedStyle(d, ps); if (q.content === 'none' || q.content === 'normal' || q.display === 'none' || q.position !== 'absolute' || +q.opacity === 0) continue; const w = parseFloat(q.width), h = parseFloat(q.height); if (!(w > 0 && h > 0) || q.backgroundColor === 'rgba(0, 0, 0, 0)' && q.boxShadow === 'none' && q.backgroundImage === 'none') continue;\n      const L = q.left !== 'auto' ? b.left + parseFloat(s.borderLeftWidth) + parseFloat(q.left) : b.right - parseFloat(s.borderRightWidth) - parseFloat(q.right) - w; const T = q.top !== 'auto' ? b.top + parseFloat(s.borderTopWidth) + parseFloat(q.top) : b.bottom - parseFloat(s.borderBottomWidth) - parseFloat(q.bottom) - h;\n      const bt = parseFloat(s.borderTopWidth) || 0, br = parseFloat(s.borderRightWidth) || 0, bb = parseFloat(s.borderBottomWidth) || 0, bl = parseFloat(s.borderLeftWidth) || 0; // 카드 테두리(가장자리)를 덮어도 튀어나온 것으로 봄\n      if (L < cb.left + bl - 0.5 || L + w > cb.right - br + 0.5 || T < cb.top + bt - 0.5 || T + h > cb.bottom - bb + 0.5) out.push(`${name(d)}${ps} [${Math.round(L - cb.left)},${Math.round(cb.right - L - w)},${Math.round(T - cb.top)},${Math.round(cb.bottom - T - h)}]`); } }\n    walk(card);\n  }\n  return [...new Set(out)];\n};\nwindow.__pad = () => { // 페이지 좌우 여백·카드 간격\n  const res = {}; const panel = [...document.querySelectorAll('.view-panel, [id^=\"view-\"]')].find(p => p.offsetWidth && !p.hidden && p.getBoundingClientRect().left > -5 && p.getBoundingClientRect().left < 5);\n  if (!panel) return res; const kids = [...panel.querySelectorAll(':scope > *, :scope > * > *')].filter(e => e.offsetWidth > 100);\n  res.panel = panel.id; res.lefts = [...new Set(kids.map(e => Math.round(e.getBoundingClientRect().left)))].slice(0, 6); return res;\n};\n"; // 카드 밖 튀어나옴 검사(장식 ::before/::after 포함)
  const W8 = ms => `await new Promise(r => setTimeout(r, ${ms}));`;
  await evaluate(LIB + '; return 1;');
  await evaluate(`await addFood('breakfast', { name: '바나나', cal: 89, carbs: 23, protein: 1.1, fat: 0.3, serving: '100g' }); await saveCustomFood('바나나 오트밀', { cal: 300, carbs: 50, protein: 9, fat: 6, serving: '1그릇' }); return 1;`);
  const STATES = {
    home: "setActiveView('home')", meal: "openMealPage('breakfast')", stats: "closeMealPage(); setActiveView('stats')", profile: "setActiveView('profile')",
    grocery: "setActiveView('fridge'); setSearchHubView('shopping')", stock: "setSearchHubView('stock')",
    foodCards: "setActiveView('foodex'); setFoodexPageTab('index'); document.getElementById('search-index-layout-card')?.click()", foodList: "document.getElementById('search-index-layout-list')?.click()",
    results: "document.getElementById('search-index-layout-card')?.click(); const i = document.getElementById('foodex-search-input'); i.value = '바나'; i.dispatchEvent(new Event('input'))",
    recipe: "const i = document.getElementById('foodex-search-input'); i.value = ''; i.dispatchEvent(new Event('input')); setFoodexPageTab('recipe')", badge: "setFoodexPageTab('badge')",
    foodDetail: "setFoodexPageTab('index'); openFoodDex({ name: '바나나 오트밀', ...CUSTOM_FOODS['바나나 오트밀'] }, { mode: 'index' }); document.getElementById('food-dex-add-btn').click()",
    addSheet: "closeFoodDex(); setActiveView('home'); openModal('lunch')", addSearch: "const f = document.getElementById('food-search'); f.value = '바나'; f.dispatchEvent(new Event('input', { bubbles: true }))",
    addProducts: "setFoodTab('products')", addCustom: "setFoodTab('custom')", foodEdit: "closeModal(); openFoodEdit('breakfast', 0)",
    timeEdit: "document.getElementById('meal-detail-modal')?.classList.remove('open'); openTimeEdit('breakfast')",
    chat: "document.getElementById('time-edit-modal')?.classList.remove('open'); setActiveView('home'); appendAgentMessage('안녕', 'user'); setAiDockPanel(true)",
  };
  for (const w of [393, 375, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: 852, deviceScaleFactor: 1, mobile: true });
    await evaluate(`setAiDockPanel(false); setActiveView('home'); ${W8(300)} return 1;`);
    const out = await evaluate(`const S = ${JSON.stringify(STATES)}; const o = {}; for (const [k, js] of Object.entries(S)) { try { eval(js); } catch (e) { o[k] = ['ERR ' + e.message]; continue; } ${W8(450)} const v = __overflowCheck(); if (v.length) o[k] = v.slice(0, 5); } setAiDockPanel(false); return o;`);
    check(`${w}px: 모든 페이지·시트·상세에서 카드 밖으로 튀어나온 것 없음(${Object.keys(STATES).length}개 화면)`, Object.keys(out).length === 0, JSON.stringify(out));
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true });
  const sp = await evaluate(`const S = { home: "setActiveView('home')", stats: "setActiveView('stats')", profile: "setActiveView('profile')", stock: "setActiveView('fridge'); setSearchHubView('stock')", recipe: "setActiveView('foodex'); setFoodexPageTab('recipe')", food: "setFoodexPageTab('index'); document.getElementById('search-index-layout-list')?.click()" };
    const o = {}; for (const [k, js] of Object.entries(S)) { eval(js); ${W8(450)}
      const panel = document.querySelector('.view-panel.active, [id^="view-"]:not([hidden])');
      const cards = [...document.querySelectorAll('.meal-card, .snack-card, .cal-card, .stats-day-card, .profile-summary-card, .profile-form-card, .stock-howto, .collection-card, .search-index-product, #foodex-tab-index')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 150 && b.top < innerHeight && b.bottom > 0 && b.left >= 0 && b.right <= innerWidth; });
      const top = cards.filter(c => !cards.some(p => p !== c && p.contains(c)));
      const R = [...new Set(top.map(c => Math.round(innerWidth - c.getBoundingClientRect().right)))];
      const s = top.map(c => c.getBoundingClientRect()).sort((a, b) => a.top - b.top); const gaps = []; for (let i = 1; i < s.length; i++) if (Math.abs(s[i].left - s[i - 1].left) < 2 && s[i].top > s[i - 1].bottom - 1) gaps.push(Math.round(s[i].top - s[i - 1].bottom));
      const pads = [...new Set(top.filter(c => !c.matches('.meal-card, .snack-card, .search-index-product, #foodex-tab-index')).map(c => getComputedStyle(c).paddingTop))];
      o[k] = { R, gaps: [...new Set(gaps)], pads }; }
    return o;`);
  check('페이지 오른쪽 여백 28px, 카드 사이 12px(식단·목록), 카드 안쪽 16px', Object.values(sp).every(v => v.R.every(r => r === 28) && v.gaps.every(g => g === 12 || g === 8 || g > 40) && v.pads.every(p => p === '16px')) && sp.home.gaps.includes(12), JSON.stringify(sp));
  // 글자 크기·굵기: 공용 단계만(큰 숫자 24px 이상, 그래프·달력 칸 7·8px은 예외)
  const typo = await evaluate(`const S = ["setActiveView('home')", "openMealPage('breakfast')", "closeMealPage(); setActiveView('stats')", "setActiveView('profile')", "setActiveView('fridge'); setSearchHubView('shopping')", "setSearchHubView('stock')", "setActiveView('foodex'); setFoodexPageTab('index')", "setFoodexPageTab('recipe')", "setFoodexPageTab('badge')", "setFoodexPageTab('index'); openFoodDex({ name: '바나나', ...FOOD_DB['바나나'] }, { mode: 'index' })", "closeFoodDex(); setActiveView('home'); openModal('lunch')", "setFoodTab('custom')"];
    const SIZES = new Set([10, 11, 12, 13, 15, 17, 20]); const WEIGHTS = new Set(['400', '500', '600', '700']); const bad = new Set(); const pairs = new Set();
    for (const js of S) { eval(js); ${W8(400)} for (const e of document.querySelectorAll('body *')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const b = e.getBoundingClientRect(); if (!b.width || b.bottom < 0 || b.top > innerHeight) continue; const s = getComputedStyle(e); if (s.visibility === 'hidden' || +s.opacity === 0) continue;
      const fs = parseFloat(s.fontSize); pairs.add(fs + '/' + s.fontWeight); if (fs >= 24 || fs <= 8 || e.closest('.sr-only, button.modal-x-btn, #food-modal-x, #meal-detail-x')) continue; if (!SIZES.has(fs) || !WEIGHTS.has(s.fontWeight)) bad.add(fs + '/' + s.fontWeight + ' ' + (e.id ? '#' + e.id : (e.className || e.tagName)).toString().slice(0, 40)); } }
    closeModal(); return { bad: [...bad].slice(0, 12), pairs: pairs.size };`);
  check('글자: 크기 10·11·12·13·15·17·20(+큰 숫자), 굵기 400·500·600·700만', typo.bad.length === 0, JSON.stringify(typo));
  // 버튼 규칙: 주(검정 둥근)·보조(연회색 둥근) 48px
  const btn = await evaluate(`const g = id => { const e = document.getElementById(id); const s = getComputedStyle(e); return [s.backgroundColor, s.borderRadius, s.height, s.borderTopWidth]; };
    return { save: g('settings-save'), timeSave: g('time-edit-save'), timeClose: g('time-edit-close'), mealSave: g('meal-detail-save-btn'), mealClose: g('meal-detail-close') };`);
  const isP = v => v[0] === 'rgb(31, 35, 41)' && v[1] === '999px' && v[2] === '48px' && v[3] === '0px'; const isS = v => v[0] === 'rgb(241, 242, 245)' && v[1] === '999px' && v[2] === '48px' && v[3] === '0px';
  check('버튼 규칙: 저장 = 검정 둥근 48px, 닫기·취소 = 연회색 둥근 48px(테두리 없음)', isP(btn.save) && isP(btn.timeSave) && isP(btn.mealSave) && isS(btn.timeClose) && isS(btn.mealClose), JSON.stringify(btn));
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (error) {
  failed++; results.push('ERROR ' + error.message); results.push('page errors: ' + errors.slice(0, 5).join(' | '));
} finally {
  console.log(results.join('\n'));
  console.log(`\n${results.length - failed}/${results.length} 통과`);
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(300); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}
