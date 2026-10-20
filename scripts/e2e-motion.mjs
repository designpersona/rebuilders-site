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
  // 1. 리포트 → 손가락 1:1
  await evaluate(`setActiveView('stats'); return 1;`); await sleep(500);
  // (첫 이동은 브라우저가 삼킬 수 있어 방향이 정해진 뒤 두 지점 사이 차이로 1:1 확인)
  await touch('touchStart', 300, 500);
  for (const x of [290, 282, 274, 266]) { await touch('touchMove', x, 501); await sleep(16); }
  const x1 = await panelX('view-stats');
  await touch('touchMove', 216, 502); await sleep(16);
  const follow = (await panelX('view-stats')) - x1 - 0; // 50px 더 밀면 정확히 -50
  await touch('touchMove', 200, 502); await sleep(16); await touch('touchEnd');
  await sleep(60);
  const after = await evaluate(`return { view: activeView, stagger: document.querySelectorAll('#view-profile .stagger-in').length, slide: document.getElementById('view-profile').classList.contains('page-in-right') };`);
  check('리포트: 손가락만큼 정확히(50px → -50px) 따라옴, 넘기면 설정, 차례로 나타나기는 겹치지 않음', Math.abs(follow + 50) < 1 && after.view === 'profile' && after.stagger === 0 && after.slide, JSON.stringify({ follow, after }));
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
  const tabC = await evaluate(`setActiveView('home'); await new Promise(r => setTimeout(r, 500)); const c = el => { const r = el.getBoundingClientRect(); return (r.left + r.right) / 2; }; const spans = [...document.querySelectorAll('#page-tabs .page-tab > span')]; const centers = spans.map(c); const act = document.querySelector('#page-tabs .page-tab.active'); const label = act.querySelector('span'); const icon = act.querySelector('.page-tab-icon').getBoundingClientRect(); const ind = document.querySelector('.page-tab-indicator').getBoundingClientRect(); const gaps = centers.slice(1).map((x, i) => x - centers[i]); return { label: c(label), mid: innerWidth / 2, ind: (ind.left + ind.right) / 2, iconLeftOfText: icon.right <= label.getBoundingClientRect().left, gaps: gaps.map(g => Math.round(g * 10) / 10) };`);
  check('식단 글자 가운데 = 화면 가운데(±1px), 아이콘은 왼쪽에 떠 있음, 밑줄 글자 가운데, 탭 간격 같음', Math.abs(tabC.label - tabC.mid) <= 1 && Math.abs(tabC.ind - tabC.label) <= 1 && tabC.iconLeftOfText && Math.max(...tabC.gaps) - Math.min(...tabC.gaps) <= 1, JSON.stringify(tabC));
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
