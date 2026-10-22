// 움직임: 식단기록 가로 밀기 = 날짜 이동(1:1·25%·튕기기·버튼도 같은 이동), 다른 탭은 가로 밀기 없음(탭 누름만), 세로 스크롤 잠금, 음식 옮길 때 FLIP, 최근 대화 시트, 동작 줄이기.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-motion.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9354, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-motion-'));
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
  const dk = () => evaluate('return dateKey(currentDate)'); const shift = (k, n) => { const [y, m, d] = k.split('-').map(Number); const t = new Date(y, m - 1, d + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  // 1. 식단기록 가로 밀기 = 날짜 이동: 지금 날(복제)과 다음 날이 손가락 1:1로 나란히, 페이지는 그대로
  await evaluate(`setActiveView('home'); await goToToday(); return 1;`); await sleep(500);
  const d1 = await dk();
  const dayX = () => evaluate(`const m = e => e ? new DOMMatrix(getComputedStyle(e).transform === 'none' ? undefined : getComputedStyle(e).transform).m41 : null; return { ghost: m(document.querySelector('#view-home > .meals-section.day-ghost')), live: m(document.querySelector('#view-home > .meals-section:not(.day-ghost)')), key: dateKey(currentDate), w: document.getElementById('view-home').getBoundingClientRect().width, stats: !document.getElementById('view-stats').hidden, home: m(document.getElementById('view-home')) };`);
  await touch('touchStart', 300, 500);
  for (const x of [290, 282, 274, 266]) { await touch('touchMove', x, 501); await sleep(16); }
  const a1 = await dayX();
  await touch('touchMove', 216, 502); await sleep(60);
  const b1 = await dayX();
  for (const x of [180, 140, 100]) { await touch('touchMove', x, 502); await sleep(8); } await touch('touchEnd');
  await sleep(400);
  const after = await evaluate(`return { view: activeView, key: dateKey(currentDate), label: document.getElementById('current-date').textContent, ghosts: document.querySelectorAll('.day-ghost').length };`);
  check('식단기록: 가로로 밀면 날짜 — 지금 날 1:1(50px → -50px), 다음 날 내용이 바로 옆(너비만큼)에서 같이 오고, 빠르게 넘기면 다음 날(페이지·탭 그대로)', Math.abs(b1.ghost - a1.ghost + 50) <= 1 && Math.abs(b1.live - b1.ghost - b1.w) <= 1 && b1.key === shift(d1, 1) && !b1.stats && !b1.home && after.view === 'home' && after.key === shift(d1, 1) && !after.ghosts, JSON.stringify({ a1, b1, after }));
  await sleep(200);
  // 2. 다른 탭: 가로로 밀어도 아무 일 없음(페이지 안 바뀌고, 끌림·고무줄 없음)
  const noSwipe = [];
  for (const v of ['stats', 'foodex', 'fridge', 'profile']) {
    await evaluate(`setActiveView('${v}'); return 1;`); await sleep(450);
    let maxPull = 0; const id = await evaluate(`return document.querySelector('.app-content.view-panel:not([hidden])').id`);
    for (const [x0, x1] of [[330, 60], [60, 330]]) { await touch('touchStart', x0, 500); for (let k = 1; k <= 8; k++) { await touch('touchMove', x0 + (x1 - x0) * k / 8, 500); await sleep(16); maxPull = Math.max(maxPull, Math.abs(await panelX(id))); } await touch('touchEnd'); await sleep(350); }
    noSwipe.push({ v, maxPull, view: await evaluate('return activeView'), peek: await evaluate(`return !!document.querySelector('.page-peek')`) });
  }
  check('리포트·도감·팬트리·설정: 가로 밀기로 페이지 안 바뀌고 끌림·고무줄 없음', noSwipe.every(r => r.maxPull === 0 && r.view === r.v && !r.peek), JSON.stringify(noSwipe));
  // 3. 세로로 스크롤하면 가로로 안 끌림
  await evaluate(`setActiveView('stats'); return 1;`); await sleep(400);
  await touch('touchStart', 200, 600); await touch('touchMove', 203, 585); await touch('touchMove', 230, 520); await touch('touchMove', 250, 450);
  const vx = await panelX('view-stats'); await touch('touchEnd'); await sleep(100);
  const vView = await evaluate(`return activeView;`);
  check('세로로 먼저 움직이면 방향 고정: 가로로 안 끌리고 페이지 그대로', vx === 0 && vView === 'stats', JSON.stringify({ vx, vView }));
  // 4. 음식 옮기기 → FLIP
  await evaluate(`setActiveView('home'); return 1;`); await sleep(500);
  const seed = `meals.breakfast.foods = [{ id: 'm1', name: '바나나', cal: 93 }, { id: 'm2', name: '사과', cal: 52 }]; meals.lunch.foods = [{ id: 'm3', name: '김밥', cal: 300 }]; meals.dinner.foods = []; renderAll(true); setTimelineEditing(true); ['breakfast-card', 'lunch-card'].forEach(id => document.getElementById(id)?.classList.add('expanded')); await new Promise(r => setTimeout(r, 400));`;
  const flip = await evaluate(`${seed} const before = document.querySelector('[data-food-id="m1"]').getBoundingClientRect().top; moveFoodToDestination({ kind: 'meal', mealId: 'breakfast', idx: 0 }, { type: 'meal', mealId: 'lunch' }); const moved = document.querySelector('#lunch-card [data-food-id="m1"]'); const anims = document.getAnimations().filter(a => a.effect?.target?.closest?.('#view-home')); return { inLunch: !!moved, before: Math.round(before), after: Math.round(moved?.getBoundingClientRect().top || 0), movedAnim: !!moved?.getAnimations().length, total: anims.length, onlyTransform: anims.every(a => a.effect.getKeyframes().every(k => Object.keys(k).every(p => ['transform', 'opacity', 'zIndex', 'offset', 'easing', 'composite', 'computedOffset'].includes(p)))) };`);
  check('점심으로 옮긴 바나나가 옛 자리에서 움직여 들어가고(이웃 줄·카드도 움직임), transform·opacity 만', flip.inLunch && flip.movedAnim && flip.total >= 2 && flip.onlyTransform, JSON.stringify(flip));
  await sleep(500);
  // 5. 동작 줄이기면 FLIP 없음
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const rm = await evaluate(`${seed} moveFoodToDestination({ kind: 'meal', mealId: 'breakfast', idx: 0 }, { type: 'meal', mealId: 'lunch' }); return document.getAnimations().filter(a => a.effect?.target?.closest?.('#view-home .food-item, #view-home .meal-card')).length;`);
  check('동작 줄이기: 옮길 때 애니메이션 없음', rm === 0, String(rm));
  await send('Emulation.setEmulatedMedia', { features: [] });
  await evaluate(`setTimelineEditing(false); meals.breakfast.foods = []; meals.lunch.foods = []; renderAll(true); return 1;`);
  // 6. 최근 대화 시트
  const sheet = await evaluate(`appendAgentMessage('아침 바나나', 'user'); appendAgentMessage('바나나 93kcal 아침에 기록했어요', 'agent'); const h = document.getElementById('ai-dock-history'); const c = document.querySelector('.ai-dock-capsule').getBoundingClientRect(); const hr = h.getBoundingClientRect(); const s = document.getElementById('agent-send').getBoundingClientRect(); const order = hr.right <= c.left && c.right <= s.left && Math.round(hr.width) === 40; h.click(); await new Promise(r => setTimeout(r, 400)); const p = document.getElementById('ai-dock-panel'); const pr = p.getBoundingClientRect(); const open = !p.hidden && p.classList.contains('is-open') && Math.abs(pr.bottom - innerHeight) < 2 && !!document.querySelector('#ai-sheet-backdrop.is-open') && p.querySelectorAll('.agent-message').length >= 2; document.getElementById('ai-sheet-backdrop').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise(r => setTimeout(r, 400)); return { order, open, closed: p.hidden && !p.classList.contains('is-open'), count: h.dataset.count };`);
  check('입력줄 [최근 대화][입력][보내기], 누르면 아래에서 시트, 바깥 누르면 닫힘', sheet.order && sheet.open && sheet.closed && +sheet.count >= 2, JSON.stringify(sheet));
  // 7. + 버튼: 테두리 없이 연한 채움 36px
  const plus = await evaluate(`const b = document.getElementById('add-lunch'); const cs = getComputedStyle(b); return { w: Math.round(b.getBoundingClientRect().width), border: cs.borderTopWidth, bg: cs.backgroundColor, stroke: getComputedStyle(b.querySelector('path')).strokeWidth };`);
  check('+ 버튼: 테두리 없음·#F4F5F7·36px·선 1.75', plus.w === 36 && plus.border === '0px' && plus.bg === 'rgb(244, 245, 247)' && plus.stroke === '1.75px', JSON.stringify(plus));
  // 8. 날짜 줄·전체 삭제
  const dateRow = await evaluate(`setActiveView('home'); setTimelineEditing(false); await goToToday(); await new Promise(r => setTimeout(r, 300)); const prev = document.getElementById('prev-day').getBoundingClientRect(); const next = document.getElementById('next-day').getBoundingClientRect(); const d = document.getElementById('date-display').getBoundingClientRect(); const b = document.getElementById('date-badge').getBoundingClientRect(); const t = document.getElementById('current-date').getBoundingClientRect(); const mid = (prev.right + next.left) / 2; const clear = document.getElementById('clear-day-btn'); const clearRow = clear.closest('.day-clear-row'); const hiddenNormally = getComputedStyle(clearRow).display === 'none'; await changeDate(-1); const y = document.getElementById('date-badge').textContent; await changeDate(-1); const two = document.getElementById('date-badge').hidden; document.getElementById('date-display').click(); await new Promise(r => setTimeout(r, 400)); const back = isToday(currentDate) && document.getElementById('date-badge').textContent === '오늘'; setTimelineEditing(true); await new Promise(r => setTimeout(r, 300)); const cr = clear.getBoundingClientRect(); const rail = document.querySelector('#view-home .meals-section').getBoundingClientRect(); const firstCard = document.querySelector('#view-home .meal-card, #view-home .snack-card:not([hidden])').getBoundingClientRect(); const cards = [...document.querySelectorAll('#view-home .meal-card, #view-home .snack-card')].filter(c => !c.hidden).map(c => c.getBoundingClientRect()); const lastBottom = Math.max(...cards.map(c => c.bottom)); const shownEdit = getComputedStyle(clearRow).display !== 'none' && cr.width > 0 && cr.top >= lastBottom - 1 && Math.abs(cr.right - rail.right) <= 8 && getComputedStyle(clear).color === 'rgb(94, 100, 112)' && clear.textContent.trim() === '전체삭제'; setTimelineEditing(false); return { centered: Math.abs((d.left + d.right) / 2 - mid) <= 2, oneRow: Math.abs((b.top + b.bottom) / 2 - (t.top + t.bottom) / 2) <= 4, noTodayBtn: !document.getElementById('go-today'), hiddenNormally, y, two, back, shownEdit, hiddenAgain: getComputedStyle(clearRow).display === 'none' };`);
  check('날짜: 화살표 사이 가운데 한 줄, 오늘 버튼 없음, 어제·(그 밖엔 비움), 날짜 누르면 오늘; 전체삭제는 편집 중에만 목록 아래 오른쪽 회색 글자', dateRow.centered && dateRow.oneRow && dateRow.noTodayBtn && dateRow.hiddenNormally && dateRow.y === '어제' && dateRow.two && dateRow.back && dateRow.shownEdit && dateRow.hiddenAgain, JSON.stringify(dateRow));
  // 9. 공용 세그먼트: 흰 칸이 고른 버튼 아래로
  const seg = await evaluate(`setActiveView('foodex'); await new Promise(r => setTimeout(r, 400)); const chips = document.getElementById('foodex-filter-chips'); document.querySelector('[data-foodex-filter="frequent"]').click(); await new Promise(r => setTimeout(r, 400)); const th = chips.querySelector('.rb-seg-thumb').getBoundingClientRect(); const b = document.querySelector('[data-foodex-filter="frequent"]').getBoundingClientRect(); const ok1 = Math.abs(th.left - b.left) < 1.5 && Math.abs(th.width - b.width) < 1.5 && getComputedStyle(chips).backgroundColor === 'rgb(232, 233, 237)'; document.querySelector('[data-foodex-filter="all"]').click(); setActiveView('fridge'); await new Promise(r => setTimeout(r, 400)); const tabs = document.querySelector('.search-hub-main-tabs'); const act = [...tabs.querySelectorAll('button')].find(x => x.classList.contains('active') && x.offsetParent); const t2 = tabs.querySelector('.rb-seg-thumb')?.getBoundingClientRect(); const a2 = act?.getBoundingClientRect(); return { ok1, ok2: !!t2 && !!a2 && Math.abs(t2.left - a2.left) < 1.5 && Math.abs(t2.width - a2.width) < 1.5, filterWorks: document.querySelector('[data-foodex-filter="all"]').classList.contains('active') };`);
  check('식도감 필터·그로서리 탭: 회색 트랙 위 흰 칸이 고른 버튼 자리로, 필터 동작 그대로', seg.ok1 && seg.ok2 && seg.filterWorks, JSON.stringify(seg));
  // 10. 위쪽 탭: 글자만(식단기록·건강리포트·음식도감·팬트리·설정), 고른 탭 밑줄 = 글자 폭, 좁은 화면에서도 고른 탭이 화면 안(가로로 굴림)
  const tabC = []; for (const w of [393, 320]) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: 852, deviceScaleFactor: 1, mobile: true }); await sleep(200);
    tabC.push(...await evaluate(`const nav = document.getElementById('page-tabs'); const views = [...nav.querySelectorAll('.page-tab')].map(b => b.dataset.view); const out = []; for (const v of views) { setActiveView(v); await new Promise(r => setTimeout(r, 650)); const act = nav.querySelector('.page-tab.active'); const label = act.querySelector('span').getBoundingClientRect(); const ind = document.querySelector('.page-tab-indicator').getBoundingClientRect(); const nr = nav.getBoundingClientRect(); out.push({ w: innerWidth, v, names: [...nav.querySelectorAll('.page-tab')].map(b => b.textContent.trim()).join('·'), noIcon: !nav.querySelector('.page-tab-icon'), indL: Math.round((ind.left - label.left) * 10) / 10, indR: Math.round((ind.right - label.right) * 10) / 10, inside: label.left >= nr.left - 0.5 && label.right <= nr.right + 0.5, bold: getComputedStyle(act).fontWeight === '700' }); } setActiveView('home'); await new Promise(r => setTimeout(r, 300)); return out;`)); }
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 1, mobile: true }); await sleep(200);

  check('위쪽 탭: 식단기록·건강리포트·음식도감·팬트리·설정 글자만, 고른 탭 굵게·밑줄은 글자 폭(±1.5px), 393·320 모두 고른 탭이 화면 안', tabC.every(t => t.names === '식단기록·건강리포트·음식도감·팬트리·설정' && t.noIcon && t.bold && Math.abs(t.indL) <= 1.5 && Math.abs(t.indR) <= 1.5 && t.inside), JSON.stringify(tabC.filter(t => !(t.noIcon && t.bold && Math.abs(t.indL) <= 1.5 && Math.abs(t.indR) <= 1.5 && t.inside)).concat(tabC.slice(0, 1))));
  // 13. 날짜 천천히 밀기: 너비 25%(약 98px) 안 넘으면 제자리, 넘으면 넘어감(왼쪽 → 다음 날, 오른쪽 → 전날), 빠르게 튕기면 넘어감, 미래도 가능
  const slow = async (x0, x1) => { await touch('touchStart', x0, 500); for (let x = x0; (x1 - x) * Math.sign(x1 - x0) > 0; x += Math.sign(x1 - x0) * 6) { await touch('touchMove', x, 500); await sleep(30); } await touch('touchMove', x1, 500); await sleep(30); await touch('touchEnd'); await sleep(450); return evaluate('return dateKey(currentDate) + "|" + activeView'); };
  await evaluate(`setActiveView('home'); await goToToday(); return 1;`); await sleep(500);
  const d13 = await dk();
  const slowShort = await slow(300, 220);
  const slowLong = await slow(320, 190);
  const slowBack = await slow(90, 240);
  const slowBack2 = await slow(90, 240);
  const flick = await (async () => { await touch('touchStart', 300, 500); for (const x of [280, 250, 210, 170]) { await touch('touchMove', x, 500); await sleep(10); } await touch('touchEnd'); await sleep(450); return evaluate('return dateKey(currentDate) + "|" + activeView'); })();
  const flick2 = await (async () => { await touch('touchStart', 300, 500); for (const x of [280, 250, 210, 170]) { await touch('touchMove', x, 500); await sleep(10); } await touch('touchEnd'); await sleep(450); return evaluate('return dateKey(currentDate) + "|" + activeView'); })();
  const snapCss = await evaluate(`return document.getElementById('view-stats').scrollWidth + '|' + document.getElementById('view-profile').scrollWidth + '|' + innerWidth;`);
  check('날짜: 80px → 제자리, 130px → 다음 날, 오른쪽 150px → 전날(두 번 → 어제), 빠르게 튕기면 다음 날·미래(내일)도 됨, 페이지는 식단기록 그대로', slowShort === `${d13}|home` && slowLong === `${shift(d13, 1)}|home` && slowBack === `${d13}|home` && slowBack2 === `${shift(d13, -1)}|home` && flick === `${d13}|home` && flick2 === `${shift(d13, 1)}|home` && snapCss.split('|').slice(0, 2).every(w => +w <= +snapCss.split('|')[2]), JSON.stringify({ d13, slowShort, slowLong, slowBack, slowBack2, flick, flick2, snapCss }));
  // 13b. < > 버튼·날짜 누름도 같은 이동(지금 날 복제가 빠지고 새 날이 같은 쪽에서), 편집 중·키보드 중엔 밀어도 날짜 그대로
  const btn = await evaluate(`await goToToday(); await new Promise(r => setTimeout(r, 400)); const k0 = dateKey(currentDate); const m = e => e ? new DOMMatrix(getComputedStyle(e).transform === 'none' ? undefined : getComputedStyle(e).transform).m41 : null;
    document.getElementById('next-day').click(); await new Promise(r => setTimeout(r, 120)); const midNext = { ghost: m(document.querySelector('#view-home > .day-summary.day-ghost')), live: m(document.querySelector('#view-home > .day-summary:not(.day-ghost)')) };
    await new Promise(r => setTimeout(r, 400)); const k1 = dateKey(currentDate);
    document.getElementById('prev-day').click(); await new Promise(r => setTimeout(r, 120)); const midPrev = { ghost: m(document.querySelector('#view-home > .day-summary.day-ghost')), live: m(document.querySelector('#view-home > .day-summary:not(.day-ghost)')) };
    await new Promise(r => setTimeout(r, 400)); const k2 = dateKey(currentDate);
    document.getElementById('prev-day').click(); await new Promise(r => setTimeout(r, 450)); document.getElementById('date-display').click(); await new Promise(r => setTimeout(r, 120)); const midToday = m(document.querySelector('#view-home > .day-summary:not(.day-ghost)'));
    await new Promise(r => setTimeout(r, 400)); return { k0, k1, k2, k3: dateKey(currentDate), midNext, midPrev, midToday, ghosts: document.querySelectorAll('.day-ghost').length };`);
  check('< > 버튼·날짜 누름(오늘로)도 같은 밀기 이동', btn.k1 === shift(btn.k0, 1) && btn.k2 === btn.k0 && btn.k3 === btn.k0 && btn.midNext.ghost < -2 && btn.midNext.live > 2 && btn.midPrev.ghost > 2 && btn.midPrev.live < -2 && btn.midToday > 2 && !btn.ghosts, JSON.stringify(btn));
  await evaluate(`setTimelineEditing(true); return 1;`); await sleep(300);
  const editKey = await slow(320, 160);
  await evaluate(`setTimelineEditing(false); document.getElementById('agent-input').focus(); return 1;`); await sleep(200);
  const kbKey = await slow(320, 160);
  await evaluate(`document.getElementById('agent-input').blur(); return 1;`);
  check('편집 중·입력칸 포커스 중엔 밀어도 날짜 그대로', editKey === `${btn.k0}|home` && kbKey === `${btn.k0}|home`, JSON.stringify({ editKey, kbKey }));
  // 14. 편집에서 끼니 카드 끌기: 들려서(1.03·그림자) 따라오고, 다른 카드가 실시간으로 비켜 자리를 만들고, 놓으면 그 자리로
  await evaluate(`setActiveView('home'); Object.keys(meals).forEach(k => { meals[k].foods = []; }); renderAll(false); await addFood('breakfast', { name: '바나나', calories: 105, carbs: 27, protein: 1, fat: 0 }); await addFood('lunch', { name: '김밥', calories: 320, carbs: 50, protein: 9, fat: 8 }); await addFood('dinner', { name: '연어', calories: 280, carbs: 0, protein: 30, fat: 17 }); setTimelineEditing(true); await new Promise(r => setTimeout(r, 300)); document.querySelectorAll('#view-home .meal-card.expanded').forEach(c => c.classList.remove('expanded')); document.querySelectorAll('#view-home .meal-card .drag-handle').forEach(h => h.classList.remove('is-disabled')); window.scrollTo(0, 0); document.getElementById('view-home').scrollTop = 0; return 1;`); await sleep(400);
  const hp = await evaluate(`const r = document.querySelector('#breakfast-card .drag-handle').getBoundingClientRect(); const d = document.getElementById('dinner-card').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, dy: d.top + d.height / 2 - (r.top + r.height / 2) + 16 };`);
  await touch('touchStart', hp.x, hp.y);
  const frames = [];
  for (let k = 1; k <= 14; k++) { await touch('touchMove', hp.x, hp.y + hp.dy * k / 14); await sleep(30); if (k === 9 || k === 14) frames.push(await evaluate(`const gr = document.querySelector('.meal-drag-ghost.is-lifted')?.getBoundingClientRect(); const br = document.getElementById('breakfast-card').getBoundingClientRect(); const lr = document.getElementById('lunch-card').getBoundingClientRect(); return { n: document.querySelectorAll('.meal-drag-ghost').length, g: gr && [Math.round(gr.top), Math.round(gr.height)], b: [Math.round(br.top), Math.round(br.height)], l: [Math.round(lr.top), Math.round(lr.height)], lunch: document.getElementById('lunch-card').style.transform, dinner: document.getElementById('dinner-card').style.transform };`)); }
  await sleep(120);
  const mid = await evaluate(`const g = document.querySelector('.meal-drag-ghost.is-lifted'); const gr = g?.getBoundingClientRect(); const near = !!gr && Math.abs(gr.top + gr.height / 2 - ${hp.y + hp.dy}) < 50 && gr.top > 0 && gr.bottom < innerHeight; const tf = id => document.getElementById(id).style.transform; return { near, ghost: !!g, lifted: g && getComputedStyle(g).scale, shadow: !!g && getComputedStyle(g).boxShadow !== 'none', lunch: tf('lunch-card'), dinner: tf('dinner-card'), src: getComputedStyle(document.getElementById('breakfast-card')).opacity, moving: getComputedStyle(document.getElementById('lunch-card')).transitionDuration };`);
  try { const png = await send('Page.captureScreenshot', { format: 'png' }); if (png.data) fs.writeFileSync(path.join(os.homedir(), 'reorder-mid.png'), Buffer.from(png.data, 'base64')); } catch {}
  await touch('touchEnd'); await sleep(500);
  const done = await evaluate(`return { b: meals.breakfast.foods.map(f => f.name).join(), l: meals.lunch.foods.map(f => f.name).join(), d: meals.dinner.foods.map(f => f.name).join(), ghost: !!document.querySelector('.meal-drag-ghost'), tf: [...document.querySelectorAll('#view-home .meal-card')].map(c => c.style.transform).join('') };`);
  await evaluate(`setTimelineEditing(false); return 1;`);
  check('카드 끌기: 들려서 손가락 아래 따라오고(1.03·그림자) 점심·저녁이 실시간으로 위로 비킴, 놓으면 아침 내용이 저녁 자리로(사이는 한 칸씩), 복제본·이동값 정리', mid.ghost && mid.near && mid.lifted === '1.03' && mid.shadow && /translateY\(-/.test(mid.lunch) && /translateY\(-/.test(mid.dinner) && /translateY\(-/.test(frames[0].lunch) && !frames[0].dinner && mid.src === '0' && done.b === '김밥' && done.l === '연어' && done.d === '바나나' && !done.ghost && !done.tf, JSON.stringify({ frames, mid, done }));
  // 15. 굵은 검정 테두리 없음(모든 페이지·끼니 상세)
  const heavy = await evaluate(`const dark = c => { const m = c.match(/[\\d.]+/g); if (!m) return false; const a = m.length > 3 ? +m[3] : 1; return a > 0.3 && (+m[0] + +m[1] + +m[2]) / 3 < 110; };
    const scan = root => { const out = []; for (const el of root.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(el); for (const s of ['Top', 'Right', 'Bottom', 'Left']) { if (parseFloat(cs['border' + s + 'Width']) >= 1 && cs['border' + s + 'Style'] !== 'none' && dark(cs['border' + s + 'Color'])) { out.push((el.id || el.className).toString().slice(0, 40)); break; } } } return out; };
    await addFood('breakfast', { name: '사과', calories: 52, carbs: 14, protein: 0, fat: 0 });
    const found = {}; for (const v of ['fridge', 'foodex', 'home', 'stats', 'profile']) { setActiveView(v); await new Promise(r => setTimeout(r, 120)); if (v === 'home') document.querySelectorAll('#view-home .meal-card.has-items').forEach(c => c.classList.add('expanded')); found[v] = scan(document.querySelector('.app-content.view-panel:not([hidden])')); }
    setActiveView('home'); openMealPage('breakfast'); await new Promise(r => setTimeout(r, 150)); found.meal = scan(document.getElementById('view-meal-detail')); closeMealPage();
    found.pad = [...document.querySelectorAll('.app-content.view-panel')].map(p => getComputedStyle(p).paddingLeft).filter(v => v !== '28px');
    return found;`);
  check('굵은 검정 테두리 없음(그로서리·식도감·식단(펼친 카드 포함)·리포트·설정·끼니 상세), 모든 페이지 좌우 여백 같음', Object.values(heavy).every(a => a.length === 0), JSON.stringify(heavy));
  // 16. 놓은 뒤 궤적(날짜 밀기): 지금 날·다음 날 모두 목표 쪽으로만, 넘침 없음, 약 250ms 에 끝, 남은 복제·이동값 없음
  await evaluate(`setActiveView('home'); await goToToday(); return 1;`); await sleep(500);
  const d16 = await dk();
  await touch('touchStart', 320, 500);
  for (const x of [308, 290, 270, 250, 230, 210, 190, 170, 150]) { await touch('touchMove', x, 500); await sleep(30); }
  await evaluate(`window.__traj = []; const m = e => { if (!e) return null; const t = getComputedStyle(e).transform; return t === 'none' ? 0 : new DOMMatrix(t).m41; }; const t0 = performance.now(); const tick = () => { window.__traj.push([Math.round(performance.now() - t0), m(document.querySelector('#view-home > .day-summary.day-ghost')), m(document.querySelector('#view-home > .day-summary:not(.day-ghost)'))]); if (performance.now() - t0 < 500) requestAnimationFrame(tick); }; requestAnimationFrame(tick); return 1;`);
  await touch('touchEnd'); await sleep(600);
  const traj = await evaluate(`return { t: window.__traj, w: document.getElementById('view-home').getBoundingClientRect().width, view: activeView, key: dateKey(currentDate), ghosts: document.querySelectorAll('.day-ghost').length, styles: [...document.querySelectorAll('#view-home > *')].map(e => e.style.transform).join('') };`);
  const tr = traj.t.filter(f => f[1] != null);
  const mono = tr.every((f, i) => i === 0 || (f[1] <= tr[i - 1][1] + 0.5 && f[2] <= tr[i - 1][2] + 0.5));
  const noOver = tr.every(f => f[1] >= -traj.w - 0.5 && f[2] >= -0.5);
  const doneAt = (traj.t.find(f => f[1] == null) || [999])[0];
  check('날짜 밀기 놓은 뒤 궤적: 지금 날·다음 날 모두 목표 쪽으로만(튕김 없음), 약 250ms 에 다음 날로 끝, 복제·이동값 정리', tr.length > 3 && mono && noOver && doneAt <= 360 && traj.view === 'home' && traj.key === shift(d16, 1) && !traj.ghosts && !traj.styles, JSON.stringify({ mono, noOver, doneAt, frames: traj.t.length, first: traj.t.slice(0, 3), last: tr.slice(-2), key: traj.key, ghosts: traj.ghosts, styles: traj.styles }));
  // 17. 페이지는 세로 스크롤만 브라우저가, 가로는 앱이(iOS 가로 끌림 막음)
  const ta = await evaluate(`return [...document.querySelectorAll('.app-content.view-panel')].map(p => getComputedStyle(p).touchAction + '/' + getComputedStyle(p).overscrollBehaviorX).join(',') + '|' + getComputedStyle(document.body).overscrollBehaviorX;`);
  check('페이지: touch-action pan-y, 가로 오버스크롤 없음', ta.split('|')[0].split(',').every(v => v === 'pan-y/none') && ta.split('|')[1] === 'none', ta);
  // 18. 탭 누름 이동: 다른 모든 탭에서 리포트·설정을 누르면 지금 페이지와 고른 페이지가 나란히 250ms 감속으로(밀기와 같게), 여러 칸 건너뛰어도 되돌아옴 없음
  const tapRuns = [];
  for (const to of ['stats', 'profile']) {
    for (const from of ['fridge', 'foodex', 'home', 'stats', 'profile'].filter(v => v !== to)) {
      await evaluate(`setActiveView('${from}'); return 1;`); await sleep(350);
      const run = await evaluate(`const order = PAGE_ORDER; const dir = Math.sign(order.indexOf('${to}') - order.indexOf('${from}'));
        const pid = v => (v === 'fridge' || v === 'foodex') ? 'view-search' : 'view-' + v;
        const cur = document.getElementById(pid('${from}')), tgt = document.getElementById(pid('${to}'));
        const m = e => { const t = getComputedStyle(e).transform; return t === 'none' ? 0 : new DOMMatrix(t).m41; };
        const W = cur.getBoundingClientRect().width; const frames = []; let pageIn = false, stagger = 0;
        const t0 = performance.now();
        await new Promise(res => { const tick = () => { frames.push([Math.round(performance.now() - t0), Math.round(m(cur) * 10) / 10, Math.round(m(tgt) * 10) / 10, activeView, !tgt.hidden]);
          if (document.querySelector('.page-in-right, .page-in-left')) pageIn = true; stagger = Math.max(stagger, document.querySelectorAll('#' + tgt.id + ' .stagger-in').length);
          if (performance.now() - t0 < 480) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick);
          document.querySelector('#page-tabs .page-tab[data-view="${to}"]').click(); });
        await new Promise(r => setTimeout(r, 80));
        return { dir, W, frames, pageIn, stagger, view: activeView, peek: !!document.querySelector('.page-peek'), styles: [cur, tgt].map(e => e.style.transform).join(''), curHidden: cur.hidden };`);
      const mid = run.frames.filter(f => f[3] === from && f[4]);
      const d = run.dir;
      const mono = mid.every((f, i) => i === 0 || (d * (f[1] - mid[i - 1][1]) <= 0.5 && d * (f[2] - mid[i - 1][2]) <= 0.5));
      const noOver = run.frames.every(f => d * f[2] >= -0.5 && d * f[1] >= -run.W - 0.5);
      const side = mid.length > 0 && Math.abs(mid[0][2]) >= run.W * 0.5; // 첫 프레임: 고른 페이지가 바로 옆(48px 들어오기 아님)
      const doneAt = (run.frames.find(f => f[3] === to) || [999])[0];
      const ok = mono && noOver && side && doneAt <= 360 && !run.pageIn && run.stagger === 0 && run.view === to && !run.peek && !run.styles && run.curHidden;
      tapRuns.push({ from, to, ok, mono, noOver, side, doneAt, frames: mid.length, pageIn: run.pageIn, first: mid[0]?.slice(1, 3), last: mid[mid.length - 1]?.slice(1, 3) });
    }
  }
  check('탭 누름 궤적: 모든 탭 → 리포트·설정, 두 페이지가 나란히 목표 쪽으로만(넘침·되돌아옴 없음), 바로 옆에서 시작, 약 250ms, 들어오기·차례로 나타나기 없음', tapRuns.every(r => r.ok), JSON.stringify(tapRuns.filter(r => !r.ok).concat(tapRuns.slice(0, 1))));
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
