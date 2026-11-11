// 식단기록 날짜 밀기: 펼친 기록(양 없는 예전 기록 포함) 위에서 밀어도 중간에 멈추지 않고, 끼니 상세를 열었다 돌아와도 밀 수 있는지.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-date-swipe.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9395, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-date-swipe-'));
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
const shift = (k, n) => { const [y, m, d] = k.split('-').map(Number); const t = new Date(y, m - 1, d + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
const swipeState = () => evaluate(`
  const m = e => { if (!e) return null; const t = getComputedStyle(e).transform; return t === 'none' ? 0 : Math.round(new DOMMatrix(t).m41 * 10) / 10; };
  const home = document.getElementById('view-home');
  const live = document.querySelector('#view-home > .meals-section:not(.day-ghost)');
  const ghost = document.querySelector('#view-home > .meals-section.day-ghost');
  const leftovers = [...document.querySelectorAll('#view-home > .day-summary, #view-home > .section-head, #view-home > .meals-section, #view-home > .day-clear-row, #view-home > .nutrition-missing-note')].map(e => e.style.transform).join('');
  return { key: dateKey(currentDate), view: activeView, swiping: home.classList.contains('day-swiping'), ghosts: document.querySelectorAll('.day-ghost').length, live: m(live), ghost: m(ghost), leftovers, mealOpen: document.body.classList.contains('meal-page-open') };
`);
const swipe = async (x0, x1, y) => {
  const mid = [];
  await touch('touchStart', x0, y);
  const steps = 8;
  for (let k = 1; k <= steps; k++) {
    const x = x0 + (x1 - x0) * k / steps;
    await touch('touchMove', x, y);
    await sleep(20);
    if (k === 3 || k === 5 || k === 8) mid.push(await swipeState());
  }
  await touch('touchEnd');
  await sleep(450);
  const after = await swipeState();
  const followed = mid.length >= 2 && mid[0].swiping && mid[mid.length - 1].swiping
    && mid[0].ghost != null && mid[mid.length - 1].ghost != null
    && Math.abs(mid[mid.length - 1].ghost - mid[0].ghost) >= 30
    && Math.abs(mid[mid.length - 1].live - mid[0].live) >= 30;
  const clean = !after.swiping && after.ghosts === 0 && !after.leftovers && after.view === 'home';
  return { mid, after, followed, clean };
};

try {
  ws = new WebSocket(await connect());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id).res(m.result || m); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await load(URL);
  await evaluate(`await saveSettings({ locale: 'ko' }); return 1;`);
  await load();

  const seeded = await evaluate(`
    const today = new Date();
    const day = (offset, data) => { const d = new Date(today); d.setDate(d.getDate() + offset); return [dateKey(d), data]; };
    const oldYogurt = { name: '그릭 요거트', cal: 24, carbs: 3, protein: 4, fat: 0 };
    const oldJuice = { name: '토마토 블루베리 주스', cal: 85 };
    const banana = { name: '바나나', cal: 105, serving: '1개 (118g)', servingAmount: 1, servingUnit: '개', servingGrams: 118 };
    const rice = { name: '밥', cal: 273, carbs: 60.1, protein: 5, fat: 0.4, serving: '1공기', servingAmount: 1, servingUnit: '공기', servingGrams: 210 };
    const all = await storageRepository.getAll();
    Object.assign(all, Object.fromEntries([
      day(-2, { breakfast: [oldYogurt, oldJuice], lunch: [rice] }),
      day(-1, { breakfast: [oldYogurt], dinner: [{ name: '김치찌개', cal: 300 }] }),
      day(0, { breakfast: [oldYogurt, banana], lunch: [rice], snack: [{ name: '믹스너트', cal: 200, slot: 1 }] }),
      day(1, { lunch: [rice, { name: '계란', cal: 68 }] }),
      day(2, { breakfast: [banana], dinner: [rice] }),
    ]));
    await storageRepository.replaceAll(all);
    currentDate = new Date();
    await loadCurrentDay();
    updateDateDisplay();
    renderAll(true);
    setActiveView('home');
    await new Promise(r => setTimeout(r, 200));
    return { today: dateKey(currentDate), breakfast: meals.breakfast.foods.map(f => f.name), yogurtHasAmount: meals.breakfast.foods[0].servingAmount != null };
  `);

  const summaryY = await evaluate(`const r = document.querySelector('#view-home .day-summary').getBoundingClientRect(); return Math.round(r.top + 80);`);

  // 1. 영양 카드(안정적인 노드)에서 좌우로 밀기
  const s1 = await swipe(300, 80, summaryY);
  check('영양 카드에서 왼쪽으로 밀면 손가락을 따라오고, 다음 날로 정리됨', s1.followed && s1.clean && s1.after.key === shift(seeded.today, 1), JSON.stringify({ mid: s1.mid, after: s1.after, followed: s1.followed }));
  const s2 = await swipe(80, 320, summaryY);
  check('영양 카드에서 오른쪽으로 밀면 오늘로 돌아오고 복제·이동값이 남지 않음', s2.followed && s2.clean && s2.after.key === seeded.today, JSON.stringify({ mid: s2.mid, after: s2.after }));

  // 2. 기록 펼치고(양 없는 예전 기록 줄) 그 위에서 밀기 — 예전에 중간에 멈추던 경로
  const foodPt = await evaluate(`
    currentDate = new Date(); await loadCurrentDay(); updateDateDisplay(); renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (card && !card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]')?.click();
    await new Promise(r => setTimeout(r, 400));
    const row = document.querySelector('#breakfast-items .food-item');
    const amount = row?.querySelector('.food-amount-btn');
    const r = (amount || row)?.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), name: row?.querySelector('.food-name')?.textContent, amount: amount?.textContent, expanded: card.classList.contains('expanded') };
  `);
  const f1 = await swipe(foodPt.x, foodPt.x - 220, foodPt.y);
  check('펼친 기록(양 없는 예전 음식 줄) 위에서 밀어도 중간에 멈추지 않고 다음 날로 감', f1.followed && f1.clean && f1.after.key === shift(seeded.today, 1), JSON.stringify({ foodPt, mid: f1.mid, after: f1.after, followed: f1.followed }));

  // 다음 날에도 기록이 있으면 펼치고 다시 밀기
  const foodPt2 = await evaluate(`
    const card = document.getElementById('lunch-card');
    if (card?.classList.contains('has-items') && !card.classList.contains('expanded')) document.querySelector('[data-expand-meal="lunch"]')?.click();
    await new Promise(r => setTimeout(r, 350));
    const row = document.querySelector('#view-home .food-item') || document.querySelector('#view-home .meals-section');
    const r = row.getBoundingClientRect();
    return { x: Math.round(r.left + Math.min(r.width, 240) * 0.55), y: Math.round(r.top + Math.max(12, r.height / 2)), from: row.className };
  `);
  const f2 = await swipe(foodPt2.x, foodPt2.x + 230, foodPt2.y);
  check('다음 날 기록 위에서 반대로 밀면 오늘로 돌아오고 화면이 멈추지 않음', f2.followed && f2.clean && f2.after.key === seeded.today, JSON.stringify({ foodPt2, mid: f2.mid, after: f2.after }));

  // 3. 끼니 상세를 열었다가 돌아온 뒤에도 밀 수 있는지
  const afterPage = await evaluate(`
    openMealPage('breakfast');
    await new Promise(r => setTimeout(r, 250));
    const opened = document.body.classList.contains('meal-page-open') && !document.getElementById('view-meal-detail').hidden;
    closeMealPage();
    await new Promise(r => setTimeout(r, 250));
    const card = document.getElementById('breakfast-card');
    if (card?.classList.contains('has-items') && !card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]')?.click();
    await new Promise(r => setTimeout(r, 350));
    const row = document.querySelector('#breakfast-items .food-item');
    const r = row?.getBoundingClientRect();
    return { opened, closed: !document.body.classList.contains('meal-page-open') && !!document.getElementById('view-home') && !document.getElementById('view-home').hidden, x: r ? Math.round(r.left + r.width / 2) : 240, y: r ? Math.round(r.top + r.height / 2) : 500 };
  `);
  check('끼니 상세를 열었다가 닫을 수 있음', afterPage.opened && afterPage.closed, JSON.stringify(afterPage));
  const f3 = await swipe(afterPage.x, afterPage.x - 220, afterPage.y);
  check('끼니 상세에서 돌아온 뒤 기록 위에서 밀어도 멈추지 않음', f3.followed && f3.clean && f3.after.key === shift(seeded.today, 1), JSON.stringify({ afterPage, mid: f3.mid, after: f3.after }));

  // 4. 여러 번 연속으로 밀기
  const keys = [f3.after.key];
  const repeats = [];
  for (const [x0, x1] of [[80, 320], [320, 80], [80, 320]]) {
    const y = (await evaluate(`const r = document.querySelector('#view-home .day-summary').getBoundingClientRect(); return Math.round(r.top + 80);`));
    const run = await swipe(x0, x1, y);
    keys.push(run.after.key);
    repeats.push({ followed: run.followed, clean: run.clean, key: run.after.key });
  }
  check('날짜를 여러 번 밀어도 매번 따라오고, 복제·이동값이 남지 않음', repeats.every(r => r.followed && r.clean) && new Set(keys).size >= 2, JSON.stringify({ keys, repeats }));

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
