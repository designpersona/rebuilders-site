// 움직임: 페이지 밀기(1:1·끝 고무줄 40px·세로 스크롤 잠금·차례로 나타나기 안 겹침), 음식 옮길 때 FLIP, 최근 대화 시트, 동작 줄이기.
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
const panelX = view => evaluate(`const m = (document.getElementById('${view}').style.transform || '').match(/translateX\\((-?[\\d.]+)px\\)/); return m ? parseFloat(m[1]) : 0;`);
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
  // 1. 리포트 → 손가락의 0.6배
  await evaluate(`setActiveView('stats'); return 1;`); await sleep(500);
  // (첫 이동은 브라우저가 삼킬 수 있어 방향이 정해진 뒤 두 지점 사이 차이로 1:1 확인)
  await touch('touchStart', 300, 500);
  for (const x of [290, 282, 274, 266]) { await touch('touchMove', x, 501); await sleep(16); }
  const x1 = await panelX('view-stats');
  await touch('touchMove', 216, 502); await sleep(16);
  const follow = (await panelX('view-stats')) - x1 - 0; // 50px 더 밀면 -30(0.6배)
  for (const x of [180, 140, 100]) { await touch('touchMove', x, 502); await sleep(8); } await touch('touchEnd');
  await sleep(60);
  const after = await evaluate(`return { view: activeView, stagger: document.querySelectorAll('#view-profile .stagger-in').length, slide: document.getElementById('view-profile').classList.contains('page-in-right') };`);
  check('리포트: 손가락의 0.6배(50px → -30px) 따라옴, 빠르게 넘기면 설정, 차례로 나타나기는 겹치지 않음', Math.abs(follow + 30) <= 1.5 && after.view === 'profile' && after.stagger === 0 && after.slide, JSON.stringify({ follow, after }));
  await sleep(400);
  // 2. 설정(마지막) → 더 밀어도 40px 까지만, 놓으면 제자리
  await touch('touchStart', 330, 500); await touch('touchMove', 318, 500); await sleep(20);
  let maxPull = 0;
  for (let x = 300; x >= 40; x -= 40) { await touch('touchMove', x, 500); await sleep(16); maxPull = Math.max(maxPull, Math.abs(await panelX('view-profile'))); }
  await touch('touchEnd'); await sleep(350);
  const edge = await evaluate(`return { view: activeView, t: document.getElementById('view-profile').style.transform };`);
  check('설정(끝): 끝까지 당겨도 40px 이하 고무줄, 놓으면 제자리', maxPull > 10 && maxPull <= 40 && edge.view === 'profile' && !edge.t, JSON.stringify({ maxPull, edge }));
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
  const dateRow = await evaluate(`setActiveView('home'); setTimelineEditing(false); await new Promise(r => setTimeout(r, 300)); const prev = document.getElementById('prev-day').getBoundingClientRect(); const next = document.getElementById('next-day').getBoundingClientRect(); const d = document.getElementById('date-display').getBoundingClientRect(); const b = document.getElementById('date-badge').getBoundingClientRect(); const t = document.getElementById('current-date').getBoundingClientRect(); const mid = (prev.right + next.left) / 2; const clear = document.getElementById('clear-day-btn'); const hiddenNormally = getComputedStyle(clear).display === 'none'; await changeDate(-1); const y = document.getElementById('date-badge').textContent; await changeDate(-1); const two = document.getElementById('date-badge').hidden; document.getElementById('date-display').click(); await new Promise(r => setTimeout(r, 400)); const back = isToday(currentDate) && document.getElementById('date-badge').textContent === '오늘'; setTimelineEditing(true); await new Promise(r => setTimeout(r, 300)); const cr = clear.getBoundingClientRect(); const rail = document.querySelector('#view-home .meals-section').getBoundingClientRect(); const firstCard = document.querySelector('#view-home .meal-card, #view-home .snack-card:not([hidden])').getBoundingClientRect(); const shownEdit = getComputedStyle(clear).display !== 'none' && cr.width > 0 && cr.bottom <= firstCard.top + 1 && Math.abs(cr.left - rail.left) <= 8 && getComputedStyle(clear).color === 'rgb(229, 72, 77)'; setTimelineEditing(false); return { centered: Math.abs((d.left + d.right) / 2 - mid) <= 2, oneRow: Math.abs((b.top + b.bottom) / 2 - (t.top + t.bottom) / 2) <= 4, noTodayBtn: !document.getElementById('go-today'), hiddenNormally, y, two, back, shownEdit, hiddenAgain: getComputedStyle(clear).display === 'none' };`);
  check('날짜: 화살표 사이 가운데 한 줄, 오늘 버튼 없음, 어제·(그 밖엔 비움), 날짜 누르면 오늘; 전체 삭제는 편집 중에만 시간 줄 위 왼쪽 빨간 글자', dateRow.centered && dateRow.oneRow && dateRow.noTodayBtn && dateRow.hiddenNormally && dateRow.y === '어제' && dateRow.two && dateRow.back && dateRow.shownEdit && dateRow.hiddenAgain, JSON.stringify(dateRow));
  // 9. 공용 세그먼트: 흰 칸이 고른 버튼 아래로
  const seg = await evaluate(`setActiveView('foodex'); await new Promise(r => setTimeout(r, 400)); const chips = document.getElementById('foodex-filter-chips'); document.querySelector('[data-foodex-filter="frequent"]').click(); await new Promise(r => setTimeout(r, 400)); const th = chips.querySelector('.rb-seg-thumb').getBoundingClientRect(); const b = document.querySelector('[data-foodex-filter="frequent"]').getBoundingClientRect(); const ok1 = Math.abs(th.left - b.left) < 1.5 && Math.abs(th.width - b.width) < 1.5 && getComputedStyle(chips).backgroundColor === 'rgb(232, 233, 237)'; document.querySelector('[data-foodex-filter="all"]').click(); setActiveView('fridge'); await new Promise(r => setTimeout(r, 400)); const tabs = document.querySelector('.search-hub-main-tabs'); const act = [...tabs.querySelectorAll('button')].find(x => x.classList.contains('active') && x.offsetParent); const t2 = tabs.querySelector('.rb-seg-thumb')?.getBoundingClientRect(); const a2 = act?.getBoundingClientRect(); return { ok1, ok2: !!t2 && !!a2 && Math.abs(t2.left - a2.left) < 1.5 && Math.abs(t2.width - a2.width) < 1.5, filterWorks: document.querySelector('[data-foodex-filter="all"]').classList.contains('active') };`);
  check('식도감 필터·그로서리 탭: 회색 트랙 위 흰 칸이 고른 버튼 자리로, 필터 동작 그대로', seg.ok1 && seg.ok2 && seg.filterWorks, JSON.stringify(seg));
  // 10. 고른 탭 글자가 정확히 화면 가운데, 아이콘이 글자를 밀지 않음, 밑줄은 글자 아래 가운데, 칸 간격 고름
  const tabC = await evaluate(`const nav = document.getElementById('page-tabs'); const views = [...nav.querySelectorAll('.page-tab')].map(b => b.dataset.view); const out = []; for (const v of views) { setActiveView(v); await new Promise(r => setTimeout(r, 450)); const tabs = [...nav.querySelectorAll('.page-tab')]; const act = nav.querySelector('.page-tab.active'); const idx = tabs.indexOf(act); const label = act.querySelector('span').getBoundingClientRect(); const icon = act.querySelector('.page-tab-icon').getBoundingClientRect(); const ind = document.querySelector('.page-tab-indicator').getBoundingClientRect(); const nr = nav.getBoundingClientRect(); const cs = getComputedStyle(nav); const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight); const colW = (nr.width - pl - pr) / 5; const colC = nr.left + pl + colW * (idx + 0.5); const span = el => el.querySelector('span').getBoundingClientRect(); const lg = idx > 0 ? icon.left - span(tabs[idx - 1]).right : null; const rg = idx < 4 ? span(tabs[idx + 1]).left - label.right : null; out.push({ v, groupC: Math.round(((icon.left + label.right) / 2 - colC) * 10) / 10, iconLeftOfText: icon.right <= label.left, indL: Math.round((ind.left - icon.left) * 10) / 10, indR: Math.round((ind.right - label.right) * 10) / 10, inside: icon.left >= 0 && label.right <= innerWidth, lg: lg && Math.round(lg), rg: rg && Math.round(rg), labelOff: Math.round(((label.left + label.right) / 2 - colC) * 10) / 10 }); } setActiveView('home'); await new Promise(r => setTimeout(r, 300)); return out;`);
  const home = tabC.find(t => t.v === 'home');
  check('켜진 탭 [아이콘+글자] 묶음이 칸 가운데(±1px), 밑줄은 아이콘 왼쪽 끝~글자 오른쪽 끝, 화면 밖으로 안 잘림(모든 탭), 식단 양옆 보이는 간격 같음(±2px)', tabC.every(t => Math.abs(t.groupC) <= 1 && t.iconLeftOfText && Math.abs(t.indL) <= 1.5 && Math.abs(t.indR) <= 1.5 && t.inside) && Math.abs(home.lg - home.rg) <= 2, JSON.stringify(tabC));
  // 13. 천천히 밀기: 너비 35%(약 138px) 안 넘으면 제자리, 넘으면 다음 페이지(손가락 왼쪽 → 오른쪽 페이지)
  const slow = async (x0, x1) => { await touch('touchStart', x0, 500); for (let x = x0; (x1 - x) * Math.sign(x1 - x0) > 0; x += Math.sign(x1 - x0) * 6) { await touch('touchMove', x, 500); await sleep(30); } await touch('touchMove', x1, 500); await sleep(30); await touch('touchEnd'); await sleep(450); return evaluate('return activeView'); };
  await evaluate(`setActiveView('home'); return 1;`); await sleep(400);
  const slowShort = await slow(300, 180);
  const slowLong = await slow(320, 160);
  const slowBack = await slow(90, 250);
  const flick = await (async () => { setTimeout(() => {}, 0); await touch('touchStart', 300, 500); for (const x of [280, 250, 210, 170]) { await touch('touchMove', x, 500); await sleep(10); } await touch('touchEnd'); await sleep(450); return evaluate('return activeView'); })();
  const snapCss = await evaluate(`return getComputedStyle(document.getElementById('view-stats')).overflowX + '|' + document.getElementById('view-stats').scrollWidth + '|' + document.getElementById('view-profile').scrollWidth + '|' + innerWidth;`);
  check('천천히 120px → 제자리, 160px → 리포트, 반대로 150px → 식단, 빠르게 튕기면(60px) 리포트 (리포트·설정 가로 넘침 없음)', slowShort === 'home' && slowLong === 'stats' && slowBack === 'home' && flick === 'stats' && snapCss.split('|').slice(1, 3).every(w => +w <= +snapCss.split('|')[3]), JSON.stringify({ slowShort, slowLong, slowBack, flick, snapCss }));
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
