// 간식 옮기기: 편집 모드에서 음식을 빈 간식 자리(맨 위·맨 아래 포함)로 끌어 옮기기, 간식 카드 순서 바꾸기 (393px, 터치).
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-snack-move.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9371, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-snack-move-'));
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
  const W8 = ms => `await new Promise(r => setTimeout(r, ${ms}));`;
  const BASE = `{ name: 'CU 생초코모찌', cal: 251, carbs: 36, protein: 1.4, fat: 11, serving: '80g' }`;
  const LATTE = `{ name: '맥심 라떼', cal: 117, carbs: 20, protein: 2, fat: 3, serving: '275ml' }`;
  const setup = (meal, snack = '') => evaluate(`setActiveView('home'); setTimelineEditing(false); for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    meals.${meal}.foods.push(${BASE}, ${LATTE}); ${snack}
    await persistMealsOrRestore(snapshotMeals()); renderAll(true); setTimelineEditing(true); ${W8(500)} window.scrollTo(0, 0);
    if (!document.getElementById('${meal}-card').classList.contains('expanded')) document.querySelector('[data-expand-meal="${meal}"]').click(); ${W8(400)} return 1;`);
  const state = () => evaluate(`return { b: meals.breakfast.foods.map(f => f.name), d: meals.dinner.foods.map(f => f.name), s: meals.snack.foods.map(f => f.name + '@' + f.slot),
    visibleEmpty: [...document.querySelectorAll('#view-home .snack-card')].filter(c => !c.hidden && !c.classList.contains('has-items')).map(c => c.id) };`);
  // 음식 손잡이를 잡고 조금 끌어 드래그를 시작한 뒤, 펼쳐진 간식 자리 위로 옮겨 놓는다.
  async function dragFoodToSlot(meal, slot) {
    const h = await evaluate(`const it = [...document.querySelectorAll('#${meal}-card .food-item')].find(e => e.textContent.includes('생초코모찌')); const b = it?.querySelector('.food-drag-handle')?.getBoundingClientRect(); return b && b.width ? [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)] : null;`);
    if (!h) return { error: 'no handle' };
    await touch('touchStart', h[0], h[1]);
    for (let k = 1; k <= 4; k++) { await touch('touchMove', h[0], h[1] + k * 5); await sleep(30); }
    await sleep(150);
    const during = await evaluate(`const s = document.getElementById('snack-slot-${slot}'); const b = s.getBoundingClientRect(); const dock = document.getElementById('home-ai-dock')?.getBoundingClientRect().top ?? innerHeight;
      return { shown: !s.hidden && b.height > 0, placeholder: s.classList.contains('drop-placeholder'), y: Math.round(b.top + b.height / 2), x: Math.round(b.left + b.width / 2), aboveDock: b.bottom <= dock, empties: [...document.querySelectorAll('#view-home .snack-card.drop-placeholder')].length };`);
    const y0 = h[1] + 20;
    for (let k = 1; k <= 12; k++) { await touch('touchMove', h[0], Math.round(y0 + (during.y - y0) * k / 12)); await sleep(30); }
    await sleep(150);
    const hover = await evaluate(`return document.getElementById('snack-slot-${slot}').classList.contains('drop-target');`);
    await touch('touchEnd'); await sleep(800);
    return { during, hover, after: await state() };
  }
  // 1. 자정 넘어 기록(아침으로 들어감), 간식 없음: 아침 음식을 맨 위 간식 자리로
  await setup('breakfast');
  const r1 = await dragFoodToSlot('breakfast', 0);
  check('간식 없을 때 아침 음식을 끌면 빈 간식 자리가 드롭 자리로 보이고, 맨 위 간식으로 옮겨짐', r1.during?.shown && r1.during.placeholder && r1.during.empties === 4 && r1.hover && JSON.stringify(r1.after.b) === JSON.stringify(['맥심 라떼']) && JSON.stringify(r1.after.s) === JSON.stringify(['CU 생초코모찌@0']) && r1.after.visibleEmpty.length === 0, JSON.stringify(r1));
  // 2. 다른 날짜(어제), 간식 없음: 저녁 음식을 맨 아래(마지막) 간식 자리로 — 채팅 바 위에 있어야 함
  await evaluate(`await changeDate(-1); ${W8(500)} return 1;`);
  await setup('dinner');
  const r2 = await dragFoodToSlot('dinner', 3);
  check('어제 날짜, 저녁 음식을 마지막 간식 자리로: 드롭 자리가 채팅 바 위에 보이고 옮겨짐', r2.during?.shown && r2.during.aboveDock && r2.hover && JSON.stringify(r2.after.d) === JSON.stringify(['맥심 라떼']) && JSON.stringify(r2.after.s) === JSON.stringify(['CU 생초코모찌@3']), JSON.stringify(r2));
  // 3. 간식에 음식이 이미 있을 때: 저녁 음식을 그 간식 카드로
  await setup('dinner', `meals.snack.foods.push({ name: '사과', cal: 52, carbs: 14, protein: 0, fat: 0, serving: '1개', slot: 3 });`);
  const r3 = await dragFoodToSlot('dinner', 3);
  check('음식 있는 간식 카드로 옮기기', r3.hover && JSON.stringify(r3.after.s) === JSON.stringify(['사과@3', 'CU 생초코모찌@3']) && JSON.stringify(r3.after.d) === JSON.stringify(['맥심 라떼']), JSON.stringify(r3));
  // 4. 간식 카드 자체 끌기(편집 모드, 접힌 카드): 간식 ↔ 저녁 순서 바꾸기
  await setup('dinner', `meals.snack.foods.push({ name: '사과', cal: 52, carbs: 14, protein: 0, fat: 0, serving: '1개', slot: 3 });`);
  await evaluate(`if (document.getElementById('dinner-card').classList.contains('expanded')) document.querySelector('[data-expand-meal="dinner"]').click(); ${W8(400)} return 1;`);
  const c4 = await evaluate(`const h = document.querySelector('#snack-slot-3 .drag-handle').getBoundingClientRect(); const d = document.getElementById('dinner-card').getBoundingClientRect(); return [Math.round(h.left + h.width / 2), Math.round(h.top + h.height / 2), Math.round(d.top + 15), document.querySelector('#snack-slot-3 .drag-handle').classList.contains('is-disabled')];`);
  await touch('touchStart', c4[0], c4[1]);
  for (let k = 1; k <= 20; k++) { await touch('touchMove', c4[0], Math.round(c4[1] + (c4[2] - c4[1]) * k / 20)); await sleep(25); }
  await sleep(150); await touch('touchEnd'); await sleep(800);
  const r4 = await state();
  check('간식 카드 손잡이로 끌어 저녁과 자리 바꾸기', !c4[3] && JSON.stringify(r4.d) === JSON.stringify(['사과']) && JSON.stringify(r4.s) === JSON.stringify(['CU 생초코모찌@3', '맥심 라떼@3']), JSON.stringify({ c4, r4 }));
  // 5. 드래그가 끝나면 빈 간식 자리는 다시 숨김
  const r5 = await evaluate(`return { empties: [...document.querySelectorAll('#view-home .snack-card')].filter(c => !c.hidden && !c.classList.contains('has-items')).length, ph: document.querySelectorAll('.drop-placeholder').length, cls: document.body.classList.contains('food-drag-active') };`);
  check('드래그 후 빈 간식 자리 다시 숨김', r5.empties === 0 && r5.ph === 0 && !r5.cls, JSON.stringify(r5));
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
