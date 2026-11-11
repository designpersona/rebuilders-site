// 먹은 양 표시·−/+ 수정, 끼니 카드는 순서만 바꾸기, 기록 시간은 실제 시각.
// Headless Chrome(CDP), Node 22. 사용법: (저장소 루트) 정적 서버 8765 → node scripts/e2e-servings.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const PORT = 9388, URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-servings-'));
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
async function shot(file) {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
}
const results = []; let failed = 0;
function check(name, cond, info = '') { results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!cond) failed++; }
const touch = (type, x, y) => send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
const W8 = ms => `await new Promise(r => setTimeout(r, ${ms}));`;
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

  // 1. 기록 시간은 실제 시각(12:30 고정이 아님)
  const r1 = await evaluate(`
    setActiveView('home');
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    mealTimes = defaultMealTimes();
    const before = currentClockTime();
    await addFoods('lunch', [{ name: '밥', cal: 273, carbs: 60.1, protein: 5, fat: 0.4, serving: '1공기', servingAmount: 1, servingUnit: '공기', servingGrams: 210 }]);
    const after = currentClockTime();
    return { time: mealTimes.lunch.value, before, after, manual: mealTimes.lunch.manual };
  `);
  check('점심 첫 기록 시간은 실제 시각(12:30 고정 아님)', r1.time === r1.before || r1.time === r1.after, JSON.stringify(r1));

  // 2. 홈 목록에 양이 보이고, −/+ 로 바로 다시 계산
  const r2setup = await evaluate(`
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    const data = { ...NILIRI_FOOD_CATALOG['바나나'] };
    const food = RebuildersUnits.applyAmount(RebuildersUnits.attachBasis({ name: '바나나', ...data }, data), { value: 1, unit: '개' }, data);
    food.id = 'e2e-banana';
    meals.breakfast.foods = [food];
    await persistMealsOrRestore(snapshotMeals());
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(400)}
    const row = document.querySelector('#breakfast-items .food-item');
    return { amount: row?.querySelector('.food-amount-btn')?.textContent, cal: row?.querySelector('.food-cal')?.textContent, kcal: meals.breakfast.foods[0].cal };
  `);
  check('홈 목록에 바나나 1개 (118g)와 105kcal이 보임', r2setup.amount === '1개 (118g)' && r2setup.kcal === 105, JSON.stringify(r2setup));

  const btn = await evaluate(`const b = document.querySelector('#breakfast-items .food-amount-btn')?.getBoundingClientRect(); return b && b.width ? [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)] : null;`);
  if (!btn) throw new Error('no amount button');
  await touch('touchStart', btn[0], btn[1]); await sleep(80); await touch('touchEnd'); await sleep(400);
  const opened = await evaluate(`const pop = document.getElementById('food-amount-popover'); return { open: pop && !pop.hidden, value: pop?.querySelector('.food-amount-value')?.textContent, cal: pop?.querySelector('.food-amount-cals')?.textContent };`);
  check('양 버튼을 누르면 −/+ 편집이 열림', opened.open && opened.value.includes('1개'), JSON.stringify(opened));
  await shot('/tmp/rebuilders-servings-home.png');

  const plus = await evaluate(`const b = document.querySelector('#food-amount-popover [data-dir="1"]')?.getBoundingClientRect(); return b && b.width ? [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)] : null;`);
  check('플러스 버튼이 보임', Boolean(plus), JSON.stringify(plus));
  if (plus) { await touch('touchStart', plus[0], plus[1]); await sleep(80); await touch('touchEnd'); await sleep(400); }
  const r2 = await evaluate(`const f = meals.breakfast.foods[0]; const row = document.querySelector('#breakfast-items .food-item'); return { cal: f.cal, amount: f.servingAmount, unit: f.servingUnit, grams: f.servingGrams, shown: row?.querySelector('.food-amount-btn')?.textContent, pop: document.querySelector('#food-amount-popover .food-amount-value')?.textContent };`);
  check('+ 한 번이면 2개 (236g) 210kcal로 바로 다시 계산', r2.cal === 210 && r2.amount === 2 && r2.unit === '개' && r2.grams === 236 && r2.shown === '2개 (236g)', JSON.stringify(r2));
  await shot('/tmp/rebuilders-servings-stepper.png');
  await evaluate(`closeAmountEditor(true); ${W8(200)} return 1;`);

  // 3. 예전 기록(양 없음)은 값을 그대로 두고 수정 가능
  const r3 = await evaluate(`
    meals.breakfast.foods = [{ name: '그릭요거트', cal: 24, carbs: 1, protein: 4, fat: 0.2, serving: '100g', id: 'old-yogurt' }];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    const row = document.querySelector('#breakfast-items .food-item');
    return { cal: meals.breakfast.foods[0].cal, amountBtn: row?.querySelector('.food-amount-btn')?.textContent, servingAmount: meals.breakfast.foods[0].servingAmount ?? null };
  `);
  check('양 없는 예전 기록은 24kcal을 유지하고 양 버튼이 있음', r3.cal === 24 && r3.servingAmount === null && Boolean(r3.amountBtn), JSON.stringify(r3));

  // 4. 간식을 점심 아래로 옮겨도 끼니는 간식 그대로
  const r4 = await evaluate(`
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    meals.lunch.foods = [{ name: '밥', cal: 273, serving: '1공기', id: 'rice' }];
    meals.snack.foods = [{ name: '믹스너트', cal: 120, serving: '1봉', slot: 1, id: 'nuts' }];
    cardOrder = DEFAULT_CARD_ORDER.slice();
    await persistMealsOrRestore(snapshotMeals());
    renderAll(true);
    setTimelineEditing(true);
    ${W8(300)}
    const visible = [...document.querySelectorAll('#view-home .meal-card, #view-home .snack-card')].filter(c => !c.hidden);
    const from = visible.findIndex(c => c.id === 'snack-slot-1');
    const lunch = visible.findIndex(c => c.id === 'lunch-card');
    // 점심 다음으로 이동
    const to = lunch + 1;
    const keys = visible.map(cardKeyFromEl);
    const nextVisible = keys.filter((_, i) => i !== from);
    nextVisible.splice(to, 0, keys[from]);
    let cursor = 0;
    cardOrder = normalizeCardOrder(cardOrder).map(key => (keys.includes(key) ? nextVisible[cursor++] : key));
    applyCardOrder();
    renderAll(true);
    const order = [...document.querySelectorAll('#view-home .meal-card, #view-home .snack-card')].filter(c => !c.hidden).map(c => c.id);
    return { lunch: meals.lunch.foods.map(f => f.name), snack: meals.snack.foods.map(f => f.name + '@' + f.slot), order, lunchIdx: order.indexOf('lunch-card'), snackIdx: order.indexOf('snack-slot-1') };
  `);
  check('간식을 점심 아래로 옮겨도 음식과 끼니는 그대로, 순서만 바뀜', JSON.stringify(r4.lunch) === JSON.stringify(['밥']) && JSON.stringify(r4.snack) === JSON.stringify(['믹스너트@1']) && r4.snackIdx > r4.lunchIdx, JSON.stringify(r4));
  await shot('/tmp/rebuilders-servings-reorder.png');

  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (err) { results.push('ERROR ' + (err.stack || err.message)); failed++; }
finally {
  console.log(results.join('\n'));
  console.log(failed ? `FAIL ${failed}` : `통과 ${results.length}`);
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(300); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}
