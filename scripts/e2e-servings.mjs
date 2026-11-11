// 먹은 양 표시·−/+ 수정, 끼니 카드는 순서만 바꾸기, 기록해도 끼니 시각은 그대로.
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

  // 1. 음식을 넣어도 점심 시각(12:30)은 그대로
  const r1 = await evaluate(`
    setActiveView('home');
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    mealTimes = defaultMealTimes();
    const before = mealTimes.lunch.value;
    await addFoods('lunch', [{ name: '밥', cal: 273, carbs: 60.1, protein: 5, fat: 0.4, serving: '1공기', servingAmount: 1, servingUnit: '공기', servingGrams: 210 }]);
    return { time: mealTimes.lunch.value, before, clock: currentClockTime(), manual: mealTimes.lunch.manual };
  `);
  check('점심에 음식을 넣어도 시각은 12:30 그대로', r1.time === '12:30' && r1.before === '12:30', JSON.stringify(r1));

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
    return {
      amount: row?.querySelector('.food-amount-btn')?.textContent,
      cal: row?.querySelector('.food-cal')?.textContent,
      kcal: meals.breakfast.foods[0].cal,
      line: [row?.querySelector('.food-amount-btn')?.textContent, row?.querySelector('.food-cal')?.textContent].filter(Boolean).join(' · '),
      macros: !!row?.querySelector('.source-label-tag, .macro-tag, .food-macros:not(:empty)'),
    };
  `);
  check('홈 목록에 바나나 이름과 회색 줄 1개 (118g) · 105kcal만 보임(출처·탄단지 없음)', r2setup.amount === '1개 (118g)' && r2setup.cal === '105kcal' && r2setup.kcal === 105 && r2setup.line === '1개 (118g) · 105kcal' && !r2setup.macros, JSON.stringify(r2setup));

  const btn = await evaluate(`const b = document.querySelector('#breakfast-items .food-amount-btn')?.getBoundingClientRect(); return b && b.width ? [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)] : null;`);
  if (!btn) throw new Error('no amount button');
  await touch('touchStart', btn[0], btn[1]); await sleep(80); await touch('touchEnd'); await sleep(400);
  const opened = await evaluate(`const pop = document.getElementById('food-amount-popover'); return { open: pop && !pop.hidden, value: pop?.querySelector('.food-amount-value')?.value || pop?.querySelector('.food-amount-value')?.textContent, cal: pop?.querySelector('.food-amount-cals')?.textContent };`);
  check('양 버튼을 누르면 −/+ 편집이 열림', opened.open && opened.value.includes('1개'), JSON.stringify(opened));
  await shot('/tmp/rebuilders-servings-home.png');

  const plus = await evaluate(`const b = document.querySelector('#food-amount-popover [data-dir="1"]')?.getBoundingClientRect(); return b && b.width ? [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)] : null;`);
  check('플러스 버튼이 보임', Boolean(plus), JSON.stringify(plus));
  if (plus) { await touch('touchStart', plus[0], plus[1]); await sleep(80); await touch('touchEnd'); await sleep(400); }
  const r2 = await evaluate(`const f = meals.breakfast.foods[0]; const row = document.querySelector('#breakfast-items .food-item'); return { cal: f.cal, amount: f.servingAmount, unit: f.servingUnit, grams: f.servingGrams, shown: row?.querySelector('.food-amount-btn')?.textContent, pop: document.querySelector('#food-amount-popover .food-amount-value')?.value || document.querySelector('#food-amount-popover .food-amount-value')?.textContent };`);
  check('+ 한 번이면 2개 (236g) 210kcal로 바로 다시 계산', r2.cal === 210 && r2.amount === 2 && r2.unit === '개' && r2.grams === 236 && r2.shown === '2개 (236g)', JSON.stringify(r2));
  await shot('/tmp/rebuilders-servings-stepper.png');
  await evaluate(`closeAmountEditor(true); ${W8(200)} return 1;`);

  // 2b. 음식 상세: 빈 사진 칸 없음, 이름·출처·먹은 양 −/+, 먹은 양 기준 영양 + 100g 참고
  const rDex = await evaluate(`
    const data = { ...NILIRI_FOOD_CATALOG['바나나'] };
    const food = RebuildersUnits.applyAmount(RebuildersUnits.attachBasis({ name: '바나나', ...data }, data), { value: 1, unit: '개' }, data);
    food.id = 'e2e-banana';
    meals.breakfast.foods = [food];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-item').click();
    ${W8(400)}
    const hero = document.getElementById('food-dex-icon');
    const wrap = hero?.closest('.food-dex-hero-wrap');
    const amount = document.getElementById('food-dex-amount');
    const first = document.querySelector('#food-dex-nutrition-grid > div');
    return {
      open: document.getElementById('food-dex')?.classList.contains('open'),
      name: document.getElementById('food-dex-name')?.textContent,
      source: document.getElementById('food-dex-source')?.textContent,
      placeholder: !!hero?.querySelector('.food-dex-placeholder'),
      emptyHero: wrap?.classList.contains('is-empty'),
      heroImg: hero?.querySelectorAll('img').length || 0,
      amountHidden: amount?.hidden,
      amountValue: amount?.querySelector('.food-dex-amount-value')?.textContent,
      amountCal: amount?.querySelector('.food-dex-amount-cals')?.textContent,
      hasStepper: !!(amount?.querySelector('[data-dir="-1"]') && amount?.querySelector('[data-dir="1"]')),
      basis: document.getElementById('food-dex-nutrition-basis')?.textContent,
      per100: document.getElementById('food-dex-per100-head')?.hidden === false && document.getElementById('food-dex-per100-head')?.textContent,
      gridCols: first ? getComputedStyle(document.getElementById('food-dex-nutrition-grid')).gridTemplateColumns.split(' ').length : 0,
      calRow: [...(first?.querySelectorAll('span, strong') || [])].map(el => el.textContent.trim()).filter(Boolean).join(' '),
    };
  `);
  check('음식 상세: 바나나는 그림이 있고 빈 자리 없음, 이름·출처·먹은 양 −/+, 영양은 먹은 양 기준에 100g 참고', rDex.open && rDex.name === '바나나' && /출처/.test(rDex.source || '') && !rDex.placeholder && !rDex.emptyHero && rDex.heroImg === 1 && rDex.amountHidden === false && rDex.amountValue === '1개 (118g)' && rDex.amountCal === '105kcal' && rDex.hasStepper && /먹은 양/.test(rDex.basis || '') && rDex.per100 === '100g 기준' && /105/.test(rDex.calRow || ''), JSON.stringify(rDex));
  const dexPlus = await evaluate(`const b = document.querySelector('#food-dex-amount [data-dir="1"]')?.getBoundingClientRect(); return b && b.width ? [Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2)] : null;`);
  check('음식 상세 플러스 버튼이 보임', Boolean(dexPlus), JSON.stringify(dexPlus));
  if (dexPlus) { await touch('touchStart', dexPlus[0], dexPlus[1]); await sleep(80); await touch('touchEnd'); await sleep(400); }
  const rDex2 = await evaluate(`const f = meals.breakfast.foods[0]; const amount = document.getElementById('food-dex-amount'); return { cal: f.cal, grams: f.servingGrams, shown: amount?.querySelector('.food-dex-amount-value')?.textContent, amountCal: amount?.querySelector('.food-dex-amount-cals')?.textContent, row: document.querySelector('#breakfast-items .food-amount-btn')?.textContent };`);
  check('상세에서 + 하면 2개 (236g) 210kcal로 다시 계산되고 홈 줄도 같음', rDex2.cal === 210 && rDex2.grams === 236 && rDex2.shown === '2개 (236g)' && rDex2.amountCal === '210kcal' && rDex2.row === '2개 (236g)', JSON.stringify(rDex2));
  await evaluate(`closeFoodDex(); ${W8(250)} return 1;`);

  const rNoImg = await evaluate(`
    meals.breakfast.foods = [{ name: '플레인 그릭 요거트', cal: 24, carbs: 1.5, protein: 4.1, fat: 0.2, sugar: 1.3, serving: '40g', servingAmount: 40, servingUnit: 'g', id: 'plain-yogurt' }];
    renderAll(true);
    document.querySelector('#breakfast-items .food-item').click();
    ${W8(400)}
    const hero = document.getElementById('food-dex-icon');
    const wrap = hero?.closest('.food-dex-hero-wrap');
    const r = wrap?.getBoundingClientRect();
    const first = document.querySelector('#food-dex-nutrition-grid > div');
    return { placeholder: !!hero?.querySelector('.food-dex-placeholder'), emptyHero: wrap?.classList.contains('is-empty'), heroImg: hero?.querySelectorAll('img').length || 0, heroH: r ? Math.round(r.height) : null, name: document.getElementById('food-dex-name')?.textContent, per100: document.getElementById('food-dex-per100-head')?.hidden === false && document.getElementById('food-dex-per100-head')?.textContent, calRow: [...(first?.querySelectorAll('span, strong') || [])].map(el => el.textContent.trim()).filter(Boolean).join(' '), basis: document.getElementById('food-dex-nutrition-basis')?.textContent };
  `);
  check('그림 없는 음식 상세는 빈 사진 칸 없이 이름부터 보이고, 40g 기준에 100g 참고가 같이 보임', rNoImg.placeholder === false && rNoImg.emptyHero && rNoImg.heroImg === 0 && rNoImg.heroH === 0 && rNoImg.name === '플레인 그릭 요거트' && rNoImg.per100 === '100g 기준' && /24/.test(rNoImg.calRow || '') && /60/.test(rNoImg.calRow || '') && /먹은 양/.test(rNoImg.basis || ''), JSON.stringify(rNoImg));
  await evaluate(`closeFoodDex(); ${W8(250)} return 1;`);

  const rPending = await evaluate(`
    const prev = globalThis.RebuildersBridge?.getQueue;
    try {
      if (!globalThis.RebuildersBridge) return { missing: true };
      RebuildersBridge.getQueue = () => [{ items: [{ name: '수제청' }], remoteId: 'e2e' }];
      meals.breakfast.foods = [{ name: '수제청', id: 'pending-tea' }];
      renderAll(true);
      const card = document.getElementById('breakfast-card');
      if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
      ${W8(300)}
      const row = document.querySelector('#breakfast-items .food-item');
      const cal = row?.querySelector('.food-cal')?.textContent;
      const pending = row?.querySelector('.food-cal')?.classList.contains('is-pending');
      const line = [row?.querySelector('.food-amount-btn')?.textContent, row?.querySelector('.food-cal')?.textContent].filter(Boolean).join(' · ');
      return { cal, pending, line, macros: !!row?.querySelector('.source-label-tag, .macro-tag') };
    } finally {
      if (prev) RebuildersBridge.getQueue = prev;
      else if (globalThis.RebuildersBridge) delete RebuildersBridge.getQueue;
    }
  `);
  check("영양 찾는 중이면 줄에 회색 '찾는 중'이 보이고 탄단지는 없음", rPending.cal === '찾는 중' && rPending.pending && /찾는 중/.test(rPending.line || '') && !rPending.macros, JSON.stringify(rPending));

  // 2c. 로투스처럼 검색·AI로 넣은 1개 기록: + 하면 kcal·양·탄단지 비례, − 하면 원래대로
  const rLotus = await evaluate(`
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    meals.breakfast.foods = [{
      name: '로투스 비스코프 오리지널 쿠키',
      cal: 30, carbs: 4.7, protein: 0.4, fat: 1.2,
      serving: '1개', servingAmount: 1, servingUnit: '개', servingGrams: 8,
      id: 'lotus-plain'
    }];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-amount-btn').click();
    ${W8(200)}
    document.querySelector('#food-amount-popover [data-dir="1"]').click();
    ${W8(200)}
    const f = meals.breakfast.foods[0];
    const plus = {
      cal: f.cal, carbs: f.carbs, protein: f.protein, fat: f.fat,
      amount: f.servingAmount, grams: f.servingGrams, serving: f.serving,
      shown: document.querySelector('#breakfast-items .food-amount-btn')?.textContent,
      pop: document.querySelector('#food-amount-popover .food-amount-value')?.value || document.querySelector('#food-amount-popover .food-amount-value')?.textContent,
      popCal: document.querySelector('#food-amount-popover .food-amount-cals')?.textContent,
    };
    document.querySelector('#food-amount-popover [data-dir="-1"]').click();
    ${W8(200)}
    const back = meals.breakfast.foods[0];
    return {
      plus,
      minus: {
        cal: back.cal, amount: back.servingAmount, grams: back.servingGrams,
        shown: document.querySelector('#breakfast-items .food-amount-btn')?.textContent,
      },
    };
  `);
  check('로투스 1개 30kcal(수정 없음) + → 2개 (16g) 60kcal·탄단지 두 배, − 하면 다시 1개 (8g) 30kcal',
    rLotus.plus.cal === 60 && rLotus.plus.carbs === 9.4 && rLotus.plus.protein === 0.8 && rLotus.plus.fat === 2.4
    && rLotus.plus.amount === 2 && rLotus.plus.grams === 16 && rLotus.plus.shown === '2개 (16g)'
    && rLotus.plus.pop === '2개 (16g)' && rLotus.plus.popCal === '60kcal'
    && rLotus.minus.cal === 30 && rLotus.minus.amount === 1 && rLotus.minus.grams === 8 && rLotus.minus.shown === '1개 (8g)',
    JSON.stringify(rLotus));

  // 2d. '이 기록 수정'으로 kcal만 고친 1개 기록(낡은 100g 기준이 남아 있어도) + 하면 고친 값이 비례
  const rCustom = await evaluate(`
    meals.breakfast.foods = [{
      name: '수제 쿠키',
      cal: 30, carbs: 4.7, protein: 0.4, fat: 1.2,
      serving: '1개', servingAmount: 1, servingUnit: '개', servingGrams: 8,
      nutritionCustom: true,
      basis: '100g', basisGrams: 100,
      basisNutrients: { cal: 120, carbs: 20, protein: 2, fat: 5 },
      id: 'cookie-custom'
    }];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-amount-btn').click();
    ${W8(200)}
    document.querySelector('#food-amount-popover [data-dir="1"]').click();
    ${W8(200)}
    const f = meals.breakfast.foods[0];
    return {
      cal: f.cal, carbs: f.carbs, protein: f.protein, fat: f.fat,
      amount: f.servingAmount, grams: f.servingGrams,
      shown: document.querySelector('#breakfast-items .food-amount-btn')?.textContent,
      popCal: document.querySelector('#food-amount-popover .food-amount-cals')?.textContent,
    };
  `);
  check('kcal을 1개 30으로 직접 고친 기록 + → 2개 (16g) 60kcal, 낡은 100g 기준은 무시',
    rCustom.cal === 60 && rCustom.carbs === 9.4 && rCustom.protein === 0.8 && rCustom.fat === 2.4
    && rCustom.amount === 2 && rCustom.grams === 16 && rCustom.shown === '2개 (16g)' && rCustom.popCal === '60kcal',
    JSON.stringify(rCustom));

  // 2e. Lotus Biscoff: 한 개 무게 없이 kcal만 직접 고친 1개 기록. 홈 + → 줄·끼니 카드·하루 합계 60
  const rLotusNoG = await evaluate(`
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    meals.breakfast.foods = [{
      name: 'Lotus Biscoff',
      cal: 30, carbs: 4.7, protein: 0.4, fat: 1.2,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      nutritionCustom: true,
      id: 'lotus-nograms'
    }];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-amount-btn').click();
    ${W8(200)}
    document.querySelector('#food-amount-popover [data-dir="1"]').click();
    ${W8(200)}
    const f = meals.breakfast.foods[0];
    return {
      cal: f.cal, amount: f.servingAmount, serving: f.serving, grams: f.servingGrams ?? null,
      rowAmt: document.querySelector('#breakfast-items .food-amount-btn')?.textContent,
      rowCal: document.querySelector('#breakfast-items .food-cal')?.textContent,
      popCal: document.querySelector('#food-amount-popover .food-amount-cals')?.textContent,
      mealCard: document.getElementById('breakfast-kcal')?.textContent,
      day: document.getElementById('kcal-gauge-value')?.textContent,
    };
  `);
  check('Lotus Biscoff 1개 30kcal(한 개 무게 없음, 직접 수정) 홈 + → 2개 60kcal, 줄·끼니 카드·하루 합계',
    rLotusNoG.cal === 60 && rLotusNoG.amount === 2 && rLotusNoG.serving === '2개'
    && /2개/.test(rLotusNoG.rowAmt || '') && /60/.test(rLotusNoG.rowCal || '')
    && rLotusNoG.popCal === '60kcal' && rLotusNoG.mealCard === '60kcal' && String(rLotusNoG.day) === '60',
    JSON.stringify(rLotusNoG));

  // 2f. 같은 기록을 끼니 상세에서 + : 상세 줄과 홈 줄, 끼니 합계·하루 합계가 모두 60
  const rLotusPage = await evaluate(`
    closeMealPage?.();
    meals.breakfast.foods = [{
      name: 'Lotus Biscoff',
      cal: 30, carbs: 4.7, protein: 0.4, fat: 1.2,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      nutritionCustom: true,
      id: 'lotus-page'
    }];
    renderAll(true);
    openMealPage('breakfast');
    ${W8(300)}
    document.querySelector('#meal-page-items .food-amount-btn').click();
    ${W8(200)}
    document.querySelector('#food-amount-popover [data-dir="1"]').click();
    ${W8(200)}
    const f = meals.breakfast.foods[0];
    return {
      cal: f.cal, amount: f.servingAmount,
      pageAmt: document.querySelector('#meal-page-items .food-amount-btn')?.textContent,
      pageCal: document.querySelector('#meal-page-items .food-cal')?.textContent,
      homeAmt: document.querySelector('#breakfast-items .food-amount-btn')?.textContent,
      homeCal: document.querySelector('#breakfast-items .food-cal')?.textContent,
      pageTotal: document.getElementById('meal-page-kcal')?.textContent,
      mealCard: document.getElementById('breakfast-kcal')?.textContent,
      day: document.getElementById('kcal-gauge-value')?.textContent,
      popCal: document.querySelector('#food-amount-popover .food-amount-cals')?.textContent,
    };
  `);
  check('끼니 상세에서 Lotus Biscoff 1개 30kcal + → 상세 줄·홈 줄·끼니 합계·하루 합계 모두 2개 60kcal',
    rLotusPage.cal === 60 && rLotusPage.amount === 2
    && /2개/.test(rLotusPage.pageAmt || '') && /60/.test(rLotusPage.pageCal || '')
    && /2개/.test(rLotusPage.homeAmt || '') && /60/.test(rLotusPage.homeCal || '')
    && rLotusPage.pageTotal === '60kcal' && rLotusPage.mealCard === '60kcal' && String(rLotusPage.day) === '60'
    && rLotusPage.popCal === '60kcal',
    JSON.stringify(rLotusPage));
  await evaluate(`closeMealPage(); return 1;`);

  // 2g. 채팅으로 넣은 내 음식(한 개 무게 없음, 1개 30kcal)도 홈 + 하면 60
  const rLotusChat = await evaluate(`
    closeMealPage?.();
    setActiveView('home');
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    CUSTOM_FOODS['로투스 비스코프'] = {
      cal: 30, carbs: 4.7, protein: 0.4, fat: 1.2,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      sourceLabel: '내 음식', sourceTrust: 'user', nutritionCustom: true,
    };
    const parsed = parseQuickFoodText('아침 로투스 비스코프 1개');
    await applyChatFoods(parsed);
    ${W8(400)}
    const logged = meals.breakfast.foods[0] || {};
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-amount-btn')?.click();
    ${W8(200)}
    document.querySelector('#food-amount-popover [data-dir="1"]')?.click();
    ${W8(200)}
    const f = meals.breakfast.foods[0] || {};
    return {
      logged: { name: logged.name, cal: logged.cal, amount: logged.servingAmount, grams: logged.servingGrams ?? null },
      plus: {
        cal: f.cal, amount: f.servingAmount,
        rowCal: document.querySelector('#breakfast-items .food-cal')?.textContent,
        mealCard: document.getElementById('breakfast-kcal')?.textContent,
        day: document.getElementById('kcal-gauge-value')?.textContent,
      },
    };
  `);
  check('채팅으로 넣은 로투스 비스코프 1개 30kcal(한 개 무게 없음) + → 2개 60kcal, 줄·끼니 카드·하루 합계',
    rLotusChat.logged?.cal === 30 && rLotusChat.logged?.amount === 1
    && rLotusChat.plus.cal === 60 && rLotusChat.plus.amount === 2
    && /60/.test(rLotusChat.plus.rowCal || '') && rLotusChat.plus.mealCard === '60kcal' && String(rLotusChat.plus.day) === '60',
    JSON.stringify(rLotusChat));

  // 2h. 1개에서 − 하면 0.5개, kcal 절반
  const rHalf = await evaluate(`
    closeMealPage?.();
    setActiveView('home');
    for (const m of ['breakfast','lunch','dinner','snack']) meals[m].foods = [];
    meals.breakfast.foods = [{
      name: '스타벅스 브륄레 쿠키 치즈케이크',
      cal: 1400, carbs: 140, protein: 20, fat: 80,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      id: 'cake-half'
    }];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-amount-btn').click();
    ${W8(200)}
    document.querySelector('#food-amount-popover [data-dir="-1"]').click();
    ${W8(200)}
    const f = meals.breakfast.foods[0];
    return {
      cal: f.cal, amount: f.servingAmount, unit: f.servingUnit, serving: f.serving,
      shown: document.querySelector('#breakfast-items .food-amount-btn')?.textContent,
      rowCal: document.querySelector('#breakfast-items .food-cal')?.textContent,
      popCal: document.querySelector('#food-amount-popover .food-amount-cals')?.textContent,
    };
  `);
  check('1개 1400kcal에서 − 하면 0.5개 700kcal',
    rHalf.cal === 700 && rHalf.amount === 0.5 && rHalf.unit === '개'
    && /반개|0\\.5개/.test(rHalf.shown || '') && /700/.test(rHalf.rowCal || '') && rHalf.popCal === '700kcal',
    JSON.stringify(rHalf));

  // 2i. 한 개 무게가 없으면 g으로 바꾸지 않고 힌트를 보여 줌. 380g을 넣으면 95g = 350kcal.
  const rGrams = await evaluate(`
    document.getElementById('food-amount-popover')?.setAttribute('hidden', '');
    amountEditorState = null;
    meals.breakfast.foods = [{
      name: '스타벅스 브륄레 쿠키 치즈케이크',
      cal: 1400, carbs: 103, protein: 13, fat: 104,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      id: 'cake-grams'
    }];
    renderAll(true);
    openFoodEdit('breakfast', 0);
    ${W8(300)}
    const unit = document.querySelector('[data-serving-unit]');
    const amount = document.querySelector('[data-serving-amount]');
    const cal = document.querySelector('[data-edit-field="cal"]');
    const pack = document.querySelector('[data-package-grams]');
    const amountLabel = document.querySelector('[data-serving-amount-label]')?.textContent;
    const header = document.getElementById('food-dex-title')?.textContent;
    unit.value = 'g';
    unit.dispatchEvent(new Event('change', { bubbles: true }));
    ${W8(100)}
    const afterSwitch = { unit: unit.value, amount: amount.value, cal: cal.value, hint: document.querySelector('.edit-grams-hint')?.textContent || '', amountLabel };
    pack.value = '380';
    pack.dispatchEvent(new Event('input', { bubbles: true }));
    unit.value = 'g';
    unit.dispatchEvent(new Event('change', { bubbles: true }));
    ${W8(100)}
    const afterPack = { unit: unit.value, amount: amount.value, cal: cal.value, label: document.querySelector('[data-serving-amount-label]')?.textContent };
    amount.value = '95';
    amount.dispatchEvent(new Event('input', { bubbles: true }));
    ${W8(100)}
    const afterType = { unit: unit.value, amount: amount.value, cal: cal.value, carbs: document.querySelector('[data-edit-field="carbs"]').value, protein: document.querySelector('[data-edit-field="protein"]').value, fat: document.querySelector('[data-edit-field="fat"]').value };
    document.getElementById('meal-detail-save-btn').click();
    ${W8(400)}
    const f = meals.breakfast.foods[0];
    return {
      header, afterSwitch, afterPack, afterType,
      cal: f.cal, unit: f.servingUnit, amount: f.servingAmount, grams: f.servingGrams ?? null, pack: f.packageGrams ?? null,
    };
  `);
  check('한 개 무게가 없으면 g으로 바꾸지 않고 포장지 중량 힌트를 보여 줌',
    rGrams.afterSwitch.unit === '개' && Number(rGrams.afterSwitch.cal) === 1400 && Number(rGrams.afterSwitch.amount) === 1
    && /포장지 중량/.test(rGrams.afterSwitch.hint || ''),
    JSON.stringify(rGrams.afterSwitch));
  check('상세 헤더는 음식 정보, 단위가 개일 때 칸 이름은 수량',
    rGrams.header === '음식 정보' && rGrams.afterSwitch.amountLabel === '수량',
    JSON.stringify({ header: rGrams.header, amountLabel: rGrams.afterSwitch.amountLabel }));
  check('380g을 넣은 뒤 g·95 → 350kcal, 칸 이름은 중량, 탄단지 비례',
    rGrams.afterPack.unit === 'g' && rGrams.afterPack.label === '중량' && Number(rGrams.afterPack.amount) === 380 && Number(rGrams.afterPack.cal) === 1400
    && Number(rGrams.afterType.cal) === 350 && Number(rGrams.afterType.carbs) === 25.8 && Number(rGrams.afterType.protein) === 3.3 && Number(rGrams.afterType.fat) === 26
    && rGrams.cal === 350 && rGrams.unit === 'g' && rGrams.amount === 95 && rGrams.grams === 95 && rGrams.pack === 380,
    JSON.stringify(rGrams));

  // 2j. 홈 양 편집: 1/4 버튼, 로투스처럼 무게 없으면 g 버튼 대신 힌트
  const rPortion = await evaluate(`
    document.getElementById('food-amount-popover')?.setAttribute('hidden', '');
    amountEditorState = null;
    meals.breakfast.foods = [{
      name: '스타벅스 브륄레 쿠키 치즈케이크',
      cal: 1400, carbs: 103, protein: 13, fat: 104,
      serving: '1개', servingAmount: 1, servingUnit: '개',
      packageGrams: 380, unitGrams: { '개': 380 }, servingGrams: 380,
      id: 'cake-portion'
    }];
    renderAll(true);
    const card = document.getElementById('breakfast-card');
    if (!card.classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(300)}
    document.querySelector('#breakfast-items .food-amount-btn').click();
    ${W8(200)}
    const pop = document.getElementById('food-amount-popover');
    const buttons = [...pop.querySelectorAll('.food-amount-portion')].map(b => b.textContent.trim());
    pop.querySelector('[data-portion="0.25"]').click();
    ${W8(200)}
    const f = meals.breakfast.foods[0];
    const shown = document.querySelector('#breakfast-items .food-amount-btn')?.textContent;
    const rowCal = document.querySelector('#breakfast-items .food-cal')?.textContent;
    document.getElementById('food-amount-popover')?.setAttribute('hidden', '');
    amountEditorState = null;
    meals.breakfast.foods = [{
      name: 'Lotus Biscoff', cal: 30, carbs: 4.7, protein: 0.4, fat: 1.2,
      serving: '1개', servingAmount: 1, servingUnit: '개', id: 'lotus-hint'
    }];
    renderAll(true);
    if (!document.getElementById('breakfast-card').classList.contains('expanded')) document.querySelector('[data-expand-meal="breakfast"]').click();
    ${W8(200)}
    document.querySelector('#breakfast-items .food-amount-btn').click();
    ${W8(200)}
    const lotusPop = document.getElementById('food-amount-popover');
    return {
      buttons,
      cal: f.cal, amount: f.servingAmount, unit: f.servingUnit, grams: f.servingGrams, shown, rowCal,
      lotusUnitHidden: lotusPop.querySelector('.food-amount-unit')?.hidden === true,
      lotusHint: lotusPop.querySelector('.food-amount-weight-hint')?.textContent || '',
    };
  `);
  check('양 편집 1/4 버튼 → 0.25개 95g 350kcal, 줄 표시도 갱신',
    JSON.stringify(rPortion.buttons) === JSON.stringify(['1/4', '1/2', '1'])
    && rPortion.cal === 350 && rPortion.amount === 0.25 && rPortion.unit === '개' && rPortion.grams === 95
    && /350/.test(rPortion.rowCal || ''),
    JSON.stringify(rPortion));
  check('한 개 무게 없는 로투스는 g 버튼 대신 포장지 중량 힌트',
    rPortion.lotusUnitHidden && /포장지 중량/.test(rPortion.lotusHint || ''),
    JSON.stringify({ hidden: rPortion.lotusUnitHidden, hint: rPortion.lotusHint }));

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
